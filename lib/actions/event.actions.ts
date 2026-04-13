'use server'

import mongoose from 'mongoose'
import { revalidatePath } from 'next/cache'
import { connectToDatabase } from '@/lib/database'
import User from '@/lib/database/models/user.model'
import Event from '@/lib/database/models/event.model'
import Order from '@/lib/database/models/order.model'
import Category from '@/lib/database/models/category.model'
import { handleError } from '@/lib/utils'
import {
  CreateEventParams,
  UpdateEventParams,
  DeleteEventParams,
  GetAllEventsParams,
  GetEventsByUserParams,
  GetRelatedEventsByCategoryParams,
} from '@/types'

// Attach ticketsSold count to each event that has a capacity
async function attachTicketsSold(events: any[]): Promise<any[]> {
  const capacityEvents = events.filter((e) => e.capacity)
  if (capacityEvents.length === 0) return events

  const eventIds = capacityEvents.map((e) => new mongoose.Types.ObjectId(e._id))
  const counts = await Order.aggregate([
    { $match: { event: { $in: eventIds } } },
    { $group: { _id: '$event', count: { $sum: 1 } } },
  ])
  const countMap: Record<string, number> = {}
  counts.forEach((c: any) => { countMap[c._id.toString()] = c.count })

  return events.map((e) => ({ ...e, ticketsSold: countMap[e._id] ?? 0 }))
}

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getCategoryByName = async (name: string) => {
  return Category.findOne({ name: { $regex: escapeRegex(name), $options: 'i' } })
}

const populateEvent = (query: any) => {
  return query
    .populate({ path: 'organizer', model: User, select: '_id firstName lastName username clerkId' })
    .populate({ path: 'category', model: Category, select: '_id name' })
}

// Find user by Clerk ID (sub) — not MongoDB _id
const getUserByClerkId = async (clerkId: string) => {
  return User.findOne({ clerkId })
}

export async function createEvent({ userId, event, path }: CreateEventParams) {
  try {
    if (!userId) throw new Error('You must be signed in to create an event')
    await connectToDatabase()

    // userId here is the Clerk ID (sub), look up the MongoDB user
    const organizer = await getUserByClerkId(userId)
    if (!organizer) throw new Error('Organizer not found. Please sign out and sign back in.')

    if (!event.categoryId) throw new Error('Please select a category')

    const crypto = await import('crypto')
    const newEvent = await Event.create({
      ...event,
      category: event.categoryId,
      organizer: organizer._id,
      capacity: event.capacity ? Number(event.capacity) : null,
      inviteCode: event.isPrivate ? crypto.randomBytes(8).toString('hex') : null,
    })
    revalidatePath(path)
    return JSON.parse(JSON.stringify(newEvent))
  } catch (error) {
    handleError(error)
  }
}

export async function getEventById(eventId: string) {
  try {
    await connectToDatabase()
    const event = await populateEvent(Event.findById(eventId))
    if (!event) throw new Error('Event not found')
    return JSON.parse(JSON.stringify(event))
  } catch (error) {
    handleError(error)
  }
}

export async function updateEvent({ userId, event, path }: UpdateEventParams) {
  try {
    await connectToDatabase()

    const organizer = await getUserByClerkId(userId)
    if (!organizer) throw new Error('User not found')

    const eventToUpdate = await Event.findById(event._id)
    if (!eventToUpdate || eventToUpdate.organizer.toHexString() !== organizer._id.toHexString()) {
      throw new Error('Unauthorized or event not found')
    }

    if (!event.categoryId) throw new Error('Please select a category')

    const existing = await Event.findById(event._id)
    const crypto = await import('crypto')
    const updatedEvent = await Event.findByIdAndUpdate(
      event._id,
      {
        ...event,
        category: event.categoryId,
        capacity: event.capacity ? Number(event.capacity) : null,
        inviteCode: event.isPrivate
          ? (existing?.inviteCode || crypto.randomBytes(8).toString('hex'))
          : null,
      },
      { new: true }
    )
    revalidatePath(path)
    return JSON.parse(JSON.stringify(updatedEvent))
  } catch (error) {
    handleError(error)
  }
}

export async function deleteEvent({ eventId, userId, path }: DeleteEventParams) {
  try {
    await connectToDatabase()
    const organizer = await getUserByClerkId(userId)
    if (!organizer) throw new Error('User not found')

    const event = await Event.findById(eventId)
    if (!event) throw new Error('Event not found')
    if (event.organizer.toHexString() !== organizer._id.toHexString()) throw new Error('Unauthorized')

    await Event.findByIdAndDelete(eventId)
    revalidatePath(path)
  } catch (error) {
    handleError(error)
  }
}

