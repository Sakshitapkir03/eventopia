import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { isAdminUser } from '@/lib/utils/admin'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { sessionClaims } = await auth()
  const userId = sessionClaims?.sub as string | undefined

  if (!isAdminUser(userId)) redirect('/')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-6 md:p-8">{children}</main>
    </div>
  )
}
