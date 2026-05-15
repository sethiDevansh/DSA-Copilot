import React, { forwardRef } from 'react';
import { cn } from '../../shared/utils/index.js';

export const Input = forwardRef(function Input(
  { label, hint, error, icon, iconRight, className, wrapperClassName, ...props },
  ref
) {
  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label className="text-xs font-semibold text-secondary tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 text-muted text-sm pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'input-field',
            icon      && 'pl-9',
            iconRight && 'pr-9',
            error     && 'border-red-500/50 focus:border-red-500 focus:shadow-none',
            className,
          )}
          {...props}
        />
        {iconRight && (
          <span className="absolute right-3.5 text-muted text-sm pointer-events-none">
            {iconRight}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-muted leading-relaxed">{hint}</p>}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, hint, error, className, wrapperClassName, rows = 4, ...props },
  ref
) {
  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label className="text-xs font-semibold text-secondary tracking-wide">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          'input-field resize-none',
          error && 'border-red-500/50 focus:border-red-500',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
});

export function SearchInput({ value, onChange, placeholder = 'Search...', className }) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <span className="absolute left-3.5 text-muted text-sm pointer-events-none">⌕</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-9"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3.5 text-muted hover:text-primary transition-colors text-sm"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
