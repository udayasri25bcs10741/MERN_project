import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi';
import DashboardStatCard from '../../components/dashboard/DashboardStatCard';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import {
  Users,
  ShieldAlert,
  Package,
  TrendingUp,
  FileText,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardApi.getAdminStats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load system admin metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <LoadingState message="Aggregating platform audit metrics..." size="large" />;
  if (error || !stats) return <ErrorState message={error} onRetry={fetchStats} />;

  const nested = stats?.stats || {};
  const userStats = stats?.userStats || {
    totalUsers: nested.totalUsers ?? 0,
    pendingVerifications: nested.pendingVerifications ?? 0,
    ngos: nested.verifiedNGOs ?? 0,
    donors: Math.max(0, (nested.totalUsers || 0) - (nested.verifiedNGOs || 0)),
  };
  const listingStats = stats?.listingStats || {
    totalListings: nested.totalListings ?? 0,
    available: nested.availableListings ?? 0,
    completed: nested.collectedListings ?? 0,
    expired: nested.expiredListings ?? 0,
  };
  const requestStats = stats?.requestStats || {
    totalRequests: (nested.pendingRequests || 0) + (nested.acceptedRequests || 0) + (nested.completedDonations || 0),
    completed: nested.completedDonations ?? 0,
    disputed: nested.disputedRequests ?? 0,
  };
  const impactVolumeByUnit = stats?.impactVolumeByUnit || [];
  const recentAuditLogs = stats?.recentAuditLogs || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-surface-900 tracking-tight">
          System Administration & Oversight
        </h1>
        <p className="text-xs text-surface-500 mt-1">
          High-level operational metrics, trust verifications, listing moderation, and tamper-resistant audit logs.
        </p>
      </div>

      {/* Pending Verifications Alert */}
      {userStats.pendingVerifications > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                {userStats.pendingVerifications} Organization Verification{userStats.pendingVerifications > 1 ? 's' : ''} Pending!
              </h4>
              <p className="text-xs text-amber-700">
                Review submitted non-profit tax registration IDs before approving claims.
              </p>
            </div>
          </div>
          <Link
            to="/admin/verifications"
            className="btn-primary bg-amber-600 hover:bg-amber-700 text-white text-xs py-2 px-4 whitespace-nowrap"
          >
            Review Verifications
          </Link>
        </div>
      )}

      {/* Disputed Requests Alert */}
      {requestStats.disputed > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                {requestStats.disputed} Disputed Handover Incident{requestStats.disputed > 1 ? 's' : ''}
              </h4>
              <p className="text-xs text-rose-700">
                Issues reported with food quality or donor location.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard
          title="Total Users"
          value={userStats.totalUsers || 0}
          subtitle={`${userStats.ngos || 0} NGOs • ${userStats.donors || 0} Donors`}
          icon={Users}
          color="primary"
        />

        <DashboardStatCard
          title="Active Listings"
          value={listingStats.available || 0}
          subtitle={`${listingStats.totalListings || 0} total posted`}
          icon={Package}
          color="amber"
        />

        <DashboardStatCard
          title="Completed Rescues"
          value={requestStats.completed || 0}
          subtitle={`${requestStats.totalRequests || 0} total requests`}
          icon={ShieldCheck}
          color="emerald"
        />

        <DashboardStatCard
          title="Pending Verifications"
          value={userStats.pendingVerifications || 0}
          subtitle="NGOs awaiting approval"
          icon={ShieldAlert}
          color="purple"
        />
      </div>

      {/* Cumulative Impact Volume by Unit */}
      {impactVolumeByUnit.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-surface-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500">
              Platform Cumulative Rescued Volume (Unit Disaggregated)
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {impactVolumeByUnit.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-surface-50 rounded-2xl border border-surface-100">
                <span className="text-xs text-surface-500 capitalize">{item.unit || 'Items'}</span>
                <p className="text-2xl font-bold text-surface-900 mt-1">
                  {item.totalQuantity} <span className="text-xs font-normal text-surface-400">{item.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Audit Trail Preview */}
      <div className="bg-white rounded-3xl p-6 border border-surface-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-surface-600" />
            <h3 className="text-sm font-bold text-surface-900">Recent System Audit Trail</h3>
          </div>
          <Link
            to="/admin/audit-logs"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <span>Full Audit Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentAuditLogs.length === 0 ? (
          <p className="text-xs text-surface-400 text-center py-6">No audit events recorded yet.</p>
        ) : (
          <div className="divide-y divide-surface-100">
            {recentAuditLogs.map((log) => (
              <div key={log._id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-surface-800 uppercase tracking-wider font-mono mr-2 bg-surface-100 px-2 py-0.5 rounded text-[10px]">
                    {log.action}
                  </span>
                  <span className="text-surface-600">{log.entityType} ({log.entityId})</span>
                </div>
                <span className="text-surface-400 text-[11px]">{formatDateTime(log.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
