#!/usr/bin/env bash
# ==============================================================================
# PUBLIC BICYCLE SHARING AND RENTAL MANAGEMENT SYSTEM (PBS-RMS)
# GITHUB REPOSITORY PUSH AUTOMATION (Linux / macOS / WSL)
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
echo -e "${BLUE} GITHUB REPOSITORY PUSH AUTOMATION${NC}"
echo -e "${BLUE} Target: https://github.com/sujalreddy21/PUBLIC-BICYCLE-SHARING-AND-RENTAL-${NC}"
echo -e "${BLUE}==============================================================================${NC}"
echo ""

git remote set-url origin "https://github.com/sujalreddy21/PUBLIC-BICYCLE-SHARING-AND-RENTAL-.git" 2>/dev/null || \
git remote add origin "https://github.com/sujalreddy21/PUBLIC-BICYCLE-SHARING-AND-RENTAL-.git"

git branch -M main

echo -e "${YELLOW}Pushing to GitHub...${NC}"
git push -u origin main --force

echo ""
echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN} SUCCESS! PROJECT PUSHED TO GITHUB REPOSITORY:${NC}"
echo -e "${GREEN} https://github.com/sujalreddy21/PUBLIC-BICYCLE-SHARING-AND-RENTAL-${NC}"
echo -e "${GREEN}==============================================================================${NC}"
