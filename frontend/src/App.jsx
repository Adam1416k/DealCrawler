// src/App.jsx

import { useState, useEffect, useMemo } from 'react';
import FilterBar from './components/FilterBar';
import DealCard from './components/DealCard';

export default function App() {
  const [deals, setDeals] = useState([]);
  const [postal, setPostal] = useState('');
  const [filters, setFilters] = useState({
    service:     [],    // ['foodora','wolt','uber_eats']
    cuisine:     [],    // e.g. ['Burgers','Sushi']
    dealCategory: [],   // ['Percentage off','Fixed-amount off','Other']
    rating:      null   // 1–4
  });
  const [sortBy, setSortBy] = useState('');      // '', 'fastest', 'rating'
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch('/all_deals.json')
      .then(res => res.json())
      .then(data => setDeals(data));
  }, []);

  // ── categorize raw deal_type into buckets ─────────
  function categorizeDealType(text) {
    if (!text) return 'Other';
    const t = text.toLowerCase();
    if (t.includes('%'))         return 'Percentage off';
    if (t.match(/\d+\s?kr/))     return 'Fixed-amount off';
    return 'Other';
  }

  // static order of buckets we want to expose
  const allBuckets = ['Percentage off','Fixed-amount off','Other'];

  // derive unique filter options
  const services = ['foodora','wolt','uber_eats'];
  const cuisines = useMemo(
    () => Array.from(new Set(deals.map(d => d.cuisine).filter(Boolean))),
    [deals]
  );
  const dealCategories = useMemo(() => {
    const seen = new Set();
    deals.forEach(d => seen.add(categorizeDealType(d.deal_type)));
    // only expose the three buckets we care about, in desired order
    return allBuckets.filter(cat => seen.has(cat));
  }, [deals]);

  // ── apply filters ─────────
  const filtered = deals
    .filter(d => !postal || d.area_id === postal)
    .filter(d => !filters.service.length   || filters.service.includes(d.service))
    .filter(d => !filters.cuisine.length   || filters.cuisine.includes(d.cuisine))
    .filter(d => !filters.dealCategory.length
      || filters.dealCategory.includes(categorizeDealType(d.deal_type))
    )
    .filter(d => {
      if (filters.rating == null) return true;
      const r = parseFloat(d.rating);
      return !isNaN(r) && r >= filters.rating;
    });

  // helper to parse delivery time
  const parseDelivery = d => {
    const m = d.delivery_time && d.delivery_time.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : Infinity;
  };

  // ── sort ─────────
  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortBy === 'fastest') {
      arr.sort((a, b) => parseDelivery(a) - parseDelivery(b));
    } else if (sortBy === 'rating') {
      arr.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
    }
    return arr;
  }, [filtered, sortBy]);

  return (
    <div className="mx-auto px-4 py-6 max-w-screen-md">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">DealCrawler</h1>

      {/* Postal code input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter postal code"
          value={postal}
          onChange={e => setPostal(e.target.value)}
          className="border p-2 text-sm rounded w-full sm:w-1/3"
        />
      </div>

      {/* Filters toggle + Sort dropdown */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        <button
          type="button"
          onClick={() => setShowFilters(f => !f)}
          className="filter-toggle"
        >
          {showFilters ? 'Hide' : 'Filters'}
        </button>
        <div className="flex items-center">
          <label className="filter-label mr-2">Sort by:</label>
          <select
            className="filter-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="">None</option>
            <option value="fastest">Fastest Delivery</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>
      </div>

      {/* Collapsible FilterBar */}
      {showFilters && (
        <div className="mb-6">
          <FilterBar
            services={services}
            cuisines={cuisines}
            dealCategories={dealCategories}
            filters={filters}
            setFilters={setFilters}
          />
        </div>
      )}

      {/* Deals grid */}
      <div className="deal-grid">
        {sorted.map(deal => (
          <DealCard key={deal.link} deal={deal} />
        ))}
      </div>
    </div>
  );
}
