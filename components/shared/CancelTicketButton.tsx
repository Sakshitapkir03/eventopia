'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { refundOrder } from '@/lib/actions/order.actions'
import { XCircle, Loader2 } from 'lucide-react'

type Props = {
  orderId: string
  clerkId: string
}

export default function CancelTicketButton({ orderId, clerkId }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleCancel = async () => {
    setLoading(true)
    setError('')
    try {
      await refundOrder(orderId, clerkId)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Refund failed. Please try again.')
      setLoading(false)
      setConfirming(false)
    }
  }

  if (!confirming) {
    return (
      <Button
        variant="outline"
        className="rounded-full text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 gap-2"
        onClick={() => setConfirming(true)}
      >
        <XCircle className="w-4 h-4" />
        Cancel Ticket
      </Button>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <p className="text-sm text-gray-600 text-center">
        Are you sure? This will cancel your ticket and issue a refund.
      </p>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => setConfirming(false)}
          disabled={loading}
        >
          Keep Ticket
        </Button>
        <Button
          className="rounded-full bg-red-500 hover:bg-red-600 gap-2"
          onClick={handleCancel}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
          Yes, Cancel
        </Button>
      </div>
    </div>
  )
}
