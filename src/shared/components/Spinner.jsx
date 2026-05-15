import React from 'react';
import { cn } from '../../shared/utils/index.js';

export function Spinner({ size = 20, color = '#09d2f5', className }) {
  return (
    <div
      className={cn('animate-spin rounded-full border-2 border-transparent', className)}
      style={{
        width:       size,
        height:      size,
        borderTopColor: color,
        borderRightColor: `${color}40`,
        flexShrink:  0,
      }}
    />
  );
}

export function LoadingDots({ color = '#09d2f5' }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 5, height: 5, borderRadius: '50%',
            background: color,
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function SkeletonBox({ width, height = 16, className, style }) {
  return (
    <div
      className={cn('shimmer rounded', className)}
      style={{ width, height, ...style }}
    />
  );
}

export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#09090b',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: 'linear-gradient(135deg, #09d2f5, #0093bb)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, fontWeight: 700, color: '#000', fontFamily: 'monospace',
        boxShadow: '0 0 30px rgba(9,210,245,0.4)',
      }}>⟨/⟩</div>
      <Spinner size={28} />
      <p style={{ fontSize: 13, color: '#52526d' }}>{message}</p>
    </div>
  );
}
