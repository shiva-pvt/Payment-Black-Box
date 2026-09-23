from sqlalchemy import Column, String, Float, DateTime, Integer, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
import uuid

def generate_tx_id():
    # PBX-YYYY-XXXXXX format mock
    return f"PBX-{str(uuid.uuid4())[:8].upper()}"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True, default=generate_tx_id)
    idempotency_key = Column(String, unique=True, index=True, nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    customer_id = Column(String, nullable=False)
    merchant_id = Column(String, nullable=False)
    status = Column(String, nullable=False, default="INITIATED")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    failure_code = Column(String, nullable=True)
    failure_reason = Column(String, nullable=True)

    events = relationship("TransactionEvent", back_populates="transaction", order_by="TransactionEvent.timestamp")


class TransactionEvent(Base):
    __tablename__ = "transaction_events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, unique=True, index=True, nullable=False) # EVT-PBX-...
    transaction_id = Column(String, ForeignKey("transactions.id"), nullable=False)
    event_type = Column(String, nullable=False)
    previous_state = Column(String, nullable=True)
    new_state = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    source = Column(String, nullable=False)
    response_latency_ms = Column(Integer, nullable=True)
    error_code = Column(String, nullable=True)
    metadata_json = Column(JSON, nullable=True)

    transaction = relationship("Transaction", back_populates="events")


class ReconciliationCase(Base):
    __tablename__ = "reconciliation_cases"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, ForeignKey("transactions.id"), unique=True, nullable=False)
    debit_status = Column(String, nullable=True)
    credit_status = Column(String, nullable=True)
    settlement_status = Column(String, nullable=True)
    recommended_action = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="OPEN") # OPEN, RESOLVED
