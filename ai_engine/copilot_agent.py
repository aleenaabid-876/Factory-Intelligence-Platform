class AIFactoryCopilot:
    def __init__(self):
        pass

    def process_query(self, question: str):
        q = question.lower()
        if "underperforming" in q:
            return {
                "answer": "Production Line A is underperforming due to thermal throttling on CNC_Mill_04.",
                "recommendation": "Reduce feed rate by 15% or dispatch maintenance to cool spindle bearings."
            }
        elif "energy" in q:
            return {
                "answer": "Energy consumption peaked during shift handover at 14:00 across Warehouse Zone B.",
                "recommendation": "Automate staggered HVAC startup protocols to flatten the load curve."
            }
        elif "output" in q or "predict" in q:
            return {
                "answer": "Predicted output for tomorrow is 142,500 units based on current OEE trends.",
                "recommendation": "Ensure raw material buffer for Line B is restocked by tonight."
            }
        else:
            return {
                "answer": f"Processed analytical request: '{question}'. Factory operational parameters are nominal.",
                "recommendation": "Continue standard autonomous monitoring."
            }