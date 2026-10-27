import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { listingApi } from '../../api/listingApi';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/donations/StatusBadge';
import DeadlineIndicator from '../../components/donations/DeadlineIndicator';
import QuantityDisplay from '../../components/donations/QuantityDisplay';
import RequestDialog from '../../components/donations/RequestDialog';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import {
  MapPin,
  Calendar,
  AlertTriangle,
  HeartHandshake,
  ShieldCheck,
  ChevronLeft,
  Share2,
  Clock,
  User,
  Thermometer,
} from 'lucide-react';
import { CATEGORIES } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function DonationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isNGO, isDonor } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchListing = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listingApi.getListingById(id);
      setListing(res.data?.listing);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load donation details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [id]);

  const handleWithdraw = async () => {
    if (!withdrawReason) {
      toast.error('Please specify a reason for withdrawing this listing.');
      return;
    }
    try {
      setActionLoading(true);
      await listingApi.withdrawListing(id, withdrawReason);
      toast.success('Listing withdrawn.');
      setIsWithdrawOpen(false);
      fetchListing();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw listing.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <LoadingState message="Loading donation details..." size="large" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <ErrorState
          title="Donation Not Found"
          message={error || 'This listing does not exist or has been removed.'}
          onRetry={fetchListing}
        />
        <div className="text-center mt-6">
          <Link to="/donations" className="btn-secondary text-xs">
            ← Back to All Donations
          </Link>
        </div>
      </div>
    );
  }

  const categoryObj = CATEGORIES.find((c) => c.value === listing.category);
  const isOwner = user && listing.donor?._id === user._id;
  const isAvailable = listing.status === 'available';
  const defaultImg =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80';
  const imageUrl = listing.imageUrl || (listing.images && listing.images.length > 0 ? listing.images[0].url : defaultImg);
  const deadline = listing.expiryDate || listing.collectionDeadline;
  const addressDisplay = listing.pickupAddress || listing.pickupLocation?.address || 'Address provided upon request approval';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top back button */}
      <div className="mb-6">
        <Link
          to="/donations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-500 hover:text-surface-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Listings
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative rounded-3xl overflow-hidden bg-surface-100 border border-surface-200 h-80 sm:h-96 shadow-sm">
            <img
              src={imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = defaultImg;
              }}
            />
            <div className="absolute top-4 left-4">
              <StatusBadge status={listing.status} />
            </div>
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-surface-800 shadow">
                <span>{categoryObj?.icon || '🍲'}</span>
                <span>{categoryObj?.label || listing.category}</span>
              </span>
            </div>
          </div>

          {/* Description & Attributes */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-200 shadow-sm space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-surface-900">
                {listing.title}
              </h1>
              <p className="text-xs text-surface-400 mt-1">
                Posted on {new Date(listing.createdAt).toLocaleDateString()} by{' '}
                <span className="font-semibold text-surface-700">
                  {listing.donor?.name || 'Verified Donor'}
                </span>
              </p>
            </div>

            <div className="prose prose-sm max-w-none text-surface-600 leading-relaxed">
              <p>{listing.description}</p>
            </div>

            {/* Food Safety & Handling */}
            <div className="border-t border-surface-100 pt-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400">
                Food Safety & Handling Instructions
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-surface-50 border border-surface-100">
                  <span className="text-xs text-surface-500 block mb-1">Perishability</span>
                  <span className="text-sm font-semibold text-surface-900">
                    {listing.perishableInfo?.isPerishable ? 'Perishable Item' : 'Non-perishable shelf stable'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-50 border border-surface-100">
                  <span className="text-xs text-surface-500 block mb-1">Storage Requirement</span>
                  <span className="text-sm font-semibold text-surface-900 capitalize">
                    {listing.perishableInfo?.storageRequirements || 'Room Temperature'}
                  </span>
                </div>
              </div>

              {listing.allergens && listing.allergens.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Contains Allergens</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {listing.allergens.map((allg, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-white text-xs font-medium text-amber-800 border border-amber-300"
                      >
                        {allg}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Pickup Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-surface-200 shadow-sm space-y-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-surface-400 block mb-1">
                Quantity Available
              </span>
              <QuantityDisplay quantity={listing.quantity} unit={listing.unit} />
            </div>

            <div className="border-t border-surface-100 pt-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-surface-400 block mb-1.5">
                Freshness Deadline
              </span>
              <DeadlineIndicator expiryDate={deadline} />
              <p className="text-[11px] text-surface-400 mt-1">
                Must be collected by {new Date(deadline).toLocaleString()}
              </p>
            </div>

            {/* Pickup Location details */}
            <div className="border-t border-surface-100 pt-4 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-surface-400 block">
                Pickup Location
              </span>
              <div className="flex items-start gap-2 text-xs text-surface-700">
                <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{addressDisplay}</p>
                  {listing.pickupLocation?.city && (
                    <p className="text-surface-500">
                      {listing.pickupLocation.city}, {listing.pickupLocation.state} {listing.pickupLocation.postalCode}
                    </p>
                  )}
                </div>
              </div>
              {listing.pickupLocation?.instructions && (
                <p className="text-[11px] text-surface-500 bg-surface-50 p-2.5 rounded-xl border border-surface-100 mt-2">
                  <strong>Notes:</strong> {listing.pickupLocation.instructions}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-surface-100 pt-5 space-y-3">
              {isAvailable && isNGO && (
                <button
                  onClick={() => setIsRequestOpen(true)}
                  className="w-full btn-primary text-sm py-3 flex items-center justify-center gap-2 shadow-md"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Request This Donation</span>
                </button>
              )}

              {isAvailable && !isAuthenticated && (
                <Link
                  to="/login"
                  className="w-full btn-primary text-sm py-3 flex items-center justify-center gap-2"
                >
                  Sign In to Claim Food
                </Link>
              )}

              {isOwner && isAvailable && (
                <div className="space-y-2">
                  <Link
                    to={`/donor/listings/${listing._id}/edit`}
                    className="w-full btn-secondary text-xs py-2.5 flex items-center justify-center gap-1.5"
                  >
                    Edit Listing Details
                  </Link>
                  <button
                    onClick={() => setIsWithdrawOpen(true)}
                    className="w-full btn-secondary text-xs text-rose-600 border-rose-200 hover:bg-rose-50 py-2.5"
                  >
                    Withdraw Listing
                  </button>
                </div>
              )}

              {!isAvailable && (
                <div className="p-3 bg-surface-50 rounded-xl text-center text-xs text-surface-500 font-medium">
                  This listing is currently <span className="capitalize font-semibold text-surface-800">{listing.status}</span>.
                </div>
              )}
            </div>
          </div>

          {/* Trust Guarantee card */}
          <div className="bg-primary-900 text-white rounded-3xl p-6 shadow-md space-y-3">
            <div className="flex items-center gap-2 text-primary-300 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Safe Food Guarantee</span>
            </div>
            <p className="text-xs text-primary-100 leading-relaxed">
              FoodBridge enforces one-time cryptographic pickup codes upon handover. Donors and NGOs are backed by verifiable non-profit audit trails.
            </p>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      <RequestDialog
        listing={listing}
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        onSuccess={() => {
          fetchListing();
          navigate('/ngo/requests');
        }}
      />

      {/* Withdraw Modal */}
      <ConfirmationDialog
        isOpen={isWithdrawOpen}
        title="Withdraw Food Listing"
        message="Are you sure you want to withdraw this surplus food? It will no longer be available for NGOs to claim."
        confirmText="Withdraw Listing"
        isDangerous
        isLoading={actionLoading}
        onCancel={() => setIsWithdrawOpen(false)}
        onConfirm={handleWithdraw}
      />
    </div>
  );
}
