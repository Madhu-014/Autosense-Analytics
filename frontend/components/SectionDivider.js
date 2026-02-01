"use client";

export default function SectionDivider() {
  return (
    <div className="w-full mt-16">
      <svg viewBox="0 0 1440 120" className="w-full h-[120px]" preserveAspectRatio="none">
        <path d="M0,40 C240,90 480,10 720,60 C960,110 1200,30 1440,80 L1440,150 L0,150 Z" fill="url(#grad)" opacity="0.15" />
        <defs>
          <linearGradient id="grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#0ea5a3" />
            <stop offset="100%" stopColor="#65a30d" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}