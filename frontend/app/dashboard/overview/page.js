"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { motion } from "framer-motion";

export default function TrendsChart({ data }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !data) return;

    const chart = echarts.init(chartRef.current);
    const option = {
      xAxis: { type: 'category', data: data.dates },
      yAxis: { type: 'value' },
      series: [
        {
          data: data.values,
          type: 'line',
          smooth: true,
          areaStyle: {},
        }
      ]
    };

    chart.setOption(option);

    window.addEventListener("resize", () => chart.resize());
    return () => chart.dispose();
  }, [data]);

  return (
    <motion.div
      ref={chartRef}
      className="w-full h-96 rounded-3xl p-4 bg-black/30"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    />
  );
}
