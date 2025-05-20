import { useState, useCallback } from 'react';

/**
 * A custom hook to handle fetch requests with loading, error, and data states
 * @param {Function} fetchFunction - The async function to execute
 * @returns {Object} - { loading, data, error, fn }
 */
export default function useFetch(fetchFunction) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fn = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  return { loading, data, error, fn };
}