@echo off
setlocal enabledelayedexpansion

echo ==============================================================================
echo  PUBLIC BICYCLE SHARING AND RENTAL MANAGEMENT SYSTEM (PBS-RMS)
echo  DOCKER BUILD AND REGISTRY PUSH AUTOMATION
echo  Developer: SUJAL REDDY (2303A51713) ^| Academic Year: 2026-2027
echo ==============================================================================
echo.

:: 1. Check Docker installation
where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker command not found in system PATH.
    echo Please ensure Docker Desktop is installed and running on your system:
    echo https://docs.docker.com/desktop/install/windows-install/
    echo.
    pause
    exit /b 1
)

:: Check if Docker daemon is running
docker info >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker daemon is not running!
    echo Please launch Docker Desktop and wait until it is in "Running" state.
    echo.
    pause
    exit /b 1
)

:: 2. Target registry username and tags
set DOCKER_USER=%1
if "%DOCKER_USER%"=="" (
    set /p DOCKER_USER="Enter Docker Hub Username [default: sujalreddy]: "
)
if "%DOCKER_USER%"=="" (
    set DOCKER_USER=sujalreddy
)

set IMAGE_TAG=%2
if "%IMAGE_TAG%"=="" (
    set IMAGE_TAG=latest
)

echo.
echo ==============================================================================
echo  Target Registry Configuration:
echo    Docker Hub User : %DOCKER_USER%
echo    Release Tag     : %IMAGE_TAG%
echo    Backend Target  : %DOCKER_USER%/pbs-backend:%IMAGE_TAG%
echo    Frontend Target : %DOCKER_USER%/pbs-frontend:%IMAGE_TAG%
echo ==============================================================================
echo.

:: 3. Docker Login Check
echo [STEP 1/4] Checking Docker Hub Authentication...
echo If you are not logged in, you will be prompted for credentials.
docker login
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker Hub authentication failed or cancelled.
    exit /b 1
)
echo [OK] Docker Hub authenticated.
echo.

:: 4. Build Backend Image
echo [STEP 2/4] Building Backend Image (Node.js 20 Alpine Production)...
echo Context: ./backend
docker build -t %DOCKER_USER%/pbs-backend:%IMAGE_TAG% -t %DOCKER_USER%/pbs-backend:latest ./backend
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Backend Docker build failed.
    exit /b 1
)
echo [OK] Backend image built successfully: %DOCKER_USER%/pbs-backend:%IMAGE_TAG%
echo.

:: 5. Build Frontend Image
echo [STEP 3/4] Building Frontend Image (Vite React + Nginx Alpine Multi-stage)...
echo Context: ./frontend
docker build -t %DOCKER_USER%/pbs-frontend:%IMAGE_TAG% -t %DOCKER_USER%/pbs-frontend:latest ./frontend
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Frontend Docker build failed.
    exit /b 1
)
echo [OK] Frontend image built successfully: %DOCKER_USER%/pbs-frontend:%IMAGE_TAG%
echo.

:: 6. Push Images to Docker Hub
echo [STEP 4/4] Pushing Images to Docker Hub...
echo.
echo Pushing backend (%DOCKER_USER%/pbs-backend:%IMAGE_TAG%)...
docker push %DOCKER_USER%/pbs-backend:%IMAGE_TAG%
if "%IMAGE_TAG%" neq "latest" (
    docker push %DOCKER_USER%/pbs-backend:latest
)

echo.
echo Pushing frontend (%DOCKER_USER%/pbs-frontend:%IMAGE_TAG%)...
docker push %DOCKER_USER%/pbs-frontend:%IMAGE_TAG%
if "%IMAGE_TAG%" neq "latest" (
    docker push %DOCKER_USER%/pbs-frontend:latest
)

echo.
echo ==============================================================================
echo  SUCCESS! DOCKER IMAGES PUSHED TO DOCKER HUB REGISTRY
echo ==============================================================================
echo  1. https://hub.docker.com/r/%DOCKER_USER%/pbs-backend
echo  2. https://hub.docker.com/r/%DOCKER_USER%/pbs-frontend
echo.
echo  Ready for Kubernetes deployment:
echo    Run 'k8s-deploy.bat' or 'kubectl apply -f k8s/pbs-complete.yaml'
echo ==============================================================================
pause
