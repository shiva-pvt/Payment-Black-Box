from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import uuid
import random

from database import get_db
from models import Transaction, TransactionEvent
from schemas import TransactionResponse, TransactionDetailResponse, SimulationRequest, TransactionCreate
from simulator import run_scenario

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.post("/simulate", response_model=TransactionResponse)
def simulate_transaction(
    request: SimulationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # Handle Idempotency explicitly
    if request.idempotency_key:
        existing_tx = db.query(Transaction).filter(Transaction.idempotency_key == request.idempotency_key).first()
        if existing_tx:
            # Idempotent response: Do not create duplicate, return existing transaction.
            return existing_tx

    # Create new transaction
    tx = Transaction(
        idempotency_key=request.idempotency_key,
        amount=5000.0 if request.scenario != "duplicate" else 1500.0,
        currency="INR",
        customer_id=f"CUST-{random.randint(100,999)}",
        merchant_id=f"MERCH-{random.randint(10,99)}",
        scenario=request.scenario
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)

    # Run simulator in background
    background_tasks.add_task(run_scenario, db, tx, request.scenario)

    return tx

@router.get("", response_model=List[TransactionResponse])
def get_transactions(db: Session = Depends(get_db), limit: int = 50, status: str = None, scenario: str = None):
    query = db.query(Transaction)
    if status:
        query = query.filter(Transaction.status == status)
    if scenario:
        query = query.filter(Transaction.scenario == scenario)
    return query.order_by(Transaction.created_at.desc()).limit(limit).all()

@router.get("/{tx_id}", response_model=TransactionDetailResponse)
def get_transaction(tx_id: str, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx

@router.post("/{tx_id}/recovery")
def recover_transaction(tx_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if tx.status not in ["RECONCILIATION_REQUIRED", "UNCERTAIN"]:
        raise HTTPException(status_code=400, detail="Transaction not in recoverable state")

    # Simulate recovery workflow
    from state_machine import StateMachine
    from simulator import _apply_event

    def execute_recovery():
        try:
            # We move it from UNCERTAIN/RECONCILIATION_REQUIRED to RECOVERY check
            current_state, event = _apply_event(db, tx, tx.status, "MANUAL_REVIEW", "RECOVERY_INITIATED", "RecoveryWorkflow", 999)
            
            # Simple heuristic: if it was debit without credit, we reverse. If it was settlement delay, we complete.
            if tx.scenario == "debit_without_credit":
                import asyncio
                import time
                time.sleep(1) # simulate check
                _apply_event(db, tx, current_state, "REVERSED", "RECOVERY_REVERSED", "RecoveryWorkflow", 1000)
            else:
                import time
                time.sleep(1)
                _apply_event(db, tx, current_state, "COMPLETED", "RECOVERY_COMPLETED", "RecoveryWorkflow", 1000)
        except Exception as e:
            pass
            
    background_tasks.add_task(execute_recovery)
    return {"status": "Recovery workflow initiated"}
