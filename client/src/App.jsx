// client/src/App.jsx
import FilterBar from './components/FilterBar'
import DealList from './components/DealList'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <FilterBar />
      <DealList />
    </div>
  )
}
