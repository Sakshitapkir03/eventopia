'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { checkInOrder } from '@/lib/actions/order.actions'
import { CheckCircle2, Loader2 } from 'lucide-react'

type Props = {
  orderId: string
  organizerClerkId: string
  currentStatus: string
}

export default function CheckInButton({ orderId, organizerClerkId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (status === 'refunded') return null

  if (status === 'checked_in') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
        <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
      </span>
    )
  }

  const handleCheckIn = async () => {
    setLoading(true)
    setError('')
    try {
      await checkInOrder(orderId, organizerClerkId)
      setStatus('checked_in')
    } catch (err: any) {
      setError(err.message || 'Check-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        variant="outline"
        className="rounded-full text-xs gap-1.5 border-blue-200 text-blue-600 hover:bg-blue-50"
        onClick={handleCheckIn}
        disabled={loading}
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
        Check In
      </Button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
