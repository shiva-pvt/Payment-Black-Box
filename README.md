# Payment Black Box

Observe. Understand. Recover.

Payment Black Box is a transaction observability and recovery platform designed for real-time payment failures and uncertain transactions. It acts as an operations dashboard tailored for fintech engineers and operators.

> **Note:** This project is a working prototype and utilizes a payment simulator. It does NOT process real financial transactions.

## Problem

Real-time payments can enter uncertain states due to timeouts, network failures, delayed responses, debit-without-credit situations, duplicate requests, and settlement mismatches. Traditional systems only display "SUCCESS," "FAILED," or "PENDING." Payment Black Box records the complete lifecycle of a transaction to answer:

1. What happened?
2. Where did it happen?
3. Why did it happen?
4. What is the current state?
5. What should happen next?
6. Can the transaction be reconciled or recovered?

## Architecture

Payment Black Box consists of:
- **Explicit State Machine**: Ensures deterministic state transitions and logs detailed events for each transaction.
- **Payment Simulator**: A tool to generate various transaction scenarios (e.g., Timeout, Duplicate, Success).
- **Idempotency System**: Prevents duplicate processing via idempotency keys.
- **WebSocket Streaming**: Real-time event propagation to the frontend.
- **Reconciliation Engine & Recovery Workflow**: Identifies failed or uncertain transactions and suggests actionable recovery paths.

### Tech Stack
- **Backend:** Python, FastAPI, SQLAlchemy, WebSockets
- **Database:** PostgreSQL (Primary) / SQLite (Fallback)
- **Cache / PubSub:** Redis (Primary) / In-memory (Fallback)
- **Frontend:** React, TypeScript, Vite, Tailwind CSS

## Local Setup

### 1. Requirements
- Node.js (v18+)
- Python 3.10+
- (Optional) Docker & Docker Compose for PostgreSQL + Redis setup.

### 2. Environment Variables
Copy the example environment file in the root directory:
```bash
cp .env.example .env
```

**Important:** The system defaults to `DB_TYPE=sqlite` to allow immediate execution without Docker. If you have Docker installed and want the full stack:
1. Set `DB_TYPE=postgres` in `.env`.
2. Run `docker-compose up -d`.

### 3. Running the Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
uvicorn main:app --reload
```

### 4. Running the Frontend
```bash
cd frontend
npm install
npm run dev
```

## Demo Scenarios

The platform includes a "Create Test Transaction" feature to simulate the following scenarios:
1. **Success**: End-to-end healthy transaction.
2. **Network Timeout**: Fails during processing due to network lag.
3. **Debit confirmed, credit missing**: Money is debited but the merchant never acknowledges it.
4. **Merchant response timeout**: Merchant endpoint times out.
5. **Duplicate payment request**: Simulates idempotency protections.
6. **Settlement delayed**: Delayed end-of-day settlement batching.
7. **Reversal pending**: A failed transaction requiring manual or automated reversal.
8. **Unknown/uncertain transaction**: An indeterminate state requiring operator reconciliation.

## API Documentation

Once the backend is running, the interactive OpenAPI documentation is available at:
`http://localhost:8000/docs`

## Limitations

- The payment provider in this MVP is simulated. No real funds are moved.
- Machine Learning anomaly detection is outside the scope of this core product layer.
