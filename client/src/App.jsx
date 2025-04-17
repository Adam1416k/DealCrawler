import { useDeals } from './hooks/useDeals'
import DealList from './components/DealList'
import FilterBar from './components/FilterBar'

export default function App() {
  const { data: deals, isLoading, error } = useDeals()

  if (isLoading) return <p className="p-4 text-center">Loading deals…</p>
  if (error)     return <p className="p-4 text-center text-red-500">Error: {error.message}</p>

  return (
    <div className="min-h-screen bg-gray-50">
      <FilterBar />
      <DealList deals={deals} />
    </div>
  )
}
