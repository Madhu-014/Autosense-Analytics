import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactECharts from "echarts-for-react";
import GeneratedDashboard from "./GeneratedDashboard";
import { getBackendUrl } from "../lib/api";

export default function DashboardModal({ open, onClose, charts, suggestions, onPromptSubmit, busy, initialCollapsed = false, agentResponse = null }) {
  const overlayRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(initialCollapsed);
  const [vh, setVh] = useState(typeof window !== "undefined" ? window.innerHeight : 800);
  
  useEffect(() => {
    const handler = () => setVh(window.innerHeight);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && open) onClose?.();
    };
    window.addEventListener("keydown", onKey);
    // Lock background scroll when modal is open
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", onKey);
        document.body.style.overflow = prev;
      };
    }
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === overlayRef.current) onClose?.();
          }}
        >
          {/* Viewport-fixed close for easy exit */}
          <button
            onClick={onClose}
            className="fixed right-4 z-[10050] rounded-full p-2 bg-white/90 hover:bg-white text-gray-900 border border-neutral-200 shadow"
            style={{ top: "calc(var(--nav-h, 64px) + 0.5rem)" }}
            aria-label="Close modal"
          >
            ✕
          </button>
          <motion.div
            className="absolute inset-0 p-4 sm:p-6 z-[110] overflow-y-auto flex items-start justify-center"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
          >
            <div
              className="w-full max-w-[96vw] h-full rounded-3xl overflow-y-auto shadow-2xl ring-1 ring-neutral-200 bg-gradient-to-b from-white to-emerald-50/40 backdrop-blur-xl"
              style={{
                marginTop: "calc(var(--nav-h, 64px) + 0.5rem)",
                maxHeight: "calc(100vh - var(--nav-h, 64px) - 1rem)"
              }}
            >
              <div className="p-4 sm:p-6 lg:p-8">
                {/* Use the new GeneratedDashboard component with split layout */}
                <GeneratedDashboard 
                  charts={charts}
                  onRefineQuery={onPromptSubmit}
                  suggestions={suggestions}
                  agentResponse={agentResponse}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
