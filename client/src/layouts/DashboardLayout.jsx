import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Inbox,
  Truck,
  ShieldCheck,
  Users,
  FileText,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { ROLE_LABELS } from '../utils/constants';

export default function DashboardLayout() {
  const { user, isDonor, isNGO, isVolunteer, isAdmin } = useAuth();

  const getNavLinks = () => {
    if (isDonor) {
      return [
        { to: '/donor/dashboard', label: 'Overview', icon: LayoutDashboard },
        { to: '/donor/listings', label: 'My Listings', icon: Package },
        { to: '/donor/listings/new', label: 'Post Surplus', icon: PlusCircle },
        { to: '/donor/requests', label: 'Incoming Requests', icon: Inbox },
      ];
    }
    if (isNGO) {
      return [
        { to: '/ngo/dashboard', label: 'Overview', icon: LayoutDashboard },
        { to: '/donations', label: 'Discover Food', icon: Search },
        { to: '/ngo/requests', label: 'Claimed Requests', icon: Package },
      ];
    }
    if (isVolunteer) {
      return [
        { to: '/volunteer/dashboard', label: 'Overview', icon: LayoutDashboard },
        { to: '/volunteer/pickups', label: 'Assigned Pickups', icon: Truck },
      ];
    }
    if (isAdmin) {
      return [
        { to: '/admin/dashboard', label: 'Analytics', icon: LayoutDashboard },
        { to: '/admin/verifications', label: 'Verifications', icon: ShieldCheck },
        { to: '/admin/listings', label: 'Listings Moderation', icon: Package },
        { to: '/admin/users', label: 'User Directory', icon: Users },
        { to: '/admin/audit-logs', label: 'Audit Trail', icon: FileText },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen flex flex-col bg-surface-50 text-surface-900 font-sans">
      <Navbar />

      {/* Verification notice banner if NGO/Volunteer is not approved */}
      {user && (user.role === 'ngo' || user.role === 'volunteer') && user.verificationStatus !== 'approved' && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-800 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Account Verification Pending:</strong> Some actions (like claiming food or completing runs) require approval from the platform administrator.
          </span>
        </div>
      )}

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Sidebar */}
          <aside className="lg:col-span-1 bg-white rounded-2xl border border-surface-200 p-4 shadow-sm">
            <div className="px-3 py-2 mb-3 border-b border-surface-100">
              <p className="text-xs font-bold text-surface-900">{user?.name}</p>
              <p className="text-[11px] text-primary-600 font-medium capitalize">
                {ROLE_LABELS[user?.role] || user?.role}
              </p>
            </div>

            <nav className="space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to.endsWith('/dashboard')}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'text-surface-600 hover:text-surface-900 hover:bg-surface-50'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </aside>

          {/* Main Outlet Area */}
          <section className="lg:col-span-4 min-w-0">
            <Outlet />
          </section>
        </div>
      </div>
    </div>
  );
}
