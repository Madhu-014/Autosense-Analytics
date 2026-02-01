"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";

export default function ChartPreview() {
  const chartRef = useRef(null);

  useEffect(() => {
    const chart = echarts.init(chartRef.current);

    chart.setOption({
      backgroundColor: "transparent",
      tooltip: {},
      xAxis: {
        type: "category",
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        axisLabel: { color: "#fff" }
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#fff" }
      },
      series: [
        {
          type: "line",
          smooth: true,
          data: [120, 200, 150, 320, 480, 350, 600],
          itemStyle: { color: "#6366f1" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(99,102,241,0.5)" },
              { offset: 1, color: "rgba(99,102,241,0.1)" },
            ])
          }
        }
      ]
    });

    const resize = () => chart.resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      chart.dispose();
    };
  }, []);

  return <div ref={chartRef} style={{ height: 300 }} />;
}
