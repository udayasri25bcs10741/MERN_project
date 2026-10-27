import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import { Heart, Menu, X, PlusCircle, LogOut, LayoutDashboard, UserCheck, ChevronDown } from 'lucide-react';
import { ROLE_LABELS } from '../../utils/constants';

export default function Navbar() {
  const { user, isAuthenticated, logout, isDonor, isNGO, isVolunteer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isNGO) return '/ngo/dashboard';
    if (isVolunteer) return '/volunteer/dashboard';
    if (isDonor) return '/donor/dashboard';
    return '/';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-surface-200 shadow-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-700 to-primary-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-surface-900 group-hover:text-primary-600 transition-colors">
                  Food<span className="text-primary-600">Bridge</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-surface-400 -mt-1">
                  Surplus Redistribution
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/donations"
                className={`nav-link text-sm ${
                  location.pathname === '/donations' ? 'nav-link-active' : ''
                }`}
              >
                Browse Food
              </Link>

              {isAuthenticated && (
                <Link
                  to={getDashboardPath()}
                  className={`nav-link text-sm flex items-center gap-1.5 ${
                    location.pathname.startsWith('/donor') ||
                    location.pathname.startsWith('/ngo') ||
                    location.pathname.startsWith('/volunteer') ||
                    location.pathname.startsWith('/admin')
                      ? 'nav-link-active'
                      : ''
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              )}

              {isAuthenticated && isDonor && (
                <Link
                  to="/donor/requests"
                  className={`nav-link text-sm ${
                    location.pathname === '/donor/requests' ? 'nav-link-active' : ''
                  }`}
                >
                  Incoming Requests
                </Link>
              )}

              {isAuthenticated && isNGO && (
                <Link
                  to="/ngo/requests"
                  className={`nav-link text-sm ${
                    location.pathname === '/ngo/requests' ? 'nav-link-active' : ''
                  }`}
                >
                  My Claims
                </Link>
              )}

              {isAuthenticated && isVolunteer && (
                <Link
                  to="/volunteer/pickups"
                  className={`nav-link text-sm ${
                    location.pathname === '/volunteer/pickups' ? 'nav-link-active' : ''
                  }`}
                >
                  Active Runs
                </Link>
              )}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {isDonor && (
                  <Link
                    to="/donor/listings/new"
                    className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Post Surplus</span>
                  </Link>
                )}

                <NotificationBell />

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-100 transition-colors border border-surface-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs uppercase">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="text-left hidden lg:block pr-1">
                      <p className="text-xs font-semibold text-surface-900 leading-none">{user?.name}</p>
                      <span className="text-[10px] text-surface-400 capitalize">
                        {ROLE_LABELS[user?.role] || user?.role}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-surface-400" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-surface-200 py-2 z-50 animate-fade-in"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-surface-100">
                        <p className="text-xs font-semibold text-surface-900">{user?.name}</p>
                        <p className="text-[11px] text-surface-400 truncate">{user?.email}</p>
                      </div>

                      <Link
                        to={getDashboardPath()}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-surface-700 hover:bg-surface-50"
                      >
                        <LayoutDashboard className="w-4 h-4 text-surface-400" />
                        <span>Go to Dashboard</span>
                      </Link>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 border-t border-surface-100 mt-1"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-xs py-2 px-4">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-xs py-2 px-4">
                  Join FoodBridge
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-surface-600 hover:bg-surface-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-fade-in">
          <Link
            to="/donations"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-surface-700 hover:text-primary-600"
          >
            Browse Food
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-surface-700 hover:text-primary-600"
              >
                Dashboard
              </Link>

              {isDonor && (
                <>
                  <Link
                    to="/donor/listings/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm font-medium text-primary-700 font-semibold"
                  >
                    + Post Surplus Food
                  </Link>
                  <Link
                    to="/donor/requests"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm font-medium text-surface-700 hover:text-primary-600"
                  >
                    Incoming Requests
                  </Link>
                </>
              )}

              {isNGO && (
                <Link
                  to="/ngo/requests"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-medium text-surface-700 hover:text-primary-600"
                >
                  My Claims
                </Link>
              )}

              {isVolunteer && (
                <Link
                  to="/volunteer/pickups"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-medium text-surface-700 hover:text-primary-600"
                >
                  Active Runs
                </Link>
              )}

              <div className="pt-3 border-t border-surface-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-surface-900">{user?.name}</p>
                  <p className="text-[11px] text-surface-400 capitalize">{ROLE_LABELS[user?.role]}</p>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="btn-secondary text-xs text-rose-600 py-1.5 px-3"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-surface-200 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-secondary text-center text-sm py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary text-center text-sm py-2"
              >
                Join FoodBridge
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
