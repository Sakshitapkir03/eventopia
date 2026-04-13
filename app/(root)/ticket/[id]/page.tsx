export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { connectToDatabase } from '@/lib/database'
import Order from '@/lib/database/models/order.model'
import Event from '@/lib/database/models/event.model'
import User from '@/lib/database/models/user.model'
import { formatDateTime } from '@/lib/utils'
import { notFound } from 'next/navigation'
import QRTicket from '@/components/shared/QRTicket'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, User as UserIcon, Ticket, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import CancelTicketButton from '@/components/shared/CancelTicketButton'
import CheckInButton from '@/components/shared/CheckInButton'
import AddToCalendar from '@/components/shared/AddToCalendar'

type TicketPageProps = {
  params: Promise<{ id: string }>
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { id } = await params
  const { sessionClaims } = await auth()
  const clerkId = sessionClaims?.sub as string | undefined

  await connectToDatabase()

  const order = await Order.findById(id)
    .populate({ path: 'event', model: Event })
    .populate({ path: 'buyer', model: User, select: 'firstName lastName email username clerkId' })

  if (!order) notFound()

  const event = order.event
  const buyer = order.buyer
  const ticketUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/ticket/${id}`
  const isOwner = clerkId === buyer.clerkId
  const organizerUser = clerkId ? await User.findOne({ clerkId }) : null
  const isOrganizer = organizerUser && event.organizer.toString() === organizerUser._id.toString()

  const canRefund =
    isOwner &&
    order.status === 'active' &&
    new Date(event.startDateTime) > new Date()

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    refunded: 'bg-red-100 text-red-600',
    checked_in: 'bg-blue-100 text-blue-700',
  }
  const statusLabels: Record<string, string> = {
    active: '✓ Booking Confirmed',
    refunded: '✕ Refunded',
    checked_in: '✓ Checked In',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-indigo-50 py-12">
      <div className="wrapper max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-4 ${statusColors[order.status] || statusColors.active}`}>
            {order.status === 'checked_in' && <CheckCircle2 className="w-4 h-4" />}
            {statusLabels[order.status] || statusLabels.active}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Your Ticket</h1>
          <p className="text-gray-500 mt-1">Show the QR code at the event entrance</p>
        </div>

        {/* Ticket Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

          {event.imageUrl && (
            <div className="relative h-48 overflow-hidden">
              <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-6">
                <Badge variant={event.isFree ? 'green' : 'default'} className="text-sm px-3 py-1">
                  {event.isFree ? 'FREE' : `$${order.totalAmount}`}
                </Badge>
              </div>
            </div>
          )}

          <div className="flex items-center px-6 py-3 bg-primary-50/50">
            <div className="flex-1 border-t-2 border-dashed border-primary-200" />
            <div className="mx-3">
              <Ticket className="w-5 h-5 text-primary-400" />
            </div>
            <div className="flex-1 border-t-2 border-dashed border-primary-200" />
          </div>

          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{event.title}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-primary-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Date & Time</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{formatDateTime(event.startDateTime).dateTime}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-primary-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Location</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{event.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex-center flex-shrink-0">
                  <UserIcon className="w-4 h-4 text-primary-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Ticket Holder</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    {buyer.firstName} {buyer.lastName || buyer.username}
                  </p>
                  <p className="text-xs text-gray-500">{buyer.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex-center flex-shrink-0">
                  <Ticket className="w-4 h-4 text-primary-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Order ID</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5 font-mono">{id.slice(-12)}</p>
                </div>
              </div>
            </div>

            {order.status !== 'refunded' && (
              <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-2xl">
                <QRTicket value={ticketUrl} />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">Scan to verify ticket</p>
                  <p className="text-xs text-gray-400 font-mono mt-1">{id}</p>
                </div>
              </div>
            )}

            {order.status === 'refunded' && (
              <div className="p-4 bg-red-50 rounded-xl text-center text-red-600 font-medium text-sm">
                This ticket has been cancelled and refunded.
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 justify-center flex-wrap">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/profile">My Tickets</Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link href="/">Explore More Events</Link>
          </Button>
          {order.status !== 'refunded' && (
            <AddToCalendar
              title={event.title}
              description={event.description || ''}
              location={event.location || ''}
              startDateTime={event.startDateTime}
              endDateTime={event.endDateTime}
            />
          )}
          {canRefund && clerkId && (
            <CancelTicketButton orderId={id} clerkId={clerkId} />
          )}
        </div>

      </div>
    </div>
  )
}
