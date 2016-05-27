package main

import (
	"log"
	"net/http"
	"os"

	"fmt"

	"encoding/json"

	"io/ioutil"

	"github.com/eogile/agilestack-utils/auth"
	"github.com/eogile/agilestack-utils/plugins"
	"github.com/eogile/agilestack-utils/plugins/resource"
	"github.com/eogile/agilestack-utils/secu"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

const (
	defaultHttpPort            = "8080"
	defaultAuthorizationServer = "http://hydra-host.agilestacknet:9090"
	defaultClientID            = "app"
	defaultClientSecret        = "secret"

	profilesPath = "/profiles"
	usersPath    = "/users"
	rolesPath    = "/roles"
)

var (
	roles               = []secu.Role{}
	hydraClient         *auth.HydraClient
	clientID            string
	clientSecret        string
	authorizationServer string
	pluginsInfoClient   resource.PluginResourcesStorageClient
	accountsResource    = resource.Resource{
		Key:         "accounts",
		SecurityKey: "rn:hydra:accounts",
		Permissions: []string{"create", "get", "delete", "put:password", "put:data"},
	}
	policiesResource = resource.Resource{
		Key:         "policies",
		SecurityKey: "rn:hydra:policies",
		Permissions: []string{"create", "update", "get", "delete"},
	}
)

func SecuMiddleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		hydraClient = auth.NewClient(authorizationServer, clientID, clientSecret)
		log.Println("SecuMiddleware", r.URL)
		h.ServeHTTP(w, r)
	})
}

func AddCors(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		corsHandler := cors.New(cors.Options{
			AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
			//AllowedOrigins: []string{"*"},
			AllowedHeaders: []string{"tokenInfo", "content-type"},
			//AllowedHeaders: []string{"*"},
			Debug: false,
		}).Handler(h)
		//log.Printf("adding CORS, url:%v, method:%v", r.URL, r.Method)
		corsHandler.ServeHTTP(w, r)
	})
}

/*
 * Run listening server
 */
func startHttp() {
	httpPort := os.Getenv("HTTP_PORT")
	if httpPort == "" {
		httpPort = defaultHttpPort
	}

	toBeSecuredRouter := mux.NewRouter().StrictSlash(true)
	toBeSecuredRouter.HandleFunc("/users", listUsers).Methods("GET")
	//toBeSecuredRouter.HandleFunc("/users/", listUsers).Methods("GET")
	toBeSecuredRouter.HandleFunc("/users", createUser).Methods("POST")
	toBeSecuredRouter.HandleFunc("/users/{id}", getUser).Methods("GET")
	toBeSecuredRouter.HandleFunc("/users/{id}", deleteUser).Methods("DELETE")
	toBeSecuredRouter.HandleFunc("/users/{id}/login", updateUserLogin).Methods("PUT")
	toBeSecuredRouter.HandleFunc("/users/{id}/password", updateUserPassword).Methods("PUT")
	toBeSecuredRouter.HandleFunc("/users/{id}/name", updateUserFirstLastName).Methods("PUT")
	toBeSecuredRouter.HandleFunc("/roles", listRoles).Methods("GET")
	toBeSecuredRouter.HandleFunc("/roles", createRole).Methods("POST")
	toBeSecuredRouter.HandleFunc("/roles/{id}", getRole).Methods("GET")
	toBeSecuredRouter.HandleFunc("/roles/{id}", updateRole).Methods("PUT")
	toBeSecuredRouter.HandleFunc("/roles/{id}", deleteRole).Methods("DELETE")
	toBeSecuredRouter.HandleFunc("/profiles", listProfiles).Methods("GET")
	toBeSecuredRouter.HandleFunc("/profiles", createProfile).Methods("POST")
	toBeSecuredRouter.HandleFunc("/profiles/{id}", getProfile).Methods("GET")
	toBeSecuredRouter.HandleFunc("/profiles/{id}", deleteProfile).Methods("DELETE")
	toBeSecuredRouter.HandleFunc("/profiles/{id}/description", updateProfileDescription).Methods("PUT")
	toBeSecuredRouter.HandleFunc("/profiles/{id}/users", updateProfileUsers).Methods("PUT")
	toBeSecuredRouter.HandleFunc("/profiles/{id}/users/{user}", addProfileUser).Methods("PUT")
	toBeSecuredRouter.HandleFunc("/profiles/{id}/users/{user}", deleteProfileUser).Methods("DELETE")
	toBeSecuredRouter.HandleFunc("/profiles/{id}/roles", updateProfileRoles).Methods("PUT")
	toBeSecuredRouter.HandleFunc("/profiles/{id}/roles/{role}", addProfileRole).Methods("PUT")
	toBeSecuredRouter.HandleFunc("/profiles/{id}/roles/{role}", deleteProfileRole).Methods("DELETE")
	toBeSecuredRouter.HandleFunc("/policies", listPolicies).Methods("GET")
	toBeSecuredRouter.HandleFunc("/policies/{id}", getPolicy).Methods("GET")
	toBeSecuredRouter.HandleFunc("/policies", createPolicy).Methods("POST")
	toBeSecuredRouter.HandleFunc("/resources", listResources).Methods("GET")

	statusRouter := mux.NewRouter().PathPrefix("/status").Subrouter()
	statusRouter.HandleFunc("/", plugins.HandleHttpStatusUrl).Methods("GET")

	handlerStatusWithCors := AddCors(statusRouter)

	handlerToBeSecuredWithCors := AddCors(toBeSecuredRouter)
	securedRouter := SecuMiddleware(handlerToBeSecuredWithCors)

	http.Handle("/status/", handlerStatusWithCors) //Need trailing slash
	http.Handle("/", securedRouter)

	log.Println("Server started: http://localhost:" + httpPort)
	err := http.ListenAndServe(":"+httpPort, nil)
	if err != nil {
		log.Fatal("HTTP start error", err)
	}
}

