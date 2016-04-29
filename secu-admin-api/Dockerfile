FROM centurylink/ca-certs
MAINTAINER EOGILE "agilestack@eogile.com"

ENV name secu-admin-api
ENV CLIENT_ID superapp
ENV CLIENT_SECRET supersecret

ENV workdir /plugin

ENV HTTP_PORT 8080
ENV CONSUL_HTTP_ADDR consul:8500
EXPOSE $HTTP_PORT
LABEL SERVICE_TAGS="urlprefix-/api/secu" \
      SERVICE_CHECK_HTTP="/status" \
      SERVICE_CHECK_INTERVAL="10s"

WORKDIR $workdir
ADD $name $workdir/$name

ENTRYPOINT ["./secu-admin-api"]
