import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Activity, LayoutDashboard, List, ShieldAlert, HeartPulse, Settings } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import TransactionList from './pages/TransactionList';
import TransactionDetail from './pages/TransactionDetail';
import Reconciliation from './pages/Reconciliation';
import PaymentHealth from './pages/PaymentHealth';

export const WSContext = React.createContext<WebSocket | null>(null);

function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Payment Black Box</h1>
        <p className="text-xs text-gray-500 mt-1">Observe. Understand. Recover.</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <Link to="/" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900">
          <LayoutDashboard className="mr-3 h-5 w-5 text-gray-400" />
          Overview
        </Link>
        <Link to="/transactions" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900">
          <List className="mr-3 h-5 w-5 text-gray-400" />
          Transactions
        </Link>
        <Link to="/reconciliation" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900">
          <ShieldAlert className="mr-3 h-5 w-5 text-gray-400" />
          Reconciliation
        </Link>
        <Link to="/health" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900">
          <HeartPulse className="mr-3 h-5 w-5 text-gray-400" />
          Payment Health
        </Link>
      </nav>
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-xs font-semibold text-blue-700 tracking-wide">SIMULATION ENVIRONMENT</span>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [ws, setWs] = React.useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8000/ws');
    socket.onopen = () => console.log('WS connected');
    setWs(socket);
    return () => socket.close();
  }, []);

  return (
    <WSContext.Provider value={ws}>
      <Router>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<TransactionList />} />
              <Route path="/transactions/:id" element={<TransactionDetail />} />
              <Route path="/reconciliation" element={<Reconciliation />} />
              <Route path="/health" element={<PaymentHealth />} />
            </Routes>
          </main>
        </div>
      </Router>
    </WSContext.Provider>
  );
}

export default App;
