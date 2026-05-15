import React from 'react';
import { cn } from '../../shared/utils/index.js';

export function EmptyState({ icon = '◎', title, description, action, className }) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-8 text-center',
      'rounded-2xl border border-white/[0.06] bg-surface-100/40',
      className,
    )}>
      <div className="text-5xl mb-4 opacity-20 select-none">{icon}</div>
      {title && (
        <h3 className="text-sm font-semibold text-secondary mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-xs text-muted max-w-xs leading-relaxed mb-5">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
