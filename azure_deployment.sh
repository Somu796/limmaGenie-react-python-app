#!/bin/bash

# 1. Variables assignment
RESOURCE_GROUP="limmaGenie" \
# LOCATION="eastus" # To make it free using two regions \
LOC_FRONTEND="eastus2"  \ 
LOC_BACKEND="eastus"  \  
# ACR_NAME="limmagenieregistry$(date +%s)" # (If you prefer Azure Docker Registry over Docker Hub)
BACKEND_APP="limmagenie-backend" \
FRONTEND_APP="limmagenie-frontend"

# 2. Create the Resource Group
# az group create --name $RESOURCE_GROUP --location $LOCATION (Already created one)

# 3. Create Azure Docker Registry (If you prefer Azure Docker Registry over Docker Hub)
# az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true

# 4. Backend: Container App (Consumption Plan - Free Grant)
az containerapp env create --name limmagenie-env --resource-group $RESOURCE_GROUP --location $LOC_BACKEND

# IMPORTANT: Added --min-replicas 0 to ensure it scales to zero when not in use   #your-username/your-repo-name:tag
az containerapp create --name $BACKEND_APP --resource-group $RESOURCE_GROUP \
  --environment limmagenie-env \
  --image docker.io/somu7/limmagenie_backend:v1 \
  --target-port 8000 --ingress external --min-replicas 0 --max-replicas 1

# 3. Frontend: App Service (F1 Tier - Always Free)
az appservice plan create --name limmagenie-plan --resource-group $RESOURCE_GROUP \
  --location $LOC_FRONTEND --sku F1 --is-linux

# Corrected runtime to "NODE|20-lts"
az webapp create --name $FRONTEND_APP --resource-group $RESOURCE_GROUP \
  --plan limmagenie-plan --runtime "NODE|20-lts"

#####
# Set up Github Actions
# FRONTEND
# 1. for front end check the gihub action yml: .github\workflows\frontend.yml
# 2. downloaded Publish Profile from azure web app limmaGenie-frontend page
# 3. Added startup command at configuration> Stack settings> pm2 serve /home/site/wwwroot --no-daemon --spa
# BACKEND
# 1. 

#####

# Backend Setting
# Note the space before 'env' to hide it from your history!
az containerapp secret set \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --secrets \
    openai-key="$LIMMAGENIE_OPENAI_API_KEY" \
    mongodb-uri="$MONGODB_CONNECTION_STRING" \
    model-name="$OPENAI_MODEL_NAME" \
    embed-name="$EMBEDDING_MODEL_NAME" \
    origin-frontend="$ORIGIN" \
  --set-env-vars ORIGINS="secretref:origin-main secretref:origin-test"

az containerapp update \
  --name $BACKEND_APP --resource-group $RESOURCE_GROUP \
  --set-env-vars \
    LIMMAGENIE_OPENAI_API_KEY=secretref:openai-key \
    MONGODB_CONNECTION_STRING=secretref:mongodb-uri \
    OPENAI_MODEL_NAME=secretref:model-name \
    EMBEDDING_MODEL_NAME=secretref:embed-name

az containerapp update \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars \
    ORIGINS="your-frontend-website-link"

az containerapp registry set \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --server docker.io \
  --username <DOCKER_HUB_USERNAME> \
  --password <DOCKER_HUB_TOKEN>

# Tell it to use that image
az containerapp update \
  --name limmagenie-backend \
  --resource-group limmaGenie \
  --image docker.io/<DOCKER_HUB_USERNAME>/limmagenie_backend:latest


# Frontend Setting
az webapp config appsettings set --name $FRONTEND_APP --resource-group $RESOURCE_GROUP \
  --settings VITE_LIMMAGENIE_API_URL='["https://limmagenie-backend.orangeground-5c0ebaa9.eastus.azurecontainerapps.io"]'