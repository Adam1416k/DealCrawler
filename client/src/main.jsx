// src/main.jsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// 1) Import React Query
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './queryClient'

// 2) Import your FilterContext
import { FilterProvider } from './context/FilterContext'

// 3) Your App & global CSS
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Wrap the entire app in React Query’s provider */}
    <QueryClientProvider client={queryClient}>
      {/* Then wrap it in your FilterContext provider */}
      <FilterProvider>
        <App />
      </FilterProvider>
    </QueryClientProvider>
  </StrictMode>
)
