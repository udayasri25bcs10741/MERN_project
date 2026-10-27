import React, { useState, useEffect, useCallback } from 'react';
import { requestApi } from '../../api/requestApi';
import StatusBadge from '../../components/donations/StatusBadge';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import QRCodeDisplay from '../../components/common/QRCodeDisplay';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Key,
  Calendar,
  Building2,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export default function IncomingRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Decision Modal State
  const [activeRequest, setActiveRequest] = useState(null);
  const [decisionType, setDecisionType] = useState(null); // 'accept' | 'reject'
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Pickup Code Display Modal (returned once upon accept)
  const [acceptedResult, setAcceptedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await requestApi.getIncomingRequests();
      setRequests(res.data?.requests || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load incoming requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleDecisionConfirm = async () => {
    if (!activeRequest || !decisionType) return;

    if (decisionType === 'reject' && !rejectionReason) {
      toast.error('Please specify a rejection reason.');
      return;
    }

    try {
      setActionLoading(true);
      const res = await requestApi.decideRequest(activeRequest._id, {
        decision: decisionType,
        rejectionReason: decisionType === 'reject' ? rejectionReason : undefined,
      });

      if (decisionType === 'accept') {
        toast.success('Request accepted! Pickup code generated.');
        // Show the pickup code modal
        setAcceptedResult({
          pickupCode: res.data?.pickupCode,
          pickupCodeNote: res.data?.pickupCodeNote,
          listingTitle: activeRequest.listing?.title,
          requesterName: activeRequest.requester?.name,
        });
      } else {
        toast.success('Request rejected.');
      }

      setActiveRequest(null);
      setDecisionType(null);
      setRejectionReason('');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process request decision.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (acceptedResult?.pickupCode) {
      navigator.clipboard.writeText(acceptedResult.pickupCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Pickup code copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-surface-900 tracking-tight">
          Incoming Food Requests
        </h1>
        <p className="text-xs text-surface-500 mt-1">
          Review claims from verified non-profit partners. Accepting an offer locks the food atomically and issues a pickup code.
        </p>
      </div>

      {loading ? (
        <LoadingState message="Fetching incoming requests..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRequests} />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No incoming requests yet"
          description="When an NGO or emergency shelter requests one of your food listings, it will appear here for your confirmation."
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
                    {req.listing?.title || 'Food Listing'}
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

              {/* Requester Profile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-surface-50 rounded-2xl border border-surface-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-surface-800">
                    <Building2 className="w-4 h-4 text-primary-600" />
                    <span>NGO / Requester Details</span>
                  </div>
                  <p className="font-semibold text-surface-900">{req.requester?.name}</p>
                  <p className="text-surface-500">{req.requester?.email} • {req.requester?.phone}</p>
                  {req.message && (
                    <p className="text-surface-600 pt-1 border-t border-surface-200/60 mt-1">
                      <strong>Message:</strong> "{req.message}"
                    </p>
                  )}
                </div>

                <div className="p-3.5 bg-surface-50 rounded-2xl border border-surface-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-surface-800">
                    <Calendar className="w-4 h-4 text-primary-600" />
                    <span>Estimated Pickup Time</span>
                  </div>
                  <p className="text-surface-900 font-semibold text-sm">
                    {formatDateTime(req.estimatedPickupTime)}
                  </p>
                  {req.volunteer && (
                    <p className="text-surface-600 pt-1 border-t border-surface-200/60 mt-1">
                      <strong>Assigned Courier:</strong> {req.volunteer?.name} ({req.volunteer?.phone})
                    </p>
                  )}
                </div>
              </div>

              {/* Decision Action Bar if pending */}
              {req.status === 'pending' && (
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setActiveRequest(req);
                      setDecisionType('reject');
                    }}
                    className="btn-secondary text-xs text-rose-600 border-rose-200 hover:bg-rose-50 py-2 px-4 flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Decline Claim</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveRequest(req);
                      setDecisionType('accept');
                    }}
                    className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept & Issue Pickup Code</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Decision Confirmation Modal */}
      {activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-surface-100 space-y-4">
            <h3 className="text-lg font-bold text-surface-900">
              {decisionType === 'accept' ? 'Accept Food Request' : 'Decline Food Request'}
            </h3>

            {decisionType === 'accept' ? (
              <div className="text-xs text-surface-600 space-y-2">
                <p>
                  Accepting this request will atomically reserve{' '}
                  <strong>{activeRequest.listing?.title}</strong> for{' '}
                  <strong>{activeRequest.requester?.name}</strong>.
                </p>
                <div className="p-3 bg-primary-50 rounded-xl text-primary-800 border border-primary-200">
                  <Key className="w-4 h-4 inline mr-1 text-primary-600" />
                  A unique, one-time handover code will be generated on the next screen.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-surface-600">
                  Please provide a reason for declining this request so the requester is informed:
                </p>
                <input
                  type="text"
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="E.g., Pickup window too late, food already spoiled..."
                  className="form-input text-xs"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveRequest(null);
                  setDecisionType(null);
                }}
                disabled={actionLoading}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDecisionConfirm}
                disabled={actionLoading}
                className={decisionType === 'accept' ? 'btn-primary text-xs' : 'btn-danger text-xs'}
              >
                {actionLoading ? 'Processing...' : decisionType === 'accept' ? 'Confirm Acceptance' : 'Decline Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pickup Code Display Modal */}
      {acceptedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-surface-100 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <Key className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-surface-900">
                Pickup Code Generated!
              </h3>
              <p className="text-xs text-surface-500 mt-1">
                For {acceptedResult.listingTitle} requested by {acceptedResult.requesterName}
              </p>
            </div>

            {/* Code Box */}
            <div className="bg-surface-900 text-white p-5 rounded-2xl flex items-center justify-between shadow-inner">
              <span className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-emerald-400">
                {acceptedResult.pickupCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2 bg-surface-800 hover:bg-surface-700 text-surface-200 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <QRCodeDisplay code={acceptedResult.pickupCode} />

            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-left text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p>{acceptedResult.pickupCodeNote}</p>
            </div>

            <button
              onClick={() => setAcceptedResult(null)}
              className="w-full btn-primary text-xs py-3 font-bold"
            >
              I Have Saved This Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
