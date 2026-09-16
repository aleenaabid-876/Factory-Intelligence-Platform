# Simulated enterprise memory store tracking 150 Smart Factories
TELEMETRY_STORE = []

ALERTS_STORE = [
    {
        "alert_id": "ALT-9041",
        "machine_id": "CNC_Mill_04",
        "severity": "HIGH",
        "message": "Overheating detected (88.4°C). Risk of spindle failure.",
        "timestamp": "2026-03-30T10:15:00Z"
    },
    {
        "alert_id": "ALT-9042",
        "machine_id": "Robot_X9",
        "severity": "MEDIUM",
        "message": "High vibration anomaly on joint actuator 3.",
        "timestamp": "2026-03-30T10:20:00Z"
    }
]

MACHINES_STORE = [
    {"id": "CNC_Mill_04", "line": "Line_A", "status": "Warning", "temp": 88.4, "vibration": 4.8, "health": "At Risk"},
    {"id": "Robot_X9", "line": "Line_A", "status": "Optimal", "temp": 45.2, "vibration": 1.1, "health": "Healthy"},
    {"id": "Press_Hyd_02", "line": "Line_B", "status": "Optimal", "temp": 62.0, "vibration": 2.0, "health": "Healthy"},
    {"id": "Laser_Cut_01", "line": "Line_C", "status": "Critical", "temp": 94.1, "vibration": 6.3, "health": "Failing Soon"}
]