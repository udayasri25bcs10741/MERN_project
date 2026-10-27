import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-black text-surface-900 tracking-tight">Access Restricted</h1>
      <p className="text-xs text-surface-500 max-w-sm mt-2 mb-6">
        You do not have permission to view this section. This page is reserved for authorized platform roles.
      </p>
      <Link to="/" className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Safe Ground</span>
      </Link>
    </div>
  );
}
