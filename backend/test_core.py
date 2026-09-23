from fastapi.testclient import TestClient
from main import app
from state_machine import StateMachine, InvalidTransitionError
import pytest

client = TestClient(app)

def test_state_machine_valid():
    # Valid transition INITIATED -> AUTHENTICATED
    new_state, event = StateMachine.transition(
        transaction_id="PBX-TEST",
        current_state="INITIATED",
        new_state="AUTHENTICATED",
        event_type="AUTH",
        source="Test",
        sequence_num=1
    )
    assert new_state == "AUTHENTICATED"
    assert event["event_id"] == "EVT-PBX-TEST-01"

def test_state_machine_invalid():
    # Invalid transition INITIATED -> COMPLETED
    with pytest.raises(InvalidTransitionError):
        StateMachine.transition(
            transaction_id="PBX-TEST",
            current_state="INITIATED",
            new_state="COMPLETED",
            event_type="COMPLETE",
            source="Test",
            sequence_num=1
        )

def test_simulate_idempotency():
    # First request
    resp1 = client.post("/transactions/simulate", json={
        "scenario": "duplicate",
        "idempotency_key": "IDEMP-12345"
    })
    assert resp1.status_code == 200
    tx1 = resp1.json()
    
    # Second request
    resp2 = client.post("/transactions/simulate", json={
        "scenario": "duplicate",
        "idempotency_key": "IDEMP-12345"
    })
    assert resp2.status_code == 200
    tx2 = resp2.json()
    
    # Must be exactly the same transaction
    assert tx1["id"] == tx2["id"]

def test_metrics():
    resp = client.get("/metrics")
    assert resp.status_code == 200
    data = resp.json()
    assert "total" in data
    assert "success_rate" in data
