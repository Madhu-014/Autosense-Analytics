"use client";

import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { motion, AnimatePresence } from "framer-motion";

function ChartCard({ option, title, subtitle, index, isSingleChart }) {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el, undefined, { renderer: "canvas" });
    chart.setOption(option);
    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); chart.dispose(); };
  }, [option]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut"
      }
    }
  };

  const hoverVariants = {
    hover: {
      y: -8,
      boxShadow: "0 20px 40px rgba(16, 185, 129, 0.15)"
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover={isSingleChart ? undefined : "hover"}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`rounded-3xl border border-neutral-200/50 bg-gradient-to-br from-white/95 via-white/90 to-neutral-50/80 backdrop-blur-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300`}
    >
      <motion.div
        className="flex items-center justify-between mb-4"
        animate={{ opacity: isHovered ? 1 : 0.8 }}
      >
        <div className="flex-1">
          <motion.div
            className="text-base font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600"
            animate={{ scale: isHovered ? 1.02 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {title}
          </motion.div>
          {subtitle && (
            <motion.div
              className="text-sm text-gray-500 mt-1"
              animate={{ opacity: isHovered ? 1 : 0.7 }}
            >
              {subtitle}
            </motion.div>
          )}
        </div>
      </motion.div>
      <motion.div
        ref={ref}
        className={`w-full rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-50 to-white border border-neutral-100/50 ${isSingleChart ? 'h-96' : 'h-56'}`}
        animate={{
          boxShadow: isHovered ? "inset 0 0 20px rgba(16, 185, 129, 0.1)" : "none"
        }}
      />
    </motion.div>
  );
}

function QueryPanel({ charts, onRefineQuery, onClose, suggestions, agentResponse }) {
  const [refineQuery, setRefineQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRefine = async () => {
    if (!refineQuery.trim()) return;
    setIsSubmitting(true);
    await onRefineQuery(refineQuery);
    setRefineQuery("");
    setIsSubmitting(false);
  };

  const suggestionsVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full flex flex-col gap-4 overflow-hidden"
    >
      {/* Close button - top right */}
      <motion.button
        onClick={onClose}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-4 right-4 lg:relative lg:top-0 lg:right-0 p-2 rounded-full hover:bg-neutral-100 transition-colors flex-shrink-0 self-start"
        title="Hide panel"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </motion.button>

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {/* Query Refinement Section */}
        <motion.div
          className="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 rounded-2xl border border-emerald-200/50 p-3 flex-shrink-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-semibold text-gray-900 mb-2 text-xs flex items-center gap-2 min-w-0">
            <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m0 0h6M6 12a6 6 0 1112 0 6 6 0 01-12 0z" />
            </svg>
            <span className="truncate text-xs">Refine Query</span>
          </h3>
          <textarea
            value={refineQuery}
            onChange={(e) => setRefineQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) handleRefine();
            }}
            placeholder="Ask another question..."
            className="w-full px-2 py-1.5 rounded-lg border border-emerald-200 bg-white/70 text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
            rows="3"
          />
          <div className="mt-2 flex gap-2 w-full">
            <motion.button
              onClick={handleRefine}
              disabled={isSubmitting || !refineQuery.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 py-1.5 px-2 rounded-lg font-medium text-xs transition-all ${
                isSubmitting || !refineQuery.trim()
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-1">
                  <motion.svg
                    className="w-3 h-3"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle cx="12" cy="12" r="9" strokeWidth="2" />
                  </motion.svg>
                  <span>Refining...</span>
                </span>
              ) : (
                "Refine"
              )}
            </motion.button>
          </div>
          <p className="text-xs text-gray-600 mt-1.5">💡 "top 5", "compare X vs Y"</p>
        </motion.div>

        {/* Suggestions Section - Executive Insights */}
        {suggestions && suggestions.length > 0 && (
          <motion.div
            variants={suggestionsVariants}
            initial="hidden"
            animate="visible"
            className="bg-gradient-to-br from-emerald-50/80 via-teal-50/60 to-cyan-50/40 rounded-2xl border border-emerald-200/60 p-4 flex-shrink-0 shadow-sm"
          >
            <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2 min-w-0">
              <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="truncate">Strategic Insights</span>
            </h3>
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {suggestions.map((suggestion, idx) => {
                // Parse bold text (**text**)
                const parts = suggestion.split(/(\*\*[^*]+\*\*)/g);
                
                return (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    className="p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-emerald-200/40 hover:border-emerald-300 hover:shadow-md transition-all"
                  >
                    <p className="text-xs leading-relaxed text-gray-800">
                      {parts.map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          const boldText = part.slice(2, -2);
                          return <strong key={i} className="font-bold text-emerald-900">{boldText}</strong>;
                        }
                        return <span key={i}>{part}</span>;
                      })}
                    </p>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-emerald-200/50">
              <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                AI-powered insights optimized for executive decision-making
              </p>
            </div>
          </motion.div>
        )}

        {/* Info Section */}
        <motion.div
          className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 rounded-2xl border border-amber-200/50 p-3 flex-shrink-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-semibold text-gray-900 mb-2 text-xs flex items-center gap-2 min-w-0">
            <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="truncate text-xs">Chart Info</span>
          </h3>
          <div className="space-y-1.5 text-xs text-gray-700 min-w-0">
            <div className="flex justify-between items-center gap-2">
              <span className="text-gray-600 flex-shrink-0">Charts:</span>
              <span className="font-semibold text-emerald-600">{charts.length}</span>
            </div>
            {agentResponse?.intent?.confidence && (
              <div className="flex justify-between items-center gap-2">
                <span className="text-gray-600 flex-shrink-0">Confidence:</span>
                <span className="font-semibold text-emerald-600">{Math.round(agentResponse.intent.confidence * 100)}%</span>
              </div>
            )}
            {agentResponse?.intent?.intents && (
              <div className="min-w-0">
                <span className="text-gray-600 block mb-1">Detected:</span>
                <div className="flex flex-wrap gap-1">
                  {agentResponse.intent.intents.slice(0, 2).map((intent, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 bg-white/60 border border-amber-200 rounded text-xs text-gray-700 truncate break-words">
                      {intent}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Hide Panel Button - Bottom */}
      <motion.button
        onClick={onClose}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full py-2 px-3 rounded-lg font-semibold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg transition-all flex-shrink-0 whitespace-nowrap"
      >
        Hide Panel
      </motion.button>
    </motion.div>
  );
}

export default function GeneratedDashboard({ charts, onRefineQuery, suggestions, agentResponse }) {
  const [showPanel, setShowPanel] = useState(true);

  if (!charts || charts.length === 0) return null;

  const isSingleChart = charts.length === 1;
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mt-8 mb-12"
    >
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-lime-600">
          {isSingleChart ? "Your Visualization" : "Analytics Dashboard"}
        </h2>
        <div className="h-1 w-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mt-2" />
      </motion.div>

      {/* Split Layout: Charts + Query Panel */}
      <div className="flex flex-col lg:flex-row gap-6 relative">
        {/* Charts Section - Left Side */}
        <div className={`flex-1 ${showPanel ? 'lg:pr-4' : ''}`}>
          <div className={`grid ${isSingleChart ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-6`}>
            {charts.map((c, i) => (
              <ChartCard 
                key={i}
                option={c.option}
                title={c.title}
                subtitle={c.subtitle}
                index={i}
                isSingleChart={isSingleChart}
              />
            ))}
          </div>
        </div>

        {/* Query Panel - Right Side */}
        <AnimatePresence>
          {showPanel && (
            <motion.div
              className="w-full lg:w-96 bg-white/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 shadow-xl p-6 relative"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.3 }}
            >
              <QueryPanel 
                charts={charts}
                onRefineQuery={onRefineQuery}
                onClose={() => setShowPanel(false)}
                suggestions={suggestions}
                agentResponse={agentResponse}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show Panel Button - when hidden */}
        <AnimatePresence>
          {!showPanel && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setShowPanel(true)}
              className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Show refinement panel"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
