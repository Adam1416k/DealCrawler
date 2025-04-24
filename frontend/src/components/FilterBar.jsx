// src/components/FilterBar.jsx

import React from 'react';

export default function FilterBar({
  services,
  cuisines,
  dealCategories,
  filters,
  setFilters
}) {
  return (
    <div className="filter-bar">
      {/* Vendor filter */}
      <div className="filter-group">
        <label className="filter-label">Delivery Service:</label>
        <div className="filter-options">
          {services.map(svc => (
            <label key={svc} className="filter-option">
              <input
                type="checkbox"
                value={svc}
                checked={filters.service.includes(svc)}
                onChange={e => {
                  const val = e.target.value;
                  setFilters(f => ({
                    ...f,
                    service: f.service.includes(val)
                      ? f.service.filter(x => x !== val)
                      : [...f.service, val]
                  }));
                }}
              />
              <span className="capitalize">{svc.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Cuisine filter */}
      <div className="filter-group">
        <label className="filter-label">Cuisine:</label>
        <div className="filter-options">
          {cuisines.map(cui => (
            <label key={cui} className="filter-option">
              <input
                type="checkbox"
                value={cui}
                checked={filters.cuisine.includes(cui)}
                onChange={e => {
                  const val = e.target.value;
                  setFilters(f => ({
                    ...f,
                    cuisine: f.cuisine.includes(val)
                      ? f.cuisine.filter(x => x !== val)
                      : [...f.cuisine, val]
                  }));
                }}
              />
              <span>{cui}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Deal Type (smart buckets) filter */}
      <div className="filter-group">
        <label className="filter-label">Deal Type:</label>
        <div className="filter-options">
          {dealCategories.map(cat => (
            <label key={cat} className="filter-option">
              <input
                type="checkbox"
                value={cat}
                checked={filters.dealCategory.includes(cat)}
                onChange={e => {
                  const val = e.target.value;
                  setFilters(f => ({
                    ...f,
                    dealCategory: f.dealCategory.includes(val)
                      ? f.dealCategory.filter(x => x !== val)
                      : [...f.dealCategory, val]
                  }));
                }}
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating filter */}
      <div className="filter-group">
        <label className="filter-label">Rating:</label>
        <select
          className="filter-select"
          value={filters.rating || ''}
          onChange={e =>
            setFilters(f => ({
              ...f,
              rating: e.target.value ? parseFloat(e.target.value) : null
            }))
          }
        >
          <option value="">Any</option>
          {[4, 3, 2, 1].map(r => (
            <option key={r} value={r}>
              {r}+
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
