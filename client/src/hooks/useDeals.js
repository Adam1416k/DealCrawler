import { useQuery } from '@tanstack/react-query'

export function useDeals() {
  return useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const res = await fetch('/all_deals.json')
      if (!res.ok) throw new Error('Failed to fetch deals')
      return res.json()
    },
    placeholderData: [],
  })
}
