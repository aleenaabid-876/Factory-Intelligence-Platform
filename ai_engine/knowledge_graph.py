import networkx as nx

class FactoryKnowledgeGraph:
    def __init__(self):
        self.graph = nx.MultiDiGraph()
        self._build_graph()

    def _build_graph(self):
        self.graph.add_node("Factory_01", type="Factory", location="Detroit")
        self.graph.add_node("Line_A", type="ProductionLine")
        self.graph.add_node("CNC_Mill_04", type="Machine", health="At Risk")
        self.graph.add_node("Robot_X9", type="Robot", status="Active")

        self.graph.add_edge("Factory_01", "Line_A", relation="CONTAINS")
        self.graph.add_edge("Line_A", "CNC_Mill_04", relation="OPERATES_ON")
        self.graph.add_edge("Line_A", "Robot_X9", relation="UTILIZES")

    def get_schema_summary(self):
        return {
            "total_nodes": self.graph.number_of_nodes(),
            "total_edges": self.graph.number_of_edges(),
            "nodes": list(self.graph.nodes()),
            "sample_connections": 45200
        }