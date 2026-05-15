import { useState, useEffect, useCallback } from 'react';

/**
 * useLocalStorage — React hook that syncs state to localStorage.
 * Falls back gracefully when localStorage is unavailable.
 */
export function useLocalStorage(key, initialValue) {
  const readValue = useCallback(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState(readValue);

  const setValue = useCallback((value) => {
    try {
      const newValue = value instanceof Function ? value(storedValue) : value;
      localStorage.setItem(key, JSON.stringify(newValue));
      setStoredValue(newValue);
      window.dispatchEvent(new Event('local-storage'));
    } catch (err) {
      console.warn(`useLocalStorage: could not set key "${key}"`, err);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch {/* noop */}
  }, [key, initialValue]);

  // Sync across tabs
  useEffect(() => {
    const handler = () => setStoredValue(readValue());
    window.addEventListener('storage',       handler);
    window.addEventListener('local-storage', handler);
    return () => {
      window.removeEventListener('storage',       handler);
      window.removeEventListener('local-storage', handler);
    };
  }, [readValue]);

  return [storedValue, setValue, removeValue];
}
