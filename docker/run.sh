#!/bin/bash

if [ -f ".env" ]; then
    echo "Converting .env file to --env"
    ENV_ARGS=$(cat .env | tr '\r\n' ' ' | sed -e 's| | --env |g')
    if [[ "$ENV_ARGS" != "" ]]; then
        ENV_ARGS=$(echo "--env ${ENV_ARGS}")
    fi
fi

PORT=$(cat .env | grep LISTEN_ON_PORT | awk -F'=' '{print $2}')
echo "Running docker run --rm -d ${ENV_ARGS} -p $PORT:$PORT --name esm-proxy esm-proxy:latest"
docker run --rm ${ENV_ARGS} -p $PORT:$PORT --name esm-proxy esm-proxy:latest

open http://localhost:$PORT