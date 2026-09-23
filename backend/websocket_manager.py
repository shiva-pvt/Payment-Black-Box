from typing import List, Dict
import json
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # We store active websocket connections
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast_transaction_update(self, transaction_id: str, new_state: str, event: dict):
        message = json.dumps({
            "type": "TRANSACTION_UPDATE",
            "transaction_id": transaction_id,
            "new_state": new_state,
            "event": event
        })
        # Simple broadcast to all connected clients
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()
