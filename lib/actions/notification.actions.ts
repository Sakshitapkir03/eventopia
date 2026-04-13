'use server'

import { connectToDatabase } from '@/lib/database'
import Notification from '@/lib/database/models/notification.model'
import User from '@/lib/database/models/user.model'
import { handleError } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

export async function createNotification({
  clerkId,
  type,
  message,
  link = '',
}: {
  clerkId: string
  type: string
  message: string
  link?: string
}) {
  try {
    await connectToDatabase()
    const user = await User.findOne({ clerkId })
    if (!user) return
    await Notification.create({ user: user._id, type, message, link })
  } catch (error) {
    console.error('Failed to create notification:', error)
  }
}

export async function getNotifications(clerkId: string) {
  try {
    await connectToDatabase()
    const user = await User.findOne({ clerkId })
    if (!user) return { notifications: [], unreadCount: 0 }

    const notifications = await Notification.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(20)

    const unreadCount = await Notification.countDocuments({ user: user._id, read: false })
    return { notifications: JSON.parse(JSON.stringify(notifications)), unreadCount }
  } catch (error) {
    handleError(error)
    return { notifications: [], unreadCount: 0 }
  }
}

export async function markAllNotificationsRead(clerkId: string) {
  try {
    await connectToDatabase()
    const user = await User.findOne({ clerkId })
    if (!user) return
    await Notification.updateMany({ user: user._id, read: false }, { read: true })
    revalidatePath('/')
  } catch (error) {
    handleError(error)
  }
}
