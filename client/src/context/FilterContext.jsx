// client/src/context/FilterContext.jsx
import { createContext, useState } from 'react'

export const FilterContext = createContext()

export function FilterProvider({ children }) {
  // default to showing all three services
  const [filters, setFilters] = useState({
    services: ['foodora','uber_eats','wolt']
  })

  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  )
}
