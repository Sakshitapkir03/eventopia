'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Loader2 } from 'lucide-react'
import { duplicateEvent } from '@/lib/actions/event.actions'

type Props = { eventId: string; userId: string }

export default function DuplicateEventButton({ eventId, userId }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    try {
      const copy = await duplicateEvent(eventId, userId)
      if (copy?._id) router.push(`/events/${copy._id}/update`)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={loading}
      title="Duplicate event"
      className="w-7 h-7 flex-center hover:text-primary-400 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
    </button>
  )
}
