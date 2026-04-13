'use server'

import { connectToDatabase } from '@/lib/database'
import Report from '@/lib/database/models/report.model'
import User from '@/lib/database/models/user.model'
import { handleError } from '@/lib/utils'

export async function submitReport({
  eventId,
  clerkId,
  reason,
  details,
}: {
  eventId: string
  clerkId: string
  reason: string
  details: string
}) {
  try {
    await connectToDatabase()
    const user = await User.findOne({ clerkId })
    if (!user) throw new Error('User not found')

    await Report.findOneAndUpdate(
      { event: eventId, reporter: user._id },
      { event: eventId, reporter: user._id, reason, details },
      { upsert: true, new: true }
    )
    return { success: true }
  } catch (error: any) {
    if (error?.code === 11000) throw new Error('You have already reported this event')
    throw new Error(error?.message || 'Failed to submit report')
  }
}

export async function hasUserReported(eventId: string, clerkId: string) {
  try {
    await connectToDatabase()
    const user = await User.findOne({ clerkId })
    if (!user) return false
    const report = await Report.findOne({ event: eventId, reporter: user._id })
    return !!report
  } catch (error) {
    return false
  }
}
