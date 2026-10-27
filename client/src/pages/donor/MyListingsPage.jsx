import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listingApi } from '../../api/listingApi';
import StatusBadge from '../../components/donations/StatusBadge';
import DeadlineIndicator from '../../components/donations/DeadlineIndicator';
import QuantityDisplay from '../../components/donations/QuantityDisplay';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { PlusCircle, Edit3, Trash2, Eye, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });

  const [withdrawId, setWithdrawId] = useState(null);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listingApi.getMyListings({
        status: statusFilter || undefined,
        page: pagination.page,
        limit: 10,
      });
      setListings(res.data?.listings || []);
      if (res.data?.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load your listings.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, pagination.page]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleWithdrawConfirm = async () => {
    if (!withdrawReason) {
      toast.error('Please specify a reason for withdrawing.');
      return;
    }
    try {
      setActionLoading(true);
      await listingApi.withdrawListing(withdrawId, withdrawReason);
      toast.success('Listing withdrawn.');
      setWithdrawId(null);
      setWithdrawReason('');
      fetchListings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw listing.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-surface-900 tracking-tight">
            My Surplus Food Listings
          </h1>
          <p className="text-xs text-surface-500 mt-1">
            Manage your posted items, review expiration windows, and withdraw uncollected food.
          </p>
        </div>

        <Link
          to="/donor/listings/new"
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Item</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-surface-200 text-xs">
        {[
          { label: 'All Listings', value: '' },
          { label: 'Available', value: 'available' },
          { label: 'Reserved', value: 'reserved' },
          { label: 'Completed', value: 'completed' },
          { label: 'Expired', value: 'expired' },
          { label: 'Withdrawn', value: 'withdrawn' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              statusFilter === tab.value
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Loading your listings..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchListings} />
      ) : listings.length === 0 ? (
        <EmptyState
          title="No listings in this category"
          description="You haven't posted any items matching the selected status filter."
          action={
            <Link to="/donor/listings/new" className="btn-primary text-xs py-2 px-4">
              Post Surplus Food Now
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-3xl border border-surface-200 overflow-hidden shadow-sm divide-y divide-surface-100">
          {listings.map((item) => (
            <div
              key={item._id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-surface-50/50 transition-colors"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-surface-900">{item.title}</h3>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-xs text-surface-500 line-clamp-1">{item.description}</p>
                <div className="flex items-center gap-4 text-xs text-surface-600 pt-1">
                  <div>
                    <span className="text-surface-400 font-medium">Qty: </span>
                    <span className="font-bold text-surface-800">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  <div>
                    <DeadlineIndicator expiryDate={item.expiryDate} compact />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2 md:pt-0">
                <Link
                  to={`/donations/${item._id}`}
                  className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
                  title="View Public Page"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </Link>

                {item.status === 'available' && (
                  <>
                    <Link
                      to={`/donor/listings/${item._id}/edit`}
                      className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
                      title="Edit Listing"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Link>

                    <button
                      onClick={() => {
                        setWithdrawId(item._id);
                        setWithdrawReason('');
                      }}
                      className="btn-secondary text-xs py-2 px-3 text-rose-600 border-rose-200 hover:bg-rose-50 flex items-center gap-1.5"
                      title="Withdraw Food"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Withdraw</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
      />

      {/* Withdraw Modal with reason input */}
      {withdrawId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-surface-100 space-y-4">
            <h3 className="text-lg font-bold text-surface-900">Withdraw Food Listing</h3>
            <p className="text-xs text-surface-600">
              Please let us know why you are withdrawing this surplus item:
            </p>
            <input
              type="text"
              required
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
              placeholder="E.g., Consumed internally, expired early, storage issue..."
              className="form-input text-xs"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setWithdrawId(null)}
                disabled={actionLoading}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleWithdrawConfirm}
                disabled={actionLoading}
                className="btn-danger text-xs"
              >
                {actionLoading ? 'Withdrawing...' : 'Confirm Withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
