import React from 'react';

export default function ApiDocs() {
  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-semibold text-gray-900">API Documentation</h1>
      <p className="text-gray-600">Interact with the simulated payment environment via these REST endpoints.</p>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 space-y-8">
        <div>
          <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">POST /transactions/simulate</h2>
          <p className="text-sm text-gray-600 mb-2">Creates a new transaction and triggers a specified simulation scenario.</p>
          <div className="bg-gray-50 p-4 rounded text-sm font-mono text-gray-800">
            {`{
  "scenario": "timeout", // "success", "timeout", "debit_without_credit", "merchant_timeout", "duplicate", "settlement_delay", "reversal", "unknown"
  "idempotency_key": "IDEMP-TEST-001"
}`}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">GET /transactions/{"{id}"}</h2>
          <p className="text-sm text-gray-600 mb-2">Fetches a specific transaction and its complete event timeline.</p>
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">POST /transactions/{"{id}"}/recovery</h2>
          <p className="text-sm text-gray-600 mb-2">Initiates a recovery workflow on an uncertain or failed transaction.</p>
        </div>
        
        <div>
          <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">GET /metrics</h2>
          <p className="text-sm text-gray-600 mb-2">Returns dashboard overview statistics derived from the database.</p>
        </div>
      </div>
    </div>
  );
}
