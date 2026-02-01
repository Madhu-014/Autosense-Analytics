'use client';

import { Suspense } from 'react';

export default function ChartsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <Suspense fallback={<div>Loading charts...</div>}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Charts & Visualizations</h1>
          <p className="text-slate-600 mb-8">Upload a file to generate interactive charts and visualizations.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-40 bg-gradient-to-br from-blue-50 to-indigo-50 rounded flex items-center justify-center">
                <p className="text-slate-500">No data uploaded yet</p>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
