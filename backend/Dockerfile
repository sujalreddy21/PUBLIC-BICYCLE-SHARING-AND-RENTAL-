# ===================================================
# Dockerfile for PBS Backend API Service
# Author: SUJAL REDDY (2303A51713)
# Academic Year: 2026-2027
# ===================================================

FROM node:20-alpine AS base

# Install system dependencies if required
RUN apk add --no-cache curl tzdata
ENV TZ=Asia/Kolkata

WORKDIR /usr/src/app

# Install dependencies with cache optimization
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy application source code
COPY . .

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Expose backend port
EXPOSE 5000

# Docker health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start server
CMD ["node", "server.js"]
