'use client'

import Link from 'next/link'
import { useUser, SignInButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export default function CreateEventCTA({ className }: { className?: string }) {
  const { isSignedIn } = useUser()

  if (isSignedIn) {
    return (
      <Button
        size="lg"
        variant="outline"
        asChild
        className={className ?? 'rounded-full text-base px-8 border-gray-500 text-gray-200 hover:bg-white/10 hover:border-white'}
      >
        <Link href="/events/create">Create Event</Link>
      </Button>
    )
  }

  return (
    <SignInButton mode="modal" forceRedirectUrl="/events/create">
      <Button
        size="lg"
        variant="outline"
        className={className ?? 'rounded-full text-base px-8 border-gray-500 text-gray-200 hover:bg-white/10 hover:border-white'}
      >
        Create Event
      </Button>
    </SignInButton>
  )
}
