from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Transaction

router = APIRouter(tags=["health"])

@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db)):
    total = db.query(Transaction).count()
    successful = db.query(Transaction).filter(Transaction.status == "COMPLETED").count()
    uncertain = db.query(Transaction).filter(Transaction.status == "UNCERTAIN").count()
    failed = db.query(Transaction).filter(Transaction.status == "FAILED").count()
    recon_req = db.query(Transaction).filter(Transaction.status == "RECONCILIATION_REQUIRED").count()
    
    return {
        "total": total,
        "successful": successful,
        "uncertain": uncertain,
        "failed": failed,
        "reconciliation_required": recon_req,
        "success_rate": round((successful / total * 100) if total > 0 else 0, 2)
    }

@router.get("/health")
def get_health():
    # Simulated system metrics for the Payment Health tab
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
