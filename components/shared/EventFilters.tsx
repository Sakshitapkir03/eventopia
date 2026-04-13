'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { formUrlQuery, removeKeysFromQuery } from '@/lib/utils'
import { Calendar, DollarSign } from 'lucide-react'

const DATE_OPTIONS = [
  { label: 'Any Date', value: '' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
]

const PRICE_OPTIONS = [
  { label: 'Any Price', value: '' },
  { label: 'Free', value: 'free' },
  { label: 'Paid', value: 'paid' },
]

export default function EventFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentDate = searchParams.get('date') || ''
  const currentPrice = searchParams.get('price') || ''

  const setFilter = (key: string, value: string) => {
    let newUrl = ''
    if (value) {
      newUrl = formUrlQuery({ params: searchParams.toString(), key, value })
    } else {
      newUrl = removeKeysFromQuery({ params: searchParams.toString(), keysToRemove: [key] })
    }
    router.push(newUrl, { scroll: false })
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Date filter */}
      <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
        <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <select
          value={currentDate}
          onChange={(e) => setFilter('date', e.target.value)}
          className="bg-transparent text-sm text-gray-700 outline-none cursor-pointer pr-1"
        >
          {DATE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Price filter */}
      <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
        <DollarSign className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <select
          value={currentPrice}
          onChange={(e) => setFilter('price', e.target.value)}
          className="bg-transparent text-sm text-gray-700 outline-none cursor-pointer pr-1"
        >
          {PRICE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
