"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FileUpload({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [query, setQuery] = useState("");
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file) => {
    const validTypes = ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (!validTypes.includes(file.type) && !file.name.endsWith(".csv") && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setError("Please upload a CSV or Excel file");
      return;
    }
    setError("");
    setSelectedFile(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);
    setError("");

    try {
      // Import API functions dynamically
      const { uploadFile, validateFile } = await import("../lib/api");
      
      // Validate file first
      validateFile(selectedFile);

      const data = await uploadFile(
        selectedFile,
        query,
        (progress) => setUploadProgress(progress)
      );

      onUpload(data);
      setSelectedFile(null);
      setQuery("");
      setUploadProgress(0);
    } catch (err) {
      setError(err.message || "Failed to upload file");
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      id="upload"
      variants={uploadVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="py-16 px-4"
    >
      <motion.div
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-lime-600">
          Upload Your Data
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Upload a CSV or Excel file and describe what you want to analyze
        </p>

        {/* Drag and drop zone */}
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          whileHover={{ scale: 1.01 }}
          className={`relative rounded-3xl border-2 border-dashed transition-all duration-300 p-8 cursor-pointer backdrop-blur-sm ${
            isDragging
              ? "border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-500/20"
              : "border-neutral-300 bg-neutral-50/30 hover:border-emerald-400"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />

          <motion.div
            className="text-center"
            animate={{ scale: isDragging ? 1.05 : 1 }}
          >
            <motion.svg
              className="w-16 h-16 mx-auto mb-4 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ y: isDragging ? -5 : 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </motion.svg>

            <p className="text-lg font-semibold text-gray-900 mb-2">
              {selectedFile ? selectedFile.name : "Drag & drop your file here"}
            </p>
            <p className="text-sm text-gray-500">or click to browse</p>
            <p className="text-xs text-gray-400 mt-2">CSV, XLS, or XLSX</p>
          </motion.div>
        </motion.div>

        {/* Query input */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
        >
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            What would you like to analyze?
          </label>
          <motion.div
            className="relative"
            whileFocus={{ scale: 1.01 }}
          >
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Show the top 10 rated movies vs box office collection or create a dashboard with sales trends"
              className="w-full px-4 py-3 rounded-2xl border border-neutral-300 bg-white/50 backdrop-blur-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none transition-all duration-200"
              rows="3"
            />
          </motion.div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Be specific! "Top 10 movies by rating vs box office" works better than "analyze data"
          </p>
        </motion.div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <AnimatePresence>
          {isLoading && uploadProgress > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="relative h-2 bg-neutral-200 rounded-full overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  initial={{ width: "0%" }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                {uploadProgress < 100 ? `Uploading... ${Math.round(uploadProgress)}%` : "Processing..."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analyze button */}
        <motion.div
          className="mt-6 flex gap-3"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
        >
          <motion.button
            onClick={handleAnalyze}
            disabled={isLoading || !selectedFile}
            whileHover={{ scale: isLoading || !selectedFile ? 1 : 1.05 }}
            whileTap={{ scale: isLoading || !selectedFile ? 1 : 0.95 }}
            className={`relative flex-1 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 overflow-hidden ${
              isLoading || !selectedFile
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-600 via-teal-600 to-lime-600 hover:shadow-lg hover:shadow-emerald-500/30"
            }`}
          >
            {!isLoading && !selectedFile && (
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.svg
                  className="w-5 h-5"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                </motion.svg>
                {uploadProgress < 100 ? "Uploading..." : "Analyzing..."}
              </span>
            ) : (
              <span className="relative z-10">Analyze Data</span>
            )}
          </motion.button>

          {selectedFile && (
            <motion.button
              onClick={() => {
                setSelectedFile(null);
                setQuery("");
                setError("");
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-xl font-semibold text-gray-900 border border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              Clear
            </motion.button>
          )}
        </motion.div>

        {/* Info box */}
        <motion.div
          className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border border-emerald-200/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="font-semibold text-gray-900 mb-3">✨ Features</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span>📊</span>
              <span><strong>Smart Analysis:</strong> AI understands natural language queries</span>
            </li>
            <li className="flex gap-2">
              <span>📈</span>
              <span><strong>Auto Charts:</strong> Creates visualizations based on your data type</span>
            </li>
            <li className="flex gap-2">
              <span>🎯</span>
              <span><strong>Single & Multiple:</strong> One chart for specific queries, dashboards for broader analysis</span>
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
