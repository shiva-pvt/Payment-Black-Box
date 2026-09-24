import { API_URL, WS_URL } from "../config";
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { WSContext } from '../App';

export default function TransactionList() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const ws = useContext(WSContext);

  useEffect(() => {
    axios.get("/transactions").then(res => setTransactions(res.data));
  }, []);

  useEffect(() => {
    if (!ws) return;
    const handleMessage = (msg: MessageEvent) => {
      try {
        const data = JSON.parse(msg.data);
        if (data.type === 'TRANSACTION_UPDATE') {
          setTransactions(prev => prev.map(tx => 
            tx.id === data.transaction_id ? { ...tx, status: data.new_state } : tx
          ));
        }
      } catch (e) {}
    };
    ws.addEventListener('message', handleMessage);
    return () => ws.removeEventListener('message', handleMessage);
  }, [ws]);

  const createTest = async (scenario: string) => {
    let idempotency_key = null;
    if (scenario === 'duplicate') {
       idempotency_key = "IDEMP-DEMO-999";
       await axios.post("/transactions/simulate", { scenario, idempotency_key });
    }
    await axios.post("/transactions/simulate", { scenario, idempotency_key });
    const res = await axios.get("/transactions");
    setTransactions(res.data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
        <div className="space-x-2">
          <select id="scenario" className="border border-gray-300 rounded px-2 py-1 text-sm bg-white">
            <option value="success">Successful Payment</option>
            <option value="timeout">Network Timeout</option>
            <option value="debit_without_credit">Debit Confirmed - Credit Missing</option>
            <option value="merchant_timeout">Merchant Response Timeout</option>
            <option value="duplicate">Duplicate Payment</option>
            <option value="settlement_delay">Settlement Delayed</option>
            <option value="reversal">Reversal Pending</option>
            <option value="unknown">Unknown / Uncertain Transaction</option>
          </select>
          <button 
            onClick={() => createTest((document.getElementById('scenario') as HTMLSelectElement).value)}
            className="bg-gray-800 text-white px-3 py-1 rounded text-sm font-medium hover:bg-gray-900 shadow-sm"
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {tx.id}
                  {tx.scenario && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">TEST</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{tx.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${tx.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                      tx.status === 'FAILED' ? 'bg-red-100 text-red-800' : 
                      (tx.status === 'UNCERTAIN' || tx.status === 'RECONCILIATION_REQUIRED') ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
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
