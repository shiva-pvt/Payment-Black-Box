from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import ReconciliationCase, Transaction
from schemas import ReconciliationCaseBase

router = APIRouter(prefix="/reconciliation", tags=["reconciliation"])

@router.get("", response_model=List[ReconciliationCaseBase])
def get_cases(db: Session = Depends(get_db)):
    return db.query(ReconciliationCase).order_by(ReconciliationCase.created_at.desc()).all()

@router.post("/{case_id}/resolve")
def resolve_case(case_id: int, action: str, db: Session = Depends(get_db)):
    case = db.query(ReconciliationCase).filter(ReconciliationCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    case.status = "RESOLVED"
    case.recommended_action = action
    
    # We could also transition the transaction to COMPLETED/REVERSED here via StateMachine
    # For demo simplicity, just updating the case.
    db.commit()
    return {"status": "success", "message": "Case resolved"}
