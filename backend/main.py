from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.models import TelemetryEvent, CopilotQuery
from backend.database import TELEMETRY_STORE, ALERTS_STORE, MACHINES_STORE
from ai_engine.knowledge_graph import FactoryKnowledgeGraph
from ai_engine.copilot_agent import AIFactoryCopilot
from pydantic import BaseModel
from typing import Optional
import random
import datetime

app = FastAPI(
    title="Enterprise Autonomous Manufacturing Intelligence Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

kg = FactoryKnowledgeGraph()
copilot = AIFactoryCopilot()

class MachineCreate(BaseModel):
    id: str
    line: str
    temp: float
    vibration: float
    health: str
    status: str

@app.get("/")
def read_root():
    return {"status": "Active", "system": "AI-232 Factory Intelligence Platform"}

@app.get("/api/dashboard/oee")
def get_executive_dashboard():
    maintenance_count = sum(1 for m in MACHINES_STORE if m["health"] in ["At Risk", "Failing Soon"])
    return {
        "overall_equipment_effectiveness": 87.4,
        "factory_health_score": 92.1 if maintenance_count < 2 else 78.5,
        "active_machines": 34800 + len(MACHINES_STORE),
        "total_robots": 8000,
        "machines_under_maintenance": maintenance_count,
        "total_energy_consumption_kwh": 142500.5,
        "quality_defect_rate": 0.012,
        "factories_monitored": 150
    }

@app.get("/api/machines")
def get_machines():
    return MACHINES_STORE

@app.post("/api/machines")
def create_machine(machine: MachineCreate):
    global ALERTS_STORE
    for m in MACHINES_STORE:
        if m["id"] == machine.id:
            raise HTTPException(status_code=400, detail="Machine ID already exists")
    
    MACHINES_STORE.append(machine.dict())

    # Automatically generate an alert if the machine is at risk or failing
    if machine.health in ["At Risk", "Failing Soon"]:
        new_alert = {
            "alert_id": f"ALT-{random.randint(1000,9999)}",
            "machine_id": machine.id,
            "severity": "HIGH" if machine.health == "Failing Soon" else "MEDIUM",
            "message": f"Autonomous detection: Machine {machine.id} flagged as '{machine.health}' (Temp: {machine.temp}°C, Vib: {machine.vibration}).",
            "timestamp": datetime.datetime.now().isoformat()
        }
        ALERTS_STORE.insert(0, new_alert) # Add to top of alerts

    return {"status": "Success", "machine": machine.dict()}

@app.delete("/api/machines/{machine_id}")
def delete_machine(machine_id: str):
    global MACHINES_STORE, ALERTS_STORE
    initial_len = len(MACHINES_STORE)
    MACHINES_STORE = [m for m in MACHINES_STORE if m["id"] != machine_id]
    
    if len(MACHINES_STORE) == initial_len:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    # Automatically clean up alerts associated with this machine
    ALERTS_STORE = [a for a in ALERTS_STORE if a["machine_id"] != machine_id]

    return {"status": "Success", "deleted": machine_id}

@app.get("/api/alerts")
def get_alerts():
    return ALERTS_STORE

@app.post("/api/copilot")
def handle_copilot(query: CopilotQuery):
    response = copilot.process_query(query.question)
    return response

@app.get("/api/knowledge-graph/schema")
def get_kg_schema():
    return kg.get_schema_summary()