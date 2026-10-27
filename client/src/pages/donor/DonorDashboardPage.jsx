import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi';
import DashboardStatCard from '../../components/dashboard/DashboardStatCard';
import StatusBadge from '../../components/donations/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import {
  Package,
  CheckCircle2,
  Clock,
  PlusCircle,
  Inbox,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';

export default function DonorDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardApi.getDonorDashboard();
      setStats(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load donor dashboard analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingState message="Calculating donation metrics and impact..." size="large" />;
  }

  if (error || !stats) {
    return <ErrorState message={error} onRetry={fetchStats} />;
  }

  const nested = stats?.stats || {};
  const activeListings = nested.activeListings ?? stats?.activeListings ?? 0;
  const completedDonations = nested.completedDonations ?? nested.collectedListings ?? stats?.completedDonations ?? 0;
  const totalListings = (nested.activeListings || 0) + (nested.reservedListings || 0) + (nested.collectedListings || 0) || stats?.totalListings || 0;
  const impactByUnit = stats?.impactByUnit || [];
  const recentListings = stats?.recentListings || [];
  const pendingRequests = stats?.pendingRequests || [];

  return (
    <div className="space-y-8">
      {/* Header with Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-surface-900 tracking-tight">
            Donor Operations Hub
          </h1>
          <p className="text-xs text-surface-500 mt-1">
            Track active surplus food, incoming NGO requests, and cumulative community impact.
          </p>
        </div>

        <Link
          to="/donor/listings/new"
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Surplus Food</span>
        </Link>
      </div>

      {/* Pending Requests Alert if any */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                You have {pendingRequests.length} pending food claim request{pendingRequests.length > 1 ? 's' : ''}!
              </h4>
              <p className="text-xs text-amber-700">
                Local NGOs are awaiting your review and confirmation.
              </p>
            </div>
          </div>
          <Link
            to="/donor/requests"
            className="btn-primary bg-amber-600 hover:bg-amber-700 text-white text-xs py-2 px-4 whitespace-nowrap"
          >
            Review Requests
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <DashboardStatCard
          title="Active Listings"
          value={activeListings}
          subtitle="Currently open for claim"
          icon={Clock}
          color="amber"
        />

        <DashboardStatCard
          title="Completed Rescues"
          value={completedDonations}
          subtitle="Delivered to verified NGOs"
          icon={CheckCircle2}
          color="emerald"
        />

        <DashboardStatCard
          title="Total Posted"
          value={totalListings}
          subtitle="Surplus meals registered"
          icon={Package}
          color="primary"
        />
      </div>

      {/* Cumulative Impact by Unit */}
      {impactByUnit.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-surface-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500">
              Cumulative Verified Impact (Grouped by Unit)
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {impactByUnit.map((item, idx) => (
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

      {/* Recent Listings */}
      <div className="bg-white rounded-3xl p-6 border border-surface-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-surface-900">Your Recent Listings</h3>
          <Link
            to="/donor/listings"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentListings.length === 0 ? (
          <p className="text-xs text-surface-400 text-center py-8">
            You haven't posted any surplus food yet.{' '}
            <Link to="/donor/listings/new" className="text-primary-600 font-semibold underline">
              Create your first listing
            </Link>
          </p>
        ) : (
          <div className="divide-y divide-surface-100">
            {recentListings.map((item) => (
              <div
                key={item._id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-50/50 rounded-xl px-2 transition-colors"
              >
                <div>
                  <h4 className="text-xs font-bold text-surface-900">{item.title}</h4>
                  <p className="text-[11px] text-surface-500">
                    {item.quantity} {item.unit} • Posted {formatDateTime(item.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={item.status} />
                  <Link
                    to={`/donations/${item._id}`}
                    className="btn-secondary text-[11px] py-1 px-3"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
