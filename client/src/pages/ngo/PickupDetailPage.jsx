import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { requestApi } from '../../api/requestApi';
import PickupTimeline from '../../components/donations/PickupTimeline';
import StatusBadge from '../../components/donations/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import {
  ShieldCheck,
  MapPin,
  Calendar,
  AlertTriangle,
  Key,
  ChevronLeft,
  Truck,
  CheckCircle2,
  Clock,
  Phone,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export default function PickupDetailPage() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handover Code Verification Form
  const [pickupCodeInput, setPickupCodeInput] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Dispute Modal
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeType, setDisputeType] = useState('food_quality_issue');
  const [disputeLoading, setDisputeLoading] = useState(false);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await requestApi.getRequestById(id);
      setRequest(res.data?.request);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load pickup coordination details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    // Server generates 8-char hex codes (crypto.randomBytes(4).toString('hex').toUpperCase())
    if (!pickupCodeInput || pickupCodeInput.trim().length !== 8) {
      toast.error('Please enter the 8-character pickup code (e.g. A1B2C3D4).');
      return;
    }

    try {
      setVerifying(true);
      await requestApi.confirmPickup(id, {
        pickupCode: pickupCodeInput.toUpperCase().trim(),
      });
      toast.success('Pickup verified and completed successfully!');
      setPickupCodeInput('');
      fetchRequest();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Code verification failed. Check code and try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!disputeType) {
      toast.error('Please select a dispute reason.');
      return;
    }
    try {
      setDisputeLoading(true);
      // Backend disputeSchema: reason = enum, details = free text
      await requestApi.disputePickup(id, {
        reason: disputeType,       // enum: food_not_collected | incorrect_quantity | etc.
        details: disputeReason,    // optional free-text description
      });
      toast.success('Issue reported. Admin team has been notified.');
      setIsDisputeOpen(false);
      fetchRequest();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setDisputeLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading pickup coordination details..." size="large" />;
  if (error || !request) return <ErrorState message={error} onRetry={fetchRequest} />;

  const isCompleted = request.pickupStatus === 'completed';
  const isAccepted = request.status === 'accepted';
  const isDisputed = request.pickupStatus === 'disputed';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          to="/ngo/requests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-500 hover:text-surface-900 transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Claims
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-surface-900 tracking-tight">
              Pickup Coordinator & Handover
            </h1>
            <p className="text-xs text-surface-500 mt-0.5">
              Ref ID: <span className="font-mono text-surface-700">{request._id}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={request.status} type="request" />
            {isAccepted && <StatusBadge status={request.pickupStatus} type="pickup" />}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Handover Action & Location */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pickup Timeline */}
          <div className="bg-white rounded-3xl p-6 border border-surface-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-4">
              Handover Lifecycle Timeline
            </h3>
            <PickupTimeline request={request} />
          </div>

          {/* Verification Code Box (Active when accepted and not yet completed) */}
          {isAccepted && !isCompleted && !isDisputed && (
            <div className="bg-gradient-to-tr from-primary-900 to-primary-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-primary-200">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Enter Donor's Pickup Code</h3>
                  <p className="text-xs text-primary-200">
                    Ask the donor for their 6-character secret code upon receiving the food.
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-3 pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={pickupCodeInput}
                    onChange={(e) => setPickupCodeInput(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE (E.G. A1B2C3)"
                    className="form-input bg-white/10 border-white/20 text-white placeholder-primary-300 font-mono tracking-widest text-center text-lg uppercase focus:bg-white focus:text-surface-900"
                  />
                  <button
                    type="submit"
                    disabled={verifying}
                    className="btn-primary bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-6 font-bold whitespace-nowrap shadow-md"
                  >
                    {verifying ? 'Verifying...' : 'Confirm Handover'}
                  </button>
                </div>
                <p className="text-[11px] text-primary-200">
                  Rate-limited to prevent brute forcing. Maximum 5 attempts allowed.
                </p>
              </form>
            </div>
          )}

          {isCompleted && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-emerald-900">
                Food Handover Verified & Delivered!
              </h3>
              <p className="text-xs text-emerald-700">
                Completed on {formatDateTime(request.completedAt)}. This rescued meal is now recorded in your impact analytics.
              </p>
            </div>
          )}

          {/* Location & Instructions */}
          <div className="bg-white rounded-3xl p-6 border border-surface-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400">
              Pickup Location & Donor Contact
            </h3>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-xs space-y-1">
                <p className="font-bold text-surface-900 text-sm">
                  {request.listing?.pickupLocation?.address || 'Address hidden until acceptance'}
                </p>
                <p className="text-surface-600">
                  {request.listing?.pickupLocation?.city}, {request.listing?.pickupLocation?.state} {request.listing?.pickupLocation?.postalCode}
                </p>
                {request.listing?.pickupLocation?.instructions && (
                  <p className="text-surface-500 pt-1">
                    <strong>Instructions:</strong> {request.listing.pickupLocation.instructions}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-surface-100 pt-3 flex items-center justify-between text-xs">
              <span className="text-surface-500 font-medium">
                Donor: <strong className="text-surface-800">{request.listing?.donor?.name}</strong>
              </span>
              {request.listing?.donor?.phone && (
                <a
                  href={`tel:${request.listing.donor.phone}`}
                  className="inline-flex items-center gap-1.5 text-primary-600 font-bold hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{request.listing.donor.phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Listing Snapshot & Dispute */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-surface-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400">
              Claimed Surplus Item
            </h3>

            <div>
              <h4 className="text-sm font-bold text-surface-900">{request.listing?.title}</h4>
              <p className="text-xs text-surface-500 mt-1 line-clamp-2">
                {request.listing?.description}
              </p>
            </div>

            <div className="p-3.5 bg-surface-50 rounded-2xl border border-surface-100 flex items-center justify-between text-xs">
              <span className="text-surface-500 font-medium">Quantity</span>
              <span className="font-bold text-surface-900">
                {request.listing?.quantity} {request.listing?.unit}
              </span>
            </div>

            <div className="p-3.5 bg-surface-50 rounded-2xl border border-surface-100 flex items-center justify-between text-xs">
              <span className="text-surface-500 font-medium">Target Pickup</span>
              <span className="font-bold text-surface-900">
                {formatDateTime(request.estimatedPickupTime)}
              </span>
            </div>

            {/* Link to public listing */}
            <Link
              to={`/donations/${request.listing?._id}`}
              className="w-full btn-secondary text-xs py-2 block text-center"
            >
              View Full Food Listing
            </Link>
          </div>

          {/* Dispute / Issue Button */}
          {isAccepted && !isCompleted && (
            <div className="p-4 bg-surface-100/60 rounded-3xl border border-surface-200 text-center space-y-2">
              <p className="text-xs text-surface-500">
                Facing a problem at the pickup location?
              </p>
              <button
                onClick={() => setIsDisputeOpen(true)}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold underline"
              >
                Report Issue / Open Dispute
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dispute Modal */}
      {isDisputeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-surface-100 space-y-4">
            <h3 className="text-lg font-bold text-surface-900">Report Pickup Issue</h3>
            <p className="text-xs text-surface-600">
              Please let our support team and administrator know what went wrong:
            </p>

            <form onSubmit={handleDisputeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Issue Type
                </label>
                <select
                  value={disputeType}
                  onChange={(e) => setDisputeType(e.target.value)}
                  className="form-input text-xs"
                >
                  <option value="food_quality_issue">Food Spoiled / Poor Quality</option>
                  <option value="donor_unavailable">Donor Not at Location</option>
                  <option value="quantity_mismatch">Quantity Different Than Listed</option>
                  <option value="other">Other Dispute</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Description of Issue
                </label>
                <textarea
                  rows={3}
                  required
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Explain the situation in detail..."
                  className="form-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDisputeOpen(false)}
                  disabled={disputeLoading}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disputeLoading}
                  className="btn-danger text-xs"
                >
                  {disputeLoading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
