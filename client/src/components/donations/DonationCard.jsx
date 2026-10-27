import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';
import DeadlineIndicator from './DeadlineIndicator';
import QuantityDisplay from './QuantityDisplay';
import { CATEGORIES } from '../../utils/constants';

export default function DonationCard({ listing }) {
  const categoryObj = CATEGORIES.find((c) => c.value === listing.category);
  const categoryIcon = categoryObj?.icon || '🍲';
  const categoryLabel = categoryObj?.label || listing.category;

  const defaultImg =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
  const imageUrl = listing.imageUrl || (listing.images && listing.images.length > 0 ? listing.images[0].url : defaultImg);
  const deadline = listing.expiryDate || listing.collectionDeadline;
  const locationDisplay = listing.pickupAddress || (listing.pickupLocation?.city
    ? `${listing.pickupLocation.city}${listing.pickupLocation.state ? ', ' + listing.pickupLocation.state : ''}`
    : 'Location shared on request');

  return (
    <div className="card group hover:shadow-card-hover transition-all duration-300 flex flex-col h-full border border-surface-200 overflow-hidden bg-white">
      {/* Image container */}
      <div className="relative h-48 w-full bg-surface-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = defaultImg;
          }}
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <StatusBadge status={listing.status} />
        </div>
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm text-surface-800">
            <span>{categoryIcon}</span>
            <span className="truncate max-w-[100px]">{categoryLabel}</span>
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-base font-bold text-surface-900 group-hover:text-primary-700 transition-colors line-clamp-1">
              {listing.title}
            </h3>
          </div>

          <p className="text-xs text-surface-500 line-clamp-2 mb-4">
            {listing.description}
          </p>

          <div className="flex items-center justify-between py-2 border-t border-b border-surface-100 mb-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-surface-400 block font-semibold">
                Quantity
              </span>
              <QuantityDisplay quantity={listing.quantity} unit={listing.unit} />
            </div>

            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-surface-400 block font-semibold mb-0.5">
                Fresh Until
              </span>
              <DeadlineIndicator expiryDate={deadline} compact />
            </div>
          </div>

          {/* Location & Tags */}
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center text-xs text-surface-600 gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-surface-400 flex-shrink-0" />
              <span className="truncate">{locationDisplay}</span>
            </div>

            {listing.perishableInfo?.isPerishable && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Perishable
                </span>
                {listing.perishableInfo?.storageRequirements && (
                  <span className="text-[11px] text-surface-500 capitalize">
                    {listing.perishableInfo.storageRequirements}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Link */}
        <div className="pt-2">
          <Link
            to={`/donations/${listing._id}`}
            className="w-full btn-secondary text-xs py-2.5 flex items-center justify-center gap-2 font-semibold hover:border-primary-500 hover:text-primary-700 group-hover:bg-primary-50/50"
          >
            <span>View Donation Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
