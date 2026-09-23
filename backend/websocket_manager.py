import os
from typing import List, Dict
import json
from fastapi import WebSocket

REDIS_URL = os.getenv("REDIS_URL")

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.redis = None
        if REDIS_URL:
            import redis.asyncio as redis
            self.redis = redis.from_url(REDIS_URL)

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
