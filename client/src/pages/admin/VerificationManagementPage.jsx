import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import VerificationBadge from '../../components/common/VerificationBadge';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { ShieldCheck, CheckCircle2, XCircle, Building2, User, Phone, Mail } from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export default function VerificationManagementPage() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');

  const [activeModalUser, setActiveModalUser] = useState(null);
  const [decision, setDecision] = useState(null); // 'approved' | 'rejected'
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getVerifications({ status: statusFilter || undefined });
      setVerifications(res.data?.users || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load organization verifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [statusFilter]);

  const handleDecisionSubmit = async () => {
    if (!activeModalUser || !decision) return;
    try {
      setActionLoading(true);
      await adminApi.decideVerification(activeModalUser._id, {
        status: decision,
        notes,
      });
      toast.success(`Verification ${decision} successfully!`);
      setActiveModalUser(null);
      setDecision(null);
      setNotes('');
      fetchVerifications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update verification status.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-surface-900 tracking-tight">
          Organization Verification Desk
        </h1>
        <p className="text-xs text-surface-500 mt-1">
          Review tax documents and charity registration IDs to maintain safety and compliance across FoodBridge.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 pb-2 border-b border-surface-200 text-xs">
        {[
          { label: 'Pending Review', value: 'pending' },
          { label: 'Approved Organizations', value: 'approved' },
          { label: 'Rejected', value: 'rejected' },
          { label: 'All', value: '' },
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
        <LoadingState message="Loading verification queue..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchVerifications} />
      ) : verifications.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No verification requests"
          description="There are currently no accounts waiting in this verification filter."
        />
      ) : (
        <div className="space-y-4">
          {verifications.map((u) => (
            <div
              key={u._id}
              className="bg-white rounded-3xl p-6 border border-surface-200 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-100">
                <div>
                  <h3 className="text-base font-bold text-surface-900">
                    {u.organizationName || u.name}
                  </h3>
                  <p className="text-xs text-surface-500">
                    Role: <span className="capitalize font-semibold">{u.role}</span> • Joined {formatDateTime(u.createdAt)}
                  </p>
                </div>
                <VerificationBadge status={u.verificationStatus} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-surface-50 rounded-2xl border border-surface-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400 block mb-1">
                    Registration / Tax ID
                  </span>
                  <p className="font-mono font-bold text-surface-800 text-sm">
                    {u.registrationNumber || 'None provided'}
                  </p>
                </div>

                <div className="p-3 bg-surface-50 rounded-2xl border border-surface-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400 block mb-1">
                    Contact Person
                  </span>
                  <p className="font-semibold text-surface-900">{u.name}</p>
                  <p className="text-surface-500">{u.email} • {u.phone}</p>
                </div>

                <div className="p-3 bg-surface-50 rounded-2xl border border-surface-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400 block mb-1">
                    Operating Address
                  </span>
                  <p className="font-semibold text-surface-900">
                    {u.address?.address || 'Address unlisted'}
                  </p>
                  <p className="text-surface-500">
                    {u.address?.city}, {u.address?.state} {u.address?.postalCode}
                  </p>
                </div>
              </div>

              {u.verificationStatus === 'pending' && (
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setActiveModalUser(u);
                      setDecision('rejected');
                    }}
                    className="btn-secondary text-xs text-rose-600 border-rose-200 hover:bg-rose-50 py-2 px-4 flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveModalUser(u);
                      setDecision('approved');
                    }}
                    className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Non-Profit</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Decision Modal */}
      {activeModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-surface-100 space-y-4">
            <h3 className="text-lg font-bold text-surface-900">
              {decision === 'approved' ? 'Approve Verification' : 'Reject Verification'}
            </h3>
            <p className="text-xs text-surface-600">
              {decision === 'approved'
                ? `Approving ${activeModalUser.organizationName || activeModalUser.name} will grant them full platform claiming privileges.`
                : `Are you sure you want to reject the registration of ${activeModalUser.organizationName || activeModalUser.name}?`}
            </p>

            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1">
                Admin Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal verification notes or reason..."
                className="form-input text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveModalUser(null);
                  setDecision(null);
                }}
                disabled={actionLoading}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDecisionSubmit}
                disabled={actionLoading}
                className={decision === 'approved' ? 'btn-primary text-xs' : 'btn-danger text-xs'}
              >
                {actionLoading ? 'Saving...' : decision === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
