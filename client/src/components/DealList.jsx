// client/src/components/DealList.jsx
import DealCard from './DealCard'

export default function DealList({ deals }) {
  return (
    <div className="p-4 grid grid-cols-2 gap-10">
      {deals.map((deal) => (
        <DealCard key={`${deal.service}-${deal.area_id}-${deal.name}`} deal={deal} />
      ))}
    </div>
  )
}
