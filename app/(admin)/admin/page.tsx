export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { getPlatformStats } from '@/lib/actions/admin.actions'
import { Users, Calendar, Ticket, DollarSign, Flag, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const { sessionClaims } = await auth()
  const userId = sessionClaims?.sub as string

  const stats = await getPlatformStats(userId)

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500 bg-blue-50', href: '/admin/users' },
    { label: 'Total Events', value: stats.totalEvents, icon: Calendar, color: 'text-primary-500 bg-primary-50', href: '/admin/events' },
    { label: 'Tickets Sold', value: stats.totalOrders, icon: Ticket, color: 'text-green-500 bg-green-50', href: '/admin/events' },
    { label: 'Platform Revenue', value: `$${stats.totalRevenue}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50', href: '/admin/events' },
    { label: 'Open Reports', value: stats.unresolvedReports, icon: Flag, color: 'text-red-500 bg-red-50', href: '/admin/reports' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Platform overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${c.color}`}>
              <c.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              <p className="text-sm text-gray-500">{c.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {stats.unresolvedReports > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700">
              {stats.unresolvedReports} unresolved report{stats.unresolvedReports !== 1 ? 's' : ''} need attention
            </p>
            <Link href="/admin/reports" className="text-sm text-red-600 hover:underline mt-0.5 inline-block">
              Review reports →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
