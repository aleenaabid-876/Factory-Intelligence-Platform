import React, { useState, useEffect } from 'react';
import axios from 'axios';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

import {
  Factory,
  Cpu,
  AlertTriangle,
  MessageSquareCode,
  Activity,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Plus,
  Trash2
} from 'lucide-react';


// ==========================================================
// BACKEND API URL
// ==========================================================

const API_BASE =
  process.env.REACT_APP_API_BASE_URL ||
  "https://factory-intelligence-platform-daf6.vercel.app";


// ==========================================================
// MAIN APP
// ==========================================================

export default function App() {

  // --------------------------------------------------------
  // Navigation State
  // --------------------------------------------------------

  const [activeTab, setActiveTab] = useState('dashboard');


  // --------------------------------------------------------
  // Application Data
  // --------------------------------------------------------

  const [oeeData, setOeeData] = useState(null);
  const [machines, setMachines] = useState([]);
  const [alerts, setAlerts] = useState([]);


  // --------------------------------------------------------
  // New Machine Form State
  // --------------------------------------------------------

  const [newMachine, setNewMachine] = useState({
    id: '',
    line: 'Line_A',
    temp: 50.0,
    vibration: 1.5,
    health: 'Healthy',
    status: 'Optimal'
  });


  // --------------------------------------------------------
  // AI Copilot State
  // --------------------------------------------------------

  const [copilotInput, setCopilotInput] = useState('');

  const [copilotLog, setCopilotLog] = useState([
    {
      sender: 'copilot',
      text:
        'Hello, Manager. I am your AI Factory Copilot. How can I assist with factory optimization today?'
    }
  ]);


  // ==========================================================
  // LOAD ALL DATA
  // ==========================================================

  const loadAllData = async () => {

    try {

      const [oeeResponse, machinesResponse, alertsResponse] =
        await Promise.all([
          axios.get(`${API_BASE}/api/dashboard/oee`),
          axios.get(`${API_BASE}/api/machines`),
          axios.get(`${API_BASE}/api/alerts`)
        ]);

      setOeeData(oeeResponse.data);
      setMachines(machinesResponse.data);
      setAlerts(alertsResponse.data);

    } catch (error) {

      console.error("Error loading application data:", error);

    }
  };


  // ==========================================================
  // LOAD DATA WHEN APPLICATION STARTS
  // ==========================================================

  useEffect(() => {
    loadAllData();
  }, []);


  // ==========================================================
  // ADD NEW MACHINE
  // ==========================================================

  const handleAddMachine = async (e) => {

    e.preventDefault();

    // Check Machine ID
    if (!newMachine.id.trim()) {
      alert("Please enter a Machine ID");
      return;
    }

    try {

      const machineData = {
        ...newMachine,
        id: newMachine.id.trim(),
        temp: Number(newMachine.temp),
        vibration: Number(newMachine.vibration)
      };

      // Send machine to backend
      await axios.post(
        `${API_BASE}/api/machines`,
        machineData
      );

      // Reset form
      setNewMachine({
        id: '',
        line: 'Line_A',
        temp: 50.0,
        vibration: 1.5,
        health: 'Healthy',
        status: 'Optimal'
      });

      // Refresh dashboard, machines and alerts
      await loadAllData();

      alert("Machine added successfully!");

    } catch (err) {

      console.error("Error adding machine:", err);

      alert(
        err.response?.data?.detail ||
        "Error adding machine"
      );
    }
  };


  // ==========================================================
  // DELETE MACHINE
  // ==========================================================

  const handleDeleteMachine = async (id) => {

    try {

      await axios.delete(
        `${API_BASE}/api/machines/${id}`
      );

      // Refresh all data after deletion
      await loadAllData();

    } catch (err) {

      console.error("Error deleting machine:", err);

      alert("Error deleting machine");
    }
  };


  // ==========================================================
  // AI COPILOT
  // ==========================================================

  const handleCopilotSubmit = async (e) => {

    e.preventDefault();

    if (!copilotInput.trim()) {
      return;
    }

    const userMsg = copilotInput.trim();

    // Add user's message
    setCopilotLog(prev => [
      ...prev,
      {
        sender: 'user',
        text: userMsg
      }
    ]);

    // Clear input
    setCopilotInput('');

    try {

      // Send question to backend
      const res = await axios.post(
        `${API_BASE}/api/copilot`,
        {
          question: userMsg
        }
      );

      // Add AI response
      setCopilotLog(prev => [
        ...prev,
        {
          sender: 'copilot',
          text:
            `${res.data.answer}\n💡 Recommendation: ${res.data.recommendation}`
        }
      ]);

    } catch (err) {

      console.error("Copilot error:", err);

      setCopilotLog(prev => [
        ...prev,
        {
          sender: 'copilot',
          text:
            'Error connecting to AI Copilot engine.'
        }
      ]);
    }
  };


  // ==========================================================
  // PRODUCTION TREND DATA
  // ==========================================================

  const productionTrend = [
    {
      time: '08:00',
      output: 4200
    },
    {
      time: '10:00',
      output: 5100
    },
    {
      time: '12:00',
      output: 4800
    },
    {
      time: '14:00',
      output: 3900
    },
    {
      time: '16:00',
      output: 5300
    }
  ];


  // ==========================================================
  // NAVIGATION ITEMS
  // ==========================================================

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Executive Dashboard',
      shortLabel: 'Dashboard',
      icon: Activity
    },
    {
      id: 'machines',
      label: 'Machines & Telemetry',
      shortLabel: 'Machines',
      icon: Cpu
    },
    {
      id: 'alerts',
      label: `Alert Center (${alerts.length})`,
      shortLabel: 'Alerts',
      icon: AlertTriangle
    },
    {
      id: 'copilot',
      label: 'AI Factory Copilot',
      shortLabel: 'Copilot',
      icon: MessageSquareCode
    }
  ];


  // ==========================================================
  // USER INTERFACE
  // ==========================================================

  return (

    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden">


      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <aside className="hidden md:flex w-64 shrink-0 bg-slate-900 border-r border-slate-800 flex-col justify-between p-4">

        <div>

          {/* Logo / Brand */}

          <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-slate-800">

            <Factory className="text-cyan-400 w-8 h-8" />

            <div>

              <h1 className="font-bold text-lg tracking-wide">
                Ezitech EEF
              </h1>

              <p className="text-xs text-slate-400">
                AI-232 Platform
              </p>

            </div>

          </div>


          {/* Desktop Navigation */}

          <nav className="space-y-2">

            {navigationItems.map(item => {

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


        {/* Enterprise Status */}

        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 text-xs text-slate-400">

          <p className="font-semibold text-slate-300 mb-1">
            Enterprise Status
          </p>

          <div className="flex items-center gap-2">

            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>

            <span>
              150 Smart Factories Active
            </span>

          </div>

        </div>

      </aside>


      {/* =====================================================
          MAIN PANEL
      ====================================================== */}

      <div className="flex-1 min-w-0 flex flex-col overflow-y-auto pb-20 md:pb-0">


        {/* ===================================================
            HEADER
        ==================================================== */}

        <header className="min-h-16 border-b border-slate-800 bg-slate-900/50 px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">

          <h2 className="text-lg md:text-xl font-semibold capitalize tracking-wide">

            {activeTab.replace('-', ' ')}

          </h2>


          {/* System Health */}

          <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 md:px-3 py-1 rounded-full border border-emerald-500/20 text-xs md:text-sm">

            <ShieldCheck className="w-4 h-4" />

            <span>
              System Health:
            </span>

            <span>
              {oeeData?.factory_health_score || 92.1}%
            </span>

          </span>

        </header>


        {/* ===================================================
            MAIN CONTENT
        ==================================================== */}

        <main className="p-4 md:p-8 flex-1">


          {/* =================================================
              DASHBOARD
          ================================================== */}

          {activeTab === 'dashboard' && (

            <div className="space-y-6">


              {/* Dashboard Statistics */}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

                {[
                  {
                    title: "Overall OEE",
                    value: `${oeeData?.overall_equipment_effectiveness || 87.4}%`,
                    change: "+2.4%",
                    icon: Zap,
                    color: "text-amber-400"
                  },

                  {
                    title: "Active Machines",
                    value:
                      oeeData?.active_machines?.toLocaleString() ||
                      "34,820",
                    change: "99.2% Uptime",
                    icon: Cpu,
                    color: "text-cyan-400"
                  },

                  {
                    title: "Under Maintenance",
                    value:
                      oeeData?.machines_under_maintenance || 0,
                    change: "Requires Check",
                    icon: AlertTriangle,
                    color: "text-rose-400"
                  },

                  {
                    title: "Quality Defect Rate",
                    value:
                      `${((oeeData?.quality_defect_rate ?? 0.012) * 100).toFixed(2)}%`,
                    change: "-0.3%",
                    icon: ShieldCheck,
                    color: "text-indigo-400"
                  }

                ].map((stat, idx) => {

                  const Icon = stat.icon;

                  return (

                    <div
                      key={idx}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5"
                    >

                      <div className="flex justify-between items-start mb-4">

                        <span className="text-slate-400 text-sm">
                          {stat.title}
                        </span>

                        <Icon
                          className={`w-5 h-5 ${stat.color}`}
                        />

                      </div>

                      <div className="text-2xl font-bold mb-1">
                        {stat.value}
                      </div>

                      <div className="text-xs text-emerald-400 flex items-center gap-1">

                        <ArrowUpRight className="w-3 h-3" />

                        {stat.change} vs last shift

                      </div>

                    </div>

                  );

                })}

              </div>


              {/* Production Chart */}

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6 min-w-0">

                <h3 className="text-base md:text-lg font-medium mb-4">
                  Hourly Production Output (Units)
                </h3>

                <div className="h-64 md:h-72 w-full min-w-0">

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <LineChart data={productionTrend}>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#334155"
                      />

                      <XAxis
                        dataKey="time"
                        stroke="#94a3b8"
                      />

                      <YAxis
                        stroke="#94a3b8"
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155'
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey="output"
                        stroke="#06b6d4"
                        strokeWidth={3}
                      />

                    </LineChart>

                  </ResponsiveContainer>

                </div>

              </div>

            </div>

          )}


          {/* =================================================
              MACHINES
          ================================================== */}

          {activeTab === 'machines' && (

            <div className="space-y-6">


              {/* Add Machine Form */}

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6">

                <h3 className="text-md font-semibold mb-4 flex items-center gap-2 text-cyan-400">

                  <Plus className="w-4 h-4" />

                  Register New Industrial Machine

                </h3>


                <form
                  onSubmit={handleAddMachine}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4"
                >


                  {/* Machine ID */}

                  <input
                    type="text"
                    placeholder="Machine ID (e.g. Lathe_05)"
                    value={newMachine.id}
                    onChange={e =>
                      setNewMachine({
                        ...newMachine,
                        id: e.target.value
                      })
                    }
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                    required
                  />


                  {/* Production Line */}

                  <input
                    type="text"
                    placeholder="Production Line"
                    value={newMachine.line}
                    onChange={e =>
                      setNewMachine({
                        ...newMachine,
                        line: e.target.value
                      })
                    }
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  />


                  {/* Temperature */}

                  <input
                    type="number"
                    step="0.1"
                    placeholder="Temp (°C)"
                    value={newMachine.temp}
                    onChange={e =>
                      setNewMachine({
                        ...newMachine,
                        temp: e.target.value
                      })
                    }
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  />


                  {/* Vibration */}

                  <input
                    type="number"
                    step="0.1"
                    placeholder="Vibration"
                    value={newMachine.vibration}
                    onChange={e =>
                      setNewMachine({
                        ...newMachine,
                        vibration: e.target.value
                      })
                    }
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  />


                  {/* Health */}

                  <select
                    value={newMachine.health}
                    onChange={e =>
                      setNewMachine({
                        ...newMachine,
                        health: e.target.value
                      })
                    }
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 text-slate-300"
                  >

                    <option value="Healthy">
                      Healthy
                    </option>

                    <option value="At Risk">
                      At Risk
                    </option>

                    <option value="Failing Soon">
                      Failing Soon
                    </option>

                  </select>


                  {/* Add Button */}

                  <button
                    type="submit"
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-sm transition py-2"
                  >
                    Add Machine
                  </button>

                </form>

              </div>


              {/* Machines Table */}

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">

                {/* Horizontal scrolling for mobile */}

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[700px] text-left border-collapse">

                    <thead>

                      <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase bg-slate-900/50">

                        <th className="p-4">
                          Machine ID
                        </th>

                        <th className="p-4">
                          Production Line
                        </th>

                        <th className="p-4">
                          Temperature (°C)
                        </th>

                        <th className="p-4">
                          Vibration (mm/s)
                        </th>

                        <th className="p-4">
                          Health Status
                        </th>

                        <th className="p-4 text-right">
                          Actions
                        </th>

                      </tr>

                    </thead>


                    <tbody className="divide-y divide-slate-800 text-sm">

                      {machines.length > 0 ? (

                        machines.map((m, i) => (

                          <tr
                            key={`${m.id}-${i}`}
                            className="hover:bg-slate-800/30"
                          >

                            <td className="p-4 font-medium text-cyan-400 break-words">
                              {m.id}
                            </td>

                            <td className="p-4">
                              {m.line}
                            </td>

                            <td className="p-4">
                              {m.temp} °C
                            </td>

                            <td className="p-4">
                              {m.vibration}
                            </td>

                            <td className="p-4">

                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  m.health === 'Healthy'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : m.health === 'Failing Soon'
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}
                              >

                                {m.health}

                              </span>

                            </td>


                            <td className="p-4 text-right">

                              <button
                                onClick={() =>
                                  handleDeleteMachine(m.id)
                                }
                                className="text-rose-400 hover:text-rose-300 p-1 bg-rose-500/10 rounded border border-rose-500/20"
                                title="Delete Machine"
                              >

                                <Trash2 className="w-4 h-4" />

                              </button>

                            </td>

                          </tr>

                        ))

                      ) : (

                        <tr>

                          <td
                            colSpan="6"
                            className="p-8 text-center text-slate-500"
                          >
                            No machines available.

                          </td>

                        </tr>

                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </div>

          )}


          {/* =================================================
              ALERT CENTER
          ================================================== */}

          {activeTab === 'alerts' && (

            <div className="space-y-4">

              {alerts.length > 0 ? (

                alerts.map((alert, idx) => (

                  <div
                    key={`${alert.alert_id}-${idx}`}
                    className="bg-slate-900 border border-rose-500/30 rounded-xl p-4 md:p-5 flex items-start gap-3 md:gap-4"
                  >

                    <div className="p-3 bg-rose-500/10 text-rose-400 rounded-lg shrink-0">

                      <AlertTriangle className="w-6 h-6" />

                    </div>


                    <div className="min-w-0">

                      <h4 className="font-semibold text-rose-400 break-words">

                        {alert.alert_id} - {alert.machine_id}

                      </h4>

                      <p className="text-sm text-slate-300 break-words mt-1">

                        {alert.message}

                      </p>

                      <span className="text-xs text-slate-500 mt-2 block break-words">

                        Timestamp: {alert.timestamp}

                      </span>

                    </div>

                  </div>

                ))

              ) : (

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">

                  <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-slate-600" />

                  <p className="text-slate-500">
                    No active alerts.
                  </p>

                </div>

              )}

            </div>

          )}


          {/* =================================================
              AI FACTORY COPILOT
          ================================================== */}

          {activeTab === 'copilot' && (

            <div className="bg-slate-900 border border-slate-800 rounded-xl h-[calc(100vh-12rem)] min-h-[500px] flex flex-col justify-between p-4 md:p-6">


              {/* Chat Messages */}

              <div className="flex-1 overflow-y-auto space-y-4 pr-1 md:pr-2">

                {copilotLog.map((msg, idx) => (

                  <div
                    key={idx}
                    className={`flex ${
                      msg.sender === 'user'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >

                    <div
                      className={`max-w-[90%] md:max-w-xl p-3 md:p-4 rounded-xl text-sm whitespace-pre-line ${
                        msg.sender === 'user'
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-800 text-slate-200 border border-slate-700'
                      }`}
                    >

                      {msg.text}

                    </div>

                  </div>

                ))}

              </div>


              {/* Copilot Input */}

              <form
                onSubmit={handleCopilotSubmit}
                className="mt-4 flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-800"
              >

                <input
                  type="text"
                  value={copilotInput}
                  onChange={e =>
                    setCopilotInput(e.target.value)
                  }
                  placeholder="Ask Copilot..."
                  className="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500"
                />

                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-6 py-3 sm:py-0 rounded-lg text-sm"
                >
                  Send
                </button>

              </form>

            </div>

          )}

        </main>

      </div>


      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
      ====================================================== */}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-2 py-2">

        <div className="grid grid-cols-4 gap-1">

          {navigationItems.map(item => {

            const Icon = item.icon;

            return (

              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : 'text-slate-400'
                }`}
              >

                <div className="relative">

                  <Icon className="w-5 h-5" />

                  {item.id === 'alerts' && alerts.length > 0 && (

                    <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 flex items-center justify-center rounded-full bg-rose-500 text-white text-[9px]">

                      {alerts.length}

                    </span>

                  )}

                </div>

                <span>
                  {item.shortLabel}
                </span>

              </button>

            );

          })}

        </div>

      </nav>

    </div>
  );
}