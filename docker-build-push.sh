#!/usr/bin/env bash
# ==============================================================================
# PUBLIC BICYCLE SHARING AND RENTAL MANAGEMENT SYSTEM (PBS-RMS)
# DOCKER BUILD AND REGISTRY PUSH AUTOMATION (Linux / macOS / WSL)
# Developer: SUJAL REDDY (2303A51713) | Academic Year: 2026-2027
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE} PUBLIC BICYCLE SHARING AND RENTAL MANAGEMENT SYSTEM (PBS-RMS)${NC}"
echo -e "${BLUE} DOCKER BUILD AND REGISTRY PUSH AUTOMATION${NC}"
echo -e "${BLUE} Developer: SUJAL REDDY (2303A51713) | Academic Year: 2026-2027${NC}"
echo -e "${BLUE}==============================================================================${NC}"
echo ""

# 1. Check Docker CLI
if ! command -v docker &> /dev/null; then
    echo -e "${RED}[ERROR] Docker command not found.${NC} Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}[ERROR] Docker daemon is not running.${NC} Please start Docker Desktop or the dockerd daemon."
    exit 1
fi

# 2. Target registry username and tags
DOCKER_USER="${1:-sujalreddy}"
IMAGE_TAG="${2:-latest}"

echo -e "${YELLOW}Target Registry Configuration:${NC}"
echo -e "  Docker Hub User : ${DOCKER_USER}"
echo -e "  Release Tag     : ${IMAGE_TAG}"
echo -e "  Backend Target  : ${DOCKER_USER}/pbs-backend:${IMAGE_TAG}"
echo -e "  Frontend Target : ${DOCKER_USER}/pbs-frontend:${IMAGE_TAG}"
echo ""

# 3. Docker Login
echo -e "${YELLOW}[STEP 1/4] Authenticating with Docker Hub...${NC}"
docker login

# 4. Build Backend
echo -e "${YELLOW}[STEP 2/4] Building Backend Image (Node.js 20 Alpine)...${NC}"
docker build -t "${DOCKER_USER}/pbs-backend:${IMAGE_TAG}" -t "${DOCKER_USER}/pbs-backend:latest" ./backend
echo -e "${GREEN}[OK] Backend built: ${DOCKER_USER}/pbs-backend:${IMAGE_TAG}${NC}"
echo ""

# 5. Build Frontend
echo -e "${YELLOW}[STEP 3/4] Building Frontend Image (Vite React + Nginx Alpine)...${NC}"
docker build -t "${DOCKER_USER}/pbs-frontend:${IMAGE_TAG}" -t "${DOCKER_USER}/pbs-frontend:latest" ./frontend
echo -e "${GREEN}[OK] Frontend built: ${DOCKER_USER}/pbs-frontend:${IMAGE_TAG}${NC}"
echo ""

# 6. Push Images
echo -e "${YELLOW}[STEP 4/4] Pushing Images to Docker Hub...${NC}"
docker push "${DOCKER_USER}/pbs-backend:${IMAGE_TAG}"
if [ "${IMAGE_TAG}" != "latest" ]; then
    docker push "${DOCKER_USER}/pbs-backend:latest"
fi

docker push "${DOCKER_USER}/pbs-frontend:${IMAGE_TAG}"
if [ "${IMAGE_TAG}" != "latest" ]; then
    docker push "${DOCKER_USER}/pbs-frontend:latest"
fi

echo ""
echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN} SUCCESS! DOCKER IMAGES PUSHED TO DOCKER HUB REGISTRY${NC}"
echo -e "${GREEN}==============================================================================${NC}"
echo -e "  1. https://hub.docker.com/r/${DOCKER_USER}/pbs-backend"
echo -e "  2. https://hub.docker.com/r/${DOCKER_USER}/pbs-frontend"
echo ""
echo -e "  Ready for Kubernetes deployment:"
echo -e "    Run './k8s-deploy.sh' or 'kubectl apply -f k8s/pbs-complete.yaml'"
echo -e "${GREEN}==============================================================================${NC}"
