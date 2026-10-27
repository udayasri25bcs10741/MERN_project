import React from 'react';
import { Heart, ShieldCheck, Mail, Phone, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface-900 text-surface-300 pt-16 pb-12 border-t border-surface-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-surface-800">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-black text-white">
                Food<span className="text-primary-400">Bridge</span>
              </span>
            </div>
            <p className="text-xs text-surface-400 leading-relaxed">
              Bridging the gap between food surplus and community need. Fast, accountable, code-verified donation logistics.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified NGO & Volunteer Network</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-surface-400">
              <li>
                <Link to="/donations" className="hover:text-primary-400 transition-colors">
                  Browse Surplus Food
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary-400 transition-colors">
                  Join as an NGO / Shelter
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary-400 transition-colors">
                  Donate as a Business
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary-400 transition-colors">
                  Volunteer Courier
                </Link>
              </li>
            </ul>
          </div>

          {/* Standards */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Food Safety & Trust
            </h4>
            <ul className="space-y-2.5 text-xs text-surface-400">
              <li>Temperature-controlled guidelines</li>
              <li>Perishable expiration tracking</li>
              <li>Atomic reservation locking</li>
              <li>One-time secure pickup codes</li>
              <li>Full audit & moderation logging</li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Final Year Project Info
            </h4>
            <p className="text-xs text-surface-400 mb-3 leading-relaxed">
              Built with MERN Stack + Leaflet + Tailwind CSS + MongoDB Transactions.
            </p>
            <div className="space-y-2 text-xs text-surface-400">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary-400" />
                <span>support@foodbridge.local</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary-400" />
                <span>+91 98765 43210</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-surface-500 gap-4">
          <p>© {new Date().getFullYear()} FoodBridge Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Clean Architecture • Role-based Security • Zero-waste Mission</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
