import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Phone, Building, ArrowRight, ShieldCheck } from 'lucide-react';
import { ROLES, ROLE_LABELS } from '../../utils/constants';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: ROLES.ORGANIZATION_DONOR,
    organizationName: '',
    registrationNumber: '',
    address: {
      address: '',
      city: '',
      state: '',
      postalCode: '',
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['address', 'city', 'state', 'postalCode'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formattedAddress =
        typeof formData.address === 'object'
          ? [formData.address.address, formData.address.city, formData.address.state, formData.address.postalCode]
              .filter(Boolean)
              .join(', ')
          : formData.address;

      const payload = {
        ...formData,
        address: formattedAddress,
      };

      const user = await register(payload);
      if (user.role === 'ngo') navigate('/ngo/dashboard');
      else if (user.role === 'volunteer') navigate('/volunteer/dashboard');
      else navigate('/donor/dashboard');
    } catch (err) {
      // handled by AuthContext toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOrgOrNgo =
    formData.role === ROLES.ORGANIZATION_DONOR || formData.role === ROLES.NGO;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-surface-900 tracking-tight">
          Join the FoodBridge Network
        </h2>
        <p className="text-xs text-surface-500 mt-1">
          Select your role to help eliminate food waste in your community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-2">
            Select Your Role
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { role: ROLES.ORGANIZATION_DONOR, label: 'Restaurant / Business' },
              { role: ROLES.NGO, label: 'NGO / Shelter' },
              { role: ROLES.HOUSEHOLD_DONOR, label: 'Household Donor' },
              { role: ROLES.VOLUNTEER, label: 'Volunteer Courier' },
            ].map((item) => (
              <button
                type="button"
                key={item.role}
                onClick={() => setFormData((prev) => ({ ...prev, role: item.role }))}
                className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition-all ${
                  formData.role === item.role
                    ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                    : 'bg-surface-50 text-surface-700 border-surface-200 hover:bg-surface-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Sarah Connor"
                className="form-input pl-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="tel"
                required
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 555-0199"
                className="form-input pl-9 text-xs"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="email"
              required
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="sarah@example.com"
              className="form-input pl-9 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1">
            Password (min 8 chars)
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="password"
              required
              minLength={8}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="form-input pl-9 text-xs"
            />
          </div>
        </div>

        {/* Organization / NGO fields */}
        {isOrgOrNgo && (
          <div className="p-3 bg-surface-50 rounded-2xl border border-surface-200 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-surface-800">
              <Building className="w-4 h-4 text-primary-600" />
              <span>Organization Verification Details</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-surface-700 mb-1">
                Organization / Restaurant Legal Name
              </label>
              <input
                type="text"
                required
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                placeholder="Hope Haven Food Bank Inc."
                className="form-input text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-surface-700 mb-1">
                Tax ID / Charity Registration Number
              </label>
              <input
                type="text"
                required
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                placeholder="REG-882931-B"
                className="form-input text-xs"
              />
            </div>
          </div>
        )}

        {/* Address Fields */}
        <div className="space-y-2 pt-2 border-t border-surface-100">
          <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700">
            Primary Location / City
          </label>
          <input
            type="text"
            required
            name="address"
            value={formData.address.address}
            onChange={handleChange}
            placeholder="Street address (e.g., 100 Main Street)"
            className="form-input text-xs"
          />

          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              required
              name="city"
              value={formData.address.city}
              onChange={handleChange}
              placeholder="City"
              className="form-input text-xs"
            />
            <input
              type="text"
              required
              name="state"
              value={formData.address.state}
              onChange={handleChange}
              placeholder="State"
              className="form-input text-xs"
            />
            <input
              type="text"
              required
              name="postalCode"
              value={formData.address.postalCode}
              onChange={handleChange}
              placeholder="Postal Code"
              className="form-input text-xs"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary text-sm py-3 flex items-center justify-center gap-2 shadow-md mt-4"
        >
          <span>{isSubmitting ? 'Creating account...' : 'Complete Registration'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-xs text-surface-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
