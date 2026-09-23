import uuid
from typing import Optional, Dict, Any, Tuple
from datetime import datetime

# Define all valid states
STATES = [
    "INITIATED",
    "AUTHENTICATED",
    "PROCESSING",
    "DEBIT_CONFIRMED",
    "CREDIT_CONFIRMED",
    "SETTLEMENT_PENDING",
    "COMPLETED",
    "FAILED",
    "TIMEOUT",
    "UNCERTAIN",
    "REVERSAL_PENDING",
    "REVERSED",
    "RECONCILIATION_REQUIRED",
    "MANUAL_REVIEW"
]

# Define valid state transitions (from_state: [valid_to_states])
VALID_TRANSITIONS = {
    None: ["INITIATED"],
    "INITIATED": ["AUTHENTICATED", "FAILED", "TIMEOUT"],
    "AUTHENTICATED": ["PROCESSING", "FAILED", "TIMEOUT"],
    "PROCESSING": ["DEBIT_CONFIRMED", "FAILED", "TIMEOUT", "UNCERTAIN"],
    "DEBIT_CONFIRMED": ["CREDIT_CONFIRMED", "TIMEOUT", "UNCERTAIN", "REVERSAL_PENDING"],
    "CREDIT_CONFIRMED": ["SETTLEMENT_PENDING", "COMPLETED", "FAILED"], # could fail settlement immediately
    "SETTLEMENT_PENDING": ["COMPLETED", "UNCERTAIN", "REVERSAL_PENDING"],
    "TIMEOUT": ["UNCERTAIN", "REVERSAL_PENDING", "RECONCILIATION_REQUIRED", "FAILED"],
    "UNCERTAIN": ["RECONCILIATION_REQUIRED", "REVERSAL_PENDING", "MANUAL_REVIEW"],
    "RECONCILIATION_REQUIRED": ["MANUAL_REVIEW", "COMPLETED", "REVERSAL_PENDING"],
    "MANUAL_REVIEW": ["COMPLETED", "REVERSED", "REVERSAL_PENDING"],
    "REVERSAL_PENDING": ["REVERSED", "FAILED"],
    "COMPLETED": [], # Terminal
    "FAILED": [], # Terminal
    "REVERSED": [] # Terminal
}

class InvalidTransitionError(Exception):
    pass

class StateMachine:
    """
    Explicit State Machine for Transaction Lifecycle
    Ensures deterministic transitions and event recording.
    """
    
    @staticmethod
    def generate_event_id(transaction_id: str, sequence_num: int) -> str:
        # e.g. EVT-PBX-XXXX-01
        return f"EVT-{transaction_id}-{sequence_num:02d}"

    @staticmethod
    def validate_transition(current_state: Optional[str], new_state: str) -> bool:
        if new_state not in STATES:
            return False
        allowed = VALID_TRANSITIONS.get(current_state, [])
        return new_state in allowed

    @staticmethod
    def transition(
        transaction_id: str,
        current_state: Optional[str],
        new_state: str,
        event_type: str,
        source: str,
        sequence_num: int,
        response_latency_ms: Optional[int] = None,
        error_code: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Attempts to transition the transaction state.
        Returns the new state and an event dictionary to be persisted.
        Raises InvalidTransitionError if the transition is not allowed.
        """
        if not StateMachine.validate_transition(current_state, new_state):
            raise InvalidTransitionError(f"Cannot transition from {current_state} to {new_state}")

        event_id = StateMachine.generate_event_id(transaction_id, sequence_num)

        event = {
            "event_id": event_id,
            "transaction_id": transaction_id,
            "event_type": event_type,
            "previous_state": current_state,
            "new_state": new_state,
            "source": source,
            "response_latency_ms": response_latency_ms,
            "error_code": error_code,
            "metadata_json": metadata or {}
        }
        
        return new_state, event
