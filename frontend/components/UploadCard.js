"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GeneratedDashboard from "./GeneratedDashboard";
import DashboardModal from "./DashboardModal";
import { ensureBackendUrl, getBackendUrl } from "../lib/api";

export default function UploadCard() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f) analyzePreview(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      setFile(f);
      analyzePreview(f);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  // Static quick prompts removed: only dataset-driven suggestions will show

  async function analyzePreview(f) {
    setPreviewLoading(true);
    setPreviewError("");
    try {
      const backendUrl = ensureBackendUrl();
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch(`${backendUrl}/analyze`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || data.message || `Request failed (${res.status})`);
      }
      setPreview(data);
    } catch (err) {
      console.error(err);
      setPreviewError(err.message || "Couldn’t analyze file for suggestions.");
    } finally {
      setPreviewLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-stretch gap-8">

      <input
        type="file"
        accept=".csv, .xls, .xlsx"
        onChange={handleFile}
        className="hidden"
        id="file-upload"
      />
      {/* Drag & Drop zone with fluid, animated feel (no boxed card) */}
      <motion.div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`relative w-full rounded-3xl px-6 py-10 overflow-hidden ${dragOver ? "shadow-[0_30px_80px_-30px_rgba(16,185,129,0.30)]" : "shadow-[0_8px_28px_-18px_rgba(0,0,0,0.08)]"}`}
        style={{ background: "transparent" }}
      >
        {/* Soft overlay that blends with page background */}
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              dragOver
                ? "radial-gradient(60% 60% at 25% 25%, rgba(16,185,129,0.10) 0%, transparent 60%), radial-gradient(55% 55% at 75% 35%, rgba(132,204,22,0.08) 0%, transparent 60%)"
                : "radial-gradient(60% 60% at 25% 25%, rgba(16,185,129,0.06) 0%, transparent 60%), radial-gradient(55% 55% at 75% 35%, rgba(132,204,22,0.05) 0%, transparent 60%)",
            mixBlendMode: "soft-light",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: dragOver ? 0.9 : 0.6 }}
          transition={{ duration: 0.3 }}
        />

        {/* Content */}
        <div className="relative flex flex-col items-center gap-5 text-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-14 w-14 rounded-2xl bg-white/90 text-emerald-700 flex items-center justify-center shadow-md"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>

          <div>
            <p className="text-lg font-semibold text-gray-900">Upload CSV or Excel</p>
            <p className="text-sm text-gray-600 mt-1">Drag & drop your file here, or browse from device.</p>
          </div>

          <div className="flex items-center gap-3">
            <motion.label
              htmlFor="file-upload"
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="group relative cursor-pointer inline-flex items-center gap-2 rounded-full px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-lime-600 text-white font-semibold shadow-md hover:shadow-xl transition-all text-sm overflow-hidden"
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_60%)]" />
              <span className="relative z-10">{file ? "Change file" : "Browse files"}</span>
            </motion.label>
          </div>

          <div className="flex items-center gap-2">
            {["CSV","XLS","XLSX"].map((t) => (
              <motion.span
                key={t}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="inline-flex items-center rounded-full border border-neutral-200 bg-white/70 px-2.5 py-1 text-[11px] text-gray-700"
              >
                {t}
              </motion.span>
            ))}
          </div>

          {/* Sparkle hints when dragging */}
          <AnimatePresence>
            {dragOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none"
              >
                {[...Array(12)].map((_, i) => (
                  <motion.span
                    key={i}
                    className="absolute w-1.5 h-1.5 bg-emerald-400 rounded-full"
                    style={{
                      top: `${10 + Math.random() * 80}%`,
                      left: `${10 + Math.random() * 80}%`,
                      filter: "blur(0.5px)",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.6 + Math.random(), repeat: Infinity }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto max-w-full"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-3 py-1 text-xs text-gray-700">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 7a2 2 0 012-2h8l4 4v8a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <span className="max-w-[260px] truncate">{file.name}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prompt (optional) */}
      <div className="w-full space-y-3">
        <div className="relative group">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-[11px] shadow">AI</div>
          <textarea
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your desired dashboard or charts (optional)"
            className="w-full pl-12 pr-3 py-3 rounded-2xl border border-neutral-200/80 bg-white/80 backdrop-blur-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>
        {/* Data-driven suggestions below prompt */}
        <div className="flex flex-wrap gap-2 items-center">
          {previewLoading && (
            <span className="text-[11px] text-gray-500">Analyzing data for suggestions…</span>
          )}
          {preview?.suggestions?.map((s, idx) => (
            <motion.button
              key={idx}
              type="button"
              onClick={() => setPrompt(s)}
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group relative rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[11px] text-gray-700 hover:border-emerald-300 hover:text-emerald-700 hover:shadow-md transition-all"
            >
              <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.18),transparent_60%)]" />
              <span className="relative z-10">{s}</span>
            </motion.button>
          ))}
          {previewError && (
            <span className="text-[11px] text-red-600">{previewError}</span>
          )}
        </div>
        {/* No static prompts; suggestions come only from the dataset analysis */}
      </div>

      {/* Primary action */}
      <div className="w-full">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="group relative w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-lime-600 shadow-lg hover:shadow-2xl transition-all text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
          disabled={!file || loading}
          onClick={async () => {
            if (!file) return;
            setLoading(true);
            try {
              const backendUrl = ensureBackendUrl();
              // If we already have a preview analysis, refine with prompt or use it directly.
              if (preview && preview.dataset_id) {
                let data = preview;
                if (prompt && prompt.trim().length > 0) {
                  const fd = new FormData();
                  fd.append("dataset_id", preview.dataset_id);
                  fd.append("prompt", prompt);
                  const res = await fetch(`${backendUrl}/analyze/prompt`, { method: "POST", body: fd });
                  data = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    throw new Error(data.error || data.message || `Request failed (${res.status})`);
                  }
                }
                setResult(data);
                setOpenModal(true);
              } else {
                const fd = new FormData();
                fd.append("file", file);
                if (prompt) fd.append("prompt", prompt);
                const res = await fetch(`${backendUrl}/analyze`, { method: "POST", body: fd });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                  throw new Error(data.error || data.message || `Request failed (${res.status})`);
                }
                setResult(data);
                setOpenModal(true);
              }
            } catch (e) {
              console.error(e);
              setResult({ error: e.message || "Failed to analyze file. Please try again." });
            } finally {
              setLoading(false);
            }
          }}
        >
          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
          {loading ? (
            <span className="relative z-10 inline-flex items-center gap-2">
              <span className="inline-block h-4 w-4 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
              Analyzing…
            </span>
          ) : (
            <span className="relative z-10 inline-flex items-center gap-2">
              Generate Dashboard
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </motion.button>
        <p className="mt-2 text-[11px] text-center text-gray-500">Prompts help shape charts, but are optional.</p>
      </div>

      {/* Full-screen Modal with dashboard + prompt */}
      <DashboardModal
        open={openModal && !!result && !result.error}
        onClose={() => setOpenModal(false)}
        charts={result?.charts || []}
        suggestions={result?.suggestions || []}
        agentResponse={result?.agent_response}
        busy={loading}
        initialCollapsed={false}
        onPromptSubmit={async (promptText) => {
          if (!result?.dataset_id) return;
          setLoading(true);
          try {
            const backendUrl = ensureBackendUrl();
            const fd = new FormData();
            fd.append("dataset_id", result.dataset_id);
            if (promptText) fd.append("prompt", promptText);
            const res = await fetch(`${backendUrl}/analyze/prompt`, { method: "POST", body: fd });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              throw new Error(data.error || data.message || `Request failed (${res.status})`);
            }
            setResult(data);
          } catch (e) {
            console.error(e);
          } finally {
            setLoading(false);
          }
        }}
      />
      {result && result.error && (
        <div className="w-full text-sm text-red-600">{result.error}</div>
      )}
    </div>
  );
}
