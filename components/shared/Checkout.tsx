'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { checkoutOrder } from '@/lib/actions/order.actions'

export default function Checkout({ event, userId }: { event: any; userId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const onCheckout = async () => {
    setIsLoading(true)
    setError('')
    try {
      await checkoutOrder({
        eventTitle: event.title,
        eventId: event._id,
        price: event.price,
        isFree: event.isFree,
        buyerId: userId,
      })
    } catch (err: any) {
      // Next.js redirect() throws a NEXT_REDIRECT error — re-throw it so the redirect works
      if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
      setError(err?.message || 'Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p className="text-red-500 text-sm font-medium">{error}</p>
      )}
      <Button size="lg" className="rounded-full" onClick={onCheckout} disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : event.isFree ? 'Get Free Ticket' : 'Buy Ticket'}
      </Button>
    </div>
  )
}
