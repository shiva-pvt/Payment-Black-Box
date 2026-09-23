import { API_URL, WS_URL } from "../config";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, ShieldAlert, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    total: 0,
    successful: 0,
    uncertain: 0,
    failed: 0,
    reconciliation_required: 0,
    success_rate: 0
  });

  const loadMetrics = () => {
    axios.get(`${API_URL}/metrics`).then(res => setMetrics(res.data)).catch(console.error);
  };

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Payment Operations</h1>
        <button onClick={loadMetrics} className="p-2 text-gray-500 hover:text-gray-900"><RefreshCw className="h-5 w-5"/></button>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5 flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Transactions</dt>
              <dd className="text-2xl font-semibold text-gray-900">{metrics.total.toLocaleString()}</dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5 flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 truncate">Successful</dt>
              <dd className="text-2xl font-semibold text-gray-900">{metrics.successful.toLocaleString()}</dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5 flex items-center">
            <div className="flex-shrink-0">
              <ShieldAlert className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 truncate">Uncertain</dt>
              <dd className="text-2xl font-semibold text-gray-900">{metrics.uncertain.toLocaleString()}</dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5 flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 truncate">Failed</dt>
              <dd className="text-2xl font-semibold text-gray-900">{metrics.failed.toLocaleString()}</dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
