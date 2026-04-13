import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createOrder } from '@/lib/actions/order.actions'
import { connectToDatabase } from '@/lib/database'
import Event from '@/lib/database/models/event.model'
import User from '@/lib/database/models/user.model'
import { sendTicketConfirmationEmail } from '@/lib/email'
import { formatDateTime } from '@/lib/utils'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature') as string
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    event = Stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    return NextResponse.json({ message: 'Webhook error', error: err })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { id, amount_total, metadata } = session

    const order = {
      stripeId: id,
      eventId: metadata?.eventId || '',
      buyerId: metadata?.buyerId || '',
      totalAmount: amount_total ? (amount_total / 100).toString() : '0',
      createdAt: new Date(),
    }

    const newOrder = await createOrder(order)

    // Send confirmation email
    try {
      await connectToDatabase()

      const eventDoc = await Event.findById(metadata?.eventId)
      const buyer = await User.findOne({ clerkId: metadata?.buyerId })

      if (eventDoc && buyer) {
        await sendTicketConfirmationEmail({
          to: buyer.email,
          buyerName: `${buyer.firstName} ${buyer.lastName}`.trim() || buyer.username,
          eventTitle: eventDoc.title,
          eventDate: formatDateTime(eventDoc.startDateTime).dateTime,
          eventLocation: eventDoc.location,
          orderId: newOrder._id.toString(),
          totalAmount: order.totalAmount,
          isFree: eventDoc.isFree,
        })
      }
    } catch (emailError) {
      // Don't fail the webhook if email fails
      console.error('Email send failed:', emailError)
    }

    return NextResponse.json({ message: 'OK', order: newOrder })
  }

  return new Response('', { status: 200 })
}
