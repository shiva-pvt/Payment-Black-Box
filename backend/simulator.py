import asyncio
import random
from sqlalchemy.orm import Session
from models import Transaction, TransactionEvent, ReconciliationCase
from state_machine import StateMachine, InvalidTransitionError
from websocket_manager import manager

def _apply_event(db: Session, tx: Transaction, current_state: str, new_state: str, event_type: str, source: str, sequence_num: int, latency: int = None, error_code: str = None, metadata: dict = None):
    new_state, event_data = StateMachine.transition(
        transaction_id=tx.id,
        current_state=current_state,
        new_state=new_state,
        event_type=event_type,
        source=source,
        sequence_num=sequence_num,
        response_latency_ms=latency,
        error_code=error_code,
        metadata=metadata
    )
    db_event = TransactionEvent(**event_data)
    db.add(db_event)
    tx.status = new_state
    db.commit()
    
    safe_event = event_data.copy()
    safe_event['timestamp'] = str(db_event.timestamp) if db_event.timestamp else None
    return new_state, safe_event

async def run_scenario(db: Session, tx: Transaction, scenario: str):
    """
    Executes a simulated transaction scenario step-by-step using the state machine,
    broadcasting events via WebSocket.
    """
    seq = 1
    current_state = None
    
    try:
        # Step 1: INITIATED
        current_state, event = _apply_event(db, tx, current_state, "INITIATED", "PAYMENT_REQUEST_RECEIVED", "PaymentGateway", seq)
        await manager.broadcast_transaction_update(tx.id, current_state, event)
        seq += 1
        await asyncio.sleep(0.5)
        
        # Step 2: AUTHENTICATED
        current_state, event = _apply_event(db, tx, current_state, "AUTHENTICATED", "AUTHENTICATION_SUCCESS", "AuthService", seq, latency=150)
        await manager.broadcast_transaction_update(tx.id, current_state, event)
        seq += 1
        await asyncio.sleep(0.5)

        # Step 3: PROCESSING
        current_state, event = _apply_event(db, tx, current_state, "PROCESSING", "BANK_REQUEST_SENT", "CoreBanking", seq, latency=200)
        await manager.broadcast_transaction_update(tx.id, current_state, event)
        seq += 1
        await asyncio.sleep(1.0)
        
        if scenario == "success":
            current_state, event = _apply_event(db, tx, current_state, "DEBIT_CONFIRMED", "DEBIT_SUCCESS", "CoreBanking", seq, latency=400)
            await manager.broadcast_transaction_update(tx.id, current_state, event)
            seq += 1
            await asyncio.sleep(0.5)
            
            current_state, event = _apply_event(db, tx, current_state, "CREDIT_CONFIRMED", "MERCHANT_CREDIT_SUCCESS", "AcquiringBank", seq, latency=300)
            await manager.broadcast_transaction_update(tx.id, current_state, event)
            seq += 1
            await asyncio.sleep(0.5)
            
            current_state, event = _apply_event(db, tx, current_state, "SETTLEMENT_PENDING", "QUEUED_FOR_SETTLEMENT", "SettlementEngine", seq, latency=100)
            await manager.broadcast_transaction_update(tx.id, current_state, event)
            seq += 1
            await asyncio.sleep(0.5)
            
            current_state, event = _apply_event(db, tx, current_state, "COMPLETED", "SETTLEMENT_SUCCESS", "SettlementEngine", seq, latency=1200)
            await manager.broadcast_transaction_update(tx.id, current_state, event)

        elif scenario == "timeout":
            current_state, event = _apply_event(db, tx, current_state, "TIMEOUT", "NETWORK_TIMEOUT", "NetworkLayer", seq, latency=5000, error_code="NET_504")
            await manager.broadcast_transaction_update(tx.id, current_state, event)
            seq += 1
            await asyncio.sleep(1.0)
            
            current_state, event = _apply_event(db, tx, current_state, "UNCERTAIN", "STATE_UNKNOWN", "ObservabilityAgent", seq)
            await manager.broadcast_transaction_update(tx.id, current_state, event)
            seq += 1
            
            current_state, event = _apply_event(db, tx, current_state, "RECONCILIATION_REQUIRED", "AUTO_RECON_TRIGGERED", "ReconciliationEngine", seq)
            await manager.broadcast_transaction_update(tx.id, current_state, event)
            
            rc = ReconciliationCase(transaction_id=tx.id, recommended_action="Check debit status")
            db.add(rc)
            db.commit()

        elif scenario == "debit_without_credit":
            current_state, event = _apply_event(db, tx, current_state, "DEBIT_CONFIRMED", "DEBIT_SUCCESS", "CoreBanking", seq, latency=350)
            await manager.broadcast_transaction_update(tx.id, current_state, event)
            seq += 1
            await asyncio.sleep(2.0)
            
            current_state, event = _apply_event(db, tx, current_state, "TIMEOUT", "MERCHANT_CREDIT_TIMEOUT", "AcquiringBank", seq, latency=4000, error_code="MCH_408")
            await manager.broadcast_transaction_update(tx.id, current_state, event)
            seq += 1
            await asyncio.sleep(0.5)
            
            current_state, event = _apply_event(db, tx, current_state, "UNCERTAIN", "CREDIT_STATUS_UNKNOWN", "ObservabilityAgent", seq)
            await manager.broadcast_transaction_update(tx.id, current_state, event)
            seq += 1
            
            current_state, event = _apply_event(db, tx, current_state, "RECONCILIATION_REQUIRED", "AUTO_RECON_TRIGGERED", "ReconciliationEngine", seq)
            await manager.broadcast_transaction_update(tx.id, current_state, event)
            
            rc = ReconciliationCase(transaction_id=tx.id, debit_status="Confirmed", credit_status="Unknown", recommended_action="Query merchant acquiring system")
            db.add(rc)
            db.commit()

        elif scenario == "merchant_timeout":
            # Similar to above but specifically fails at authentication/processing before debit
            current_state, event = _apply_event(db, tx, current_state, "TIMEOUT", "MERCHANT_RESPONSE_TIMEOUT", "PaymentGateway", seq, latency=8000, error_code="PG_504")
            await manager.broadcast_transaction_update(tx.id, current_state, event)
            seq += 1
            
            current_state, event = _apply_event(db, tx, current_state, "UNCERTAIN", "GATEWAY_UNCERTAIN", "ObservabilityAgent", seq)
            await manager.broadcast_transaction_update(tx.id, current_state, event)
            seq += 1
            
            current_state, event = _apply_event(db, tx, current_state, "RECONCILIATION_REQUIRED", "AUTO_RECON_TRIGGERED", "ReconciliationEngine", seq)
            await manager.broadcast_transaction_update(tx.id, current_state, event)
            
            rc = ReconciliationCase(transaction_id=tx.id, debit_status="Unknown", credit_status="Failed", recommended_action="Check if bank debited the customer")
            db.add(rc)
            db.commit()
            
        elif scenario == "duplicate":
            # A duplicate that somehow reached processing
            current_state, event = _apply_event(db, tx, current_state, "FAILED", "DUPLICATE_DETECTED", "RiskEngine", seq, error_code="DUP_409")
            await manager.broadcast_transaction_update(tx.id, current_state, event)

        elif scenario == "settlement_delay":
            current_state, event = _apply_event(db, tx, current_state, "DEBIT_CONFIRMED", "DEBIT_SUCCESS", "CoreBanking", seq, latency=400)
            await manager.broadcast_transaction_update(tx.id, current_state, event)
            seq += 1
            await asyncio.sleep(0.5)
            
            current_state, event = _apply_event(db, tx, current_state, "CREDIT_CONFIRMED", "MERCHANT_CREDIT_SUCCESS", "AcquiringBank", seq, latency=300)
            await manager.broadcast_transaction_update(tx.id, current_state, event)
            seq += 1
            await asyncio.sleep(0.5)
            
            current_state, event = _apply_event(db, tx, current_state, "SETTLEMENT_PENDING", "QUEUED_FOR_SETTLEMENT", "SettlementEngine", seq, latency=100)
            await manager.broadcast_transaction_update(tx.id, current_state, event)
            seq += 1
            await asyncio.sleep(1.0)
            
            current_state, event = _apply_event(db, tx, current_state, "UNCERTAIN", "SETTLEMENT_DELAY_DETECTED", "SettlementMonitor", seq, error_code="SET_001")
            await manager.broadcast_transaction_update(tx.id, current_state, event)
            seq += 1
            
            current_state, event = _apply_event(db, tx, current_state, "RECONCILIATION_REQUIRED", "MANUAL_INTERVENTION_NEEDED", "ReconciliationEngine", seq)
            await manager.broadcast_transaction_update(tx.id, current_state, event)
            
            rc = ReconciliationCase(transaction_id=tx.id, debit_status="Confirmed", credit_status="Confirmed", settlement_status="Delayed", recommended_action="Check batch job status")
            db.add(rc)
            db.commit()
            
        elif scenario == "reversal":
            current_state, event = _apply_event(db, tx, current_state, "DEBIT_CONFIRMED", "DEBIT_SUCCESS", "CoreBanking", seq, latency=350)
            await manager.broadcast_transaction_update(tx.id, current_state, event)
            seq += 1
            await asyncio.sleep(0.5)
            
            current_state, event = _apply_event(db, tx, current_state, "REVERSAL_PENDING", "FRAUD_DETECTED", "RiskEngine", seq, error_code="RISK_999")
            await manager.broadcast_transaction_update(tx.id, current_state, event)
            seq += 1
            await asyncio.sleep(1.0)
            
            current_state, event = _apply_event(db, tx, current_state, "REVERSED", "REVERSAL_SUCCESS", "CoreBanking", seq, latency=400)
            await manager.broadcast_transaction_update(tx.id, current_state, event)

        elif scenario == "unknown":
            current_state, event = _apply_event(db, tx, current_state, "UNCERTAIN", "CONNECTION_DROPPED", "NetworkLayer", seq, error_code="NET_000")
            await manager.broadcast_transaction_update(tx.id, current_state, event)
            seq += 1
            
            current_state, event = _apply_event(db, tx, current_state, "RECONCILIATION_REQUIRED", "MANUAL_INTERVENTION_NEEDED", "ReconciliationEngine", seq)
            await manager.broadcast_transaction_update(tx.id, current_state, event)
            
            rc = ReconciliationCase(transaction_id=tx.id, debit_status="Unknown", credit_status="Unknown", recommended_action="Check core banking logs manually")
            db.add(rc)
            db.commit()

    except InvalidTransitionError as e:
        print(f"State Machine Error: {e}")
