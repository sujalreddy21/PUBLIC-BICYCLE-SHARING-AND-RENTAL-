# ===================================================
# Root Dockerfile for Public Bicycle Sharing Backend
# Author: SUJAL REDDY (2303A51713) | Academic Year: 2026-2027
# ===================================================

FROM node:20-alpine AS base

RUN apk add --no-cache curl tzdata
ENV TZ=Asia/Kolkata

WORKDIR /usr/src/app

# Support building from repository root context
COPY backend/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY backend/ .

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
