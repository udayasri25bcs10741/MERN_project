import React from 'react';
import { CheckCircle2, Clock, Truck, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';

export default function PickupTimeline({ request }) {
  if (!request) return null;

  const isRejected = request.status === 'rejected';
  const isCancelled = request.status === 'cancelled';
  const isDisputed = request.pickupStatus === 'disputed';
  const isCompleted = request.pickupStatus === 'completed';

  const steps = [
    {
      id: 'submitted',
      title: 'Request Submitted',
      time: request.createdAt,
      done: true,
      icon: Clock,
    },
    {
      id: 'decision',
      title: isRejected ? 'Request Rejected' : isCancelled ? 'Request Cancelled' : 'Donor Accepted',
      time: request.updatedAt,
      done: request.status === 'accepted' || isRejected || isCancelled,
      error: isRejected || isCancelled,
      icon: CheckCircle2,
    },
    {
      id: 'courier',
      title: request.volunteer ? 'Volunteer Assigned' : 'Awaiting Volunteer',
      time: null,
      done: Boolean(request.volunteer) || isCompleted,
      skip: request.status === 'pending' || isRejected || isCancelled,
      icon: Truck,
    },
    {
      id: 'completed',
      title: isDisputed ? 'Pickup Disputed' : isCompleted ? 'Pickup Completed & Verified' : 'In Transit / Pending Handover',
      time: request.completedAt,
      done: isCompleted || isDisputed,
      error: isDisputed,
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="py-4">
      <div className="relative border-l-2 border-surface-200 ml-4 space-y-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isError = step.error;
          const isDone = step.done && !isError;

          return (
            <div key={idx} className="relative pl-6">
              {/* Dot / Icon */}
              <div
                className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white ${
                  isError
                    ? 'border-rose-500 text-rose-600 bg-rose-50'
                    : isDone
                    ? 'border-primary-600 text-primary-600 bg-primary-50'
                    : 'border-surface-300 text-surface-400 bg-white'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div>
                <h4
                  className={`text-sm font-semibold ${
                    isError
                      ? 'text-rose-700'
                      : isDone
                      ? 'text-surface-900'
                      : 'text-surface-400'
                  }`}
                >
                  {step.title}
                </h4>
                {step.time && (
                  <span className="text-xs text-surface-400 block mt-0.5">
                    {formatDateTime(step.time)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
