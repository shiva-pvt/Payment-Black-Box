import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function PaymentHealth() {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    axios.get('http://localhost:8000/health').then(res => setHealth(res.data));
  }, []);

  if (!health) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Payment Health</h1>
      
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Overall: <span className="text-green-600">{health.overall}</span></h2>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {health.banks.map((bank: any) => (
            <div key={bank.name} className="border border-gray-200 rounded-md p-4">
              <h3 className="font-semibold text-gray-800">{bank.name}</h3>
              <p className="text-sm text-gray-600 mt-2">Success rate: {bank.success_rate}%</p>
              <p className="text-sm text-gray-600">Avg response: {bank.avg_response_ms}ms</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 text-red-600">Recent anomalies</h2>
        <ul className="list-disc pl-5 space-y-2">
          {health.anomalies.map((anomaly: string, i: number) => (
            <li key={i} className="text-gray-700">{anomaly}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
