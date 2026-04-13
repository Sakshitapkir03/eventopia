'use server'

import Stripe from 'stripe'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { connectToDatabase } from '@/lib/database'
import Order from '@/lib/database/models/order.model'
import Event from '@/lib/database/models/event.model'
import User from '@/lib/database/models/user.model'
import { handleError } from '@/lib/utils'
import { CheckoutOrderParams, CreateOrderParams, GetOrdersByEventParams, GetOrdersByUserParams } from '@/types'
import { sendTicketConfirmationEmail } from '@/lib/email'
import { formatDateTime } from '@/lib/utils'

async function checkCapacity(eventId: string): Promise<void> {
  const event = await Event.findById(eventId)
  if (!event) throw new Error('Event not found')
  if (event.capacity) {
    const soldCount = await Order.countDocuments({ event: eventId })
    if (soldCount >= event.capacity) throw new Error('This event is sold out. No tickets remaining.')
  }
}

export const checkoutOrder = async (order: CheckoutOrderParams) => {
  await connectToDatabase()

  // Capacity check before doing anything
  try {
    await checkCapacity(order.eventId)
  } catch (err: any) {
    throw err
  }

  // Free event: create order directly, skip Stripe
  if (order.isFree) {
    try {
      const buyer = await User.findOne({ clerkId: order.buyerId })
      if (!buyer) throw new Error('Buyer not found. Please sign out and sign back in.')

      const newOrder = await Order.create({
        stripeId: `free_${Date.now()}`,
        event: order.eventId,
        buyer: buyer._id,
        totalAmount: '0',
        createdAt: new Date(),
      })

      // Send confirmation email
      try {
        const event = await Event.findById(order.eventId)
        if (event && buyer.email) {
          await sendTicketConfirmationEmail({
            to: buyer.email,
            buyerName: buyer.firstName || buyer.username || 'there',
            eventTitle: event.title,
            eventDate: formatDateTime(event.startDateTime).dateTime,
            eventLocation: event.location || 'TBD',
            orderId: newOrder._id.toString(),
            totalAmount: '0',
            isFree: true,
          })
        }
      } catch (emailErr) {
        console.error('Failed to send free ticket email:', emailErr)
      }
    } catch (error) {
      throw error
    }

    redirect(`${process.env.NEXT_PUBLIC_SERVER_URL}/profile?success=1`)
  }

  // Paid event: use Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const price = Number(order.price) * 100

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: price,
            product_data: { name: order.eventTitle },
          },
          quantity: 1,
        },
      ],
      metadata: {
        eventId: order.eventId,
        buyerId: order.buyerId,
      },
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/events/${order.eventId}`,
    })

    redirect(session.url!)
  } catch (error) {
    throw error
  }
}

export const createOrder = async (order: CreateOrderParams) => {
  try {
    await connectToDatabase()
    const buyer = await User.findOne({ clerkId: order.buyerId })
    if (!buyer) throw new Error('Buyer not found')

    const newOrder = await Order.create({
      stripeId: order.stripeId,
      event: order.eventId,
      buyer: buyer._id,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
    })
    return JSON.parse(JSON.stringify(newOrder))
  } catch (error) {
    handleError(error)
  }
}

export async function getOrdersByEvent({ searchString, eventId }: GetOrdersByEventParams) {
  try {
    await connectToDatabase()
    if (!eventId) throw new Error('Event ID is required')

    const orders = await Order.aggregate([
      {
        $lookup: { from: 'users', localField: 'buyer', foreignField: '_id', as: 'buyer' },
      },
      { $unwind: '$buyer' },
      {
        $lookup: { from: 'events', localField: 'event', foreignField: '_id', as: 'event' },
      },
      { $unwind: '$event' },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          createdAt: 1,
          status: 1,
          eventTitle: '$event.title',
          eventId: '$event._id',
          buyer: { $concat: ['$buyer.firstName', ' ', '$buyer.lastName'] },
        },
      },
      {
        $match: {
          $and: [
            { eventId: { $eq: eventId } },
            { buyer: { $regex: searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
          ],
        },
      },
    ])

    return JSON.parse(JSON.stringify(orders))
  } catch (error) {
    handleError(error)
  }
}

export async function refundOrder(orderId: string, clerkId: string) {
  try {
    await connectToDatabase()
    const user = await User.findOne({ clerkId })
    if (!user) throw new Error('User not found')

    const order = await Order.findById(orderId).populate('event')
    if (!order) throw new Error('Order not found')
    if (order.buyer.toString() !== user._id.toString()) throw new Error('Unauthorized')
    if (order.status === 'refunded') throw new Error('Already refunded')
    if (new Date(order.event.startDateTime) < new Date()) throw new Error('Cannot refund after event has started')

    // Refund via Stripe if paid
    if (!order.stripeId.startsWith('free_') && order.totalAmount !== '0') {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
      const session = await stripe.checkout.sessions.retrieve(order.stripeId)
      if (session.payment_intent) {
        await stripe.refunds.create({ payment_intent: session.payment_intent as string })
      }
    }

    await Order.findByIdAndUpdate(orderId, { status: 'refunded' })

    // Promote next person from waitlist
    const { promoteFromWaitlist } = await import('./waitlist.actions')
    const next = await promoteFromWaitlist(order.event._id.toString())
    if (next) {
      // Send notification email to the next person
      try {
        const { sendWaitlistNotificationEmail } = await import('@/lib/email')
        await sendWaitlistNotificationEmail({
          to: next.email,
          firstName: next.firstName,
          eventTitle: order.event.title,
          eventId: order.event._id.toString(),
        })
      } catch {}
    }

    revalidatePath('/profile')
    return { success: true }
  } catch (error: any) {
    throw new Error(error?.message || 'Refund failed')
  }
}

export async function checkInOrder(orderId: string, organizerClerkId: string) {
  try {
    await connectToDatabase()
    const organizer = await User.findOne({ clerkId: organizerClerkId })
    if (!organizer) throw new Error('Organizer not found')

    const order = await Order.findById(orderId).populate('event')
    if (!order) throw new Error('Order not found')
    if (order.event.organizer.toString() !== organizer._id.toString()) throw new Error('Unauthorized')
    if (order.status === 'refunded') throw new Error('Ticket has been refunded')

    await Order.findByIdAndUpdate(orderId, { status: 'checked_in' })
    revalidatePath(`/orders?eventId=${order.event._id}`)
    return { success: true }
  } catch (error: any) {
    throw new Error(error?.message || 'Check-in failed')
  }
}

export async function getOrdersByUser({ userId, limit = 3, page }: GetOrdersByUserParams) {
  try {
    await connectToDatabase()
    const skipAmount = (Number(page) - 1) * limit
    const user = await User.findOne({ clerkId: userId })
    if (!user) return { data: [], totalPages: 0 }

    const conditions = { buyer: user._id }

    const orders = await Order.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)
      .populate({
        path: 'event',
        model: Event,
        populate: { path: 'organizer', model: User, select: '_id firstName lastName' },
      })

    const ordersCount = await Order.countDocuments(conditions)

    return {
      data: JSON.parse(JSON.stringify(orders)),
      totalPages: Math.ceil(ordersCount / limit),
    }
  } catch (error) {
    handleError(error)
  }
}
