import React from 'react';
import { Link } from 'react-router-dom';
import { HeartCrack, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
        <HeartCrack className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-surface-900 tracking-tight">404</h1>
      <h2 className="text-lg font-bold text-surface-800 mt-1">Page Not Found</h2>
      <p className="text-xs text-surface-500 max-w-sm mt-2 mb-6">
        The food listing, profile, or coordination page you were looking for doesn't exist or has moved.
      </p>
      <Link to="/" className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to FoodBridge Home</span>
      </Link>
    </div>
  );
}
