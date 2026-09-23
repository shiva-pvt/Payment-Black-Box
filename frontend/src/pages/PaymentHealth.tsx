import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Activity, Clock, ShieldAlert, HeartPulse, Building2, AlertTriangle, RefreshCcw } from 'lucide-react';
import { API_URL } from '../config';

interface BankHealth {
  name: string;
  success_rate: number;
  avg_response_ms: number;
}

interface HealthData {
  overall: string;
  banks: BankHealth[];
  anomalies: string[];
}

export default function PaymentHealth() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      // Prioritize the dynamic config, but this fulfills the Railway API requirement
      const response = await axios.get(`${API_URL}/health`);
      
      // If the backend returns something different during simulation, we mock the format expected by the prompt
      // just in case the real backend doesn't precisely match the requested format yet.
      // But we assume the real backend returns the requested format.
      setData(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch health data from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center text-gray-500">
          <RefreshCcw className="h-8 w-8 animate-spin mb-4 text-blue-600" />
          <p className="text-sm font-medium">Analyzing system health...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl">
          <div className="flex items-center text-red-600 mb-2">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-semibold">System Unreachable</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={fetchHealth}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Calculate metrics
  const totalBanks = data.banks?.length || 0;
  const avgSuccessRate = totalBanks > 0 
    ? (data.banks.reduce((acc, b) => acc + b.success_rate, 0) / totalBanks).toFixed(1)
    : '0.0';
  const avgResponseTime = totalBanks > 0 
    ? Math.round(data.banks.reduce((acc, b) => acc + b.avg_response_ms, 0) / totalBanks)
    : 0;
  const openAnomalies = data.anomalies?.length || 0;

  const isSystemHealthy = data.overall.toLowerCase() === 'healthy';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Network Health</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time observability of downstream banking partners.</p>
        </div>
        <div className={`flex items-center px-4 py-2 rounded-full border ${isSystemHealthy ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
          <HeartPulse className={`h-5 w-5 mr-2 ${isSystemHealthy ? 'animate-pulse' : ''}`} />
          <span className="font-semibold text-sm uppercase tracking-wide">
            System Status: {data.overall}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Banks</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{totalBanks}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Success Rate</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{avgSuccessRate}%</h3>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Activity className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{avgResponseTime}ms</h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Open Anomalies</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{openAnomalies}</h3>
            </div>
            <div className={`p-2 rounded-lg ${openAnomalies > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
              <ShieldAlert className={`h-6 w-6 ${openAnomalies > 0 ? 'text-red-600' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Success Rate Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-6">Success Rate by Bank</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.banks} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#F3F4F6'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="success_rate" radius={[4, 4, 0, 0]}>
                  {data.banks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.success_rate > 95 ? '#10B981' : entry.success_rate > 90 ? '#F59E0B' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Time Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-6">Response Time by Bank (ms)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.banks} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#F3F4F6'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="avg_response_ms" radius={[4, 4, 0, 0]}>
                  {data.banks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.avg_response_ms > 4000 ? '#EF4444' : entry.avg_response_ms > 2000 ? '#F59E0B' : '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-gray-400 mr-2" />
          Active Anomalies & Alerts
        </h3>
        {openAnomalies === 0 ? (
          <div className="py-8 text-center bg-gray-50 rounded-lg border border-gray-100 mt-2">
            <p className="text-gray-500 text-sm">No active anomalies detected in the network.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.anomalies.map((anomaly, idx) => (
              <div key={idx} className="flex items-start p-4 bg-red-50 text-red-800 rounded-lg border border-red-100">
                <ShieldAlert className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-red-600" />
                <span className="text-sm font-medium">{anomaly}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
