/**
 * useTimer — Precise countdown / stopwatch hook.
 *
 * Usage:
 *   const { elapsed, remaining, pct, isRunning, start, pause, reset } = useTimer({ duration: 2700 });
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * @param {Object} opts
 * @param {number}  opts.duration   — total seconds (for countdown). If omitted, acts as a stopwatch.
 * @param {boolean} opts.autoStart  — start immediately
 * @param {Function} opts.onExpire  — callback when countdown hits 0
 */
export function useTimer({ duration, autoStart = false, onExpire } = {}) {
  const [elapsed,    setElapsed]    = useState(0);
  const [isRunning,  setIsRunning]  = useState(autoStart);
  const startTimeRef = useRef(null);
  const offsetRef    = useRef(0);
  const rafRef       = useRef(null);

  const tick = useCallback(() => {
    if (startTimeRef.current === null) return;
    const now     = performance.now();
    const current = Math.floor((now - startTimeRef.current + offsetRef.current) / 1000);
    setElapsed(current);

    if (duration && current >= duration) {
      setIsRunning(false);
      setElapsed(duration);
      onExpire?.();
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [duration, onExpire]);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (startTimeRef.current !== null) {
        offsetRef.current += performance.now() - startTimeRef.current;
        startTimeRef.current = null;
      }
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isRunning, tick]);

  const start = useCallback(() => setIsRunning(true),  []);
  const pause = useCallback(() => setIsRunning(false), []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setElapsed(0);
    offsetRef.current    = 0;
    startTimeRef.current = null;
  }, []);

  const remaining = duration != null ? Math.max(0, duration - elapsed) : null;
  const pct       = duration != null ? Math.min(100, Math.round((elapsed / duration) * 100)) : null;

  return { elapsed, remaining, pct, isRunning, start, pause, reset };
}
