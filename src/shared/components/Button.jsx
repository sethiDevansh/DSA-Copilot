import React from 'react';
import { cn } from '../../shared/utils/index.js';

const VARIANTS = {
  primary: {
    base:     'bg-gradient-to-r from-brand-400 to-brand-700 text-black font-bold border-0',
    hover:    'hover:shadow-brand hover:-translate-y-px',
    disabled: 'opacity-50 cursor-not-allowed',
  },
  ghost: {
    base:     'bg-transparent text-secondary border border-white/10',
    hover:    'hover:border-brand-400 hover:text-brand-400 hover:bg-brand-400/5',
    disabled: 'opacity-40 cursor-not-allowed',
  },
  danger: {
    base:     'bg-red-500/10 text-red-400 border border-red-500/25',
    hover:    'hover:bg-red-500/20',
    disabled: 'opacity-40 cursor-not-allowed',
  },
  accent: {
    base:     'bg-gradient-to-r from-accent-500 to-accent-700 text-white font-bold border-0',
    hover:    'hover:shadow-accent hover:-translate-y-px',
    disabled: 'opacity-50 cursor-not-allowed',
  },
  subtle: {
    base:     'bg-white/[0.04] text-secondary border border-white/[0.07]',
    hover:    'hover:bg-white/[0.07] hover:text-primary',
    disabled: 'opacity-40 cursor-not-allowed',
  },
};

const SIZES = {
  xs:  'text-[11px] px-2.5 py-1   rounded-md',
  sm:  'text-xs    px-3.5 py-2   rounded-lg',
  md:  'text-sm    px-4.5 py-2.5 rounded-lg',
  lg:  'text-base  px-6   py-3   rounded-xl',
  xl:  'text-base  px-8   py-3.5 rounded-xl',
};

export function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  disabled = false,
  loading  = false,
  icon,
  iconRight,
  className,
  onClick,
  type     = 'button',
  ...rest
}) {
  const v = VARIANTS[variant] ?? VARIANTS.primary;
  const s = SIZES[size]       ?? SIZES.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium',
        'transition-all duration-150 ease-out select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50',
        s,
        v.base,
        !disabled && !loading && v.hover,
        (disabled || loading) && v.disabled,
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span
          className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"
          aria-hidden
        />
      ) : icon ? (
        <span className="text-[1em]" aria-hidden>{icon}</span>
      ) : null}

      {children}

      {!loading && iconRight && (
        <span className="text-[1em]" aria-hidden>{iconRight}</span>
      )}
    </button>
  );
}
