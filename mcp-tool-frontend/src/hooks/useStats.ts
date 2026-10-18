import {useEffect, useState} from 'react';
import type { CorpusStats } from '../api/types/stats.ts';
import statsApi from '../api/statsApi.ts';

/**
 * TODO(student): Load the corpus statistics (statsApi.get) for the home
 * dashboard, with loading/error state. This is the same data the provided
 * `corpus_stats` MCP tool returns.
 */

const useStats = () => {
  const [stats, setStats] = useState<CorpusStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await statsApi.get();
        setStats(response.data);
      } catch (err) {
        console.error('Failed to load corpus statistics:', err);
        setError('Failed to load corpus statistics.');
      } finally {
        setLoading(false);
      }
    };

    void loadStats();
  }, []);

  return { stats, loading, error };
};

export default useStats;
