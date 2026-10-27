import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { requestApi } from '../../api/requestApi';
import StatusBadge from '../../components/donations/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { HeartHandshake, Eye, XCircle, Calendar, Truck, ArrowRight } from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export default function MyRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const [cancelId, setCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await requestApi.getMyRequests({
        status: statusFilter || undefined,
      });
      setRequests(res.data?.requests || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load your food claim requests.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleCancelConfirm = async () => {
    if (!cancelReason) {
      toast.error('Please specify a reason for cancellation.');
      return;
    }
    try {
      setCancelLoading(true);
      await requestApi.cancelRequest(cancelId, cancelReason);
      toast.success('Food claim cancelled.');
      setCancelId(null);
      setCancelReason('');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel request.');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-surface-900 tracking-tight">
            Claimed Surplus Food
          </h1>
          <p className="text-xs text-surface-500 mt-1">
            Track pickup coordination, assign couriers, and confirm verified handovers.
          </p>
        </div>

        <Link to="/donations" className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2">
          <span>Find More Food</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-surface-200 text-xs">
        {[
          { label: 'All Claims', value: '' },
          { label: 'Pending Approval', value: 'pending' },
          { label: 'Accepted / Active', value: 'accepted' },
          { label: 'Rejected', value: 'rejected' },
          { label: 'Cancelled', value: 'cancelled' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
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
        <LoadingState message="Loading your food claims..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRequests} />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={HeartHandshake}
          title="No food requests found"
          description="You haven't requested any food in this category yet."
          action={
            <Link to="/donations" className="btn-primary text-xs py-2 px-4">
              Browse Available Food
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-white rounded-3xl p-6 border border-surface-200 shadow-sm space-y-4 hover:border-surface-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-100">
                <div>
                  <h3 className="text-base font-bold text-surface-900">
                    {req.listing?.title || 'Surplus Meal Listing'}
                  </h3>
                  <p className="text-xs text-surface-500">
                    Requested on {formatDateTime(req.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={req.status} type="request" />
                  {req.status === 'accepted' && (
                    <StatusBadge status={req.pickupStatus} type="pickup" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-surface-50 rounded-2xl border border-surface-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400 block mb-1">
                    Donor / Pickup Location
                  </span>
                  <p className="font-semibold text-surface-900">{req.listing?.donor?.name || 'Donor'}</p>
                  <p className="text-surface-600">
                    {req.listing?.pickupLocation?.city
                      ? `${req.listing.pickupLocation.city}, ${req.listing.pickupLocation.state || ''}`
                      : 'Address available on acceptance'}
                  </p>
                </div>

                <div className="p-3.5 bg-surface-50 rounded-2xl border border-surface-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400 block mb-1">
                    Pickup Coordination
                  </span>
                  <p className="font-semibold text-surface-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary-600" />
                    <span>Est. Pickup: {formatDateTime(req.estimatedPickupTime)}</span>
                  </p>
                  <p className="text-surface-500 mt-0.5">
                    {req.volunteer ? `Courier: ${req.volunteer?.name}` : 'Self pickup or courier unassigned'}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-2">
                {req.status === 'pending' && (
                  <button
                    onClick={() => {
                      setCancelId(req._id);
                      setCancelReason('');
                    }}
                    className="btn-secondary text-xs text-rose-600 border-rose-200 hover:bg-rose-50 py-2 px-4 flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cancel Request</span>
                  </button>
                )}

                <Link
                  to={`/ngo/requests/${req._id}`}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Pickup Coordinator</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel dialog */}
      {cancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-surface-100 space-y-4">
            <h3 className="text-lg font-bold text-surface-900">Cancel Food Claim</h3>
            <p className="text-xs text-surface-600">
              Are you sure? Cancelling will release this food back to the community surplus pool.
            </p>
            <input
              type="text"
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (e.g., Unable to pick up, schedule conflict)..."
              className="form-input text-xs"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelId(null)}
                disabled={cancelLoading}
                className="btn-secondary text-xs"
              >
                Keep Request
              </button>
              <button
                type="button"
                onClick={handleCancelConfirm}
                disabled={cancelLoading}
                className="btn-danger text-xs"
              >
                {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
