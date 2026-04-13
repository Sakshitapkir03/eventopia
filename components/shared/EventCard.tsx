import { auth } from '@clerk/nextjs/server'
import Image from 'next/image'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'
import { Event } from '@/types'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, Lock } from 'lucide-react'
import DeleteConfirmation from './DeleteConfirmation'
import DuplicateEventButton from './DuplicateEventButton'

type Props = {
  event: Event
  hasOrderLink?: boolean
  hidePrice?: boolean
}

export default async function EventCard({ event, hasOrderLink, hidePrice }: Props) {
  const { sessionClaims } = await auth()
  const userId = sessionClaims?.sub as string

  const isEventCreator = userId === event.organizer.clerkId
  const isSoldOut = !!(event.capacity && event.ticketsSold !== undefined && event.ticketsSold >= event.capacity)

  return (
    <div className="group relative flex min-h-[380px] w-full max-w-[400px] flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 event-card">
      <Link
        href={`/events/${event._id}`}
        style={{ backgroundImage: `url(${event.imageUrl})` }}
        className="flex-center flex-grow bg-gray-50 bg-cover bg-center text-grey-500 min-h-[220px] w-full relative"
      >
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="bg-red-500 text-white font-bold text-sm px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      {isEventCreator && !hidePrice && (
        <div className="absolute right-3 top-3 flex flex-col gap-2 rounded-xl bg-white/90 backdrop-blur-sm p-2 shadow-lg transition-all">
          <Link href={`/events/${event._id}/update`}>
            <button className="w-7 h-7 flex-center hover:text-primary-400 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </Link>
          <DuplicateEventButton eventId={event._id} userId={userId} />
          <DeleteConfirmation eventId={event._id} userId={userId} />
        </div>
      )}

      <div className="flex flex-col gap-3 p-5 md:gap-4">
        {!hidePrice && (
          <div className="flex gap-2 flex-wrap">
            <Badge variant={event.isFree ? 'green' : 'default'}>
              {event.isFree ? 'FREE' : `$${event.price}`}
            </Badge>
            <Badge variant="secondary">{event.category.name}</Badge>
            {isSoldOut && <Badge variant="destructive">SOLD OUT</Badge>}
            {event.isPrivate && (
              <Badge variant="outline" className="gap-1 text-gray-500">
                <Lock className="w-2.5 h-2.5" /> Private
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
          <Calendar className="w-3.5 h-3.5 text-primary-400" />
          <p>{formatDateTime(event.startDateTime).dateTime}</p>
        </div>

        <Link href={`/events/${event._id}`}>
          <p className="p-medium-16 md:p-medium-20 line-clamp-2 text-gray-900 group-hover:text-primary-400 transition-colors font-semibold">
            {event.title}
          </p>
        </Link>

        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
          <MapPin className="w-3.5 h-3.5 text-primary-400" />
          <p className="line-clamp-1">{event.location}</p>
        </div>

        <div className="flex-between w-full">
          {hasOrderLink && (
            <Link href={`/orders?eventId=${event._id}`} className="flex gap-2 items-center text-primary-400 text-sm font-medium hover:underline">
              Order Details
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

      </div>
    </div>
  )
}
