'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { joinWaitlist, leaveWaitlist } from '@/lib/actions/waitlist.actions'
import { Bell, BellOff, Loader2 } from 'lucide-react'

type Props = {
  eventId: string
  userId: string
  initialStatus: { isOnWaitlist: boolean; position: number; total: number }
}

export default function WaitlistButton({ eventId, userId, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    try {
      if (status.isOnWaitlist) {
        await leaveWaitlist(eventId, userId)
        setStatus({ isOnWaitlist: false, position: 0, total: status.total - 1 })
      } else {
        await joinWaitlist(eventId, userId)
        setStatus({ isOnWaitlist: true, position: status.total + 1, total: status.total + 1 })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        size="lg"
        variant={status.isOnWaitlist ? 'outline' : 'default'}
        className="rounded-full gap-2"
        onClick={toggle}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : status.isOnWaitlist ? (
          <BellOff className="w-4 h-4" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
        {status.isOnWaitlist ? 'Leave Waitlist' : 'Join Waitlist'}
      </Button>

      {status.isOnWaitlist && (
        <p className="text-xs text-center text-gray-500">
          You're <span className="font-semibold text-primary-500">#{status.position}</span> on the waitlist
          {status.total > 1 && ` of ${status.total}`}.
          We'll email you if a spot opens up.
        </p>
      )}

      {!status.isOnWaitlist && status.total > 0 && (
        <p className="text-xs text-center text-gray-400">
          {status.total} {status.total === 1 ? 'person' : 'people'} on the waitlist
        </p>
      )}
    </div>
  )
}
