// client/src/components/DealList.jsx
import DealCard from './DealCard'
import { useDeals } from '../hooks/useDeals'
import { useContext } from 'react'
import { FilterContext } from '../context/FilterContext'

export default function DealList() {
  const { data: deals, isLoading } = useDeals()
  const { filters } = useContext(FilterContext)

  if (isLoading) return <p className="p-4">Loading…</p>

  const filtered = deals.filter(d =>
    filters.services.includes(d.service)
  )

  return (
    <div className="p-4 grid gap-4 sm:grid-cols-2">
      {filtered.map(deal => (
        <DealCard key={`${deal.service}-${deal.area_id}-${deal.name}`} deal={deal} />
      ))}
    </div>
  )
}
