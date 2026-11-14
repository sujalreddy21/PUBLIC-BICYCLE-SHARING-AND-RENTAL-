#!/usr/bin/env bash
# ==============================================================================
# PUBLIC BICYCLE SHARING AND RENTAL MANAGEMENT SYSTEM (PBS-RMS)
# KUBERNETES CLUSTER DEPLOYMENT AUTOMATION (Linux / macOS / WSL)
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
echo -e "${BLUE} KUBERNETES CLUSTER DEPLOYMENT AUTOMATION${NC}"
echo -e "${BLUE} Developer: SUJAL REDDY (2303A51713) | Academic Year: 2026-2027${NC}"
echo -e "${BLUE}==============================================================================${NC}"
echo ""

# 1. Check kubectl
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}[ERROR] kubectl command not found.${NC} Please install kubectl."
    exit 1
fi

# 2. Check cluster
echo -e "${YELLOW}[INFO] Verifying Kubernetes cluster connectivity...${NC}"
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}[ERROR] Cannot connect to a Kubernetes cluster.${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] Connected to Kubernetes cluster.${NC}"
echo ""

# 3. Apply manifests
echo -e "${YELLOW}[STEP 1/5] Applying ConfigMap and Secrets...${NC}"
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

echo -e "${YELLOW}[STEP 2/5] Deploying Persistent Database (MongoDB with PVC)...${NC}"
kubectl apply -f k8s/mongodb-pvc.yaml
kubectl apply -f k8s/mongodb-service.yaml
kubectl apply -f k8s/mongodb-deployment.yaml

echo -e "${YELLOW}[STEP 3/5] Deploying Backend REST API Tier...${NC}"
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/backend-deployment.yaml

echo -e "${YELLOW}[STEP 4/5] Deploying Frontend Web UI Tier...${NC}"
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml

echo -e "${YELLOW}[STEP 5/5] Deploying Ingress...${NC}"
kubectl apply -f k8s/ingress.yaml 2>/dev/null || true

echo ""
echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE} WAITING FOR POD ROLLOUT COMPLETION...${NC}"
echo -e "${BLUE}==============================================================================${NC}"
kubectl rollout status deployment/mongodb-deployment --timeout=120s
kubectl rollout status deployment/backend-deployment --timeout=120s
kubectl rollout status deployment/frontend-deployment --timeout=120s

echo ""
echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN} KUBERNETES CLUSTER STATUS:${NC}"
echo -e "${GREEN}==============================================================================${NC}"
echo ""
echo -e "${YELLOW}--- PODS ---${NC}"
kubectl get pods -l "app=pbs" -o wide
echo ""
echo -e "${YELLOW}--- SERVICES ---${NC}"
kubectl get services -l "app=pbs"

echo ""
echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN} ACCESSING THE APPLICATION:${NC}"
echo -e "${GREEN}==============================================================================${NC}"
echo -e "  1. NodePort URL: http://localhost:30080"
echo -e "  2. Minikube: minikube service frontend-service"
echo -e "  3. Port Forwarding: kubectl port-forward svc/frontend-service 8080:80"
echo -e "  4. Backend Health:  curl http://localhost:5000/api/health"
echo -e "${GREEN}==============================================================================${NC}"
