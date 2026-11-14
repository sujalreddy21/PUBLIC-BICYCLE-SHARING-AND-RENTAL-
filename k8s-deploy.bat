@echo off
setlocal enabledelayedexpansion

echo ==============================================================================
echo  PUBLIC BICYCLE SHARING AND RENTAL MANAGEMENT SYSTEM (PBS-RMS)
echo  KUBERNETES CLUSTER DEPLOYMENT AUTOMATION
echo  Developer: SUJAL REDDY (2303A51713) ^| Academic Year: 2026-2027
echo ==============================================================================
echo.

:: 1. Check kubectl installation
where kubectl >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] kubectl command not found in system PATH.
    echo Please install kubectl or enable Kubernetes in Docker Desktop:
    echo   - Docker Desktop: Settings -^> Kubernetes -^> Enable Kubernetes
    echo   - Minikube: https://minikube.sigs.k8s.io/docs/start/
    echo.
    pause
    exit /b 1
)

:: 2. Check Kubernetes cluster connectivity
echo [INFO] Verifying Kubernetes cluster connectivity...
kubectl cluster-info >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Cannot connect to a Kubernetes cluster.
    echo Ensure your cluster (Minikube / Docker Desktop / Kind / Cloud) is running.
    echo.
    pause
    exit /b 1
)
echo [OK] Connected to Kubernetes cluster.
echo.

:: 3. Deploying Resources in Dependency Order
echo [STEP 1/5] Applying Configuration and Secrets...
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to apply ConfigMap or Secret.
    exit /b 1
)

echo.
echo [STEP 2/5] Deploying Persistent Database (MongoDB with PVC)...
kubectl apply -f k8s/mongodb-pvc.yaml
kubectl apply -f k8s/mongodb-service.yaml
kubectl apply -f k8s/mongodb-deployment.yaml
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to deploy MongoDB tier.
    exit /b 1
)

echo.
echo [STEP 3/5] Deploying Backend REST API Tier (Express.js)...
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/backend-deployment.yaml
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to deploy Backend tier.
    exit /b 1
)

echo.
echo [STEP 4/5] Deploying Frontend Web UI Tier (React + Nginx)...
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to deploy Frontend tier.
    exit /b 1
)

echo.
echo [STEP 5/5] Deploying Ingress (Optional)...
kubectl apply -f k8s/ingress.yaml 2>nul

echo.
echo ==============================================================================
echo  WAITING FOR POD ROLLOUT COMPLETION...
echo ==============================================================================
echo Waiting for MongoDB deployment...
kubectl rollout status deployment/mongodb-deployment --timeout=120s

echo Waiting for Backend deployment...
kubectl rollout status deployment/backend-deployment --timeout=120s

echo Waiting for Frontend deployment...
kubectl rollout status deployment/frontend-deployment --timeout=120s

echo.
echo ==============================================================================
echo  KUBERNETES CLUSTER STATUS:
echo ==============================================================================
echo.
echo --- PODS ---
kubectl get pods -l "app=pbs" -o wide
echo.
echo --- SERVICES ---
kubectl get services -l "app=pbs"
echo.
echo ==============================================================================
echo  ACCESSING THE APPLICATION:
echo ==============================================================================
echo  1. NodePort Access (Docker Desktop / Kind / Local Node):
echo     http://localhost:30080
echo.
echo  2. Minikube Access:
echo     Run command: minikube service frontend-service
echo.
echo  3. Port-Forward Alternative (Direct Tunnel):
echo     Run: kubectl port-forward svc/frontend-service 8080:80
echo     Open: http://localhost:8080
echo.
echo  4. Backend API Direct Verification:
echo     Run: kubectl port-forward svc/backend 5000:5000
echo     Open: http://localhost:5000/api/health
echo ==============================================================================
pause
