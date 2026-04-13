'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatDateTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, QrCode } from 'lucide-react'
import Pagination from './Pagination'

type TicketListProps = {
  orders: any[]
  page: number
  totalPages?: number
}

export default function TicketList({ orders, page, totalPages = 0 }: TicketListProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {orders.map((order: any) => {
          const event = order.event
          if (!event) return null

          return (
            <div
              key={order._id}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              {/* Event Image */}
              <Link href={`/events/${event._id}`}>
                <div
                  className="h-44 w-full bg-cover bg-center bg-gray-100"
                  style={{ backgroundImage: `url(${event.imageUrl})` }}
                />
              </Link>

              {/* Dashed divider with ticket icon */}
              <div className="flex items-center px-4 py-2 bg-primary-50/40">
                <div className="flex-1 border-t border-dashed border-primary-200" />
                <div className="mx-2 w-5 h-5 rounded-full bg-white border border-primary-200 flex-center text-[10px]">🎟</div>
                <div className="flex-1 border-t border-dashed border-primary-200" />
              </div>

              <div className="flex flex-col gap-3 p-4">
                {/* Badges */}
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={event.isFree ? 'green' : 'default'}>
                    {event.isFree ? 'FREE' : `$${order.totalAmount}`}
                  </Badge>
                  {event.category && <Badge variant="secondary">{event.category.name}</Badge>}
                </div>

                {/* Title */}
                <Link href={`/events/${event._id}`}>
                  <p className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-400 transition-colors">
                    {event.title}
                  </p>
                </Link>

                {/* Date */}
                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-primary-400" />
                  <span>{formatDateTime(event.startDateTime).dateTime}</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-primary-400" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>

                {/* View Ticket Button */}
                <Button asChild size="sm" className="rounded-full w-full mt-1 gap-2">
                  <Link href={`/ticket/${order._id}`}>
                    <QrCode className="w-4 h-4" />
                    View Ticket & QR Code
                  </Link>
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination urlParamName="ordersPage" page={page} totalPages={totalPages} />
        </div>
      )}
    </div>
  )
}
