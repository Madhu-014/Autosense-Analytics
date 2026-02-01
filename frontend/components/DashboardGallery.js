"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as echarts from "echarts";

function useChart(ref, getOption) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el, undefined, { renderer: "canvas" });
    chart.setOption(getOption());

    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      chart.dispose();
    };
  }, [ref, getOption]);
}

function LineMini() {
  const ref = useRef(null);
  useChart(ref, () => ({
    grid: { left: 8, right: 8, top: 8, bottom: 8 },
    xAxis: { type: "category", show: false, data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },
    yAxis: { type: "value", show: false },
    series: [{
      type: "line",
      smooth: true,
      data: [120, 200, 150, 260, 180, 300, 260],
      lineStyle: { width: 3, color: new echarts.graphic.LinearGradient(0,0,1,0,[{offset:0,color:'#10b981'},{offset:0.5,color:'#22d3ee'},{offset:1,color:'#0ea5a3'}]) },
      areaStyle: { color: "rgba(16,185,129,0.12)" },
      symbol: "circle",
      symbolSize: 6,
      itemStyle: { color: "#0ea5a3" }
    }]
  }));
  return <div ref={ref} className="h-36 w-full" />;
}

function BarMini() {
  const ref = useRef(null);
  useChart(ref, () => ({
    grid: { left: 8, right: 8, top: 8, bottom: 8 },
    xAxis: { type: "category", show: false, data: ["A","B","C","D","E"] },
    yAxis: { type: "value", show: false },
    series: [{
      type: "bar",
      data: [40, 52, 61, 80, 72],
      itemStyle: {
        color: (params) => {
          const colors = [
            new echarts.graphic.LinearGradient(0,1,0,0,[{offset:0,color:'#0ea5a3'},{offset:1,color:'#22d3ee'}]),
            new echarts.graphic.LinearGradient(0,1,0,0,[{offset:0,color:'#10b981'},{offset:1,color:'#65a30d'}]),
            new echarts.graphic.LinearGradient(0,1,0,0,[{offset:0,color:'#65a30d'},{offset:1,color:'#f59e0b'}]),
            '#10b981', '#0ea5a3'];
          return colors[params.dataIndex % colors.length];
        },
        borderRadius: [6,6,0,0]
      }
    }]
  }));
  return <div ref={ref} className="h-36 w-full" />;
}

function PieMini() {
  const ref = useRef(null);
  useChart(ref, () => ({
    series: [{
      type: "pie",
      radius: ["55%","80%"],
      avoidLabelOverlap: true,
      label: { show: false },
      labelLine: { show: false },
      data: [
        { value: 40, name: "North", itemStyle: { color: "#10b981" } },
        { value: 22, name: "West", itemStyle: { color: "#22d3ee" } },
        { value: 18, name: "East", itemStyle: { color: "#65a30d" } },
        { value: 20, name: "South", itemStyle: { color: "#7c3aed" } }
      ]
    }]
  }));
  return <div ref={ref} className="h-36 w-full" />;
}

export default function DashboardGallery() {
  const cards = [
    {
      title: "Revenue Overview",
      subtitle: "Last 7 days",
      charts: [<LineMini key="l" />, <BarMini key="b" />],
      grad: "from-emerald-50 to-white"
    },
    {
      title: "Category Mix",
      subtitle: "Current quarter",
      charts: [<PieMini key="p" />, <BarMini key="b" />],
      grad: "from-teal-50 to-white"
    },
    {
      title: "Forecast",
      subtitle: "Projected",
      charts: [<LineMini key="l" />, <PieMini key="p" />],
      grad: "from-lime-50 to-white"
    },
    {
      title: "Engagement",
      subtitle: "Weekly",
      charts: [<BarMini key="b" />, <LineMini key="l" />],
      grad: "from-cyan-50 to-white"
    }
  ];

  return (
    <div className="mt-16 w-full">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-2xl md:text-3xl font-bold text-gray-900 text-center"
      >
        Dashboard Showcase
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-gray-600 text-center mt-2"
      >
        A glimpse of the visuals AutoSense creates
      </motion.p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((c, idx) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className={`rounded-3xl border border-neutral-200 bg-gradient-to-br ${c.grad} p-5 shadow-lg hover:shadow-2xl transition-shadow duration-300 group cursor-pointer`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">{c.title}</div>
                <div className="text-xs text-gray-600">{c.subtitle}</div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative h-8 w-24 rounded-full brand-gradient text-white text-xs font-semibold flex items-center justify-center shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <span className="relative z-10">Export</span>
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_60%)]" />
              </motion.div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {c.charts.map((Comp, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="rounded-xl border border-neutral-200 bg-white/80 backdrop-blur-sm p-2 shadow-sm hover:shadow-md transition-shadow"
                >
                  {Comp}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
