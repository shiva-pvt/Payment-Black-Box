# Deployment Checklist

## Frontend (Vercel)
- [ ] Vercel project connected to GitHub repository.
- [ ] Framework preset set to `Vite`.
- [ ] Root Directory set to `frontend`.
- [ ] Environment Variables added:
  - `VITE_API_URL` -> `https://[RAILWAY_URL]`
  - `VITE_WS_URL` -> `wss://[RAILWAY_URL]/ws`
- [ ] `vercel.json` present to handle SPA routing rewrites.

## Backend (Railway)
- [ ] Railway project created from GitHub repository.
- [ ] Root Directory set to `/backend`.
- [ ] PostgreSQL Database Service attached.
- [ ] Redis Service attached (optional/supported).
- [ ] Environment Variables added:
  - `DATABASE_URL` (automatically provided by Postgres service)
  - `REDIS_URL` (automatically provided by Redis service)
  - `FRONTEND_URL` -> `https://[VERCEL_URL]`
  - `CORS_ORIGINS` -> `https://[VERCEL_URL]`

## Validation
- [ ] `GET /health` returns 200 OK.
- [ ] Vercel Dashboard loads without CORS errors.
- [ ] Transaction creation broadcasts successfully over WebSockets.
- [ ] Database seeds mock data if empty (done automatically via `seed.py`).
