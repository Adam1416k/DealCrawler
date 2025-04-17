import { useQuery } from '@tanstack/react-query'

const fetchDeals = () =>
  fetch('/all_deals.json')
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok')
      return res.json()
    })

export function useDeals() {
  return useQuery({
    queryKey: ['deals'],    // formerly your first positional arg
    queryFn:  fetchDeals,   // formerly your second positional arg
    placeholderData: [],    // formerly in your options object
    refetchOnWindowFocus: false,
  })
}
