import React, { useState, useEffect, useCallback } from 'react';
import { listingApi } from '../../api/listingApi';
import DonationCard from '../../components/donations/DonationCard';
import DonationFilters from '../../components/donations/DonationFilters';
import DonationMapView from '../../components/donations/DonationMapView';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import { Sparkles, Utensils, LayoutGrid, Map } from 'lucide-react';

export default function BrowseDonationsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, totalPages: 1, total: 0 });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    city: '',
    status: 'available', // default to active available donations
    page: 1,
    limit: 9,
  });

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listingApi.getListings(filters);
      setListings(res.data?.listings || []);
      setPagination(
        res.data?.pagination || { page: filters.page, limit: 9, totalPages: 1, total: res.data?.listings?.length || 0 }
      );
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load surplus food listings.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      city: '',
      status: 'available',
      page: 1,
      limit: 9,
    });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-primary-600" />
          <span>Real-time Surplus Stream</span>
        </div>
        <h1 className="text-3xl font-black text-surface-900 tracking-tight">
          Available Surplus Food
        </h1>
        <p className="text-sm text-surface-600 mt-1 max-w-2xl">
          Browse fresh meals, packaged produce, and surplus bakery items ready for pickup by verified local organizations.
        </p>
      </div>

      {/* Filter Bar */}
      <DonationFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Content Stream */}
      {loading ? (
        <LoadingState message="Fetching fresh food listings..." size="large" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchListings} />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={Utensils}
          title="No food listings found"
          description="Try adjusting your category filter, clearing your search query, or check back soon for newly posted surplus."
          action={
            <button onClick={handleResetFilters} className="btn-secondary text-xs">
              Clear All Filters
            </button>
          }
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b border-surface-200">
            <div className="flex items-center gap-2 text-xs text-surface-600 font-medium">
              <span>
                Showing <strong className="text-surface-900">{listings.length}</strong> of{' '}
                <strong className="text-surface-900">{pagination.total}</strong> surplus donations
              </span>
              <span className="hidden sm:inline text-surface-300">•</span>
              <span className="hidden sm:inline text-primary-700 font-semibold">
                Live updates enabled
              </span>
            </div>

            {/* View Mode Switcher */}
            <div className="inline-flex items-center bg-surface-100 p-1 rounded-xl border border-surface-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-surface-900 shadow-sm'
                    : 'text-surface-500 hover:text-surface-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-surface-900 shadow-sm'
                    : 'text-surface-500 hover:text-surface-900'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Map View</span>
              </button>
            </div>
          </div>

          {viewMode === 'map' ? (
            <div className="space-y-6">
              <DonationMapView listings={listings} />
              <p className="text-xs text-surface-500 text-center">
                Click on any marker pin to view food surplus details and initiate a claim request.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item) => (
                <DonationCard key={item._id} listing={item} />
              ))}
            </div>
          )}

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
