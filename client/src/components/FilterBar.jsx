// client/src/components/FilterBar.jsx
import { useContext } from 'react'
import { FilterContext } from '../context/FilterContext'

export default function FilterBar() {
  const { filters, setFilters } = useContext(FilterContext)

  const toggleService = (service) => {
    setFilters(f => ({
      ...f,
      services: f.services.includes(service)
        ? f.services.filter(s => s !== service)
        : [...f.services, service]
    }))
  }

  return (
    <div className="flex space-x-2 p-4 bg-white sticky top-0 z-10 shadow">
      {['foodora','uber_eats','wolt'].map(svc => (
        <button
          key={svc}
          className={`px-3 py-1 rounded-full border 
            ${filters.services.includes(svc)
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700'}`}
          onClick={() => toggleService(svc)}
        >
          {svc.replace('_',' ').toUpperCase()}
        </button>
      ))}
    </div>
  )
}
