#!/bin/bash

usage() {
  echo "Usage: $0 [-n] [-t /path/to/test/directory]" && echo "-n: do not start a new cql-translation-service container" 1>&2; exit 1;
}

DIRNAME=`dirname "$0"`

NO_START=0;
TEST_DIR=''

while getopts "t:nh" o; do
  case "${o}" in
    n) NO_START=1 ;;
    t) TEST_DIR=$OPTARG ;;
    h) usage; exit 0 ;;
    *) usage; exit 1 ;;
  esac
done

# Don't start new container if user wants to keep existing running server
if [ $NO_START -eq 0 ]
then
  echo "> Starting cql-translation-service"

  RUNNING_PID=$(docker ps | grep "cqframework/cql-translation-service" | awk '{ print $1 }')
  if [[ ! -z $RUNNING_PID ]]
  then
    echo "> Stopping existing container"
    docker stop $RUNNING_PID
  fi

  docker run --name cql-translation-service --rm -d -p 8080:8080 cqframework/cql-translation-service:latest

  echo "> Waiting for server"

  # Wait for cql-translation-service
  curl --silent http://localhost:8080/cql/translator > /dev/null
  while [ $? -ne 0 ]
  do
    printf "."
    sleep 1
    curl --silent http://localhost:8080/cql/translator > /dev/null
  done
fi

echo "> Translating CQL"

node $DIRNAME/buildElm.js

if [ $? -ne 0 ] ; then exit 1 ; fi

echo "> Running unit tests"

jest --testPathPattern=$TEST_DIR

if [ $NO_START -eq 0 ]
then
  echo "> Stopping cql-translation-service"
  docker stop cql-translation-service
fi
