import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import HomePage from '../pages/public/HomePage';
import BrowseDonationsPage from '../pages/public/BrowseDonationsPage';
import DonationDetailPage from '../pages/public/DonationDetailPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Donor Pages
import DonorDashboardPage from '../pages/donor/DonorDashboardPage';
import MyListingsPage from '../pages/donor/MyListingsPage';
import CreateListingPage from '../pages/donor/CreateListingPage';
import EditListingPage from '../pages/donor/EditListingPage';
import IncomingRequestsPage from '../pages/donor/IncomingRequestsPage';

// NGO Pages
import NGODashboardPage from '../pages/ngo/NGODashboardPage';
import MyRequestsPage from '../pages/ngo/MyRequestsPage';
import PickupDetailPage from '../pages/ngo/PickupDetailPage';

// Volunteer Pages
import VolunteerDashboardPage from '../pages/volunteer/VolunteerDashboardPage';
import AssignedPickupsPage from '../pages/volunteer/AssignedPickupsPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import VerificationManagementPage from '../pages/admin/VerificationManagementPage';
import ListingModerationPage from '../pages/admin/ListingModerationPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import AuditLogsPage from '../pages/admin/AuditLogsPage';

// System Pages
import NotFoundPage from '../pages/NotFoundPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/donations" element={<BrowseDonationsPage />} />
        <Route path="/donations/:id" element={<DonationDetailPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Auth Pages with AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Donor Protected Routes */}
      <Route
        path="/donor"
        element={
          <ProtectedRoute allowedRoles={['household_donor', 'organization_donor']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/donor/dashboard" replace />} />
        <Route path="dashboard" element={<DonorDashboardPage />} />
        <Route path="listings" element={<MyListingsPage />} />
        <Route path="listings/new" element={<CreateListingPage />} />
        <Route path="listings/:id/edit" element={<EditListingPage />} />
        <Route path="requests" element={<IncomingRequestsPage />} />
      </Route>

      {/* NGO Protected Routes */}
      <Route
        path="/ngo"
        element={
          <ProtectedRoute allowedRoles={['ngo']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/ngo/dashboard" replace />} />
        <Route path="dashboard" element={<NGODashboardPage />} />
        <Route path="requests" element={<MyRequestsPage />} />
        <Route path="requests/:id" element={<PickupDetailPage />} />
      </Route>

      {/* Volunteer Protected Routes */}
      <Route
        path="/volunteer"
        element={
          <ProtectedRoute allowedRoles={['volunteer']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/volunteer/dashboard" replace />} />
        <Route path="dashboard" element={<VolunteerDashboardPage />} />
        <Route path="pickups" element={<AssignedPickupsPage />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="verifications" element={<VerificationManagementPage />} />
        <Route path="listings" element={<ListingModerationPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
      </Route>
    </Routes>
  );
}
