#!/bin/bash
set -e


IMAGE_NAME="limmagenie"
PORT=8000
DOCKER_PATH="/c/Program Files/Docker/Docker/Docker Desktop.exe"
# 1. Start Docker if it's down
if ! docker info >/dev/null 2>&1; then
  echo "Starting Docker..."
  "$DOCKER_PATH" &
  
  # Wait with a limit (30 tries * 2s = 1 minute)
  for i in {1..30}; do
    if docker info >/dev/null 2>&1; then break; fi
    echo "Waiting... ($i/30)"
    sleep 2
  done
fi


# 2. Check if container exists (running or stopped)
if docker ps -a --format '{{.Names}}' | grep -q "^${IMAGE_NAME}$"; then
  echo "Existing container found. Stopping and removing..."
  docker stop $IMAGE_NAME 2>/dev/null || true
  docker rm $IMAGE_NAME 2>/dev/null || true
else
  echo "No existing container. Fresh build..."
fi

# 3. Build image (first time: full build, rebuild: uses cached layers)
echo "Building image..."
docker build -t $IMAGE_NAME .

# 4. Start container
echo "Starting container..."
docker run -d \
  --name $IMAGE_NAME \
  -p $PORT:$PORT \
  --env-file .env \
  --restart unless-stopped \
  $IMAGE_NAME

echo ""
echo "limmaGenie is running at http://localhost:$PORT"
echo "View logs: docker logs -f $IMAGE_NAME"