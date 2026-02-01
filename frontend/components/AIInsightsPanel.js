"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function AIInsightsPanel({ insights, loading = false }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!insights && !loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mt-8 rounded-3xl border border-neutral-200 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 backdrop-blur-xl p-8 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center shadow-md">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">AI Intelligence Report</h3>
          <p className="text-sm text-gray-600">Advanced analytics and insights</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-purple-500 animate-spin" />
          </div>
          <span className="ml-4 text-gray-600">Analyzing data with AI...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Data Quality */}
          {insights.data_quality && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-white/80 backdrop-blur-sm p-4 border border-neutral-200/50 cursor-pointer hover:shadow-md transition-all"
              onClick={() => setExpandedIndex(expandedIndex === 0 ? null : 0)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    insights.data_quality.quality_score >= 75 ? 'bg-emerald-100 text-emerald-700' :
                    insights.data_quality.quality_score >= 50 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {insights.data_quality.quality_score}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Data Quality Score</h4>
                    <p className="text-xs text-gray-600">{insights.data_quality.total_rows} rows × {insights.data_quality.total_columns} columns</p>
                  </div>
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedIndex === 0 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              
              <AnimatePresence>
                {expandedIndex === 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-neutral-200/50 space-y-2"
                  >
                    {insights.data_quality.issues.map((issue, i) => (
                      <div key={i} className="text-sm text-gray-700">⚠️ {issue}</div>
                    ))}
                    {insights.data_quality.recommendations.map((rec, i) => (
                      <div key={i} className="text-sm text-emerald-700">💡 {rec}</div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Correlations */}
          {insights.correlations && insights.correlations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl bg-white/80 backdrop-blur-sm p-4 border border-neutral-200/50 cursor-pointer hover:shadow-md transition-all"
              onClick={() => setExpandedIndex(expandedIndex === 1 ? null : 1)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center text-sm font-bold">
                    {insights.correlations.length}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Significant Correlations Found</h4>
                    <p className="text-xs text-gray-600">Variable relationships & dependencies</p>
                  </div>
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedIndex === 1 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>

              <AnimatePresence>
                {expandedIndex === 1 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-neutral-200/50 space-y-2"
                  >
                    {insights.correlations.map((corr, i) => (
                      <div key={i} className="text-sm">
                        <div className="font-medium text-gray-900">{corr.column_1} ↔ {corr.column_2}</div>
                        <div className="text-xs text-gray-600">
                          <span className="inline-block px-2 py-1 rounded bg-purple-100 text-purple-700 mr-2">
                            {corr.strength}
                          </span>
                          <span className="text-emerald-700">r = {(corr.correlation * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Business Recommendations */}
          {insights.business_recommendations && insights.business_recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 backdrop-blur-sm p-4 border border-emerald-200 cursor-pointer hover:shadow-md transition-all"
              onClick={() => setExpandedIndex(expandedIndex === 2 ? null : 2)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">
                    ★
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Business Recommendations</h4>
                    <p className="text-xs text-gray-600">{insights.business_recommendations.length} actionable insights</p>
                  </div>
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedIndex === 2 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>

              <AnimatePresence>
                {expandedIndex === 2 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-emerald-200/50 space-y-2"
                  >
                    {insights.business_recommendations.map((rec, i) => (
                      <div key={i} className="text-sm text-gray-700">
                        <p>{rec}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Confidence Score */}
          {insights.analysis_confidence !== undefined && (
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-4 border border-neutral-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">Analysis Confidence</h4>
                  <p className="text-xs text-gray-600">Reliability of generated insights</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    {(insights.analysis_confidence * 100).toFixed(0)}%
                  </div>
                  <div className="h-1.5 w-24 rounded-full bg-gray-200 mt-1">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                      style={{ width: `${insights.analysis_confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-3 rounded-lg bg-blue-50 border border-blue-100">
        <p className="text-xs text-blue-800">
          <strong>🤖 AI-Powered Analysis:</strong> This report is generated using advanced machine learning algorithms including statistical correlation analysis, anomaly detection, and business intelligence frameworks. All insights are quantified and actionable.
        </p>
      </div>
    </motion.div>
  );
}
