#!/bin/bash

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "The .env file is missing. Please create it and define SERVICE_ROLE_KEY, ADMIN_MAIL, and ADMIN_PSW."
  exit 1
fi

KEY=${SERVICE_ROLE_KEY}
MAIL=${ADMIN_MAIL}
PSW=${ADMIN_PSW}
# Check if the environment variables are set
if [ -z "$KEY" ] || [ -z "$MAIL" ] || [ -z "$PSW" ]; then
  echo "Please set the SERVICE_ROLE_KEY, ADMIN_MAIL, and ADMIN_PSW environment variables."
  exit 1
fi

curl -X POST 'http://localhost:8000/auth/v1/signup' \
-H "accept: application/json" \
-H "Content-Type: application/json" \
-H "apikey: $KEY" \
-d "{ \"email\": \"$MAIL\", \"password\": \"$PSW\" }"