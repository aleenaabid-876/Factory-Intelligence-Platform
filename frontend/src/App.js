import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { 
  Factory, Cpu, AlertTriangle, MessageSquareCode, 
  Activity, ShieldCheck, Zap, ArrowUpRight, Plus, Trash2 
} from 'lucide-react';

const API_BASE = "http://localhost:8000";

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [oeeData, setOeeData] = useState(null);
  const [machines, setMachines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  
  // New Machine Form State
  const [newMachine, setNewMachine] = useState({
    id: '', line: 'Line_A', temp: 50.0, vibration: 1.5, health: 'Healthy', status: 'Optimal'
  });

  const [copilotInput, setCopilotInput] = useState('');
  const [copilotLog, setCopilotLog] = useState([
    { sender: 'copilot', text: 'Hello, Manager. I am your AI Factory Copilot. How can I assist with factory optimization today?' }
  ]);

  const loadAllData = () => {
    axios.get(`${API_BASE}/api/dashboard/oee`).then(res => setOeeData(res.data)).catch(err => console.error(err));
    axios.get(`${API_BASE}/api/machines`).then(res => setMachines(res.data)).catch(err => console.error(err));
    axios.get(`${API_BASE}/api/alerts`).then(res => setAlerts(res.data)).catch(err => console.error(err));
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleAddMachine = async (e) => {
    e.preventDefault();
    if (!newMachine.id) return alert("Please enter a Machine ID");
    try {
      await axios.post(`${API_BASE}/api/machines`, newMachine);
      setNewMachine({ id: '', line: 'Line_A', temp: 50.0, vibration: 1.5, health: 'Healthy', status: 'Optimal' });
      loadAllData(); // Refresh all application state automatically
      alert("Machine added successfully!");
    } catch (err) {
      alert(err.response?.data?.detail || "Error adding machine");
    }
  };

  const handleDeleteMachine = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/machines/${id}`);
      loadAllData(); // Refresh all application state automatically
    } catch (err) {
      alert("Error deleting machine");
    }
  };

  const handleCopilotSubmit = async (e) => {
    e.preventDefault();
    if (!copilotInput.trim()) return;

    const userMsg = copilotInput;
    setCopilotLog(prev => [...prev, { sender: 'user', text: userMsg }]);
    setCopilotInput('');

    try {
      const res = await axios.post(`${API_BASE}/api/copilot`, { question: userMsg });
      setCopilotLog(prev => [
        ...prev, 
        { sender: 'copilot', text: `${res.data.answer}\n💡 Recommendation: ${res.data.recommendation}` }
      ]);
    } catch (err) {
      setCopilotLog(prev => [...prev, { sender: 'copilot', text: 'Error connecting to AI Copilot engine.' }]);
    }
  };

  const productionTrend = [
    { time: '08:00', output: 4200 },
    { time: '10:00', output: 5100 },
    { time: '12:00', output: 4800 },
    { time: '14:00', output: 3900 },
    { time: '16:00', output: 5300 },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-slate-800">
            <Factory className="text-cyan-400 w-8 h-8" />
            <div>
              <h1 className="font-bold text-lg tracking-wide">Ezitech EEF</h1>
              <p className="text-xs text-slate-400">AI-232 Platform</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'Executive Dashboard', icon: Activity },
              { id: 'machines', label: 'Machines & Telemetry', icon: Cpu },
              { id: 'alerts', label: `Alert Center (${alerts.length})`, icon: AlertTriangle },
              { id: 'copilot', label: 'AI Factory Copilot', icon: MessageSquareCode },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === item.id 
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 text-xs text-slate-400">
          <p className="font-semibold text-slate-300 mb-1">Enterprise Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>150 Smart Factories Active</span>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 px-8 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-semibold capitalize tracking-wide">
            {activeTab.replace('-', ' ')}
          </h2>
          <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 text-sm">
            <ShieldCheck className="w-4 h-4" /> System Health: {oeeData?.factory_health_score || 92.1}%
          </span>
        </header>

        <main className="p-8 flex-1">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { title: "Overall OEE", value: `${oeeData?.overall_equipment_effectiveness || 87.4}%`, change: "+2.4%", icon: Zap, color: "text-amber-400" },
                  { title: "Active Machines", value: oeeData?.active_machines?.toLocaleString() || "34,820", change: "99.2% Uptime", icon: Cpu, color: "text-cyan-400" },
                  { title: "Under Maintenance", value: oeeData?.machines_under_maintenance || 0, change: "Requires Check", icon: AlertTriangle, color: "text-rose-400" },
                  { title: "Quality Defect Rate", value: `${(oeeData?.quality_defect_rate * 100).toFixed(2) || 1.2}%`, change: "-0.3%", icon: ShieldCheck, color: "text-indigo-400" },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-slate-400 text-sm">{stat.title}</span>
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div className="text-2xl font-bold mb-1">{stat.value}</div>
                      <div className="text-xs text-emerald-400 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> {stat.change} vs last shift
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-medium mb-4">Hourly Production Output (Units)</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={productionTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="time" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Line type="monotone" dataKey="output" stroke="#06b6d4" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'machines' && (
            <div className="space-y-6">
              {/* Add Machine Form */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-md font-semibold mb-4 flex items-center gap-2 text-cyan-400">
                  <Plus className="w-4 h-4" /> Register New Industrial Machine
                </h3>
                <form onSubmit={handleAddMachine} className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <input 
                    type="text" 
                    placeholder="Machine ID (e.g. Lathe_05)" 
                    value={newMachine.id} 
                    onChange={e => setNewMachine({...newMachine, id: e.target.value})}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500" 
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Production Line" 
                    value={newMachine.line} 
                    onChange={e => setNewMachine({...newMachine, line: e.target.value})}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500" 
                  />
                  <input 
                    type="number" 
                    placeholder="Temp (°C)" 
                    value={newMachine.temp} 
                    onChange={e => setNewMachine({...newMachine, temp: parseFloat(e.target.value)})}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500" 
                  />
                  <input 
                    type="number" 
                    placeholder="Vibration" 
                    value={newMachine.vibration} 
                    onChange={e => setNewMachine({...newMachine, vibration: parseFloat(e.target.value)})}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500" 
                  />
                  <select 
                    value={newMachine.health} 
                    onChange={e => setNewMachine({...newMachine, health: e.target.value})}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 text-slate-300"
                  >
                    <option value="Healthy">Healthy</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Failing Soon">Failing Soon</option>
                  </select>
                  <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-sm transition">
                    Add Machine
                  </button>
                </form>
              </div>

              {/* Machines Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase bg-slate-900/50">
                      <th className="p-4">Machine ID</th>
                      <th className="p-4">Production Line</th>
                      <th className="p-4">Temperature (°C)</th>
                      <th className="p-4">Vibration (mm/s)</th>
                      <th className="p-4">Health Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-sm">
                    {machines.map((m, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="p-4 font-medium text-cyan-400">{m.id}</td>
                        <td className="p-4">{m.line}</td>
                        <td className="p-4">{m.temp} °C</td>
                        <td className="p-4">{m.vibration}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            m.health === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {m.health}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleDeleteMachine(m.id)}
                            className="text-rose-400 hover:text-rose-300 p-1 bg-rose-500/10 rounded border border-rose-500/20"
                            title="Delete Machine"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-4">
              {alerts.map((alert, idx) => (
                <div key={idx} className="bg-slate-900 border border-rose-500/30 rounded-xl p-5 flex items-start gap-4">
                  <div className="p-3 bg-rose-500/10 text-rose-400 rounded-lg">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-rose-400">{alert.alert_id} - {alert.machine_id}</h4>
                    <p className="text-sm text-slate-300">{alert.message}</p>
                    <span className="text-xs text-slate-500 mt-2 block">Timestamp: {alert.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'copilot' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl h-[calc(100vh-12rem)] flex flex-col justify-between p-6">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {copilotLog.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xl p-4 rounded-xl text-sm whitespace-pre-line ${
                      msg.sender === 'user' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleCopilotSubmit} className="mt-4 flex gap-3 pt-4 border-t border-slate-800">
                <input
                  type="text"
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  placeholder="Ask Copilot (e.g., 'Which production line is underperforming?')..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500"
                />
                <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-6 rounded-lg text-sm">
                  Send
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}