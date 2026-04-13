'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, Check } from 'lucide-react'
import { getNotifications, markAllNotificationsRead } from '@/lib/actions/notification.actions'
import Link from 'next/link'

type Notification = {
  _id: string
  type: string
  message: string
  link: string
  read: boolean
  createdAt: string
}

type Props = { clerkId: string; initialUnread: number; initialNotifications: Notification[] }

export default function NotificationBell({ clerkId, initialUnread, initialNotifications }: Props) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [unread, setUnread] = useState(initialUnread)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleOpen = async () => {
    setOpen(!open)
    if (!open && unread > 0) {
      await markAllNotificationsRead(clerkId)
      setUnread(0)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }
  }

  const typeIcon: Record<string, string> = {
    waitlist_promoted: '🎟',
    event_updated: '📅',
    event_cancelled: '❌',
    review_received: '⭐',
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
            <button onClick={() => setOpen(false)}>
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No notifications yet</p>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 ${!n.read ? 'bg-primary-50/40' : ''}`}
                >
                  <span className="text-lg flex-shrink-0">{typeIcon[n.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-snug">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    {n.link && (
                      <Link href={n.link} onClick={() => setOpen(false)} className="text-xs text-primary-500 hover:underline mt-0.5 block">
                        View →
                      </Link>
                    )}
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0 mt-1.5" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
