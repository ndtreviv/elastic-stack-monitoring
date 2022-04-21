#!/bin/bash

PORT=$(cat .args | grep LISTEN_ON_PORT | awk -F'=' '{print $2}')
echo "Running on port $PORT"
#docker run -d --rm -p $PORT:$PORT --name esm-proxy esm-proxy:latest

open http://localhost:$PORT