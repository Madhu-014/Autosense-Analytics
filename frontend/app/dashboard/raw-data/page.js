'use client';

import { Suspense } from 'react';

export default function RawDataPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <Suspense fallback={<div>Loading data...</div>}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Raw Data</h1>
          <p className="text-slate-600 mb-8">View and analyze your raw data in a tabular format.</p>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-96 bg-gradient-to-br from-purple-50 to-pink-50 rounded flex items-center justify-center">
              <p className="text-slate-500">No data uploaded yet</p>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
