import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Checkout from './Checkout'
import WaitlistButton from './WaitlistButton'

type Props = {
  event: any
  userId?: string
  ticketsSold?: number
  waitlistStatus?: { isOnWaitlist: boolean; position: number; total: number }
}

export default function CheckoutButton({ event, userId, ticketsSold, waitlistStatus }: Props) {
  const hasEventFinished = new Date(event.endDateTime) < new Date()
  const isOrganizer = !!userId && event.organizer?.clerkId === userId
  const isSoldOut = event.capacity != null &&
    ticketsSold !== undefined &&
    ticketsSold >= event.capacity

  if (hasEventFinished) {
    return (
      <p className="p-2 text-red-400 font-medium">
        Sorry, tickets are no longer available.
      </p>
    )
  }

  if (isOrganizer) {
    return (
      <div className="flex flex-col gap-3">
        <Button size="lg" asChild variant="outline" className="rounded-full">
          <Link href={`/events/${event._id}/update`}>Manage Event</Link>
        </Button>

        {event.capacity && ticketsSold !== undefined && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500 font-medium">Ticket Sales</span>
              <span className="text-sm font-bold text-gray-900">
                {ticketsSold} / {event.capacity}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${isSoldOut ? 'bg-red-500' : 'bg-primary-400'}`}
                style={{ width: `${Math.min((ticketsSold / event.capacity) * 100, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {isSoldOut
                ? 'All tickets have been sold'
                : `${event.capacity - ticketsSold} ticket${event.capacity - ticketsSold === 1 ? '' : 's'} remaining`}
            </p>
          </div>
        )}
      </div>
    )
  }

  if (!userId) {
    return (
      <Button size="lg" asChild className="rounded-full">
        <Link href="/sign-in">Get Tickets</Link>
      </Button>
    )
  }

  if (isSoldOut) {
    return (
      <WaitlistButton
        eventId={event._id}
        userId={userId}
        initialStatus={waitlistStatus || { isOnWaitlist: false, position: 0, total: 0 }}
      />
    )
  }

  return <Checkout event={event} userId={userId} />
}