// List all users
func listUsers(w http.ResponseWriter, r *http.Request) {
	log.Println("in listUsers")
	tokenInfo := r.Header.Get("tokenInfo")
	users, err, respCode := hydraClient.ListUsers(&auth.TokenInfo{TokenInfo: tokenInfo})
	if err != nil {
		http.Error(w, err.Error(), respCode)
		return
	}

	// Return the users
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache")
	json.NewEncoder(w).Encode(users)
}

// Create a user
func createUser(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var newUser secu.User
	err := json.NewDecoder(r.Body).Decode(&newUser)
	if err != nil {
		http.Error(w, "Invalid user: "+err.Error(), http.StatusBadRequest)
		return
	}
	if newUser.Login == "" || newUser.Password == "" {
		http.Error(w, "Please provide a username and a password", http.StatusBadRequest)
		return
	}
	if newUser.FirstName == "" || newUser.LastName == "" {
		http.Error(w, "Please provide a first and last name", http.StatusBadRequest)
		return
	}

	tokenInfo := r.Header.Get("tokenInfo")
	id, err := hydraClient.CreateUser(&newUser, &auth.TokenInfo{TokenInfo: tokenInfo})
	if err != nil {
		http.Error(w, "Error saving the user "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return the new id
	w.Header().Set("Location", usersPath+"/"+id)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(id)
}

// Get a user by id
func getUser(w http.ResponseWriter, r *http.Request) {
	id, exists := mux.Vars(r)["id"]
	if !exists {
		http.Error(w, "No id given", http.StatusBadRequest)
		return
	}

	tokenInfo := r.Header.Get("tokenInfo")
	usr, err := hydraClient.FindUser(id, &auth.TokenInfo{TokenInfo: tokenInfo})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if usr == nil {
		http.Error(w, "User not found: "+id, http.StatusNotFound)
		return
	}

	// Return the user
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache")
	json.NewEncoder(w).Encode(usr)
}

func deleteUser(w http.ResponseWriter, r *http.Request) {
	id, exists := mux.Vars(r)["id"]
	if !exists {
		http.Error(w, "No id given", http.StatusBadRequest)
		return
	}

	tokenInfo := r.Header.Get("tokenInfo")
	// Delete the user in Hydra
	err := hydraClient.DeleteUser(id, &auth.TokenInfo{TokenInfo: tokenInfo})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Update a user login
func updateUserLogin(w http.ResponseWriter, r *http.Request) {
	id, exists := mux.Vars(r)["id"]
	if !exists {
		http.Error(w, "No id given", http.StatusBadRequest)
		return
	}

	defer r.Body.Close()
	var req secu.UpdateLoginRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request: "+err.Error(), http.StatusBadRequest)
		return
	}

	err = hydraClient.UpdateUserLogin(id, req)
	if err != nil {
		http.Error(w, "Error updating the user "+err.Error(), http.StatusInternalServerError)
		return
	}
}

// Update a user password
func updateUserPassword(w http.ResponseWriter, r *http.Request) {
	id, exists := mux.Vars(r)["id"]
	if !exists {
		http.Error(w, "No id given", http.StatusBadRequest)
		return
	}

	defer r.Body.Close()
	var req secu.UpdatePasswordRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request: "+err.Error(), http.StatusBadRequest)
		return
	}

	err = hydraClient.UpdateUserPassword(id, req)
	if err != nil {
		http.Error(w, "Error updating the user "+err.Error(), http.StatusInternalServerError)
		return
	}
}

// Update a user first and last name
func updateUserFirstLastName(w http.ResponseWriter, r *http.Request) {
	id, exists := mux.Vars(r)["id"]
	if !exists {
		http.Error(w, "No id given", http.StatusBadRequest)
		return
	}

	defer r.Body.Close()
	var userdata secu.UserData
	err := json.NewDecoder(r.Body).Decode(&userdata)
	if err != nil {
		http.Error(w, "Invalid request: "+err.Error(), http.StatusBadRequest)
		return
	}
	if userdata.FirstName == "" || userdata.LastName == "" {
		http.Error(w, "Please provide a first and last name", http.StatusBadRequest)
		return
	}

	tokenInfo := r.Header.Get("tokenInfo")
	err = hydraClient.UpdateUserData(id, userdata, &auth.TokenInfo{TokenInfo: tokenInfo})
	if err != nil {
		http.Error(w, "Error updating the user "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// listProfiles List profiles
//DEPRECATED : use listPolicies
func listProfiles(w http.ResponseWriter, r *http.Request) {
	tokenInfo := r.Header.Get("tokenInfo")
	profiles, err := hydraClient.ListProfiles(&auth.TokenInfo{TokenInfo: tokenInfo})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return the profiles
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache")
	json.NewEncoder(w).Encode(profiles)
}

// listPolicies List policies
func listPolicies(w http.ResponseWriter, r *http.Request) {
	log.Println("in listPolicies")
	tokenInfo := r.Header.Get("tokenInfo")
	policies, err, respCode := hydraClient.ListPolicies(&auth.TokenInfo{TokenInfo: tokenInfo})
	if err != nil {
		http.Error(w, err.Error(), respCode)
		return
	}

	// Return the policies
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache")
	json.NewEncoder(w).Encode(policies)
}

func getPolicy(w http.ResponseWriter, r *http.Request) {
	id, exists := mux.Vars(r)["id"]
	if !exists {
		http.Error(w, "No id given", http.StatusBadRequest)
		return
	}

	// Find the profile in Hydra
	tokenInfo := r.Header.Get("tokenInfo")
	policy, err := hydraClient.FindPolicy(id, &auth.TokenInfo{TokenInfo: tokenInfo})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if policy == nil {
		http.Error(w, "Profile not found: "+id, http.StatusNotFound)
		return
	}

	// Return the profile
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache")
	json.NewEncoder(w).Encode(*policy)
}

// createPolicy Creates a policy
func createPolicy(w http.ResponseWriter, r *http.Request) {
	// Decode the provided profile
	var policy secu.Policy
	err := json.NewDecoder(r.Body).Decode(&policy)
	if err != nil {
		http.Error(w, "Invalid policy: "+err.Error(), http.StatusBadRequest)
		return
	} else if policy.Description == "" {
		http.Error(w, "No description given", http.StatusBadRequest)
		return
	}

	// Create the profile in Hydra
	tokenInfo := r.Header.Get("tokenInfo")
	id, err := hydraClient.CreatePolicy(&policy, &auth.TokenInfo{TokenInfo: tokenInfo})
	if err != nil {
		http.Error(w, "Error saving the profile "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return the new id
	w.Header().Set("Location", profilesPath+"/"+id)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(id)
}

// Create a profile
func createProfile(w http.ResponseWriter, r *http.Request) {
	// Decode the provided profile
	var profile secu.Policy
	err := json.NewDecoder(r.Body).Decode(&profile)
	if err != nil {
		http.Error(w, "Invalid profile: "+err.Error(), http.StatusBadRequest)
		return
	} else if profile.Description == "" {
		http.Error(w, "No description given", http.StatusBadRequest)
		return
	}

	// Create the profile in Hydra
	tokenInfo := r.Header.Get("tokenInfo")
	id, err := hydraClient.CreateProfile(&profile, &auth.TokenInfo{TokenInfo: tokenInfo})
	if err != nil {
		http.Error(w, "Error saving the profile "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Return the new id
	w.Header().Set("Location", profilesPath+"/"+id)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(id)
}

func getProfile(w http.ResponseWriter, r *http.Request) {
	id, exists := mux.Vars(r)["id"]
	if !exists {
		http.Error(w, "No id given", http.StatusBadRequest)
		return
	}

	// Find the profile in Hydra
	tokenInfo := r.Header.Get("tokenInfo")
	profile, err := hydraClient.FindProfile(id, &auth.TokenInfo{TokenInfo: tokenInfo})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if profile == nil {
		http.Error(w, "Profile not found: "+id, http.StatusNotFound)
		return
	}

	// Return the profile
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache")
	json.NewEncoder(w).Encode(*profile)
}

func deleteProfile(w http.ResponseWriter, r *http.Request) {
	id, exists := mux.Vars(r)["id"]
	if !exists {
		http.Error(w, "No id given", http.StatusBadRequest)
		return
	}

	// Delete the profile in Hydra
	tokenInfo := r.Header.Get("tokenInfo")
	err := hydraClient.DeleteProfile(id, &auth.TokenInfo{TokenInfo: tokenInfo})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func updateProfileDescription(w http.ResponseWriter, r *http.Request) {
	id, exists := mux.Vars(r)["id"]
	if !exists {
		http.Error(w, "No id given", http.StatusBadRequest)
		return
	}

	escapedDesc, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	} else if len(escapedDesc) <= 2 { // blank + quotes
		http.Error(w, "No description given", http.StatusBadRequest)
		return
	}

	// Update the profile in Hydra
	tokenInfo := r.Header.Get("tokenInfo")
	err = hydraClient.UpdateProfileDescription(id, escapedDesc, &auth.TokenInfo{TokenInfo: tokenInfo})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func updateProfileUsers(w http.ResponseWriter, r *http.Request) {
	id, exists := mux.Vars(r)["id"]
	if !exists {
		http.Error(w, "No id given", http.StatusBadRequest)
		return
	}
	// Decode the provided user list
	var users []string
	err := json.NewDecoder(r.Body).Decode(&users)
	if err != nil {
		http.Error(w, "Invalid user list: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Update the profile in Hydra
	tokenInfo := r.Header.Get("tokenInfo")
	err = hydraClient.UpdateProfileUsers(id, users, &auth.TokenInfo{TokenInfo: tokenInfo})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func addProfileUser(w http.ResponseWriter, r *http.Request) {
	id, exists := mux.Vars(r)["id"]
	if !exists {
		http.Error(w, "No profile id given", http.StatusBadRequest)
		return
	}

	userId, exists := mux.Vars(r)["user"]
	if !exists {
		http.Error(w, "No user id given", http.StatusBadRequest)
		return
	}

	// Update the profile in Hydra
	tokenInfo := r.Header.Get("tokenInfo")
	err := hydraClient.AddProfileUser(id, userId, &auth.TokenInfo{TokenInfo: tokenInfo})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func deleteProfileUser(w http.ResponseWriter, r *http.Request) {
	id, exists := mux.Vars(r)["id"]
	if !exists {
		http.Error(w, "No profile id given", http.StatusBadRequest)
		return
	}

	userId, exists := mux.Vars(r)["user"]
	if !exists {
		http.Error(w, "No user id given", http.StatusBadRequest)
		return
	}

	// Update the profile in Hydra
	tokenInfo := r.Header.Get("tokenInfo")
	err := hydraClient.DeleteProfileUser(id, userId, &auth.TokenInfo{TokenInfo: tokenInfo})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func updateProfileRoles(w http.ResponseWriter, r *http.Request) {
	id, exists := mux.Vars(r)["id"]
	if !exists {
		http.Error(w, "No id given", http.StatusBadRequest)
		return
	}
	// Decode the provided user list
	var roles []string
	err := json.NewDecoder(r.Body).Decode(&roles)
	if err != nil {
		http.Error(w, "Invalid role list: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Update the profile in Hydra
	tokenInfo := r.Header.Get("tokenInfo")
	err = hydraClient.UpdateProfileRoles(id, roles, &auth.TokenInfo{TokenInfo: tokenInfo})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func addProfileRole(w http.ResponseWriter, r *http.Request) {
	id, exists := mux.Vars(r)["id"]
	if !exists {
		http.Error(w, "No profile id given", http.StatusBadRequest)
		return
	}

	role, exists := mux.Vars(r)["role"]
	if !exists {
		http.Error(w, "No role given", http.StatusBadRequest)
		return
	}

	// Update the profile in Hydra
	tokenInfo := r.Header.Get("tokenInfo")
	err := hydraClient.AddProfileRole(id, role, &auth.TokenInfo{TokenInfo: tokenInfo})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func deleteProfileRole(w http.ResponseWriter, r *http.Request) {
	id, exists := mux.Vars(r)["id"]
	if !exists {
		http.Error(w, "No profile id given", http.StatusBadRequest)
		return
	}

	role, exists := mux.Vars(r)["role"]
	if !exists {
		http.Error(w, "No role given", http.StatusBadRequest)
		return
	}

	// Update the profile in Hydra
	tokenInfo := r.Header.Get("tokenInfo")
	err := hydraClient.DeleteProfileRole(id, role, &auth.TokenInfo{TokenInfo: tokenInfo})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// List all roles
func listRoles(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache")
	json.NewEncoder(w).Encode(roles)
}

// Create a role
func createRole(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var role secu.Role
	err := json.NewDecoder(r.Body).Decode(&role)
	if err != nil {
		http.Error(w, "Invalid role: "+err.Error(), http.StatusBadRequest)
		return
	}
	if role.Id == "" {
		// TODO Check id validity / sanitize
		http.Error(w, "Please provide an ID", http.StatusBadRequest)
		return
	}
	if _, existingRole := findRole(role.Id); existingRole != nil {
		http.Error(w, "Role already exists: "+role.Id, http.StatusBadRequest)
		return
	}

	roles = append(roles, role)

	w.Header().Set("Location", rolesPath+"/"+role.Id)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(role.Id)
}

// Get a role
func getRole(w http.ResponseWriter, r *http.Request) {
	id, exists := mux.Vars(r)["id"]
	if !exists {
		http.Error(w, "No id given", http.StatusBadRequest)
		return
	}

	_, role := findRole(id)
	if role == nil {
		http.Error(w, "Role not found: "+id, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache")
	json.NewEncoder(w).Encode(role)
}

// Update a role
func updateRole(w http.ResponseWriter, r *http.Request) {
	id, exists := mux.Vars(r)["id"]
	if !exists {
		http.Error(w, "No id given", http.StatusBadRequest)
		return
	}

	i, _ := findRole(id)
	if i == -1 {
		http.Error(w, "Role not found: "+id, http.StatusNotFound)
		return
	}

	defer r.Body.Close()
	var role secu.Role
	err := json.NewDecoder(r.Body).Decode(&role)
	if err != nil {
		http.Error(w, "Invalid role: "+err.Error(), http.StatusBadRequest)
		return
	}
	if role.Id != id {
		http.Error(w, fmt.Sprintf("The provided role has id '%s'. It should have id '%s'", role.Id, id), http.StatusBadRequest)
	}

	roles[i] = role

	w.WriteHeader(http.StatusNoContent)
}

// Delete a role
func deleteRole(w http.ResponseWriter, r *http.Request) {
	id, exists := mux.Vars(r)["id"]
	if !exists {
		http.Error(w, "No id given", http.StatusBadRequest)
		return
	}

	i, _ := findRole(id)
	if i == -1 {
		http.Error(w, "Role not found: "+id, http.StatusNotFound)
		return
	}
	roles = append(roles[:i], roles[i+1:]...)

	w.WriteHeader(http.StatusNoContent)
}

func findRole(roleId string) (int, *secu.Role) {
	for i, role := range roles {
		if role.Id == roleId {
			return i, &role
		}
	}
	return -1, nil
}

// List all resources
func listResources(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache")
	resources, err := pluginsInfoClient.ListResources()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache")
	json.NewEncoder(w).Encode(resources)
}

func main() {

	authorizationServer = os.Getenv("AUTHORIZATION_SERVER")
	if authorizationServer == "" {
		authorizationServer = defaultAuthorizationServer
	}
	clientID = os.Getenv("CLIENT_ID")
	if clientID == "" {
		clientID = defaultClientID
	}
	clientSecret = os.Getenv("CLIENT_SECRET")
	if clientSecret == "" {
		clientSecret = defaultClientSecret
	}

	hydraClient = auth.NewClient(authorizationServer, clientID, clientSecret)

	pluginsInfoClient = resource.NewPluginResourcesStorageClient()

	err := pluginsInfoClient.StoreResource(accountsResource)
	if err != nil {
		log.Fatalln("Impossible to store accounts resource", err)
	}
	err = pluginsInfoClient.StoreResource(policiesResource)
	if err != nil {
		log.Fatalln("Impossible to store policies resource", err)
	}

	// TODO get the roles from somewhere else...
	roles = []secu.Role{
		{Id: "plugin1:role1", Description: "Plugin 1 Role 1"},
		{Id: "plugin1:role2", Description: "Plugin 1 Role 2"},
		{Id: "admin:view_roles", Description: "Ability to view the roles"},
	}

	//Run listening server
	startHttp()

}
