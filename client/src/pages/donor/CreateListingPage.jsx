import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingApi } from '../../api/listingApi';
import ImageUploader from '../../components/forms/ImageUploader';
import { CATEGORIES, UNITS } from '../../utils/constants';
import { PlusCircle, Clock, MapPin, AlertCircle, ArrowRight, Info, Crosshair, Search, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Backend-accepted categories (must match server/src/models/FoodListing.js CATEGORIES)
const VALID_CATEGORIES = [
  'cooked_meals','packaged_food','bakery','dairy_bakery',
  'fruits_vegetables','dry_groceries','grains_staples','beverages','other',
];

// Backend-accepted units (must match server/src/models/FoodListing.js UNITS)
const VALID_UNITS = [
  'meals','servings','kilograms','kg','grams','liters','packages','packets','boxes','items',
];

// Filter constants to only include values accepted by the backend
const FILTERED_CATEGORIES = CATEGORIES.filter((c) => VALID_CATEGORIES.includes(c.value));
const FILTERED_UNITS = UNITS.filter((u) => VALID_UNITS.includes(u.value));

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [geocoding, setGeocoding] = useState(false);

  // Auto-detect current GPS location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setGeocoding(true);
    toast.loading('Detecting your GPS location...', { id: 'geo-detect' });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setForm((prev) => ({
          ...prev,
          locationLat: lat,
          locationLng: lng,
        }));

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
          );
          const data = await res.json();
          if (data && data.display_name) {
            setForm((prev) => ({
              ...prev,
              pickupAddress: data.display_name,
            }));
            toast.success('Location & address detected successfully!', { id: 'geo-detect' });
          } else {
            toast.success(`Coordinates detected: ${lat}, ${lng}`, { id: 'geo-detect' });
          }
        } catch {
          toast.success(`Coordinates captured: ${lat}, ${lng}`, { id: 'geo-detect' });
        } finally {
          setGeocoding(false);
        }
      },
      () => {
        setGeocoding(false);
        toast.error('Unable to retrieve location. Please check browser permissions.', { id: 'geo-detect' });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Lookup coordinates from typed address
  const handleLookupCoordinates = async () => {
    if (!form.pickupAddress || form.pickupAddress.trim().length < 3) {
      toast.error('Please enter a pickup address first.');
      return;
    }
    setGeocoding(true);
    toast.loading('Finding coordinates from address...', { id: 'geo-lookup' });
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.pickupAddress)}&limit=1`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat).toFixed(6);
        const lng = parseFloat(data[0].lon).toFixed(6);
        setForm((prev) => ({
          ...prev,
          locationLat: lat,
          locationLng: lng,
        }));
        toast.success(`Coordinates found: ${lat}, ${lng}! Added to map view.`, { id: 'geo-lookup' });
      } else {
        toast.error('Could not find coordinates for this address. You can enter them manually.', { id: 'geo-lookup' });
      }
    } catch {
      toast.error('Geocoding service unavailable.', { id: 'geo-lookup' });
    } finally {
      setGeocoding(false);
    }
  };

  // Get a datetime-local string 1 hour from now (for availableFrom default)
  const nowPlusOneHour = () => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  };

  // Get a datetime-local string 24 hours from now (for collectionDeadline default)
  const nowPlusOneDay = () => {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  };

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'cooked_meals',
    quantity: 10,
    unit: 'servings',
    availableFrom: nowPlusOneHour(),
    collectionDeadline: nowPlusOneDay(),
    storageCondition: '',
    allergenInformation: '',
    allergenStatus: 'unknown',
    pickupAddress: '',
    locationLat: '',
    locationLng: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation matching backend rules
    if (!form.collectionDeadline) {
      toast.error('Please specify a collection deadline.');
      return;
    }

    if (new Date(form.collectionDeadline) <= new Date()) {
      toast.error('Collection deadline must be in the future.');
      return;
    }

    if (new Date(form.collectionDeadline) <= new Date(form.availableFrom)) {
      toast.error('Collection deadline must be after the availability time.');
      return;
    }

    if (!form.pickupAddress.trim()) {
      toast.error('Please provide a pickup address.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Use FormData to support optional image upload
      const data = new FormData();
      // Required fields — names match backend createListingSchema exactly
      data.append('title', form.title.trim());
      data.append('description', form.description.trim());
      data.append('category', form.category);
      data.append('quantity', form.quantity);
      data.append('unit', form.unit);
      data.append('availableFrom', new Date(form.availableFrom).toISOString());
      data.append('collectionDeadline', new Date(form.collectionDeadline).toISOString());
      data.append('pickupAddress', form.pickupAddress.trim());

      // Optional safety fields
      if (form.storageCondition.trim()) {
        data.append('storageCondition', form.storageCondition.trim());
      }
      if (form.allergenInformation.trim()) {
        data.append('allergenInformation', form.allergenInformation.trim());
      }
      data.append('allergenStatus', form.allergenStatus);

      // Optional coordinates
      if (form.locationLat && form.locationLng) {
        data.append('locationLat', parseFloat(form.locationLat));
        data.append('locationLng', parseFloat(form.locationLng));
      }

      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await listingApi.createListing(data);
      toast.success('Food listing published successfully!');
      navigate(`/donations/${res.data?.listing?._id || ''}`);
    } catch (err) {
      console.error(err);
      // Show specific validation errors if available
      const errData = err.response?.data;
      if (errData?.errors?.length) {
        errData.errors.forEach((e) => toast.error(`${e.field}: ${e.message}`));
      } else {
        toast.error(errData?.message || 'Failed to publish listing.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-surface-900 tracking-tight">
          Post Surplus Food
        </h1>
        <p className="text-xs text-surface-500 mt-1">
          Share surplus meals or fresh produce before they expire. Verified local shelters will be notified.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-200 shadow-sm space-y-6">
        {/* Basic Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400">
            1. Surplus Overview
          </h3>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1">
              Food Item Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              name="title"
              minLength={5}
              maxLength={100}
              value={form.title}
              onChange={handleChange}
              placeholder="E.g., 25 Portions of Fresh Pasta Primavera"
              className="form-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              name="description"
              minLength={10}
              maxLength={1000}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe preparation time, packaging state, key ingredients..."
              className="form-input text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="form-input text-xs"
              >
                {FILTERED_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                required
                min={0.1}
                step={0.1}
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                className="form-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1">
                Unit
              </label>
              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="form-input text-xs"
              >
                {FILTERED_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Availability & Deadline */}
        <div className="space-y-4 pt-4 border-t border-surface-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400">
            2. Availability Window
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1">
                Available From <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                name="availableFrom"
                value={form.availableFrom}
                onChange={handleChange}
                className="form-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1">
                Collection Deadline <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                name="collectionDeadline"
                value={form.collectionDeadline}
                onChange={handleChange}
                className="form-input text-xs"
              />
              <p className="text-xs text-surface-400 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Must be after the availability time and in the future.
              </p>
            </div>
          </div>
        </div>

        {/* Food Safety */}
        <div className="space-y-4 pt-4 border-t border-surface-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400">
            3. Food Safety Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1">
                Storage Condition
              </label>
              <input
                type="text"
                name="storageCondition"
                maxLength={500}
                value={form.storageCondition}
                onChange={handleChange}
                placeholder="E.g., Refrigerate below 4°C, consume within 4 hours"
                className="form-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1">
                Allergen Status
              </label>
              <select
                name="allergenStatus"
                value={form.allergenStatus}
                onChange={handleChange}
                className="form-input text-xs"
              >
                <option value="unknown">Unknown / Not Assessed</option>
                <option value="allergen_free">Allergen Free</option>
                <option value="contains_allergens">Contains Allergens</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1">
              Allergen Information
            </label>
            <input
              type="text"
              name="allergenInformation"
              maxLength={500}
              value={form.allergenInformation}
              onChange={handleChange}
              placeholder="E.g., Contains gluten, dairy, peanuts. May contain traces of tree nuts."
              className="form-input text-xs"
            />
            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Always disclose allergens accurately. Incomplete information can endanger lives.
            </p>
          </div>
        </div>

        {/* Pickup Location */}
        <div className="space-y-4 pt-4 border-t border-surface-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-surface-400">
              4. Pickup Location
            </h3>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={geocoding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>{geocoding ? 'Detecting...' : '📍 Use My Current Location'}</span>
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700">
                Full Pickup Address <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleLookupCoordinates}
                disabled={geocoding}
                className="text-[11px] font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 hover:underline"
              >
                <Search className="w-3 h-3" />
                Find Coordinates on Map
              </button>
            </div>
            <input
              type="text"
              required
              name="pickupAddress"
              minLength={5}
              maxLength={500}
              value={form.pickupAddress}
              onChange={handleChange}
              placeholder="E.g., 742 Evergreen Terrace, Kitchen Loading Bay, Springfield, OR 97477"
              className="form-input text-xs"
            />
            <p className="text-xs text-surface-400 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Exact address is only shared with confirmed recipients. Public view shows a general area.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1">
                Latitude (optional)
              </label>
              <input
                type="number"
                step="any"
                name="locationLat"
                value={form.locationLat}
                onChange={handleChange}
                placeholder="E.g., 12.9716"
                className="form-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1">
                Longitude (optional)
              </label>
              <input
                type="number"
                step="any"
                name="locationLng"
                value={form.locationLng}
                onChange={handleChange}
                placeholder="E.g., 77.5946"
                className="form-input text-xs"
              />
            </div>
          </div>

          {form.locationLat && form.locationLng && (
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                GPS Coordinates Ready: {form.locationLat}, {form.locationLng}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                Will appear on Live Map
              </span>
            </div>
          )}
        </div>

        {/* Food Image */}
        <div className="pt-4 border-t border-surface-100">
          <ImageUploader onFileSelect={(file) => setImageFile(file)} />
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-surface-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/donor/dashboard')}
            disabled={isSubmitting}
            className="btn-secondary text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2 shadow-md"
          >
            <span>{isSubmitting ? 'Publishing...' : 'Publish Surplus Food'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
