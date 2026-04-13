'use server'

import { connectToDatabase } from '@/lib/database'
import Review from '@/lib/database/models/review.model'
import Order from '@/lib/database/models/order.model'
import User from '@/lib/database/models/user.model'
import { handleError } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

export async function submitReview({
  eventId,
  clerkId,
  rating,
  comment,
}: {
  eventId: string
  clerkId: string
  rating: number
  comment: string
}) {
  try {
    await connectToDatabase()
    const user = await User.findOne({ clerkId })
    if (!user) throw new Error('User not found')

    // Only attendees who bought a ticket can review
    const hasTicket = await Order.findOne({ event: eventId, buyer: user._id, status: { $ne: 'refunded' } })
    if (!hasTicket) throw new Error('You must attend this event to leave a review')

    await Review.findOneAndUpdate(
      { event: eventId, reviewer: user._id },
      { event: eventId, reviewer: user._id, rating, comment },
      { upsert: true, new: true }
    )

    revalidatePath(`/events/${eventId}`)
    return { success: true }
  } catch (error: any) {
    throw new Error(error?.message || 'Failed to submit review')
  }
}

export async function getReviewsByEvent(eventId: string) {
  try {
    await connectToDatabase()
    const reviews = await Review.find({ event: eventId })
      .sort({ createdAt: -1 })
      .populate({ path: 'reviewer', model: User, select: 'firstName lastName photo username' })
      .limit(50)

    return JSON.parse(JSON.stringify(reviews))
  } catch (error) {
    handleError(error)
    return []
  }
}

export async function getUserReviewForEvent(eventId: string, clerkId: string) {
  try {
    await connectToDatabase()
    const user = await User.findOne({ clerkId })
    if (!user) return null

    const review = await Review.findOne({ event: eventId, reviewer: user._id })
    return review ? JSON.parse(JSON.stringify(review)) : null
  } catch (error) {
    return null
  }
}

export async function hasUserAttendedEvent(eventId: string, clerkId: string) {
  try {
    await connectToDatabase()
    const user = await User.findOne({ clerkId })
    if (!user) return false

    const order = await Order.findOne({ event: eventId, buyer: user._id, status: { $ne: 'refunded' } })
    return !!order
  } catch (error) {
    return false
  }
}
