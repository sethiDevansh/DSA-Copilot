import { useState, useCallback } from 'react';
import { aiService } from '../services/aiService.js';

/**
 * useAI — Generic hook for making AI service calls with managed state.
 *
 * Usage:
 *   const { call, result, loading, error, reset } = useAI('getHint');
 *   await call({ problem, level: 1, code });
 */
export function useAI(method) {
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const call = useCallback(async (params) => {
    if (!aiService[method]) {
      setError(`Unknown AI method: ${method}`);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await aiService[method](params);
      setResult(res);
      return res;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [method]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return { call, result, loading, error, reset };
}
