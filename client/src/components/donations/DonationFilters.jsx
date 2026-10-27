import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { CATEGORIES } from '../../utils/constants';

export default function DonationFilters({ filters, onFilterChange, onReset }) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value, page: 1 });
  };

  const handleCategoryClick = (categoryVal) => {
    const newCategory = filters.category === categoryVal ? '' : categoryVal;
    onFilterChange({ ...filters, category: newCategory, page: 1 });
  };

  const hasActiveFilters = Boolean(
    filters.search || filters.category || filters.city || (filters.status && filters.status !== 'available')
  );

  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-5 shadow-sm space-y-4 mb-6">
      {/* Top Search Row */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            name="search"
            value={filters.search || ''}
            onChange={handleInputChange}
            placeholder="Search by meal name, ingredients, or notes..."
            className="form-input pl-10"
          />
        </div>

        <div className="w-full md:w-56">
          <input
            type="text"
            name="city"
            value={filters.city || ''}
            onChange={handleInputChange}
            placeholder="Filter by city..."
            className="form-input"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="btn-secondary text-xs flex items-center justify-center gap-1.5 whitespace-nowrap text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            <X className="w-4 h-4" /> Reset Filters
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-surface-400 block mb-2">
          Categories
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleCategoryClick('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              !filters.category
                ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                : 'bg-surface-50 text-surface-600 border-surface-200 hover:bg-surface-100'
            }`}
          >
            All Items
          </button>
          {CATEGORIES.map((cat) => {
            const active = filters.category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleCategoryClick(cat.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                    : 'bg-surface-50 text-surface-600 border-surface-200 hover:bg-surface-100'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
