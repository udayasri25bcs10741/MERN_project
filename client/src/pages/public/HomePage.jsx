import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ShieldCheck,
  Truck,
  ArrowRight,
  Clock,
  Sparkles,
  Users,
  CheckCircle2,
  Building2,
  UtensilsCrossed,
} from 'lucide-react';

export default function HomePage() {
  const steps = [
    {
      step: '01',
      title: 'Post Surplus Food',
      desc: 'Restaurants, event caterers, and households post surplus food before it expires, detailing quantity, allergens, and pickup window.',
      icon: UtensilsCrossed,
    },
    {
      step: '02',
      title: 'Claimed by Verified NGOs',
      desc: 'Approved NGOs receive real-time notifications, request meals, and trigger atomic reservation to eliminate double-booking.',
      icon: Building2,
    },
    {
      step: '03',
      title: 'Code-Verified Handover',
      desc: 'A volunteer courier or NGO representative presents a cryptographic one-time pickup code to complete the chain of custody.',
      icon: ShieldCheck,
    },
  ];

  const impactMetrics = [
    { label: 'Meals Rescued', value: '45,200+' },
    { label: 'CO2 Emissions Prevented', value: '18.4 Tons' },
    { label: 'Verified NGO Partners', value: '120+' },
    { label: 'Volunteer Runs Completed', value: '3,800+' },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/60 via-surface-50 to-surface-50 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100/80 text-primary-800 text-xs font-semibold border border-primary-200 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary-600" />
              <span>Zero Food Waste • Maximum Social Impact</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-surface-900 tracking-tight leading-[1.15]">
              Turning Surplus Food into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-500">
                Community Nourishment
              </span>
            </h1>

            <p className="text-base sm:text-lg text-surface-600 leading-relaxed max-w-2xl mx-auto">
              FoodBridge connects restaurants, caterers, and households with verified local shelters and food banks in real time with automated deadline tracking and code-verified handovers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/donations"
                className="w-full sm:w-auto btn-primary text-sm py-3.5 px-8 flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20"
              >
                <span>Browse Available Food</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto btn-secondary text-sm py-3.5 px-8 flex items-center justify-center gap-2"
              >
                <span>Join as Donor / NGO</span>
              </Link>
            </div>

            {/* Quick trust strip */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-surface-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary-600" />
                Atomic Reservation Locking
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary-600" />
                One-Time Cryptographic Handover
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary-600" />
                Strict Non-profit Verification
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-surface-800">
            {impactMetrics.map((item, idx) => (
              <div key={idx} className="pt-4 md:pt-0">
                <p className="text-3xl sm:text-4xl font-extrabold text-primary-400">
                  {item.value}
                </p>
                <p className="text-xs sm:text-sm text-surface-400 mt-1 font-medium">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            End-to-End Workflow
          </span>
          <h2 className="text-3xl font-extrabold text-surface-900 mt-2">
            How FoodBridge Works
          </h2>
          <p className="text-sm text-surface-600 mt-3">
            Designed for high-speed, verifiable coordination between food donors and community organizations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 border border-surface-200 shadow-sm hover:shadow-card-hover transition-all duration-300 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-surface-200">{s.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-surface-900 mb-2">{s.title}</h3>
                  <p className="text-xs text-surface-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Platform Roles CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary-800 to-primary-950 rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black">
              Ready to eliminate surplus food waste in your city?
            </h2>
            <p className="text-xs sm:text-sm text-primary-100/90 leading-relaxed">
              Whether you are a restaurant owner with 50 unused meals, an NGO operating an emergency shelter, or an individual ready to run delivery missions, FoodBridge brings us all together.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="btn-primary bg-white text-primary-900 hover:bg-primary-50 text-xs font-bold py-3 px-6 shadow-md"
              >
                Register Your Account
              </Link>
              <Link
                to="/donations"
                className="btn-secondary bg-primary-900/60 border-primary-700 text-white hover:bg-primary-900 text-xs font-bold py-3 px-6"
              >
                Explore Active Listings
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
