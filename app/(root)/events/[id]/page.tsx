export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import Image from 'next/image'
import { auth } from '@clerk/nextjs/server'
import { getEventById, getRelatedEventsByCategory } from '@/lib/actions/event.actions'
import { formatDateTime } from '@/lib/utils'
import CheckoutButton from '@/components/shared/CheckoutButton'
import Collection from '@/components/shared/Collection'
import ReviewSection from '@/components/shared/ReviewSection'
import BookmarkButton from '@/components/shared/BookmarkButton'
import EventCountdown from '@/components/shared/EventCountdown'
import ReportButton from '@/components/shared/ReportButton'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, User, Link as LinkIcon, ExternalLink, Users, Lock, ListOrdered, ShieldCheck } from 'lucide-react'
import { connectToDatabase } from '@/lib/database'
import Order from '@/lib/database/models/order.model'
import { getWaitlistStatus } from '@/lib/actions/waitlist.actions'
import { getReviewsByEvent, getUserReviewForEvent, hasUserAttendedEvent } from '@/lib/actions/review.actions'
import { getIsEventSaved } from '@/lib/actions/user.actions'
import { hasUserReported } from '@/lib/actions/report.actions'

type EventDetailsProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: EventDetailsProps): Promise<Metadata> {
  const { id } = await params
  try {
    const event = await getEventById(id)
    return {
      title: `${event.title} | Eventopia`,
      description: event.description?.slice(0, 160) || 'Join this event on Eventopia',
      openGraph: {
        title: event.title,
        description: event.description?.slice(0, 160) || 'Join this event on Eventopia',
        images: [{ url: event.imageUrl, width: 1200, height: 630, alt: event.title }],
        type: 'website',
        url: `${process.env.NEXT_PUBLIC_SERVER_URL}/events/${id}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: event.title,
        description: event.description?.slice(0, 160) || 'Join this event on Eventopia',
        images: [event.imageUrl],
      },
    }
  } catch {
    return { title: 'Event | Eventopia' }
  }
}

export default async function EventDetails({ params, searchParams }: EventDetailsProps) {
  const { id } = await params
  const resolvedSearchParams = await searchParams
  const { sessionClaims } = await auth()
  const userId = sessionClaims?.sub as string | undefined

  const event = await getEventById(id)

  await connectToDatabase()
  let ticketsSold = 0
  if (event?.capacity) {
    ticketsSold = await Order.countDocuments({ event: id, status: { $ne: 'refunded' } })
  }

  const isSoldOut = event.capacity != null && ticketsSold >= event.capacity
  const eventEnded = new Date(event.endDateTime) < new Date()
  const isOrganizer = userId && event.organizer?.clerkId === userId

  // Parallel data fetching
  const [relatedEvents, waitlistStatus, reviews, userReview, hasAttended, isSaved, userReported] = await Promise.all([
    getRelatedEventsByCategory({
      categoryId: event.category._id,
      eventId: event._id,
      page: resolvedSearchParams.page as string,
    }),
    isSoldOut && userId && !isOrganizer
      ? getWaitlistStatus(id, userId)
      : Promise.resolve({ isOnWaitlist: false, position: 0, total: 0 }),
    getReviewsByEvent(id),
    userId ? getUserReviewForEvent(id, userId) : Promise.resolve(null),
    userId ? hasUserAttendedEvent(id, userId) : Promise.resolve(false),
    userId ? getIsEventSaved(userId, id) : Promise.resolve(false),
    userId && !isOrganizer ? hasUserReported(id, userId) : Promise.resolve(false),
  ])

  return (
    <>
      <section className="flex justify-center bg-primary-50/30 bg-dotted-pattern bg-contain py-0">
        <div className="grid grid-cols-1 md:grid-cols-2 max-w-7xl w-full">
          <div className="relative min-h-[350px] md:min-h-[500px]">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:hidden" />
            {isSoldOut && (
              <div className="absolute top-4 left-4">
                <span className="bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-full uppercase tracking-widest shadow">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6 p-6 md:p-10 bg-white">
            <div className="flex gap-2 flex-wrap items-start justify-between">
              <div className="flex gap-2 flex-wrap">
                <Badge variant={event.isFree ? 'green' : 'default'} className="text-sm px-3 py-1">
                  {event.isFree ? 'FREE' : `$${event.price}`}
                </Badge>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {event.category.name}
                </Badge>
              </div>
              {userId && !isOrganizer && (
                <BookmarkButton eventId={event._id} userId={userId} initialSaved={isSaved} />
              )}
            </div>

            <h2 className="h2-bold text-gray-900">{event.title}</h2>

            {/* Countdown — only for upcoming events */}
            {!eventEnded && !isOrganizer && (
              <EventCountdown startDateTime={event.startDateTime} />
            )}

            {/* Private event invite link (organizer only) */}
            {isOrganizer && event.isPrivate && event.inviteCode && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm">
                <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-amber-700 font-medium text-xs uppercase tracking-wide mb-0.5">Private Event — Invite Link</p>
                  <p className="text-amber-800 font-mono text-xs truncate">
                    {process.env.NEXT_PUBLIC_SERVER_URL}/events/{event._id}?invite={event.inviteCode}
                  </p>
                </div>
              </div>
            )}

            {event.capacity && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-primary-400" />
                <span className="text-gray-600">
                  {isSoldOut
                    ? <span className="text-red-500 font-semibold">Sold out</span>
                    : <><span className="font-semibold text-gray-900">{event.capacity - ticketsSold}</span> tickets left</>
                  }
                </span>
              </div>
            )}

            <CheckoutButton
              event={event}
              userId={userId}
              ticketsSold={ticketsSold}
              waitlistStatus={waitlistStatus as any}
            />

            <div className="flex flex-col gap-4 border-t pt-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Date & Time</p>
                  <p className="text-gray-700 font-medium">
                    {formatDateTime(event.startDateTime).dateTime}
                  </p>
                  <p className="text-gray-500 text-sm">
                    to {formatDateTime(event.endDateTime).dateTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Location</p>
                  <p className="text-gray-700 font-medium">{event.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex-center flex-shrink-0 mt-0.5">
                  <User className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Organizer</p>
                  <p className="text-gray-700 font-medium">
                    {event.organizer.firstName} {event.organizer.lastName}
                  </p>
                </div>
              </div>

              {event.url && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex-center flex-shrink-0 mt-0.5">
                    <LinkIcon className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Website</p>
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 font-medium hover:underline flex items-center gap-1 text-sm"
                    >
                      Visit website
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">About this event</h3>
              <p className="p-regular-16 lg:p-regular-18 text-gray-600 leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Agenda */}
            {event.agenda && event.agenda.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <ListOrdered className="w-4 h-4 text-primary-400" />
                  <h3 className="font-semibold text-gray-900">Event Agenda</h3>
                </div>
                <div className="flex flex-col gap-2">
                  {event.agenda.map((item: any, i: number) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="text-xs font-bold text-primary-400 bg-primary-50 rounded-lg px-2 py-1 min-w-[60px] text-center flex-shrink-0 mt-0.5">
                        {item.time}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                        {item.speaker && <p className="text-xs text-gray-500">{item.speaker}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Refund Policy */}
            {event.refundPolicy && (
              <div className="flex items-start gap-2 border-t pt-4">
                <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Refund Policy</p>
                  <p className="text-sm text-gray-700">{event.refundPolicy}</p>
                </div>
              </div>
            )}

            {/* Report link */}
            {userId && !isOrganizer && (
              <div className="flex justify-end pt-2">
                <ReportButton eventId={event._id} userId={userId} initialReported={userReported} />
              </div>
            )}

            {/* Reviews */}
            <ReviewSection
              eventId={event._id}
              userId={userId || null}
              reviews={reviews || []}
              hasAttended={hasAttended}
              existingReview={userReview}
              eventEnded={eventEnded}
            />
          </div>
        </div>
      </section>

      <section className="wrapper my-8 flex flex-col gap-8 md:gap-12">
        <h2 className="h2-bold text-gray-900">
          Related <span className="text-primary-400">Events</span>
        </h2>

        <Collection
          data={relatedEvents?.data || []}
          emptyTitle="No Related Events Found"
          emptyStateSubtext="Come back later"
          collectionType="All_Events"
          limit={3}
          page={resolvedSearchParams.page as string}
          totalPages={relatedEvents?.totalPages}
        />
      </section>
    </>
  )
}
