import { useState, useEffect } from 'react';

/**
 * useDebounce — debounces a value by a given delay.
 *
 * Usage:
 *   const debouncedQuery = useDebounce(query, 350);
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
