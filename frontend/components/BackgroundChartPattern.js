"use client";

export default function BackgroundChartPattern({ opacity = 0.12 }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="bars" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgba(16,185,129,0.12)" />
            <stop offset="50%" stopColor="rgba(13,148,136,0.1)" />
            <stop offset="100%" stopColor="rgba(101,163,13,0.12)" />
          </linearGradient>
        </defs>
        {/* Vertical translucent bars */}
        {[10, 120, 200, 300, 420, 520].map((x, i) => (
          <rect key={x} x={x} y={20 + i * 8} width={60 + (i % 3) * 20} height={180 + (i % 2) * 30} fill="url(#bars)" opacity={opacity} />
        ))}
        {/* Dotted grid overlay */}
        <g opacity={opacity * 0.8}>
          {Array.from({ length: 30 }).map((_, i) => (
            <circle key={i} cx={i * 30 + 15} cy={i % 2 === 0 ? 90 : 140} r="1.5" fill="rgba(16,185,129,0.2)" />
          ))}
        </g>
      </svg>
    </div>
  );
}
