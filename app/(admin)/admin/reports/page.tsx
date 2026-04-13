export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { getAdminReports } from '@/lib/actions/admin.actions'
import ReportActions from '@/components/admin/ReportActions'
import { Flag } from 'lucide-react'

export default async function AdminReports({
  searchParams,
}: {
  searchParams: Promise<{ resolved?: string }>
}) {
  const { sessionClaims } = await auth()
  const userId = sessionClaims?.sub as string
  const resolved = (await searchParams).resolved === '1'

  const reports = await getAdminReports(userId, resolved)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">User-submitted event reports</p>
        </div>
        <div className="flex gap-2">
          <a href="/admin/reports" className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!resolved ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            Open ({!resolved ? reports.length : '…'})
          </a>
          <a href="/admin/reports?resolved=1" className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${resolved ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            Resolved
          </a>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Flag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No {resolved ? 'resolved' : 'open'} reports</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((r: any) => (
            <div key={r._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-900 text-sm">
                      {r.event?.title || 'Deleted Event'}
                    </span>
                    <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                      {r.reason}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Reported by <span className="font-medium text-gray-700">{r.reporter?.firstName} {r.reporter?.lastName}</span>
                    <span className="text-gray-400"> · {r.reporter?.email}</span>
                  </p>
                  {r.details && <p className="text-sm text-gray-600 mt-1 italic">"{r.details}"</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                {!resolved && r.event?._id && (
                  <ReportActions reportId={r._id} eventId={r.event._id} adminClerkId={userId} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
