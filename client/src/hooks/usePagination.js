import { useCallback, useMemo, useState } from 'react';

export default function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => {
    if (!limit || limit <= 0) return 1;
    return Math.max(1, Math.ceil(total / limit));
  }, [total, limit]);

  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);

  const goToPage = useCallback((p) => {
    const n = Number(p);
    if (!Number.isFinite(n)) return;
    setPage(Math.min(Math.max(1, n), totalPages));
  }, [totalPages]);

  const changeLimit = useCallback((newLimit) => {
    const n = Number(newLimit);
    if (!Number.isFinite(n) || n <= 0) return;
    setLimit(n);
    setPage(1);
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
    setTotal(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    page,
    limit,
    total,
    totalPages,
    setPage,
    setLimit: changeLimit,
    setTotal,
    nextPage,
    prevPage,
    goToPage,
    reset,
    offset: (page - 1) * limit,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}