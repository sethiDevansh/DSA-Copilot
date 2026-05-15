import React from 'react';

const TYPE_STYLES = {
  success: { bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.25)', color: '#4ade80', icon: '✓' },
  error:   { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  color: '#f87171', icon: '⚠' },
  info:    { bg: 'rgba(9,210,245,0.08)',  border: 'rgba(9,210,245,0.25)',  color: '#09d2f5', icon: 'ℹ' },
  warning: { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)', color: '#fbbf24', icon: '⚡' },
};

export function Toast({ toast }) {
  const style = TYPE_STYLES[toast.type] ?? TYPE_STYLES.info;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      padding: '12px 18px',
      background: 'rgba(9,9,11,0.97)',
      border: `1px solid ${style.border}`,
      borderRadius: 12,
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
      animation: 'slideInUp 0.3s cubic-bezier(0.16,1,0.3,1)',
      backdropFilter: 'blur(20px)',
      maxWidth: 360,
    }}>
      <span style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: style.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: style.color, fontSize: 14, fontWeight: 700,
        border: `1px solid ${style.border}`,
      }}>{style.icon}</span>
      <span style={{ fontSize: 13, color: '#c4c4d8' }}>{toast.message}</span>
    </div>
  );
}
