import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/database'
import Event from '@/lib/database/models/event.model'
import Order from '@/lib/database/models/order.model'
import User from '@/lib/database/models/user.model'
import { sendEventReminderEmail } from '@/lib/email'
import { formatDateTime } from '@/lib/utils'

export async function GET(req: NextRequest) {
  // Verify the request is from our cron or an authorized caller
  const secret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectToDatabase()

  // Find events starting in the next 24–48 hours
  const now = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000)

  const upcomingEvents = await Event.find({
    startDateTime: { $gte: in24h, $lte: in48h },
  })

  let emailsSent = 0
  let errors = 0

  for (const event of upcomingEvents) {
    const orders = await Order.find({ event: event._id, status: 'active' })
      .populate({ path: 'buyer', model: User, select: 'firstName lastName email' })

    for (const order of orders) {
      const buyer = order.buyer as any
      if (!buyer?.email) continue

      try {
        await sendEventReminderEmail({
          to: buyer.email,
          buyerName: buyer.firstName || 'there',
          eventTitle: event.title,
          eventDate: formatDateTime(event.startDateTime).dateTime,
          eventLocation: event.location || 'TBD',
          eventId: event._id.toString(),
          orderId: order._id.toString(),
        })
        emailsSent++
      } catch (err) {
        console.error(`Failed to send reminder for order ${order._id}:`, err)
        errors++
      }
    }
  }

  return NextResponse.json({
    ok: true,
    eventsProcessed: upcomingEvents.length,
    emailsSent,
    errors,
    timestamp: now.toISOString(),
  })
}
