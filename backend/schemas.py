from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class TransactionEventBase(BaseModel):
    event_id: str
    event_type: str
    previous_state: Optional[str] = None
    new_state: str
    timestamp: datetime
    source: str
    response_latency_ms: Optional[int] = None
    error_code: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class TransactionBase(BaseModel):
    amount: float
    currency: str = "INR"
    customer_id: str
    merchant_id: str
    idempotency_key: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: str
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    failure_code: Optional[str] = None
    failure_reason: Optional[str] = None

    class Config:
        from_attributes = True

class TransactionDetailResponse(TransactionResponse):
    events: List[TransactionEventBase] = []

    class Config:
        from_attributes = True

class SimulationRequest(BaseModel):
    scenario: str # "success", "timeout", "debit_without_credit", "duplicate", "settlement_delay", "reversal", "unknown"
    idempotency_key: Optional[str] = None
    
class ReconciliationCaseBase(BaseModel):
    id: int
    transaction_id: str
    debit_status: Optional[str] = None
    credit_status: Optional[str] = None
    settlement_status: Optional[str] = None
    recommended_action: Optional[str] = None
    created_at: datetime
    status: str
    
    class Config:
        from_attributes = True
