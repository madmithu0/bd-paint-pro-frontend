import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import useToast from '../hooks/useToast';
import { formatTaka, formatDate } from '../format';
import SearchBar from '../components/SearchBar';
import Card from '../components/Card';
import Loading from '../components/Loading';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { error } = useToast();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('type') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const executeSearch = useCallback(
    async (searchTerm, filterType, sortOrder) => {
      setLoading(true);
      try {
        const { data } = await api.get('/search', {
          params: {
            q: searchTerm,
            type: filterType,
            sort: sortOrder,
          },
        });
        setResults(Array.isArray(data?.results) ? data.results : []);
      } catch (err) {
        error(err.response?.data?.message || 'Search request failed.');
      } finally {
        setLoading(false);
      }
    },
    [error]
  );

  useEffect(() => {
    const qParam = searchParams.get('q') || '';
    const typeParam = searchParams.get('type') || 'all';
    const sortParam = searchParams.get('sort') || 'newest';
    setQuery(qParam);
    setCategory(typeParam);
    setSortBy(sortParam);
    executeSearch(qParam, typeParam, sortParam);
  }, [searchParams, executeSearch]);

  const handleSearchSubmit = (newQuery) => {
    setSearchParams({ q: newQuery, type: category, sort: sortBy });
  };

  const handleFilterChange = (newType, newSort) => {
    setSearchParams({ q: query, type: newType, sort: newSort });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Global Search</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Search across jobs, teams, and construction materials
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={handleSearchSubmit}
            placeholder="Type keyword and press Enter..."
            autoFocus
          />
        </div>

        <select
          value={category}
          onChange={(e) => handleFilterChange(e.target.value, sortBy)}
          className="px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
        >
          <option value="all">All Categories</option>
          <option value="jobs">Jobs</option>
          <option value="materials">Materials</option>
          <option value="teams">Teams</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => handleFilterChange(category, e.target.value)}
          className="px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <Loading />
      ) : results.length === 0 ? (
        <Loading
          variant="empty"
          emptyTitle="No Matching Results"
          emptyDescription="Try adjusting your search keywords or category filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((item) => {
            const linkPath =
              item.entityType === 'material'
                ? `/materials/${item._id}`
                : item.entityType === 'team'
                ? `/teams/${item._id}`
                : `/jobs/${item._id}`;

            return (
              <Card key={item._id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                      {item.entityType || 'Job'}
                    </span>
                    <h3 className="font-bold text-base mt-2">
                      {item.title || item.name || `${item.sqft} Sqft Painting Job`}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(item.createdAt)}</p>
                  </div>

                  <div className="text-right">
                    {typeof item.price === 'number' && (
                      <p className="font-bold text-blue-600">{formatTaka(item.price)}</p>
                    )}
                    <Link
                      to={linkPath}
                      className="inline-block mt-2 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
