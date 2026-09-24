import { API_URL, WS_URL } from "../config";
import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { WSContext } from '../App';

export default function TransactionDetail() {
  const { id } = useParams();
  const [tx, setTx] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const ws = useContext(WSContext);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/transactions/${id}`)
      .then(res => {
        setTx(res.data);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError(`Unable to load transaction details. Backend returned HTTP ${err.response?.status || 'Error'}`);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!ws) return;
    const handleMessage = (msg: MessageEvent) => {
      try {
        const data = JSON.parse(msg.data);
        if (data.type === 'TRANSACTION_UPDATE' && data.transaction_id === id) {
          setTx((prev: any) => ({
            ...prev,
            status: data.new_state,
            events: [...(prev?.events || []), data.event]
          }));
        }
      } catch (e) {}
    };
    ws.addEventListener('message', handleMessage);
    return () => ws.removeEventListener('message', handleMessage);
  }, [ws, id]);

  if (loading) return <div className="text-gray-500">Loading transaction details...</div>;
  
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded p-6">
      <h2 className="text-red-900 font-semibold mb-2">Error</h2>
      <p className="text-red-800">{error}</p>
      <Link to="/transactions" className="mt-4 inline-block text-red-700 underline">Return to Transactions</Link>
    </div>
  );

  if (!tx) return <div className="text-gray-500">Transaction not found.</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">{tx.id}</h1>
        <p className="text-gray-500 text-lg mt-1">?{tx.amount}</p>
        <div className="mt-4">
          <span className={`px-3 py-1 text-sm font-semibold rounded-full 
            ${tx.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
              tx.status === 'FAILED' ? 'bg-red-100 text-red-800' : 
              (tx.status === 'UNCERTAIN' || tx.status === 'RECONCILIATION_REQUIRED') ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
            {tx.status}
          </span>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Transaction Timeline</h2>
        <div className="flow-root">
          <ul className="-mb-8">
            {tx.events?.map((event: any, eventIdx: number) => (
              <li key={event.event_id}>
                <div className="relative pb-8">
                  {eventIdx !== tx.events.length - 1 ? (
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                        <span className="text-white text-xs font-bold">{eventIdx + 1}</span>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">{event.event_id} - {event.source}</p>
                        <p className="text-sm font-medium text-gray-900">{event.event_type} <span className="text-gray-400">-&gt; {event.new_state}</span></p>
                        {event.error_code && (
                          <p className="text-sm text-red-500 font-medium mt-1">Error: {event.error_code}</p>
                        )}
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time dateTime={event.timestamp}>{new Date(event.timestamp).toLocaleTimeString()}</time>
                        {event.response_latency_ms && <p className="text-xs text-gray-400">{event.response_latency_ms}ms</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {tx.status === 'UNCERTAIN' || tx.status === 'RECONCILIATION_REQUIRED' || tx.status === 'FAILED' ? (
        <div className="bg-red-50 shadow-sm border border-red-200 rounded-lg p-6 mt-6">
          <h2 className="text-lg font-medium text-red-900 mb-2">Root Cause Analysis</h2>
          <p className="text-sm text-red-800 font-medium">Primary Issue: <span className="font-normal">{tx.events[tx.events.length - 1]?.event_type}</span></p>
          <p className="text-sm text-red-800 font-medium mt-1">Observed Evidence:</p>
          <ul className="list-disc pl-5 text-sm text-red-800">
            <li>Transaction halted at state: {tx.status}</li>
            <li>Last recorded system: {tx.events[tx.events.length - 1]?.source}</li>
            {tx.events[tx.events.length - 1]?.error_code && <li>Error Code: {tx.events[tx.events.length - 1].error_code}</li>}
          </ul>
          
          {(tx.status === 'UNCERTAIN' || tx.status === 'RECONCILIATION_REQUIRED') && (
            <div className="mt-4">
              <button 
                onClick={async () => {
                   await axios.post(`${API_URL}/transactions/${id}/recovery`);
                   alert("Recovery workflow initiated. Watch timeline for updates.");
                }}
                className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700"
              >
                Initiate Simulated Recovery Workflow
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
