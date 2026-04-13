export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { getAdminUsers } from '@/lib/actions/admin.actions'
import AdminUserActions from '@/components/admin/AdminUserActions'
import Search from '@/components/shared/Search'

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>
}) {
  const { sessionClaims } = await auth()
  const userId = sessionClaims?.sub as string
  const sp = await searchParams
  const search = sp.query || ''
  const page = Number(sp.page) || 1

  const { users, totalPages } = await getAdminUsers(userId, search, page)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 text-sm mt-1">{users.length > 0 ? `Showing users` : 'No users found'}</p>
      </div>

      <div className="mb-4">
        <Search placeholder="Search by name or email..." />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Email</th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Username</th>
              <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-right p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">No users found</td></tr>
            ) : users.map((user: any) => (
              <tr key={user._id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${user.banned ? 'opacity-60' : ''}`}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {user.photo && (
                      <img src={user.photo} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                    )}
                    <p className="text-sm font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-500 hidden md:table-cell">{user.email}</td>
                <td className="p-4 text-sm text-gray-400 hidden lg:table-cell font-mono">@{user.username}</td>
                <td className="p-4">
                  {user.banned ? (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">Banned</span>
                  ) : (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">Active</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  {user.clerkId !== userId && (
                    <AdminUserActions targetClerkId={user.clerkId} banned={user.banned} adminClerkId={userId} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <a key={p} href={`/admin/users?page=${p}&query=${search}`}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${p === page ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >{p}</a>
          ))}
        </div>
      )}
    </div>
  )
}
