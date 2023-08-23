#!/bin/bash

# Set variables
REGISTRY_URL="10.10.160.25:5000"
IMAGE_NAME="houwiyeti-demandes"
TAG="1.0.1"
USERNAME="houwiyeti.anrpts.mr"
PASSWORD="h0uwiyetP@sswrd"

# Build the Docker image
docker build -t $IMAGE_NAME:$TAG .

# Log in to the registry
docker login -u $USERNAME -p $PASSWORD $REGISTRY_URL

# Tag the image for the registry
docker tag $IMAGE_NAME:$TAG $REGISTRY_URL/$IMAGE_NAME:$TAG

# Push the image to the registry
docker push $REGISTRY_URL/$IMAGE_NAME:$TAG

# Log out from the registry
docker logout $REGISTRY_URL
