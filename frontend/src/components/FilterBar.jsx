import React from 'react';

export default function FilterBar({
  services,
  cuisines,
  dealCategories,
  filters,
  setFilters,
  translations
}) {
  const t = translations;

  const handleCheckbox = (field, value, checked) => {
    setFilters(prev => {
      const list = prev[field];
      return {
        ...prev,
        [field]: checked
          ? [...list, value]
          : list.filter(x => x !== value)
      };
    });
  };

  return (
    <div className="filter-bar">
      {/* Vendor */}
      <div className="filter-group">
        <label className="filter-label">{t.vendorLabel}</label>
        <div className="filter-options">
          {services.map(svc => (
            <label key={svc} className="filter-option">
              <input
                type="checkbox"
                value={svc}
                checked={filters.service.includes(svc)}
                onChange={e => handleCheckbox('service', svc, e.target.checked)}
              />
              <span className="capitalize">{svc.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Cuisine */}
      <div className="filter-group">
        <label className="filter-label">{t.cuisineLabel}</label>
        <div className="filter-options">
          {cuisines.map(cui => (
            <label key={cui} className="filter-option">
              <input
                type="checkbox"
                value={cui}
                checked={filters.cuisine.includes(cui)}
                onChange={e => handleCheckbox('cuisine', cui, e.target.checked)}
              />
              <span>{cui}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Deal Type */}
      <div className="filter-group">
        <label className="filter-label">{t.dealTypeLabel}</label>
        <div className="filter-options">
          {dealCategories.map(cat => (
            <label key={cat} className="filter-option">
              <input
                type="checkbox"
                value={cat}
                checked={filters.dealCategory.includes(cat)}
                onChange={e =>
                  handleCheckbox('dealCategory', cat, e.target.checked)
                }
              />
              <span>{t.dealTypeOptions[cat] || cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Min Rating */}
      <div className="filter-group">
        <label className="filter-label">{t.minRatingLabel}</label>
        <select
          className="filter-select"
          value={filters.rating || ''}
          onChange={e =>
            setFilters(prev => ({
              ...prev,
              rating: e.target.value ? parseFloat(e.target.value) : null
            }))
          }
        >
          <option value="">{t.anyOption}</option>
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
