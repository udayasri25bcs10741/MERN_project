import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestApi } from '../../api/requestApi';
import StatusBadge from '../../components/donations/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { Truck, MapPin, Calendar, Eye, Phone } from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';

export default function AssignedPickupsPage() {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPickups = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await requestApi.getAssignedPickups();
      setPickups(res.data?.requests || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load assigned courier runs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-surface-900 tracking-tight">
          Assigned Courier Deliveries
        </h1>
        <p className="text-xs text-surface-500 mt-1">
          Pick up meals from donors and transport them to the recipient shelter. Verify handover using the donor's code.
        </p>
      </div>

      {loading ? (
        <LoadingState message="Loading your assigned deliveries..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchPickups} />
      ) : pickups.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No courier missions assigned"
          description="You currently have no active or historical pickup assignments."
        />
      ) : (
        <div className="space-y-4">
          {pickups.map((req) => (
            <div
              key={req._id}
              className="bg-white rounded-3xl p-6 border border-surface-200 shadow-sm space-y-4 hover:border-surface-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-100">
                <div>
                  <h3 className="text-base font-bold text-surface-900">
                    {req.listing?.title || 'Surplus Food'}
                  </h3>
                  <p className="text-xs text-surface-500">
                    Target Handover: {formatDateTime(req.estimatedPickupTime)}
                  </p>
                </div>
                <StatusBadge status={req.pickupStatus} type="pickup" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Donor pickup location */}
                <div className="p-3.5 bg-surface-50 rounded-2xl border border-surface-100 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400 block mb-1">
                    Pickup From Donor
                  </span>
                  <p className="font-semibold text-surface-900">{req.listing?.donor?.name}</p>
                  <p className="text-surface-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                    <span>
                      {req.listing?.pickupLocation?.address || 'Address provided'},{' '}
                      {req.listing?.pickupLocation?.city}
                    </span>
                  </p>
                </div>

                {/* Recipient NGO */}
                <div className="p-3.5 bg-surface-50 rounded-2xl border border-surface-100 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400 block mb-1">
                    Deliver To NGO
                  </span>
                  <p className="font-semibold text-surface-900">{req.requester?.name}</p>
                  <p className="text-surface-600">
                    {req.requester?.address?.address ? `${req.requester.address.address}, ${req.requester.address.city}` : 'NGO Main Shelter'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Link
                  to={`/ngo/requests/${req._id}`}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>Open Coordinator & Code Verification</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
