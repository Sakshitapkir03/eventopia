import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/database'
import Order from '@/lib/database/models/order.model'
import Event from '@/lib/database/models/event.model'
import User from '@/lib/database/models/user.model'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { sessionClaims } = await auth()
  const clerkId = sessionClaims?.sub as string | undefined
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { eventId } = await params

  await connectToDatabase()

  const organizer = await User.findOne({ clerkId })
  if (!organizer) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const event = await Event.findById(eventId)
  if (!event || event.organizer.toString() !== organizer._id.toString()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const orders = await Order.find({ event: eventId })
    .populate({ path: 'buyer', model: User, select: 'firstName lastName email username' })
    .sort({ createdAt: -1 })

  const rows = [
    ['Order ID', 'First Name', 'Last Name', 'Email', 'Amount', 'Status', 'Date'],
    ...orders.map((o: any) => [
      o._id.toString(),
      o.buyer?.firstName || '',
      o.buyer?.lastName || '',
      o.buyer?.email || '',
      o.totalAmount === '0' ? 'Free' : `$${o.totalAmount}`,
      o.status || 'active',
      new Date(o.createdAt).toLocaleDateString('en-US'),
    ]),
  ]

  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="attendees-${eventId}.csv"`,
    },
  })
}
