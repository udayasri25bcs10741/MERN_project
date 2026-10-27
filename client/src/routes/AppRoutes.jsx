import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts (eagerly loaded for shell layout stability)
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import LoadingState from '../components/common/LoadingState';

// Public Pages (lazy-loaded)
const HomePage = lazy(() => import('../pages/public/HomePage'));
const BrowseDonationsPage = lazy(() => import('../pages/public/BrowseDonationsPage'));
const DonationDetailPage = lazy(() => import('../pages/public/DonationDetailPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));

// Donor Pages (lazy-loaded)
const DonorDashboardPage = lazy(() => import('../pages/donor/DonorDashboardPage'));
const MyListingsPage = lazy(() => import('../pages/donor/MyListingsPage'));
const CreateListingPage = lazy(() => import('../pages/donor/CreateListingPage'));
const EditListingPage = lazy(() => import('../pages/donor/EditListingPage'));
const IncomingRequestsPage = lazy(() => import('../pages/donor/IncomingRequestsPage'));

// NGO Pages (lazy-loaded)
const NGODashboardPage = lazy(() => import('../pages/ngo/NGODashboardPage'));
const MyRequestsPage = lazy(() => import('../pages/ngo/MyRequestsPage'));
const PickupDetailPage = lazy(() => import('../pages/ngo/PickupDetailPage'));

// Volunteer Pages (lazy-loaded)
const VolunteerDashboardPage = lazy(() => import('../pages/volunteer/VolunteerDashboardPage'));
const AssignedPickupsPage = lazy(() => import('../pages/volunteer/AssignedPickupsPage'));

// Admin Pages (lazy-loaded)
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const VerificationManagementPage = lazy(() => import('../pages/admin/VerificationManagementPage'));
const ListingModerationPage = lazy(() => import('../pages/admin/ListingModerationPage'));
const UserManagementPage = lazy(() => import('../pages/admin/UserManagementPage'));
const AuditLogsPage = lazy(() => import('../pages/admin/AuditLogsPage'));

// System Pages (lazy-loaded)
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage'));

const PageFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <LoadingState message="Loading page..." size="large" />
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
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
    </Suspense>
  );
}
