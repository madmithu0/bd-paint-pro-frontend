import { useEffect, useMemo, useState } from 'react';
import useDebounce from './useDebounce';

export default function useSearch(items = [], searchKeys = [], delay = 300) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, delay);

  const filtered = useMemo(() => {
    const q = String(debouncedQuery || '').trim().toLowerCase();
    if (!q) return items;
    if (!Array.isArray(items)) return [];
    return items.filter((item) => {
      if (!item || typeof item !== 'object') return String(item).toLowerCase().includes(q);
      if (!searchKeys.length) {
        return JSON.stringify(item).toLowerCase().includes(q);
      }
      return searchKeys.some((key) => {
        const val = key.split('.').reduce((acc, k) => acc?.[k], item);
        return val != null && String(val).toLowerCase().includes(q);
      });
    });
  }, [items, debouncedQuery, searchKeys]);

  useEffect(() => {
    // keep query in sync if needed - no-op, placeholder for side effects
  }, [debouncedQuery]);

  const clear = () => setQuery('');

  return {
    query,
    setQuery,
    debouncedQuery,
    filtered,
    results: filtered,
    clear,
    isSearching: query !== debouncedQuery,
  };
}