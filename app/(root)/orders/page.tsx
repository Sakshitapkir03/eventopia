export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getOrdersByEvent } from '@/lib/actions/order.actions'
import { getEventById } from '@/lib/actions/event.actions'
import Search from '@/components/shared/Search'
import CheckInButton from '@/components/shared/CheckInButton'
import { Users, DollarSign, CheckCircle2, Ticket, Download } from 'lucide-react'
import Link from 'next/link'

type OrdersPageProps = {
  searchParams: Promise<{ eventId?: string; query?: string }>
}

export default async function Orders({ searchParams }: OrdersPageProps) {
  const { sessionClaims } = await auth()
  const userId = sessionClaims?.sub as string | undefined

  if (!userId) redirect('/sign-in')

  const resolvedSearchParams = await searchParams
  const eventId = resolvedSearchParams?.eventId || ''
  const searchText = resolvedSearchParams?.query || ''

  if (eventId) {
    const event = await getEventById(eventId)
    if (!event || event.organizer?.clerkId !== userId) redirect('/')
  } else {
    redirect('/')
  }

  const event = await getEventById(eventId)
  const orders = await getOrdersByEvent({ eventId, searchString: searchText })

  // Analytics
  const activeOrders = (orders || []).filter((o: any) => o.status !== 'refunded')
  const checkedIn = (orders || []).filter((o: any) => o.status === 'checked_in')
  const totalRevenue = activeOrders.reduce((sum: number, o: any) => sum + (parseFloat(o.totalAmount) || 0), 0)

  const stats = [
    { label: 'Tickets Sold', value: activeOrders.length, icon: Ticket, color: 'text-primary-500 bg-primary-50' },
    { label: 'Checked In', value: checkedIn.length, icon: CheckCircle2, color: 'text-blue-500 bg-blue-50' },
    { label: 'Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { label: 'Capacity', value: event.capacity ? `${activeOrders.length} / ${event.capacity}` : '∞', icon: Users, color: 'text-orange-500 bg-orange-50' },
  ]

  const statusStyles: Record<string, string> = {
    active: 'text-green-600 bg-green-50',
    refunded: 'text-red-500 bg-red-50',
    checked_in: 'text-blue-600 bg-blue-50',
  }
  const statusLabels: Record<string, string> = {
    active: 'Active',
    refunded: 'Refunded',
    checked_in: 'Checked In',
  }

  return (
    <>
      <section className="bg-gradient-to-b from-primary-50/40 to-white py-10">
        <div className="wrapper flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-bold text-3xl text-gray-900">{event.title}</h3>
            <p className="text-gray-500 mt-1">Manage attendees and track sales</p>
          </div>
          <Link
            href={`/api/export/${eventId}`}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="wrapper mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex-center flex-shrink-0 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrapper mt-6">
        <Search placeholder="Search buyer name..." />
      </section>

      <section className="wrapper overflow-x-auto mt-4 mb-8">
        <table className="w-full border-collapse rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">
          <thead>
            <tr className="bg-primary-50 border-b border-primary-100">
              <th className="text-left p-4 font-semibold text-gray-700 text-sm">Order ID</th>
              <th className="text-left p-4 font-semibold text-gray-700 text-sm">Buyer</th>
              <th className="text-left p-4 font-semibold text-gray-700 text-sm">Date</th>
              <th className="text-left p-4 font-semibold text-gray-700 text-sm">Status</th>
              <th className="text-right p-4 font-semibold text-gray-700 text-sm">Amount</th>
              <th className="text-right p-4 font-semibold text-gray-700 text-sm">Check-In</th>
            </tr>
          </thead>
          <tbody>
            {orders && orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-10 p-regular-14">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders && orders.map((row: any) => (
                <tr key={row._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm text-gray-500 font-mono">
                    {row._id.toString().slice(-8)}...
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">{row.buyer}</td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(row.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[row.status] || statusStyles.active}`}>
                      {statusLabels[row.status] || 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-semibold text-right text-primary-500">
                    {row.totalAmount === '0' ? 'Free' : `$${row.totalAmount}`}
                  </td>
                  <td className="p-4 text-right">
                    <CheckInButton
                      orderId={row._id}
                      organizerClerkId={userId}
                      currentStatus={row.status || 'active'}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </>
  )
}
