"use client";

import { useEffect, useRef } from "react";

export default function ParticleLayer({ count = 30 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const nodes = Array.from({ length: count }).map(() => {
      const p = document.createElement("div");
      p.className = "absolute rounded-full";
      const size = Math.random() * 4 + 2;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.background = "rgba(16,185,129,0.25)"; // emerald tint
      p.style.filter = "blur(0.5px)";
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `${Math.random() * 100}%`;
      p.style.animation = `float ${5 + Math.random() * 6}s ease-in-out ${Math.random() * 2}s infinite`;
      return p;
    });
    nodes.forEach(n => el.appendChild(n));
    return () => { nodes.forEach(n => n.remove()); };
  }, [count]);

  return <div ref={ref} className="absolute inset-0 pointer-events-none" />;
}