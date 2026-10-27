import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import StatusBadge from '../../components/donations/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { Package, ShieldAlert, EyeOff, Eye, Search } from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export default function ListingModerationPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const [activeItem, setActiveItem] = useState(null);
  const [actionType, setActionType] = useState('hide'); // 'hide' | 'unhide'
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getAllListings({ search });
      setListings(res.data?.listings || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load listings for moderation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleModerateSubmit = async () => {
    if (!activeItem) return;
    if (actionType === 'hide' && !reason) {
      toast.error('Please enter a moderation reason.');
      return;
    }
    try {
      setActionLoading(true);
      await adminApi.moderateListing(activeItem._id, {
        action: actionType,
        reason,
      });
      toast.success(`Listing ${actionType === 'hide' ? 'hidden' : 'restored'} successfully.`);
      setActiveItem(null);
      setReason('');
      fetchListings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Moderation action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-surface-900 tracking-tight">
          Food Listing Moderation
        </h1>
        <p className="text-xs text-surface-500 mt-1">
          Review posted surplus across the entire network and hide listings that violate food safety policies.
        </p>
      </div>

      {loading ? (
        <LoadingState message="Loading platform listings..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchListings} />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No listings found"
          description="There are currently no listings in the system."
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
                  {item.isModerated && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      Hidden by Moderator
                    </span>
                  )}
                </div>
                <p className="text-xs text-surface-500 line-clamp-1">{item.description}</p>
                <div className="flex items-center gap-4 text-[11px] text-surface-500 pt-1">
                  <span>Donor: <strong>{item.donor?.name || 'Unknown'}</strong></span>
                  <span>•</span>
                  <span>Qty: <strong>{item.quantity} {item.unit}</strong></span>
                  <span>•</span>
                  <span>Expires: {formatDateTime(item.expiryDate)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {item.isModerated ? (
                  <button
                    onClick={() => {
                      setActiveItem(item);
                      setActionType('unhide');
                    }}
                    className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setActiveItem(item);
                      setActionType('hide');
                    }}
                    className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 text-rose-700 border-rose-200 hover:bg-rose-50"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide Listing</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Moderation Reason Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-surface-100 space-y-4">
            <h3 className="text-lg font-bold text-surface-900">
              {actionType === 'hide' ? 'Hide Food Listing' : 'Restore Food Listing'}
            </h3>
            <p className="text-xs text-surface-600">
              {actionType === 'hide'
                ? `Hiding "${activeItem.title}" will remove it from search and prevent NGOs from claiming it.`
                : `Restoring "${activeItem.title}" will unhide it and make it visible again.`}
            </p>

            {actionType === 'hide' && (
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Reason for Moderation <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="E.g., Inappropriate content, expired food, prohibited item..."
                  className="form-input text-xs"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                disabled={actionLoading}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModerateSubmit}
                disabled={actionLoading}
                className={actionType === 'hide' ? 'btn-danger text-xs' : 'btn-primary text-xs'}
              >
                {actionLoading ? 'Processing...' : actionType === 'hide' ? 'Confirm Hide' : 'Confirm Restore'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
