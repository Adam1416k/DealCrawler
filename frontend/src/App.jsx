import { useState, useEffect } from 'react';
import DealCard from './components/DealCard';
import FilterBar from './components/FilterBar';

export default function App() {
  const [deals, setDeals] = useState([]);
  const [postal, setPostal] = useState('');
  const [filters, setFilters] = useState({ service: [], rating: null });

  useEffect(() => {
    fetch('/all_deals.json')
      .then(res => res.json())
      .then(data => setDeals(data));
  }, []);

  const filtered = deals
    .filter(d => (!postal || d.area_id === postal))
    .filter(d => (filters.service.length === 0 || filters.service.includes(d.service)))
    .filter(d => (filters.rating === null || parseFloat(d.rating) >= filters.rating));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">DealCrawler</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter postal code"
          value={postal}
          onChange={e => setPostal(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        />
      </div>
      <FilterBar filters={filters} setFilters={setFilters} />
      <div className="grid grid-cols-2 gap-4 mt-4">
        {filtered.map(deal => (
          <DealCard key={deal.link} deal={deal} />
        ))}
      </div>
    </div>
  );
}