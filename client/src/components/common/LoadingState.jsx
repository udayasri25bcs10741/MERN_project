import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading...', size = 'default' }) {
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.default} animate-spin text-primary-600 mb-3`} />
      <p className="text-sm font-medium text-surface-600">{message}</p>
    </div>
  );
}
