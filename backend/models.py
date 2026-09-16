from pydantic import BaseModel
from typing import Optional, List

class TelemetryEvent(BaseModel):
    machine_id: str
    temperature: float
    vibration: float
    status: str
    timestamp: str

class CopilotQuery(BaseModel):
    question: str

class ProductionOrder(BaseModel):
    order_id: str
    product_type: str
    quantity: int
    priority: int