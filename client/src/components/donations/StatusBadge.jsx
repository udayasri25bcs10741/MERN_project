import React from 'react';
import { LISTING_STATUS_CONFIG, PICKUP_STATUS_CONFIG } from '../../utils/constants';

export default function StatusBadge({ status, type = 'listing' }) {
  const config = type === 'listing' ? LISTING_STATUS_CONFIG : PICKUP_STATUS_CONFIG;
  const current = config[status] || { label: status, color: 'bg-surface-100 text-surface-700 border-surface-200' };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.color}`}
    >
      {current.label}
    </span>
  );
}
