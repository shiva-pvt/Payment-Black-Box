# Technical Debt & Future Improvements

## 1. Authentication Layer
Currently, the API and Dashboard are completely open. 
- **Action**: Add Auth0 or generic JWT bearer authentication to `main.py`.

## 2. Real Database Migrations
We rely on `Base.metadata.create_all(bind=engine)` on startup.
- **Action**: Introduce Alembic for proper schema versioning and safe rollbacks in production.

## 3. WebSocket Scalability
The current `ConnectionManager` has a Redis pub/sub integration stub, but it needs a full bi-directional broadcast channel across multiple Uvicorn worker instances.
- **Action**: Implement Broadcaster or a full Redis Pub/Sub consumer loop in the FastAPI lifecycle.

## 4. Frontend State Management
We fetch and hold state locally in React components via `useEffect`.
- **Action**: Migrate to React Query (TanStack Query) for advanced caching, polling, and optimistic UI updates.

## 5. End-to-End Testing
Backend has Pytest coverage for core logic, but the frontend lacks E2E tests.
- **Action**: Integrate Playwright or Cypress to test the user flow from dashboard to transaction recovery.
