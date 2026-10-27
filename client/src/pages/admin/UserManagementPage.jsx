import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { Users, UserX, UserCheck, Search, Shield } from 'lucide-react';
import { ROLE_LABELS } from '../../utils/constants';
import { formatDateTime } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');

  const [activeUser, setActiveUser] = useState(null);
  const [statusAction, setStatusAction] = useState('suspended'); // 'suspended' | 'active'
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getAllUsers({ role: roleFilter || undefined });
      setUsers(res.data?.users || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleStatusSubmit = async () => {
    if (!activeUser) return;
    try {
      setActionLoading(true);
      await adminApi.updateUserStatus(activeUser._id, {
        status: statusAction,
        reason: statusAction === 'suspended' ? reason : 'Reactivated by administrator',
      });
      toast.success(`User ${statusAction === 'suspended' ? 'suspended' : 'reactivated'}.`);
      setActiveUser(null);
      setReason('');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-surface-900 tracking-tight">
          User Directory & Account Controls
        </h1>
        <p className="text-xs text-surface-500 mt-1">
          Inspect registered donors, shelters, and couriers. Suspend accounts that violate platform integrity.
        </p>
      </div>

      {/* Role Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-surface-200 text-xs">
        {[
          { label: 'All Users', value: '' },
          { label: 'Donors', value: 'organization_donor' },
          { label: 'NGOs', value: 'ngo' },
          { label: 'Volunteers', value: 'volunteer' },
          { label: 'Admins', value: 'admin' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setRoleFilter(tab.value)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              roleFilter === tab.value
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Loading platform users..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchUsers} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="There are currently no users matching this filter."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-surface-200 overflow-hidden shadow-sm divide-y divide-surface-100">
          {users.map((u) => (
            <div
              key={u._id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-50/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-surface-900">{u.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-50 text-primary-700 border border-primary-200 capitalize">
                    {ROLE_LABELS[u.role] || u.role}
                  </span>
                  {u.status === 'suspended' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      Suspended
                    </span>
                  )}
                </div>
                <p className="text-xs text-surface-500">{u.email} • {u.phone}</p>
                <p className="text-[11px] text-surface-400">
                  Joined {formatDateTime(u.createdAt)} • {u.address?.city || 'No city'}
                </p>
              </div>

              {u.role !== 'admin' && (
                <div className="flex items-center gap-2">
                  {u.status === 'suspended' ? (
                    <button
                      onClick={() => {
                        setActiveUser(u);
                        setStatusAction('active');
                      }}
                      className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Reactivate</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveUser(u);
                        setStatusAction('suspended');
                      }}
                      className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 text-rose-700 border-rose-200 hover:bg-rose-50"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Suspend</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Suspend Modal */}
      {activeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-surface-100 space-y-4">
            <h3 className="text-lg font-bold text-surface-900">
              {statusAction === 'suspended' ? 'Suspend User Account' : 'Reactivate User Account'}
            </h3>
            <p className="text-xs text-surface-600">
              {statusAction === 'suspended'
                ? `Suspending ${activeUser.name} will immediately revoke their ability to post food or claim donations.`
                : `Reactivating ${activeUser.name} will restore their access.`}
            </p>

            {statusAction === 'suspended' && (
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Reason for Suspension
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="E.g., Inappropriate conduct, repeated missed pickups..."
                  className="form-input text-xs"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveUser(null)}
                disabled={actionLoading}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusSubmit}
                disabled={actionLoading}
                className={statusAction === 'suspended' ? 'btn-danger text-xs' : 'btn-primary text-xs'}
              >
                {actionLoading ? 'Processing...' : statusAction === 'suspended' ? 'Confirm Suspension' : 'Confirm Reactivation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
