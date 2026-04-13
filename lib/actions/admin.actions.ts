'use server'

import { revalidatePath } from 'next/cache'
import { connectToDatabase } from '@/lib/database'
import User from '@/lib/database/models/user.model'
import Event from '@/lib/database/models/event.model'
import Order from '@/lib/database/models/order.model'
import Category from '@/lib/database/models/category.model'
import Report from '@/lib/database/models/report.model'
import { handleError } from '@/lib/utils'
import { isAdminUser } from '@/lib/utils/admin'

function requireAdmin(clerkId: string) {
  if (!isAdminUser(clerkId)) throw new Error('Unauthorized')
}

// ─── Platform Stats ────────────────────────────────────────────────────────

export async function getPlatformStats(clerkId: string) {
  requireAdmin(clerkId)
  await connectToDatabase()

  const [totalUsers, totalEvents, totalOrders, unresolvedReports, orders] = await Promise.all([
    User.countDocuments(),
    Event.countDocuments(),
    Order.countDocuments({ status: { $ne: 'refunded' } }),
    Report.countDocuments({ resolved: false }),
    Order.find({ status: { $ne: 'refunded' } }, 'totalAmount'),
  ])

  const totalRevenue = orders.reduce((s: number, o: any) => s + (parseFloat(o.totalAmount) || 0), 0)

  return { totalUsers, totalEvents, totalOrders, unresolvedReports, totalRevenue: totalRevenue.toFixed(2) }
}

// ─── Reports ───────────────────────────────────────────────────────────────

export async function getAdminReports(clerkId: string, resolved = false) {
  requireAdmin(clerkId)
  await connectToDatabase()

  const reports = await Report.find({ resolved })
    .sort({ createdAt: -1 })
    .populate({ path: 'event', model: Event, select: 'title _id organizer' })
    .populate({ path: 'reporter', model: User, select: 'firstName lastName email' })
    .limit(100)

  return JSON.parse(JSON.stringify(reports))
}

export async function resolveReport(reportId: string, clerkId: string) {
  requireAdmin(clerkId)
  await connectToDatabase()
  await Report.findByIdAndUpdate(reportId, { resolved: true })
  revalidatePath('/admin/reports')
}

export async function deleteReportedEvent(reportId: string, eventId: string, clerkId: string) {
  requireAdmin(clerkId)
  await connectToDatabase()
  await Event.findByIdAndDelete(eventId)
  await Report.updateMany({ event: eventId }, { resolved: true })
  revalidatePath('/admin/reports')
}

// ─── Events ────────────────────────────────────────────────────────────────

export async function getAdminEvents(clerkId: string, search = '', page = 1) {
  requireAdmin(clerkId)
  await connectToDatabase()

  const limit = 20
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const query = search ? { title: { $regex: escaped, $options: 'i' } } : {}

  const [events, total] = await Promise.all([
    Event.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: 'organizer', model: User, select: 'firstName lastName email' })
      .populate({ path: 'category', model: Category, select: 'name' }),
    Event.countDocuments(query),
  ])

  return { events: JSON.parse(JSON.stringify(events)), totalPages: Math.ceil(total / limit) }
}

export async function toggleFeaturedEvent(eventId: string, clerkId: string) {
  requireAdmin(clerkId)
  await connectToDatabase()
  const event = await Event.findById(eventId)
  if (!event) throw new Error('Event not found')
  await Event.findByIdAndUpdate(eventId, { featured: !event.featured })
  revalidatePath('/admin/events')
  revalidatePath('/')
}

export async function adminDeleteEvent(eventId: string, clerkId: string) {
  requireAdmin(clerkId)
  await connectToDatabase()
  await Event.findByIdAndDelete(eventId)
  revalidatePath('/admin/events')
}

// ─── Users ─────────────────────────────────────────────────────────────────

export async function getAdminUsers(clerkId: string, search = '', page = 1) {
  requireAdmin(clerkId)
  await connectToDatabase()

  const limit = 20
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const query = search
    ? {
        $or: [
          { firstName: { $regex: escaped, $options: 'i' } },
          { lastName: { $regex: escaped, $options: 'i' } },
          { email: { $regex: escaped, $options: 'i' } },
        ],
      }
    : {}

  const [users, total] = await Promise.all([
    User.find(query).sort({ _id: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(query),
  ])

  return { users: JSON.parse(JSON.stringify(users)), totalPages: Math.ceil(total / limit) }
}

export async function toggleBanUser(targetClerkId: string, clerkId: string) {
  requireAdmin(clerkId)
  await connectToDatabase()
  const user = await User.findOne({ clerkId: targetClerkId })
  if (!user) throw new Error('User not found')
  await User.findByIdAndUpdate(user._id, { banned: !user.banned })
  revalidatePath('/admin/users')
}

// ─── Categories ────────────────────────────────────────────────────────────

export async function getAdminCategories(clerkId: string) {
  requireAdmin(clerkId)
  await connectToDatabase()
  const categories = await Category.find().sort({ name: 1 })
  return JSON.parse(JSON.stringify(categories))
}

export async function adminCreateCategory(name: string, clerkId: string) {
  requireAdmin(clerkId)
  await connectToDatabase()
  if (!name.trim()) throw new Error('Category name is required')
  const cat = await Category.create({ name: name.trim() })
  revalidatePath('/admin/categories')
  return JSON.parse(JSON.stringify(cat))
}

export async function adminDeleteCategory(categoryId: string, clerkId: string) {
  requireAdmin(clerkId)
  await connectToDatabase()
  await Category.findByIdAndDelete(categoryId)
  revalidatePath('/admin/categories')
}
