from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])

@router.get("")
def get_health():
    # Simulated system metrics
    return {
        "overall": "Healthy",
        "banks": [
            {"name": "Bank A", "success_rate": 99.7, "avg_response_ms": 1200},
            {"name": "Bank B", "success_rate": 97.8, "avg_response_ms": 2800},
            {"name": "Bank C", "success_rate": 91.4, "avg_response_ms": 5100}
        ],
        "anomalies": [
            "Increase in settlement timeouts",
            "Higher response latency from Bank C",
            "14 unresolved debit/credit mismatches"
        ]
    }
