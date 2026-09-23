import { API_URL, WS_URL } from "../config";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Reconciliation() {
  const [cases, setCases] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/reconciliation`).then(res => setCases(res.data));
  }, []);

  const resolve = async (id: int) => {
    await axios.post(`${API_URL}/reconciliation/${id}/resolve?action=MANUAL_REVIEW`);
    const res = await axios.get(`${API_URL}/reconciliation`);
    setCases(res.data);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Reconciliation Center</h1>
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommended Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cases.map((c: any) => (
              <tr key={c.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <Link to={`/transactions/${c.transaction_id}`} className="text-blue-600 hover:underline">{c.transaction_id}</Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.recommended_action}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {c.status === 'OPEN' && (
                    <button onClick={() => resolve(c.id)} className="text-blue-600 hover:text-blue-900">Resolve</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
