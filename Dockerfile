FROM alpine:latest

ARG PB_VERSION=0.13.4
ARG PB_URL="0.0.0.0:8080"
ARG CRON_EXPRESSION="* * * * *"

ENV PB_URL=$PB_URL
ENV CRON_EXPRESSION=$CRON_EXPRESSION

RUN apk add --no-cache \
    unzip \
    ca-certificates

# download and unzip PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

# create directory and copy files
RUN mkdir -p /pb/pb_public/
COPY ./ipas-alpine-app/ /pb/pb_public/

#Add docker volume for db
VOLUME /pb/pb_data

EXPOSE 8080

# start PocketBase
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]