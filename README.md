# Payment Black Box

**Observe. Understand. Recover.**

Payment Black Box is an advanced transaction observability, diagnosis, reconciliation, and recovery platform for digital payments. Built as a prototype for modern fintech infrastructure, it simulates and diagnoses real-time payment failures, identifying root causes (like NPCI timeouts, bank node failures, or liquidity mismatches) using deterministic state machine tracing.

> **Disclaimer:** This prototype simulates payment processing and recovery workflows. It does not process real financial transactions or perform real bank/UPI reversals.

---

## 🏗️ Architecture

The project is structured as a monorepo containing a modern Vite/React frontend and a robust FastAPI backend.

- **Frontend (`/frontend`)**: React, Vite, Tailwind CSS, Recharts, Lucide Icons. Deployed natively as a Single Page Application (SPA).
- **Backend (`/backend`)**: Python, FastAPI, SQLAlchemy, WebSockets.
- **Database**: PostgreSQL (Production) / SQLite (Local Development).
- **Cache/Realtime**: Redis (Production - pub/sub) / In-memory (Local).

### Component Flow
1. **Transaction Simulation**: The user initiates a transaction payload in the dashboard.
2. **State Machine Processing**: The backend explicitly walks the payment through standard UPI/Banking phases (Initiated -> Authenticated -> Processing -> Debit -> Credit -> Settlement -> Completed/Failed).
3. **Real-time Observability**: State transitions are broadcasted via WebSockets back to the React UI in real-time.
4. **Reconciliation & Root Cause**: Failed transactions are aggregated, reconciled, and provided with actionable recovery steps based on the exact failure point.

---

## 🚀 Local Setup

### Prerequisites
- Node.js (v18+)
- Python (3.11+)
- Git

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
*The backend will automatically start on `http://localhost:8000` using a local SQLite database (`pbx.db`).*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The frontend will be available at `http://localhost:5173`. It automatically connects to the local backend.*

---

## ☁️ Deployment

### Railway Deployment (Backend + Database)
1. Import the repository into [Railway](https://railway.app).
2. Provision a **PostgreSQL** service and optionally a **Redis** service.
3. Provision a **GitHub Repo** service pointed to the `/backend` Root Directory.
4. Set Backend Environment Variables:
   - `DATABASE_URL`: `${Postgres.DATABASE_URL}`
   - `REDIS_URL`: `${Redis.REDIS_URL}`
   - `FRONTEND_URL`: `https://your-vercel-domain.vercel.app`
   - `CORS_ORIGINS`: `https://your-vercel-domain.vercel.app`
5. Deploy the backend service.

### Vercel Deployment (Frontend)
1. Import the repository into [Vercel](https://vercel.com).
2. Set the Root Directory to `frontend`.
3. Vercel automatically detects the Vite framework and routing (`vercel.json` handles SPA fallback).
4. Set Frontend Environment Variables:
   - `VITE_API_URL`: `https://your-railway-domain.up.railway.app`
   - `VITE_WS_URL`: `wss://your-railway-domain.up.railway.app/ws`
5. Deploy the frontend service.

---

## ⚙️ Environment Variables

### Backend (`/backend/.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string. | (Falls back to SQLite) |
| `REDIS_URL` | Redis connection string for WS pub/sub. | (Falls back to memory) |
| `FRONTEND_URL` | URL of the frontend for CORS. | `http://localhost:5173` |
| `CORS_ORIGINS` | Comma-separated allowed origins. | `$FRONTEND_URL` |

### Frontend (`/frontend/.env.production`)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | HTTPS URL of the backend API. | `http://localhost:8000` |
| `VITE_WS_URL` | WSS URL for WebSocket broadcasts. | `ws://localhost:8000/ws` |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Fetch overall system health, bank latencies, and anomalies. |
| `GET` | `/transactions` | List all transactions with status and mock identifiers. |
| `GET` | `/transactions/{id}` | Fetch detailed transaction state and payload. |
| `POST` | `/transactions/simulate` | Trigger a new simulated transaction (pass scenario). |
| `GET` | `/reconciliation` | Fetch aggregate reconciliation metrics and failure categories. |
| `WS` | `/ws` | WebSocket endpoint for real-time transaction updates. |

---

## 🧪 Testing

The backend includes a comprehensive pytest suite to validate state machine transitions and core application logic.
```bash
cd backend
pytest test_core.py -v
```

The frontend relies on standard Vite builds for syntax and static typing checks:
```bash
cd frontend
npm run build
```
