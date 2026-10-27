import React from 'react';

export default function QuantityDisplay({ quantity, unit }) {
  const unitLabels = {
    kg: 'kg',
    servings: 'servings',
    packets: 'packets',
    boxes: 'boxes',
    liters: 'liters',
  };

  return (
    <span className="inline-flex items-baseline gap-1 font-semibold text-surface-900">
      <span className="text-lg text-primary-700">{quantity}</span>
      <span className="text-xs text-surface-500 font-medium">{unitLabels[unit] || unit}</span>
    </span>
  );
}
