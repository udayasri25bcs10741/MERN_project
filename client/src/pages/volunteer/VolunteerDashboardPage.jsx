import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboardApi';
import DashboardStatCard from '../../components/dashboard/DashboardStatCard';
import StatusBadge from '../../components/donations/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { Truck, CheckCircle2, Clock, Calendar, ArrowRight, MapPin } from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';

export default function VolunteerDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardApi.getVolunteerDashboard();
      setStats(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load volunteer metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <LoadingState message="Loading courier missions..." size="large" />;
  if (error || !stats) return <ErrorState message={error} onRetry={fetchStats} />;

  const nested = stats?.stats || {};
  const totalAssigned = nested.assignedPickups ?? stats?.totalAssigned ?? 0;
  const completedPickups = nested.completedPickups ?? stats?.completedPickups ?? 0;
  const pendingPickups = nested.pendingPickups ?? stats?.pendingPickups ?? 0;
  const assignedPickups = stats?.assignedPickups || stats?.recentPickups || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-surface-900 tracking-tight">
            Volunteer Courier Operations
          </h1>
          <p className="text-xs text-surface-500 mt-1">
            Transport surplus meals safely between local donors and emergency community food banks.
          </p>
        </div>

        <Link
          to="/volunteer/pickups"
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 shadow-md"
        >
          <Truck className="w-4 h-4" />
          <span>Active Pickup Missions ({pendingPickups})</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <DashboardStatCard
          title="Active Missions"
          value={pendingPickups}
          subtitle="Awaiting pickup or in transit"
          icon={Clock}
          color="amber"
        />

        <DashboardStatCard
          title="Completed Deliveries"
          value={completedPickups}
          subtitle="Delivered to verified shelters"
          icon={CheckCircle2}
          color="emerald"
        />

        <DashboardStatCard
          title="Total Runs"
          value={totalAssigned}
          subtitle="All lifetime missions"
          icon={Truck}
          color="primary"
        />
      </div>

      {/* Assigned Pickups List */}
      <div className="bg-white rounded-3xl p-6 border border-surface-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-surface-900">Your Current Assignments</h3>
          <Link
            to="/volunteer/pickups"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <span>View All Runs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {assignedPickups.length === 0 ? (
          <p className="text-xs text-surface-400 text-center py-8">
            No courier runs currently assigned to you. When an NGO dispatches you for a pickup, it will show up here.
          </p>
        ) : (
          <div className="divide-y divide-surface-100">
            {assignedPickups.map((req) => (
              <div
                key={req._id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-50/50 rounded-xl px-2 transition-colors"
              >
                <div>
                  <h4 className="text-xs font-bold text-surface-900">{req.listing?.title}</h4>
                  <div className="flex items-center gap-3 text-[11px] text-surface-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-surface-400" />
                      {req.listing?.pickupLocation?.city || 'Location available'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-surface-400" />
                      {formatDateTime(req.estimatedPickupTime)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={req.pickupStatus} type="pickup" />
                  <Link
                    to={`/ngo/requests/${req._id}`}
                    className="btn-primary text-[11px] py-1.5 px-3"
                  >
                    Open Coordinator
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
