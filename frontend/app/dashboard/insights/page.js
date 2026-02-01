'use client';

import { Suspense } from 'react';

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <Suspense fallback={<div>Loading insights...</div>}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">AI Insights</h1>
          <p className="text-slate-600 mb-8">View AI-powered insights and recommendations for your data.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-40 bg-gradient-to-br from-green-50 to-emerald-50 rounded flex items-center justify-center">
                <p className="text-slate-500">No data uploaded yet</p>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
