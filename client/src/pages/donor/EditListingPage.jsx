import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingApi } from '../../api/listingApi';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { CATEGORIES, UNITS } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'cooked_meals',
    quantity: 1,
    unit: 'servings',
    expiryDate: '',
    instructions: '',
  });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const res = await listingApi.getListingById(id);
        const item = res.data?.listing;
        if (item) {
            const dl = item.collectionDeadline || item.expiryDate;
            setForm({
              title: item.title,
              description: item.description,
              category: item.category,
              quantity: item.quantity,
              unit: item.unit,
              expiryDate: dl ? new Date(dl).toISOString().slice(0, 16) : '',
              instructions: item.pickupLocation?.instructions || item.pickupAddress || '',
            });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load listing for editing.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await listingApi.updateListing(id, {
        title: form.title,
        description: form.description,
        category: form.category,
        quantity: Number(form.quantity),
        unit: form.unit,
        collectionDeadline: new Date(form.expiryDate).toISOString(),
        expiryDate: new Date(form.expiryDate).toISOString(),
        pickupAddress: form.instructions,
      });
      toast.success('Listing updated successfully!');
      navigate(`/donations/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading listing details..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-surface-900 tracking-tight">
          Edit Surplus Food Listing
        </h1>
        <p className="text-xs text-surface-500 mt-1">
          Update the listing details or adjust expiration windows.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1">
            Food Item Title
          </label>
          <input
            type="text"
            required
            name="title"
            value={form.title}
            onChange={handleChange}
            className="form-input text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            required
            name="description"
            value={form.description}
            onChange={handleChange}
            className="form-input text-xs"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
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
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
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
              min={1}
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
              {UNITS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1">
            Freshness Deadline
          </label>
          <input
            type="datetime-local"
            required
            name="expiryDate"
            value={form.expiryDate}
            onChange={handleChange}
            className="form-input text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1">
            Pickup Instructions
          </label>
          <input
            type="text"
            name="instructions"
            value={form.instructions}
            onChange={handleChange}
            className="form-input text-xs"
          />
        </div>

        <div className="pt-4 border-t border-surface-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/donor/listings')}
            disabled={isSubmitting}
            className="btn-secondary text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary text-xs py-2 px-6"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
