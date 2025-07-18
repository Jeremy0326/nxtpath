import React from 'react';
import { AlertCircle, Download } from 'lucide-react';

const logs = [
  {
    id: '1',
    type: 'error',
    message: 'Failed login attempt',
    timestamp: '2024-03-15 14:30:00',
    user: 'john@example.com',
  },
  {
    id: '2',
    type: 'info',
    message: 'User profile updated',
    timestamp: '2024-03-15 14:25:00',
    user: 'jane@example.com',
  },
];

export function AdminLogs() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">System Logs</h1>
        <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
          <Download className="h-4 w-4 inline-block mr-2" />
          Export Logs
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            <div className="flex space-x-2">
              <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option>All Types</option>
                <option>Error</option>
                <option>Info</option>
                <option>Warning</option>
              </select>
              <input
                type="date"
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {logs.map((log) => (
            <div key={log.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${
                  log.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  <AlertCircle className={`h-5 w-5 ${
                    log.type === 'error' ? 'text-red-600' : 'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{log.message}</p>
                    <span className="text-xs text-gray-500">{log.timestamp}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">User: {log.user}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}