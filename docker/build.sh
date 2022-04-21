#!/bin/bash

if [ -f ".args" ]; then
    echo "Converting .args file to --build-arg"
    build_args=$(cat .args | tr '\r\n' ' ' | sed -e 's| | --build-arg |g')
    if [[ "$build_args" != "" ]]; then
        build_args=$(echo "--build-arg ${build_args}")
    fi
fi


rm -rf build
yarn install && CI=false yarn build

echo "docker build -t esm-proxy:latest ${build_args} ."
docker build -t esm-proxy:latest ${build_args} .