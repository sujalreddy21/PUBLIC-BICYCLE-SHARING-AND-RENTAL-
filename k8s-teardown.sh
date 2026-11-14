#!/usr/bin/env bash
# PBS Kubernetes Cleanup
echo "Deleting all PBS Kubernetes resources..."
kubectl delete -f k8s/pbs-complete.yaml --ignore-not-found=true
kubectl delete ingress pbs-ingress --ignore-not-found=true
echo "Done."
