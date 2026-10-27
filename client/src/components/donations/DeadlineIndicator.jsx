import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { getTimeRemaining } from '../../utils/formatDate';

export default function DeadlineIndicator({ expiryDate, compact = false }) {
  const { hours, isExpired, text } = getTimeRemaining(expiryDate);

  if (isExpired) {
    return (
      <div className={`inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 ${compact ? 'text-[11px] py-0.5' : ''}`}>
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>Expired</span>
      </div>
    );
  }

  // Urgent: less than 4 hours remaining
  const isUrgent = hours < 4;
  const isWarning = hours < 12;

  const colorClass = isUrgent
    ? 'text-rose-700 bg-rose-50 border-rose-200 animate-pulse'
    : isWarning
    ? 'text-amber-800 bg-amber-50 border-amber-200'
    : 'text-surface-700 bg-surface-100 border-surface-200';

  return (
    <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border ${colorClass} ${compact ? 'text-[11px] py-0.5' : ''}`}>
      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{text}</span>
    </div>
  );
}
