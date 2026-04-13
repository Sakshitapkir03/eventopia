'use server'

import { connectToDatabase } from '@/lib/database'
import Waitlist from '@/lib/database/models/waitlist.model'
import User from '@/lib/database/models/user.model'
import { handleError } from '@/lib/utils'

export async function joinWaitlist(eventId: string, clerkId: string) {
  try {
    await connectToDatabase()
    const user = await User.findOne({ clerkId })
    if (!user) throw new Error('User not found')

    await Waitlist.findOneAndUpdate(
      { event: eventId, user: user._id },
      { event: eventId, user: user._id },
      { upsert: true, new: true }
    )
    return { success: true }
  } catch (error: any) {
    if (error?.code === 11000) return { success: true } // already on waitlist
    handleError(error)
  }
}

export async function leaveWaitlist(eventId: string, clerkId: string) {
  try {
    await connectToDatabase()
    const user = await User.findOne({ clerkId })
    if (!user) throw new Error('User not found')

    await Waitlist.findOneAndDelete({ event: eventId, user: user._id })
    return { success: true }
  } catch (error) {
    handleError(error)
  }
}

export async function getWaitlistStatus(eventId: string, clerkId: string) {
  try {
    await connectToDatabase()
    const user = await User.findOne({ clerkId })
    if (!user) return { isOnWaitlist: false, position: 0, total: 0 }

    const entry = await Waitlist.findOne({ event: eventId, user: user._id })
    const total = await Waitlist.countDocuments({ event: eventId })

    if (!entry) return { isOnWaitlist: false, position: 0, total }

    const position = await Waitlist.countDocuments({
      event: eventId,
      createdAt: { $lte: entry.createdAt },
    })

    return { isOnWaitlist: true, position, total }
  } catch (error) {
    handleError(error)
    return { isOnWaitlist: false, position: 0, total: 0 }
  }
}

// Called after a cancellation — notify and promote the first person on waitlist
export async function promoteFromWaitlist(eventId: string) {
  try {
    await connectToDatabase()
    const next = await Waitlist.findOne({ event: eventId, notified: false })
      .sort({ createdAt: 1 })
      .populate({ path: 'user', model: User, select: 'email firstName' })

    if (!next) return null

    await Waitlist.findByIdAndUpdate(next._id, { notified: true })
    return { email: next.user.email, firstName: next.user.firstName }
  } catch (error) {
    handleError(error)
    return null
  }
}
