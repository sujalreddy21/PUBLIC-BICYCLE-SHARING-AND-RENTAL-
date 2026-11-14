# 🚲 Public Bicycle Sharing and Rental Management System (PBS-RMS)

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v6-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v6.0-47A248.svg)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326CE5.svg)](https://kubernetes.io/)

---

## 🎓 Academic Project Information
- **Student Name:** SUJAL REDDY
- **Hall Ticket Number:** 2303A51713
- **Subject:** DevOps & Full Stack
- **Academic Year:** 2026–2027
- **Institution:** Department of Computer Science & Engineering

---

## 📌 Project Overview
The **Public Bicycle Sharing and Rental Management System** is a modern, enterprise-grade, cloud-native full-stack mobility web application engineered to solve urban last-mile transit challenges. The platform features an interactive single-page dashboard with 12 complete functional screens, role-based access control across four distinct user roles, automated dynamic rental fare calculations, station dock occupancy validation, fleet maintenance ticketing, business intelligence analytics with CSV exports, multi-container Docker Compose orchestration, and production Kubernetes deployment manifests.

---

## 🌟 Key Features

### 1. 🔐 Authentication & Role-Based Access Control (RBAC)
- 4 Partitioned Roles:
  - **Administrator:** Complete fleet management, stations, pricing tiers, system reports, and revenue audit.
  - **Operations Manager:** Live station monitoring, fleet health, bike rebalancing, and maintenance schedules.
  - **Station Attendant:** Dedicated station terminal console, walk-in checkouts, dock check-ins, and defect logging.
  - **Member (Commuter):** Bike reservations with 30-min hold timer, 1-click unlocks, active trip tracking, pass subscriptions, and wallet recharge.
- JWT-based stateless authentication with `bcrypt` salted password encryption.
- One-click demo credential switcher on login and in the dashboard sidebar for immediate evaluation.

### 2. 🚲 Bicycle Fleet & Station Capacity Management
- Real-time fleet inventory tracking: `Available`, `Reserved`, `Rented`, `Under Maintenance`, `Inactive`.
- Support for multiple bicycle models: Standard, Electric (with battery telemetry), Geared (7-Speed), and Cruisers.
- Rigid station capacity enforcement prevents docking beyond maximum capacity slots.
- Station inventory drilldown modal displaying all bicycles parked at each docking hub.

### 3. 💳 Membership Passes & Tiered Pricing
- Configurable membership tiers: **Daily Pass**, **Weekly Pass**, **Monthly Pass**, and **Annual Pass**.
- Free ride minutes (30–90 mins) per trip with discounted hourly overtime rates.
- In-app Smart Mobility Wallet with instant balance recharge.

### 4. ⏱️ Automated Rental Checkout & Return
- **Checkout:** Generates unique rental ID (`RNT-YYYYMMDD-XXXX`), transitions bicycle status to `Rented`, and updates station counts.
- **Return:** Verifies return station dock capacity, calculates elapsed duration, calculates fare discounts, updates bicycle to `Available`, and generates an itemized rental receipt.

### 5. 🔧 Fleet Maintenance & Repair Management
- Defect reporting system with priority triage (`Low`, `Medium`, `High`, `Critical`).
- Technician assignment and repair status lifecycle (`Pending` → `In Progress` → `Completed`).
- Automatic fleet restoration: marking a ticket `Completed` returns the bicycle to `Available` status.

### 6. 📊 4 Mandatory Business Intelligence Reports with CSV Export
1. **Bike Availability Report:** Total fleet distribution, station-wise matrix, and available dock count.
2. **Rental History Report:** Daily rental volume trends, duration averages, and revenue sums.
3. **Station Utilization Report:** Network turnover rankings, top utilized vs. least congested stations.
4. **Revenue Summary:** Gross earnings, membership vs. rental collections, payment method distribution.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Recharts |
| **Backend** | Node.js, Express.js, REST APIs, JSON Web Tokens (JWT), bcryptjs |
| **Database** | MongoDB 6.0, Mongoose ODM (with embedded self-contained runner fallback) |
| **DevOps** | Git, GitHub, Docker (Multi-Stage), Docker Compose, Kubernetes (Deployments, Services, ConfigMaps, Secrets, PVCs), Nginx |

---

## 📋 12 Functional Screens

| # | Screen Name | Key Functionalities |
|:---:|---|---|
| **1** | **Login & Registration** | Sign in, account creation, role selection, password toggle, quick demo credentials |
| **2** | **Admin Dashboard** | 8 KPI stat cards, 4 Recharts visual graphs, recent rental activity feed |
| **3** | **Bicycle Management** | Fleet table, station/status filters, Add Bicycle modal, Edit/Delete modals |
| **4** | **Station Management** | Dock cards, occupancy gauges, free slot count, Add/Edit Station modal |
| **5** | **Membership Management** | Pricing tiers, subscription activation, admin CRUD controls |
| **6** | **Bicycle Reservation** | 30-min hold reservation with countdown, duplicate hold prevention |
| **7** | **Checkout & Return Terminal** | Solenoid unlock, return station dock validation, itemized receipt modal |
| **8** | **Member Dashboard** | Active ride tracker, pass details, nearby docking hubs, wallet recharge |
| **9** | **Rental History** | Audit ledger of all sessions, status filters, receipt viewer, CSV export |
| **10**| **Maintenance Management** | Damage ticketing, priority triage, repair cost logs, status update |
| **11**| **Station Attendant Terminal** | Station gate terminal, walk-in checkouts, dock receipts, defect reporting |
| **12**| **Reports & Analytics** | 4 official reports, interactive Recharts visualizations, CSV data export |

---

## 🔑 Demo Login Credentials

| Role | Email Address | Password | Permissions Scope |
|---|---|---|---|
| **System Administrator** | `admin@pbs.com` | `Admin@123` | Full system access, all screens |
| **Operations Manager** | `ops@pbs.com` | `Ops@123` | Fleet, stations, maintenance, reports |
| **Station Attendant 1** | `attendant1@pbs.com` | `Attendant@123` | Central Metro Station terminal |
| **Station Attendant 2** | `attendant2@pbs.com` | `Attendant@123` | Tech Park Gateway terminal |
| **Member (Sujal Reddy)** | `sujal@pbs.com` | `Member@123` | Annual pass subscriber |
| **Member (Priya Sharma)**| `priya@pbs.com` | `Member@123` | Monthly pass subscriber |
| **Member (Rahul Varma)** | `rahul@pbs.com` | `Member@123` | Pay-as-you-go rider |

*(Tip: You can also use the One-Click Demo Role Switcher on the login screen or in the sidebar)*

---

## 🚀 Local Installation & Setup

### Prerequisites
- Node.js (v18 or v20+)
- npm (v9+)
- Git

### 1. Clone & Setup Backend
```bash
cd backend
npm install
npm run seed     # Populates database with 5 stations, 26 bikes, users & plans
npm start        # Starts Express API server on http://localhost:5000
```

### 2. Setup & Run Frontend
```bash
cd ../frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:3000
```
Open **`http://localhost:3000`** in your browser.

---

## 🐳 Docker Containerization & Docker Hub Push

The application includes production multi-stage Dockerfiles, a root `docker-compose.yml`, and turnkey automation scripts.

### Build and Push Images to Docker Hub
To build and publish both frontend and backend images to Docker Hub:

```bash
# Automated Windows Script:
.\docker-build-push.bat sujalreddy latest

# Automated Linux / macOS / WSL Script:
chmod +x ./docker-build-push.sh
./docker-build-push.sh sujalreddy latest
```

#### Manual Docker CLI Commands:
```bash
# 1. Login to Docker Hub
docker login

# 2. Build Backend Image (Node 20 Alpine Production)
docker build -t sujalreddy/pbs-backend:latest ./backend

# 3. Build Frontend Image (Vite React + Nginx Alpine Multi-stage)
docker build -t sujalreddy/pbs-frontend:latest ./frontend

# 4. Push to Docker Hub
docker push sujalreddy/pbs-backend:latest
docker push sujalreddy/pbs-frontend:latest
```

### Run Locally with Docker Compose
```bash
# Build and run all 3 containers (MongoDB, Express Backend, React/Nginx Frontend):
docker compose up --build

# Run detached in background:
docker compose up -d

# View container status:
docker compose ps

# View logs:
docker compose logs -f
```

### Accessing Docker Services
- **Frontend Web UI:** [http://localhost:3000](http://localhost:3000)
- **Backend Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **MongoDB Database:** `localhost:27017`

---

## ☸️ Kubernetes Deployment

The `k8s/` directory contains all Kubernetes specifications, plus a unified all-in-one manifest and automated deploy scripts.

📖 **Detailed Guide:** See [docs/DOCKER_KUBERNETES_GUIDE.md](file:///c:/public%20bicycle%20sharing%20system/docs/DOCKER_KUBERNETES_GUIDE.md)

### 1. Automated Deployment
```bash
# On Windows:
.\k8s-deploy.bat

# On Linux / macOS / WSL:
chmod +x ./k8s-deploy.sh
./k8s-deploy.sh
```

### 2. Manual Deployment via kubectl
```bash
# Option A: Deploy with unified all-in-one manifest
kubectl apply -f k8s/pbs-complete.yaml

# Option B: Deploy using Kustomize
kubectl apply -k k8s/

# Option C: Deploy individually in order
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/mongodb-pvc.yaml
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/mongodb-service.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/ingress.yaml
```

### 3. Verify Deployments & Pods
```bash
# Check Pods
kubectl get pods -l app=pbs -o wide

# Check Deployments
kubectl get deployments -l app=pbs

# Check Services & NodePort
kubectl get services -l app=pbs

# Rollout status
kubectl rollout status deployment/backend-deployment
kubectl rollout status deployment/frontend-deployment
```

### 4. Accessing the Application in Kubernetes
- **NodePort Access:** [http://localhost:30080](http://localhost:30080)
- **Minikube:** `minikube service frontend-service`
- **Port Forwarding:** `kubectl port-forward svc/frontend-service 8080:80` -> [http://localhost:8080](http://localhost:8080)
- **Backend Health Check:** `kubectl port-forward svc/backend 5000:5000` -> [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 5. Teardown
```bash
.\k8s-teardown.bat
# or
kubectl delete -f k8s/pbs-complete.yaml
```

---

## 🧪 Automated Testing
Run the automated integration test suite:
```bash
cd backend
npm test
```
The test runner validates:
- Database seeding and model relationships
- Password encryption and token verification
- Station capacity overflow prevention
- Hold reservation conflict prevention
- Rental checkout unique ID generation
- Duration computation and dynamic fare deduction
- Maintenance defect reporting and auto-restoration
- Business intelligence report consistency

---

## 📂 Repository Structure
```
public-bicycle-sharing-system/
│
├── backend/                  # Node.js Express REST API backend
│   ├── config/               # Database connection & memory fallback
│   ├── controllers/          # Business logic controllers
│   ├── middleware/           # Auth, RBAC, error handlers
│   ├── models/               # Mongoose data schemas (8 models)
│   ├── routes/               # API route definitions
│   ├── seed/                 # Seed data script
│   ├── tests/                # Automated integration test suite
│   ├── Dockerfile            # Production backend Docker image
│   ├── .dockerignore
│   └── package.json
│
├── frontend/                 # React 18 Single Page Application
│   ├── public/               # Static assets & icons
│   ├── src/
│   │   ├── components/       # Common reusable UI components & layout
│   │   ├── context/          # AuthContext for session management
│   │   ├── pages/            # 12 Functional Screens
│   │   ├── services/         # API HTTP communication client
│   │   ├── App.jsx           # Main routing & layout controller
│   │   └── main.jsx          # Root React entrypoint
│   ├── Dockerfile            # Multi-stage build with Nginx
│   ├── nginx.conf            # Reverse proxy configuration
│   ├── tailwind.config.js    # Tailwind styling theme
│   ├── vite.config.js        # Vite bundler & proxy configuration
│   └── package.json
│
├── k8s/                      # Production Kubernetes deployment manifests
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── mongodb-pvc.yaml
│   ├── mongodb-deployment.yaml
│   ├── mongodb-service.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   └── frontend-service.yaml
│
├── docs/                     # Comprehensive Academic Project Report
│   └── PROJECT_REPORT.md     # 25 Detailed Sections with Mermaid Diagrams
│
├── docker-compose.yml        # Multi-container orchestration
├── .env.example              # Environment variable template
├── .gitignore                # Git exclusions
└── README.md                 # Complete project documentation
```

---

## 📄 License
Academic and Educational Project - Developed by **SUJAL REDDY (2303A51713)** for the **DevOps & Full Stack** curriculum (2026–2027).
