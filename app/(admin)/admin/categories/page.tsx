export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { getAdminCategories } from '@/lib/actions/admin.actions'
import CategoryManager from '@/components/admin/CategoryManager'

export default async function AdminCategories() {
  const { sessionClaims } = await auth()
  const userId = sessionClaims?.sub as string

  const categories = await getAdminCategories(userId)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="text-gray-500 text-sm mt-1">Manage event categories shown to users</p>
      </div>
      <CategoryManager categories={categories} adminClerkId={userId} />
    </div>
  )
}
