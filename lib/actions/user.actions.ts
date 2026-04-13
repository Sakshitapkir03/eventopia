'use server'

import { revalidatePath } from 'next/cache'
import { connectToDatabase } from '@/lib/database'
import User from '@/lib/database/models/user.model'
import Order from '@/lib/database/models/order.model'
import Event from '@/lib/database/models/event.model'
import Category from '@/lib/database/models/category.model'
import { handleError } from '@/lib/utils'
import { CreateUserParams, UpdateUserParams } from '@/types'

export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase()
    const newUser = await User.create(user)
    return JSON.parse(JSON.stringify(newUser))
  } catch (error) {
    handleError(error)
  }
}

export async function getUserById(userId: string) {
  try {
    await connectToDatabase()
    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')
    return JSON.parse(JSON.stringify(user))
  } catch (error) {
    handleError(error)
  }
}

export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase()
    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, { new: true })
    if (!updatedUser) throw new Error('User update failed')
    return JSON.parse(JSON.stringify(updatedUser))
  } catch (error) {
    handleError(error)
  }
}

export async function toggleSaveEvent(clerkId: string, eventId: string) {
  try {
    await connectToDatabase()
    const user = await User.findOne({ clerkId })
    if (!user) throw new Error('User not found')

    const isSaved = user.savedEvents?.some((id: any) => id.toString() === eventId)

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      isSaved
        ? { $pull: { savedEvents: eventId } }
        : { $addToSet: { savedEvents: eventId } },
      { new: true }
    )

    return { isSaved: !isSaved }
  } catch (error) {
    handleError(error)
  }
}

export async function getSavedEvents(clerkId: string, page = 1, limit = 6) {
  try {
    await connectToDatabase()
    const user = await User.findOne({ clerkId }, 'savedEvents')
    if (!user || !user.savedEvents?.length) return { data: [], totalPages: 0 }

    const total = user.savedEvents.length
    const skip = (page - 1) * limit
    const pageIds = user.savedEvents.slice().reverse().slice(skip, skip + limit)

    const events = await Event.find({ _id: { $in: pageIds } })
      .populate({ path: 'organizer', model: User, select: '_id firstName lastName username clerkId' })
      .populate({ path: 'category', model: Category, select: '_id name' })

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(total / limit),
    }
  } catch (error) {
    handleError(error)
    return { data: [], totalPages: 0 }
  }
}

export async function getIsEventSaved(clerkId: string, eventId: string) {
  try {
    await connectToDatabase()
    const user = await User.findOne({ clerkId })
    if (!user) return false
    return user.savedEvents?.some((id: any) => id.toString() === eventId) || false
  } catch (error) {
    return false
  }
}

export async function getOrganizerStats(clerkId: string) {
  try {
    await connectToDatabase()
    const user = await User.findOne({ clerkId })
    if (!user) return { totalEvents: 0, totalTicketsSold: 0, totalRevenue: 0, chartData: [] }

    const events = await Event.find({ organizer: user._id }, '_id title price isFree')
    const eventIds = events.map((e: any) => e._id)

    const orders = await Order.find({ event: { $in: eventIds }, status: { $ne: 'refunded' } })
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (parseFloat(o.totalAmount) || 0), 0)

    // Per-event chart data
    const chartData = events.map((e: any) => {
      const eventOrders = orders.filter((o: any) => o.event.toString() === e._id.toString())
      const revenue = eventOrders.reduce((s: number, o: any) => s + (parseFloat(o.totalAmount) || 0), 0)
      return {
        name: e.title.length > 16 ? e.title.slice(0, 14) + '…' : e.title,
        tickets: eventOrders.length,
        revenue: parseFloat(revenue.toFixed(2)),
      }
    })

    return {
      totalEvents: events.length,
      totalTicketsSold: orders.length,
      totalRevenue: totalRevenue.toFixed(2),
      chartData,
    }
  } catch (error) {
    handleError(error)
    return { totalEvents: 0, totalTicketsSold: 0, totalRevenue: 0, chartData: [] }
  }
}

export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase()
    const userToDelete = await User.findOne({ clerkId })
    if (!userToDelete) throw new Error('User not found')

    await Promise.all([
      Event.updateMany(
        { _id: { $in: userToDelete.events } },
        { $pull: { organizer: userToDelete._id } }
      ),
      Order.updateMany({ _id: { $in: userToDelete.orders } }, { $unset: { buyer: 1 } }),
    ])

    const deletedUser = await User.findByIdAndDelete(userToDelete._id)
    revalidatePath('/')
    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null
  } catch (error) {
    handleError(error)
  }
}
