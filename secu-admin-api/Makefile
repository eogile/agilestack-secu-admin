NAME		= secu-admin-api
IMAGE_NAME	= agilestack-$(NAME)

GO_FILES=*.go


############################
#          BUILD           #
############################

install : docker-build

docker-build : go-build
		docker build -t $(IMAGE_NAME) .

go-build : $(NAME)

$(NAME) : $(GO_FILES)
		env GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o $(NAME)


############################
#          SETUP           #
############################

setup: go-deps

go-deps :
		go get -t $(shell go list ./... | grep -v /vendor/)


############################
#           TEST           #
############################

test :
		# in test
		go test -v -p 1 $(shell go list ./... | grep -v /vendor/)


############################
#          DEPLOY          #
############################

docker-deploy :
		docker tag $(IMAGE_NAME) eogile/$(IMAGE_NAME):latest && docker push eogile/$(IMAGE_NAME):latest


############################
#          CLEAN           #
############################

clean :
		$(RM) $(NAME)

.PHONY : install docker-build go-build setup go-deps test docker-deploy clean
