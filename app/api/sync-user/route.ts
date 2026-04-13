import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/database'
import User from '@/lib/database/models/user.model'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    await connectToDatabase()
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)

    const email = clerkUser.emailAddresses[0]?.emailAddress || ''
    const username = clerkUser.username || email.split('@')[0] || 'user'
    // Use email prefix as name if Clerk has no first/last name
    const firstName = clerkUser.firstName || username
    const lastName = clerkUser.lastName || ''

    // Upsert — update if exists, create if not
    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { clerkId: userId, email, username, firstName, lastName, photo: clerkUser.imageUrl },
      { upsert: true, new: true }
    )

    return NextResponse.json({ message: 'User synced', user })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