export async function duplicateEvent(eventId: string, userId: string) {
  try {
    await connectToDatabase()
    const organizer = await getUserByClerkId(userId)
    if (!organizer) throw new Error('User not found')

    const source = await Event.findById(eventId)
    if (!source || source.organizer.toString() !== organizer._id.toString()) throw new Error('Unauthorized')

    const newStart = new Date()
    newStart.setDate(newStart.getDate() + 7)
    const newEnd = new Date(newStart)
    newEnd.setHours(newEnd.getHours() + (source.endDateTime - source.startDateTime) / 3600000)

    const copy = await Event.create({
      title: `${source.title} (Copy)`,
      description: source.description,
      location: source.location,
      imageUrl: source.imageUrl,
      startDateTime: newStart,
      endDateTime: newEnd,
      price: source.price,
      isFree: source.isFree,
      url: source.url,
      capacity: source.capacity,
      isPrivate: source.isPrivate,
      refundPolicy: source.refundPolicy,
      agenda: source.agenda,
      category: source.category,
      organizer: organizer._id,
    })
    revalidatePath('/profile')
    return JSON.parse(JSON.stringify(copy))
  } catch (error) {
    handleError(error)
  }
}

export async function getAllEvents({ query, limit = 6, page, category, dateFilter, priceFilter }: GetAllEventsParams) {
  try {
    await connectToDatabase()

    const now = new Date()
    const titleCondition = query ? { title: { $regex: escapeRegex(query), $options: 'i' } } : {}
    const categoryCondition = category ? await getCategoryByName(category) : null

    // Date filter
    let dateCondition: any = {}
    if (dateFilter === 'today') {
      const start = new Date(now); start.setHours(0, 0, 0, 0)
      const end = new Date(now); end.setHours(23, 59, 59, 999)
      dateCondition = { startDateTime: { $gte: start, $lte: end } }
    } else if (dateFilter === 'week') {
      const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      dateCondition = { startDateTime: { $gte: now, $lte: end } }
    } else if (dateFilter === 'month') {
      const end = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
      dateCondition = { startDateTime: { $gte: now, $lte: end } }
    }

    // Price filter
    const priceCondition = priceFilter === 'free'
      ? { isFree: true }
      : priceFilter === 'paid'
      ? { isFree: false }
      : {}

    const conditions = {
      $and: [
        titleCondition,
        categoryCondition ? { category: categoryCondition._id } : {},
        dateCondition,
        priceCondition,
        { isPrivate: { $ne: true } },
      ],
    }

    const skipAmount = (Number(page) - 1) * limit
    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)

    const events = JSON.parse(JSON.stringify(await populateEvent(eventsQuery)))
    const eventsCount = await Event.countDocuments(conditions)
    const eventsWithSold = await attachTicketsSold(events)

    return {
      data: eventsWithSold,
      totalPages: Math.ceil(eventsCount / limit),
    }
  } catch (error) {
    handleError(error)
  }
}

export async function getEventsByUser({ userId, limit = 6, page }: GetEventsByUserParams) {
  try {
    await connectToDatabase()

    const organizer = await getUserByClerkId(userId)
    if (!organizer) return { data: [], totalPages: 0 }

    const conditions = { organizer: organizer._id }
    const skipAmount = (page - 1) * limit
    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)

    const events = JSON.parse(JSON.stringify(await populateEvent(eventsQuery)))
    const eventsCount = await Event.countDocuments(conditions)
    const eventsWithSold = await attachTicketsSold(events)

    return {
      data: eventsWithSold,
      totalPages: Math.ceil(eventsCount / limit),
    }
  } catch (error) {
    handleError(error)
  }
}

export async function getRelatedEventsByCategory({
  categoryId,
  eventId,
  limit = 3,
  page = 1,
}: GetRelatedEventsByCategoryParams) {
  try {
    await connectToDatabase()
    const skipAmount = (Number(page) - 1) * limit
    const conditions = { $and: [{ category: categoryId }, { _id: { $ne: eventId } }] }

    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)

    const events = JSON.parse(JSON.stringify(await populateEvent(eventsQuery)))
    const eventsCount = await Event.countDocuments(conditions)
    const eventsWithSold = await attachTicketsSold(events)

    return {
      data: eventsWithSold,
      totalPages: Math.ceil(eventsCount / limit),
    }
  } catch (error) {
    handleError(error)
  }
}
