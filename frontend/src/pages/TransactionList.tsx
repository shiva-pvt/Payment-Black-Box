import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/transactions').then(res => setTransactions(res.data));
  }, []);

  const createTest = async (scenario: string) => {
    await axios.post('http://localhost:8000/transactions/simulate', { scenario });
    const res = await axios.get('http://localhost:8000/transactions');
    setTransactions(res.data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
        <div className="space-x-2">
          <select id="scenario" className="border border-gray-300 rounded px-2 py-1 text-sm">
            <option value="success">Success</option>
            <option value="timeout">Network Timeout</option>
            <option value="debit_without_credit">Debit without Credit</option>
            <option value="settlement_delay">Settlement Delayed</option>
            <option value="reversal">Reversal Pending</option>
            <option value="unknown">Unknown State</option>
          </select>
          <button 
            onClick={() => createTest((document.getElementById('scenario') as HTMLSelectElement).value)}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700"
          >
            Create Test Transaction
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((tx: any) => (
              <tr key={tx.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{tx.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${tx.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                      tx.status === 'FAILED' ? 'bg-red-100 text-red-800' : 
                      tx.status === 'UNCERTAIN' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link to={`/transactions/${tx.id}`} className="text-blue-600 hover:text-blue-900">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
