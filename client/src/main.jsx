import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// React Query provider
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './queryClient'

// Your new FilterProvider
import { FilterProvider } from './context/FilterContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <FilterProvider>
        <App />
      </FilterProvider>
    </QueryClientProvider>
  </StrictMode>
)
