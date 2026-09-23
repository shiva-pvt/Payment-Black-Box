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
    # Handle Idempotency
    if request.idempotency_key:
        existing_tx = db.query(Transaction).filter(Transaction.idempotency_key == request.idempotency_key).first()
        if existing_tx:
            # For demo purposes, if duplicate scenario is chosen, we might still want to return existing
            # and maybe push a "DUPLICATE_REQUEST_REJECTED" event, but the state machine might not allow it 
            # if it's already in terminal state. We'll just return the existing tx.
            return existing_tx

    # Create new transaction
    tx = Transaction(
        idempotency_key=request.idempotency_key,
        amount=5000.0 if request.scenario != "duplicate" else 1500.0,
        currency="INR",
        customer_id=f"CUST-{random.randint(100,999)}",
        merchant_id=f"MERCH-{random.randint(10,99)}"
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)

    # Run simulator in background
    background_tasks.add_task(run_scenario, db, tx, request.scenario)

    return tx

@router.get("", response_model=List[TransactionResponse])
def get_transactions(db: Session = Depends(get_db), limit: int = 50):
    return db.query(Transaction).order_by(Transaction.created_at.desc()).limit(limit).all()

@router.get("/{tx_id}", response_model=TransactionDetailResponse)
def get_transaction(tx_id: str, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx
