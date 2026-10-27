import React, { useState } from 'react';
import { X, Calendar, Clock, HeartHandshake } from 'lucide-react';
import { requestApi } from '../../api/requestApi';
import toast from 'react-hot-toast';

export default function RequestDialog({ listing, isOpen, onClose, onSuccess }) {
  const [message, setMessage] = useState('');
  const [estimatedPickupTime, setEstimatedPickupTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!estimatedPickupTime) {
      toast.error('Please specify an estimated pickup date and time.');
      return;
    }

    const pickupDate = new Date(estimatedPickupTime);
    if (pickupDate < new Date()) {
      toast.error('Estimated pickup time must be in the future.');
      return;
    }

    if (new Date(listing.expiryDate) < pickupDate) {
      toast.error('Pickup time cannot be later than the listing expiry time.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await requestApi.createRequest({
        listingId: listing._id,
        message,
        estimatedPickupTime: pickupDate.toISOString(),
      });
      toast.success('Donation request sent to donor!');
      if (onSuccess) onSuccess(res.data?.request);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit request. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-surface-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-surface-900">Request This Food</h3>
              <p className="text-xs text-surface-500">Connect with donor to coordinate pickup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-surface-400 hover:text-surface-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Listing preview banner */}
        <div className="bg-surface-50 p-3.5 rounded-xl border border-surface-200 mb-5 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-surface-900">{listing.title}</h4>
            <p className="text-xs text-surface-500">
              {listing.quantity} {listing.unit} • Expires {new Date(listing.expiryDate).toLocaleDateString()}
            </p>
          </div>
          <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-200">
            Available
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1.5">
              Estimated Pickup Date & Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={estimatedPickupTime}
              onChange={(e) => setEstimatedPickupTime(e.target.value)}
              className="form-input"
            />
            <p className="text-[11px] text-surface-500 mt-1">
              Must be before the expiration deadline.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1.5">
              Message to Donor (Optional)
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="E.g., We have 45 individuals at our shelter ready for this meal..."
              className="form-input"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-sm flex items-center gap-2"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
