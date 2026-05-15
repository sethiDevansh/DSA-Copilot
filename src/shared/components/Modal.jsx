import React, { useEffect, useRef } from 'react';
import { cn } from '../../shared/utils/index.js';

export function Modal({ isOpen, onClose, title, children, size = 'md', className }) {
  const overlayRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const MAX_WIDTHS = { sm: 400, md: 560, lg: 720, xl: 900 };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: 'fadeIn 0.15s ease-out',
      }}
    >
      <div
        className={cn(className)}
        style={{
          width: '100%',
          maxWidth: MAX_WIDTHS[size] ?? 560,
          background: 'rgba(18,18,22,0.98)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 20,
          boxShadow: '0 25px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04)',
          animation: 'slideInUp 0.25s cubic-bezier(0.16,1,0.3,1)',
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        {title && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0,
          }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e8e8f2', margin: 0 }}>{title}</h2>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 7, color: '#52526d',
                cursor: 'pointer', fontSize: 14,
                width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e8e8f2'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#52526d'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '20px 24px', overflow: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p style={{ fontSize: 13, color: '#9b9bba', lineHeight: 1.7, marginBottom: 20 }}>{message}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          onClick={onClose}
          style={{
            padding: '9px 18px', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9,
            color: '#737394', cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans, sans-serif',
          }}
        >Cancel</button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          style={{
            padding: '9px 18px',
            background: danger ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#09d2f5,#0093bb)',
            border: 'none', borderRadius: 9,
            color: danger ? '#fff' : '#000',
            cursor: 'pointer', fontSize: 13, fontWeight: 700,
            fontFamily: 'DM Sans, sans-serif',
          }}
        >{confirmLabel}</button>
      </div>
    </Modal>
  );
}
