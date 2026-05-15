import React from 'react';
import { cn } from '../../shared/utils/index.js';

export function Card({ children, className, hover = true, glow = false, padding = true, onClick, style }) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={cn(
        'rounded-2xl border transition-all duration-200',
        'bg-surface-100/80 border-white/[0.07]',
        'shadow-card',
        padding && 'p-5',
        hover && 'hover:border-brand-400/20 hover:shadow-card-hover hover:-translate-y-0.5',
        glow && 'hover:shadow-brand',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-brand-400/10 border border-brand-400/20 flex items-center justify-center text-brand-400 text-base flex-shrink-0">
            {icon}
          </div>
        )}
        <div>
          {title    && <h3 className="text-sm font-semibold text-primary leading-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, sub, color, icon, trend }) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="section-header">{label}</span>
        {icon && <span className="text-lg opacity-60">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span
          className="text-3xl font-bold font-display leading-none"
          style={{ color: color ?? 'var(--color-brand)' }}
        >
          {value}
        </span>
        {trend !== undefined && (
          <span className={cn('text-xs font-semibold mb-0.5', trend >= 0 ? 'text-green-400' : 'text-red-400')}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      {sub && <span className="text-xs text-muted">{sub}</span>}
    </Card>
  );
}
