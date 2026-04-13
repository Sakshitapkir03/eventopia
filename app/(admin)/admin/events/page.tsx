export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { getAdminEvents } from '@/lib/actions/admin.actions'
import AdminEventActions from '@/components/admin/AdminEventActions'
import Search from '@/components/shared/Search'
import { Star } from 'lucide-react'

export default async function AdminEvents({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>
}) {
  const { sessionClaims } = await auth()
  const userId = sessionClaims?.sub as string
  const sp = await searchParams
  const search = sp.query || ''
  const page = Number(sp.page) || 1

  const { events, totalPages } = await getAdminEvents(userId, search, page)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <p className="text-gray-500 text-sm mt-1">Manage all events on the platform</p>
      </div>

      <div className="mb-4">
        <Search placeholder="Search events..." />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Event</th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Organizer</th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Category</th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Date</th>
              <th className="text-right p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">No events found</td></tr>
            ) : events.map((event: any) => (
              <tr key={event._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {event.imageUrl && (
                      <img src={event.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{event.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {event.featured && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                            <Star className="w-2.5 h-2.5" /> Featured
                          </span>
                        )}
                        {event.isPrivate && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">Private</span>
                        )}
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${event.isFree ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'}`}>
                          {event.isFree ? 'Free' : `$${event.price}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600 hidden md:table-cell">
                  {event.organizer?.firstName} {event.organizer?.lastName}
                </td>
                <td className="p-4 text-sm text-gray-500 hidden lg:table-cell">
                  {event.category?.name}
                </td>
                <td className="p-4 text-sm text-gray-500 hidden md:table-cell">
                  {new Date(event.startDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="p-4 text-right">
                  <AdminEventActions eventId={event._id} featured={event.featured} adminClerkId={userId} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <a key={p} href={`/admin/events?page=${p}&query=${search}`}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${p === page ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >{p}</a>
          ))}
        </div>
      )}
    </div>
  )
}
