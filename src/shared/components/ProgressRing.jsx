import React from 'react';

/**
 * ProgressRing — animated SVG circular progress indicator.
 * Props:
 *   size      (number) — diameter in px
 *   progress  (number) — 0–100
 *   stroke    (number) — ring thickness
 *   color     (string) — ring color
 *   bg        (string) — track color
 *   label     (string | ReactNode) — centre content
 */
export function ProgressRing({
  size     = 80,
  progress = 0,
  stroke   = 6,
  color    = '#09d2f5',
  bg       = 'rgba(255,255,255,0.06)',
  label,
  sublabel,
}) {
  const radius      = (size - stroke) / 2;
  const circumf     = 2 * Math.PI * radius;
  const dashOffset  = circumf - (progress / 100) * circumf;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2}
          r={radius}
          fill="none"
          stroke={bg}
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumf}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        {label !== undefined && (
          <div style={{ fontSize: size * 0.18, fontWeight: 700, color, fontFamily: 'Space Mono, monospace', lineHeight: 1 }}>
            {label}
          </div>
        )}
        {sublabel && (
          <div style={{ fontSize: size * 0.12, color: '#52526d', marginTop: 2 }}>
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}
