import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi';
import DashboardStatCard from '../../components/dashboard/DashboardStatCard';
import StatusBadge from '../../components/donations/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import {
  HeartHandshake,
  Truck,
  CheckCircle2,
  Search,
  Calendar,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';

export default function NGODashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardApi.getNGODashboard();
      setStats(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load NGO analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <LoadingState message="Calculating shelter impact metrics..." size="large" />;
  if (error || !stats) return <ErrorState message={error} onRetry={fetchStats} />;

  const nested = stats?.stats || {};
  const activePickups = nested.acceptedRequests ?? stats?.activePickups ?? 0;
  const completedPickups = nested.completedCollections ?? stats?.completedPickups ?? 0;
  const totalRequests = (nested.pendingRequests || 0) + (nested.acceptedRequests || 0) + (nested.completedCollections || 0) || stats?.totalRequests || 0;
  const mealsRescued = stats?.mealsRescued || [];
  const upcomingPickups = stats?.upcomingPickups || stats?.recentRequests || [];
  const availableListingsCount = stats?.availableListingsCount || 0;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-surface-900 tracking-tight">
            NGO Distribution Operations
          </h1>
          <p className="text-xs text-surface-500 mt-1">
            Coordinate food claims, schedule pickups, and track community nourishment.
          </p>
        </div>

        <Link
          to="/donations"
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 shadow-md"
        >
          <Search className="w-4 h-4" />
          <span>Claim Available Food ({availableListingsCount})</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <DashboardStatCard
          title="Active Pickups"
          value={activePickups}
          subtitle="Currently scheduled or in transit"
          icon={Truck}
          color="amber"
        />

        <DashboardStatCard
          title="Completed Deliveries"
          value={completedPickups}
          subtitle="Food successfully distributed"
          icon={CheckCircle2}
          color="emerald"
        />

        <DashboardStatCard
          title="Total Claims"
          value={totalRequests}
          subtitle="All submitted food requests"
          icon={HeartHandshake}
          color="primary"
        />
      </div>

      {/* Meals Rescued Breakdown by Unit */}
      {mealsRescued.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-surface-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-500">
              Total Rescued Food Volume (Unit Separated)
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {mealsRescued.map((item, idx) => (
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

      {/* Upcoming Scheduled Pickups */}
      <div className="bg-white rounded-3xl p-6 border border-surface-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-surface-900">Upcoming Pickups</h3>
          <Link
            to="/ngo/requests"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <span>View All Claims</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingPickups.length === 0 ? (
          <p className="text-xs text-surface-400 text-center py-8">
            No upcoming pickups scheduled.{' '}
            <Link to="/donations" className="text-primary-600 font-semibold underline">
              Browse available donations
            </Link>
          </p>
        ) : (
          <div className="divide-y divide-surface-100">
            {upcomingPickups.map((req) => (
              <div
                key={req._id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-50/50 rounded-xl px-2 transition-colors"
              >
                <div>
                  <h4 className="text-xs font-bold text-surface-900">{req.listing?.title}</h4>
                  <p className="text-[11px] text-surface-500 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-surface-400" />
                    <span>Scheduled for: {formatDateTime(req.estimatedPickupTime)}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={req.pickupStatus} type="pickup" />
                  <Link
                    to={`/ngo/requests/${req._id}`}
                    className="btn-secondary text-[11px] py-1 px-3"
                  >
                    View Details
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
