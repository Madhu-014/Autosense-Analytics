"use client";

import { useState, useEffect } from "react";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "./Toast";
import KeyboardShortcutsModal from "./KeyboardShortcutsModal";

export default function AppProvider({ children }) {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { toasts, removeToast, info } = useToast();

  const shortcuts = [
    {
      key: "?",
      shift: true,
      action: () => setShowShortcuts(true),
    },
    {
      key: "escape",
      action: () => setShowShortcuts(false),
    },
    {
      key: "u",
      ctrl: true,
      action: () => {
        const uploadSection = document.getElementById("upload");
        if (uploadSection) {
          uploadSection.scrollIntoView({ behavior: "smooth", block: "center" });
          info("Upload section focused");
        }
      },
    },
    {
      key: "k",
      ctrl: true,
      action: () => {
        const queryInput = document.querySelector('textarea[placeholder*="analyze"]');
        if (queryInput) {
          queryInput.focus();
          info("Query input focused");
        }
      },
    },
  ];

  useKeyboardShortcuts(shortcuts);

  // Show keyboard shortcuts hint on first visit
  useEffect(() => {
    const hasSeenHint = localStorage.getItem("keyboard-shortcuts-hint");
    if (!hasSeenHint) {
      setTimeout(() => {
        info("Press Shift + ? to view keyboard shortcuts", 6000);
        localStorage.setItem("keyboard-shortcuts-hint", "true");
      }, 3000);
    }
  }, [info]);

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      
      {/* Help button - bottom right */}
      <button
        onClick={() => setShowShortcuts(true)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 group"
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (Shift + ?)"
      >
        <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </>
  );
}
