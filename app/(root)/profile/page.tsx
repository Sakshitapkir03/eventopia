export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { Button } from '@/components/ui/button'
import Collection from '@/components/shared/Collection'
import { getEventsByUser } from '@/lib/actions/event.actions'
import { getOrdersByUser } from '@/lib/actions/order.actions'
import { getSavedEvents, getOrganizerStats } from '@/lib/actions/user.actions'
import { CalendarPlus, Ticket, CheckCircle, BarChart2, DollarSign, Bookmark } from 'lucide-react'
import TicketList from '@/components/shared/TicketList'
import AuthRequired from '@/components/shared/AuthRequired'
import RevenueChart from '@/components/shared/RevenueChart'

type ProfilePageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const resolvedSearchParams = await searchParams
  const { sessionClaims } = await auth()
  const userId = sessionClaims?.sub as string | undefined

  if (!userId) {
    return (
      <div className="wrapper my-8">
        <AuthRequired message="Please sign in to view your tickets and events." />
      </div>
    )
  }

  const ordersPage = Number(resolvedSearchParams?.ordersPage) || 1
  const eventsPage = Number(resolvedSearchParams?.eventsPage) || 1
  const savedPage = Number(resolvedSearchParams?.savedPage) || 1
  const showSuccess = resolvedSearchParams?.success === '1'

  const [orders, organizedEvents, savedEvents, stats] = await Promise.all([
    getOrdersByUser({ userId, page: ordersPage }),
    getEventsByUser({ userId, page: eventsPage }),
    getSavedEvents(userId, savedPage),
    getOrganizerStats(userId),
  ])

  return (
    <>
      {showSuccess && (
        <div className="bg-green-50 border-b border-green-100 py-4">
          <div className="wrapper flex items-center gap-3 text-green-700">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">Payment successful! Your ticket has been confirmed and sent to your email.</p>
          </div>
        </div>
      )}

      {/* Organizer Stats — only if they've organized at least one event */}
      {stats.totalEvents > 0 && (
        <section className="wrapper my-6">
          <div className="bg-gradient-to-r from-primary-50 to-indigo-50 rounded-2xl p-6 border border-primary-100">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-5 h-5 text-primary-500" />
              <h3 className="font-bold text-gray-900">Organizer Overview</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <p className="text-2xl font-bold text-primary-500">{stats.totalEvents}</p>
                <p className="text-xs text-gray-500 mt-1">Events Created</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <p className="text-2xl font-bold text-primary-500">{stats.totalTicketsSold}</p>
                <p className="text-xs text-gray-500 mt-1">Tickets Sold</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <DollarSign className="w-4 h-4 text-green-500 mx-auto mb-0.5" />
                <p className="text-2xl font-bold text-green-600">${stats.totalRevenue}</p>
                <p className="text-xs text-gray-500 mt-1">Total Revenue</p>
              </div>
            </div>
          </div>
          {stats.chartData && stats.chartData.length > 0 && (
            <div className="mt-4">
              <RevenueChart data={stats.chartData} />
            </div>
          )}
        </section>
      )}

      {/* My Tickets */}
      <section className="bg-gradient-to-b from-primary-50/40 to-white py-10">
        <div className="wrapper flex items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex-center">
              <Ticket className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h3 className="font-bold text-2xl text-gray-900">My Tickets</h3>
              <p className="text-gray-500 text-sm">Events you've registered for</p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href="/#events">Explore Events</Link>
          </Button>
        </div>
      </section>

      <section className="wrapper my-8">
        {orders?.data && orders.data.length > 0 ? (
          <TicketList orders={orders.data} page={ordersPage} totalPages={orders.totalPages} />
        ) : (
          <div className="flex-center wrapper min-h-[200px] w-full flex-col gap-3 rounded-2xl bg-gray-50 py-28 text-center">
            <h3 className="font-bold text-xl">No tickets yet</h3>
            <p className="text-gray-500 text-sm">No worries — plenty of exciting events to explore!</p>
            <Button asChild className="rounded-full mt-2">
              <Link href="/#events">Browse Events</Link>
            </Button>
          </div>
        )}
      </section>

      {/* Saved Events */}
      <section className="bg-gradient-to-b from-primary-50/40 to-white py-10">
        <div className="wrapper flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex-center">
            <Bookmark className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="font-bold text-2xl text-gray-900">Saved Events</h3>
            <p className="text-gray-500 text-sm">Events you've bookmarked</p>
          </div>
        </div>
      </section>

      <section className="wrapper my-8">
        <Collection
          data={savedEvents?.data || []}
          emptyTitle="No saved events"
          emptyStateSubtext="Bookmark events you're interested in!"
          collectionType="All_Events"
          limit={6}
          page={savedPage}
          urlParamName="savedPage"
          totalPages={savedEvents?.totalPages}
        />
      </section>

      {/* Events Organized */}
      <section className="bg-gradient-to-b from-primary-50/40 to-white py-10">
        <div className="wrapper flex items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex-center">
              <CalendarPlus className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h3 className="font-bold text-2xl text-gray-900">Events Organized</h3>
              <p className="text-gray-500 text-sm">Events you've created and managed</p>
            </div>
          </div>
          <Button asChild size="sm" className="rounded-full">
            <Link href="/events/create">Create Event</Link>
          </Button>
        </div>
      </section>

      <section className="wrapper my-8">
        <Collection
          data={organizedEvents?.data || []}
          emptyTitle="No events created yet"
          emptyStateSubtext="Ready to make your first event? Let's go!"
          collectionType="Events_Organized"
          limit={3}
          page={eventsPage}
          urlParamName="eventsPage"
          totalPages={organizedEvents?.totalPages}
        />
      </section>
    </>
  )
}
