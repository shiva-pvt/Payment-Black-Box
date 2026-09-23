# Security Review

## Authentication & Authorization
- **Current State**: Unauthenticated. This is a hackathon/demo prototype designed for open observability.
- **Risk**: Open access to sensitive payment metadata.
- **Recommendation**: Implement JWT-based API authentication and OAuth2/OIDC for the frontend dashboard in the next iteration.

## Data Protection
- **Current State**: Uses PostgreSQL for transactional storage. Passwords and secrets are managed via environment variables (`.env`).
- **Risk**: PII leakage in simulated payloads.
- **Recommendation**: Integrate field-level encryption for transaction payloads or ensure simulation data strictly uses mock PII (Faker).

## API Security
- **Current State**: CORS is dynamically bound to `FRONTEND_URL`. Global exception handlers suppress 500-level stack traces.
- **Risk**: Rate limiting is not enforced, vulnerable to volumetric simulation DoS.
- **Recommendation**: Implement FastAPI Limiter or Nginx/Vercel edge-level rate limiting.

## Infrastructure
- **Current State**: Deployed on Railway (backend) and Vercel (frontend) using isolated containers.
- **Recommendation**: Move to a VPC peering setup for database access to remove public database endpoints.
