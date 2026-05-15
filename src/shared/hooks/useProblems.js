import { useState, useEffect, useCallback } from 'react';
import { problemService } from '../services/problemService.js';

/**
 * useProblems — Data hook for problem list with filtering, sorting, and pagination.
 *
 * Returns everything components need: problems, stats, loading state, and CRUD actions.
 */
export function useProblems({ autoLoad = true } = {}) {
  const [problems,  setProblems]  = useState([]);
  const [stats,     setStats]     = useState(null);
  const [streak,    setStreak]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [probs, st, str] = await Promise.all([
        problemService.getAllProblems(),
        problemService.getStats(),
        problemService.getStreak(),
      ]);
      setProblems(probs);
      setStats(st);
      setStreak(str);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) load();
  }, [autoLoad, load]);

  const addProblem = useCallback(async (data) => {
    const result = await problemService.upsertProblem(data);
    await load();
    return result;
  }, [load]);

  const toggleBookmark = useCallback(async (id) => {
    await problemService.toggleBookmark(id);
    await load();
  }, [load]);

  const markRevision = useCallback(async (id, quality) => {
    await problemService.markRevisionDone(id, quality);
    await load();
  }, [load]);

  const getDue = useCallback(async () => {
    return problemService.getDueForRevision();
  }, []);

  const search = useCallback(async (filters) => {
    return problemService.searchProblems(filters);
  }, []);

  return {
    problems,
    stats,
    streak,
    loading,
    error,
    reload: load,
    addProblem,
    toggleBookmark,
    markRevision,
    getDue,
    search,
  };
}
