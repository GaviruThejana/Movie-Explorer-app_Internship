import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { getErrorMessage } from '../api/tmdb';

/**
 * Generic data-fetching hook.
 *
 * @param {(signal: AbortSignal) => Promise<any>} fetcher  async function receiving an AbortSignal
 * @param {Array} deps  dependency list – refetches whenever it changes
 * @param {{ enabled?: boolean }} options
 * @returns {{ data: any, loading: boolean, error: string|null, refetch: () => void }}
 */
const useFetch = (fetcher, deps = [], { enabled = true } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetcherRef
      .current(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((err) => {
        if (axios.isCancel(err) || controller.signal.aborted) return;
        setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, reloadKey]);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  return { data, loading, error, refetch };
};

export default useFetch;
