export default function FilterBar({ filters, setFilters }) {
  const services = ['foodora', 'wolt', 'uber_eats'];
  return (
    <div className="flex flex-wrap gap-4">
      <div>
        <label className="block text-sm font-medium">Service:</label>
        {services.map(s => (
          <label key={s} className="inline-flex items-center mr-2">
            <input
              type="checkbox"
              value={s}
              checked={filters.service.includes(s)}
              onChange={e => {
                const val = e.target.value;
                setFilters(fs => ({
                  ...fs,
                  service: fs.service.includes(val)
                    ? fs.service.filter(x => x !== val)
                    : [...fs.service, val]
                }));
              }}
            />
            <span className="ml-1 capitalize">{s.replace('_', ' ')}</span>
          </label>
        ))}
      </div>
      <div>
        <label className="block text-sm font-medium">Min Rating:</label>
        <select
          value={filters.rating || ''}
          onChange={e => setFilters(fs => ({...fs, rating: e.target.value ? parseFloat(e.target.value) : null}))}
          className="border rounded p-1"
        >
          <option value="">Any</option>
          {[5,4,3,2,1].map(r => <option key={r} value={r}>{r}+</option>)}
        </select>
      </div>
    </div>
  );
}