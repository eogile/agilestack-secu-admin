
const TOKEN_INFO = 'tokenInfo';

function doFetchWithAuth(url, configToAppend) {
  var tokenInfoFromStorage = localStorage.getItem(TOKEN_INFO);
  var myHeaders = new Headers();

  myHeaders.append(TOKEN_INFO, tokenInfoFromStorage);
  console.log('in doFetchWithAuth url=', url);
  var config = {
    ...configToAppend,
    headers: myHeaders,
    // mode: 'no-cors',
  }
  console.log('in doFetchWithAuth config=', config);
  return fetch(url, config)
      .then(response => {
          console.log('in response with status : ', response.status);
          if (!response.ok) {
              //delete token from localStorage, Add error message, redirect to signin with callback
              //TODO : error message
              //TODO : redirect after successful login
              if (response.status == 401) {
                //if not authentified remove token info
                localStorage.removeItem(TOKEN_INFO);
              }
              return response.text().then(err => {throw err});
          }
          if (response.status==204) {
            //no body we cannot do response.json()
            return
          }
          return response.json();
      });
}

export {doFetchWithAuth};
