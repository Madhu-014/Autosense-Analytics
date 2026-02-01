"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  const shortcuts = [
    { key: "Ctrl/⌘ + U", description: "Upload new file" },
    { key: "Ctrl/⌘ + K", description: "Focus search/query" },
    { key: "Ctrl/⌘ + S", description: "Save/Export dashboard" },
    { key: "Ctrl/⌘ + N", description: "New analysis" },
    { key: "Shift + ?", description: "Show keyboard shortcuts" },
    { key: "Escape", description: "Close modal/panel" },
    { key: "Tab", description: "Navigate between elements" },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                >
                  <span className="text-sm text-gray-700">{shortcut.description}</span>
                  <kbd className="px-3 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg shadow-sm">
                    {shortcut.key}
                  </kbd>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200"
            >
              <p className="text-xs text-emerald-800">
                💡 <strong>Tip:</strong> Use these shortcuts to speed up your workflow and navigate faster!
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
