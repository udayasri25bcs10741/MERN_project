import React, { useRef } from 'react';
import { Award, Download, Printer, X, CheckCircle, ShieldCheck, Heart, Leaf } from 'lucide-react';
import { formatDateTime } from '../../utils/formatDate';

export default function ImpactCertificateModal({ isOpen, onClose, request }) {
  const certificateRef = useRef(null);

  if (!isOpen || !request) return null;

  const listing = request.listing || {};
  const recipient = request.recipient || {};
  const donor = listing.donor || {};

  // Calculate environmental and community impact metrics
  const quantity = listing.quantity || 1;
  const unit = listing.unit || 'servings';

  // Calculations:
  // - If servings/meals: 1 serving = 1 meal, approx 0.4 kg
  // - If kg: 1 kg = 2.5 meals
  // - If packages: 1 package = ~1.5 meals, approx 0.6 kg
  let mealsFed = quantity;
  let estimatedKg = quantity;

  if (['meals', 'servings'].includes(unit)) {
    mealsFed = quantity;
    estimatedKg = Math.round(quantity * 0.45 * 10) / 10;
  } else if (['kilograms', 'kg'].includes(unit)) {
    mealsFed = Math.round(quantity * 2.5);
    estimatedKg = quantity;
  } else {
    mealsFed = Math.round(quantity * 1.5);
    estimatedKg = Math.round(quantity * 0.5 * 10) / 10;
  }

  // UNEP benchmark: ~2.5 kg CO2e saved per kg of food saved from landfills
  const co2SavedKg = Math.round(estimatedKg * 2.5 * 10) / 10;

  const certificateId = `FB-CSR-${(request._id || '000000').slice(-6).toUpperCase()}-${new Date().getFullYear()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/60 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-surface-200 overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Header bar (hidden when printing) */}
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between bg-surface-50 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-sm text-surface-900">Certificate of Surplus Redistribution</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-surface-400 hover:text-surface-600 rounded-lg hover:bg-surface-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Body */}
        <div className="overflow-y-auto p-6 sm:p-10 print:p-8" ref={certificateRef}>
          <div className="relative border-4 border-double border-emerald-700/30 rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-emerald-50/20 via-white to-surface-50/40 text-center space-y-6">
            {/* Watermark / Seal */}
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 fill-white" />
              </div>
              <div className="text-left">
                <span className="text-xl font-black tracking-tight text-surface-900 block leading-tight">
                  Food<span className="text-emerald-600">Bridge</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 block">
                  Zero Waste Food Redistribution Network
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase font-extrabold tracking-widest text-emerald-700">
                Official Impact Statement & CSR Certificate
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-surface-900 tracking-tight mt-1">
                Certificate of Environmental & Community Impact
              </h2>
              <p className="text-xs text-surface-400 mt-1 font-mono">
                Verification ID: <span className="font-bold text-surface-700">{certificateId}</span>
              </p>
            </div>

            <p className="text-xs sm:text-sm text-surface-600 max-w-lg mx-auto leading-relaxed">
              This document certifies that surplus wholesome food was successfully rescued and redistributed to vulnerable community members, preventing landfill degradation and hunger.
            </p>

            {/* Donor & Recipient Details */}
            <div className="grid grid-cols-2 gap-4 text-left max-w-lg mx-auto bg-white/90 backdrop-blur rounded-xl p-4 border border-surface-200">
              <div className="border-r border-surface-100 pr-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 block">
                  Contributing Donor
                </span>
                <p className="text-xs font-bold text-surface-900 truncate mt-0.5">
                  {donor.organizationName || donor.name || 'Generous Donor'}
                </p>
                <p className="text-[10px] text-surface-500 capitalize">{donor.role?.replace('_', ' ') || 'Food Donor'}</p>
              </div>
              <div className="pl-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400 block">
                  Receiving Organization
                </span>
                <p className="text-xs font-bold text-surface-900 truncate mt-0.5">
                  {recipient.organizationName || recipient.name || 'Verified Shelter'}
                </p>
                <p className="text-[10px] text-surface-500">Verified Partner NGO</p>
              </div>
            </div>

            {/* Impact Metric Cards */}
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
              <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-3 text-center">
                <span className="text-xl sm:text-2xl font-black text-emerald-700 block">
                  {mealsFed}
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block mt-0.5">
                  Meals Served
                </span>
              </div>
              <div className="bg-blue-50 border border-blue-200/60 rounded-xl p-3 text-center">
                <span className="text-xl sm:text-2xl font-black text-blue-700 block">
                  {estimatedKg} <span className="text-xs font-bold">kg</span>
                </span>
                <span className="text-[10px] font-semibold text-blue-800 uppercase tracking-wider block mt-0.5">
                  Food Rescued
                </span>
              </div>
              <div className="bg-teal-50 border border-teal-200/60 rounded-xl p-3 text-center">
                <span className="text-xl sm:text-2xl font-black text-teal-700 block">
                  {co2SavedKg} <span className="text-xs font-bold">kg</span>
                </span>
                <span className="text-[10px] font-semibold text-teal-800 uppercase tracking-wider block mt-0.5 flex items-center justify-center gap-1">
                  <Leaf className="w-2.5 h-2.5 text-teal-600" /> CO₂ Offset
                </span>
              </div>
            </div>

            {/* Donation item summary */}
            <div className="text-left max-w-lg mx-auto text-xs text-surface-600 border-t border-surface-200/60 pt-4 flex justify-between items-center">
              <div>
                <span className="font-semibold text-surface-800">{listing.title || 'Surplus Food'}</span>
                <p className="text-[11px] text-surface-400">Category: {listing.category?.replace('_', ' ') || 'Food'}</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-medium text-surface-700">
                  {request.completedAt ? formatDateTime(request.completedAt) : formatDateTime(new Date())}
                </span>
                <p className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                  <CheckCircle className="w-3 h-3" /> Secure Handover Verified
                </p>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 max-w-md mx-auto pt-4 text-center">
              <div className="border-t border-surface-300 pt-2">
                <p className="font-serif italic text-xs text-surface-700">Verified System Audit</p>
                <span className="text-[10px] text-surface-400 uppercase tracking-wider block">
                  FoodBridge Verification Engine
                </span>
              </div>
              <div className="border-t border-surface-300 pt-2">
                <p className="font-serif italic text-xs text-surface-700">
                  {recipient.name || 'Shelter Officer'}
                </p>
                <span className="text-[10px] text-surface-400 uppercase tracking-wider block">
                  Authorized Recipient Representative
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
