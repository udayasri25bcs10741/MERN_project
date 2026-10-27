import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-700 to-primary-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-surface-900">
            Food<span className="text-primary-600">Bridge</span>
          </span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card border border-surface-200 rounded-3xl">
          <Outlet />
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-surface-400">
        <Link to="/" className="hover:text-primary-600 transition-colors">
          ← Back to FoodBridge Home
        </Link>
      </div>
    </div>
  );
}
