import { auth, clerkClient } from '@clerk/nextjs/server'
import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'
import { connectToDatabase } from '@/lib/database'
import User from '@/lib/database/models/user.model'

async function ensureUserSynced(clerkId: string) {
  try {
    await connectToDatabase()
    const existing = await User.findOne({ clerkId })
    if (!existing) {
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(clerkId)
      const email = clerkUser.emailAddresses[0]?.emailAddress || ''
      const username = clerkUser.username || email.split('@')[0] || 'user'
      const firstName = clerkUser.firstName || username
      const lastName = clerkUser.lastName || ''
      await User.findOneAndUpdate(
        { clerkId },
        { clerkId, email, username, firstName, lastName, photo: clerkUser.imageUrl },
        { upsert: true, new: true }
      )
    }
  } catch {
    // Silent — don't break the page if sync fails
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { sessionClaims } = await auth()
  const clerkId = sessionClaims?.sub as string | undefined
  if (clerkId) await ensureUserSynced(clerkId)

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
