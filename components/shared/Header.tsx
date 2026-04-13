import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import NavItems from './NavItems'
import MobileNav from './MobileNav'
import NotificationBell from './NotificationBell'
import { getNotifications } from '@/lib/actions/notification.actions'
import { isAdminUser } from '@/lib/utils/admin'

export default async function Header() {
  const { userId } = await auth()
  const isAdmin = isAdminUser(userId ?? undefined)

  let unreadCount = 0
  let notifications: any[] = []
  if (userId) {
    const result = await getNotifications(userId)
    unreadCount = result.unreadCount
    notifications = result.notifications
  }

  return (
    <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="wrapper flex-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">
            Event<span className="text-primary-400">opia</span>
          </span>
        </Link>

        {userId && (
          <nav className="md:flex-between hidden w-full max-w-xs">
            <NavItems isAdmin={isAdmin} />
          </nav>
        )}

        <div className="flex items-center justify-end gap-3">
          {userId ? (
            <>
              <NotificationBell
                clerkId={userId}
                initialUnread={unreadCount}
                initialNotifications={notifications}
              />
              <UserButton />
              <MobileNav isAdmin={isAdmin} />
            </>
          ) : (
            <Button asChild size="lg">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
