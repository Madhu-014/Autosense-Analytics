"use client";

import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { motion } from "framer-motion";

export default function ChartCard({ chart }) {
  const chartRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chart || !chart.data) {
      setError("Invalid chart data");
      setIsLoading(false);
      return;
    }

    try {
      const myChart = echarts.init(chartRef.current);
      const option = {
        title: {
          text: chart.title,
          left: "center",
          textStyle: {
            color: "#1f2937",
            fontSize: 16,
            fontWeight: 600
          }
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderColor: "#e5e7eb",
          textStyle: { color: "#374151" },
          axisPointer: {
            type: "shadow",
            shadowStyle: { color: "rgba(16, 185, 129, 0.1)" }
          }
        },
        xAxis: {
          type: "category",
          data: chart.data.map(d => d[0]),
          axisLabel: {
            color: "#6b7280",
            rotate: chart.data.length > 10 ? 45 : 0
          },
          axisLine: { lineStyle: { color: "#e5e7eb" } }
        },
        yAxis: {
          type: "value",
          axisLabel: { color: "#6b7280" },
          axisLine: { lineStyle: { color: "#e5e7eb" } },
          splitLine: { lineStyle: { color: "#f3f4f6", type: "dashed" } }
        },
        series: [
          {
            data: chart.data.map(d => d[1]),
            type: chart.type || "line",
            smooth: true,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "#10b981" },
                { offset: 1, color: "#059669" }
              ])
            },
            areaStyle: chart.type === "line" ? {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(16, 185, 129, 0.3)" },
                { offset: 1, color: "rgba(16, 185, 129, 0.05)" }
              ])
            } : undefined,
            emphasis: {
              focus: "series",
              itemStyle: { shadowBlur: 10, shadowColor: "rgba(16, 185, 129, 0.5)" }
            }
          },
        ],
        backgroundColor: "transparent",
        grid: {
          left: "3%",
          right: "4%",
          bottom: "10%",
          top: "15%",
          containLabel: true
        }
      };

      myChart.setOption(option);
      setIsLoading(false);

      const handleResize = () => myChart.resize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        myChart.dispose();
      };
    } catch (err) {
      console.error("Chart rendering error:", err);
      setError("Failed to render chart");
      setIsLoading(false);
    }
  }, [chart]);

  if (error) {
    return (
      <motion.div
        className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 shadow-xl border border-red-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center h-64 text-red-600">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="group relative bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-neutral-200/50 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.5 }}
      role="article"
      aria-label={`Chart: ${chart.title}`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10 rounded-2xl">
          <motion.div
            className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}
      <div
        ref={chartRef}
        className="w-full"
        style={{ height: 320 }}
        aria-hidden={isLoading}
      />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.08),transparent_70%)]" />
    </motion.div>
  );
}
