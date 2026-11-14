@echo off
echo ==============================================================================
echo  PUBLIC BICYCLE SHARING AND RENTAL MANAGEMENT SYSTEM (PBS-RMS)
echo  KUBERNETES TEARDOWN / CLEANUP
echo  Developer: SUJAL REDDY (2303A51713)
echo ==============================================================================
echo.

echo Deleting Kubernetes resources...
kubectl delete -f k8s/pbs-complete.yaml --ignore-not-found=true
kubectl delete ingress pbs-ingress --ignore-not-found=true

echo.
echo [OK] All PBS Kubernetes resources deleted.
pause
