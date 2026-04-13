'use client'

import { SignInButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'

export default function AuthRequired({ message = 'You need to be signed in to continue.' }: { message?: string }) {
  return (
    <div className="flex-center min-h-[400px] flex-col gap-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 flex-center">
        <Lock className="w-7 h-7 text-primary-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in required</h2>
        <p className="text-gray-500 text-sm max-w-xs">{message}</p>
      </div>
      <div className="flex gap-3">
        <SignInButton mode="modal">
          <Button className="rounded-full px-6">Sign In</Button>
        </SignInButton>
        <SignInButton mode="modal">
          <Button variant="outline" className="rounded-full px-6">Create Account</Button>
        </SignInButton>
      </div>
    </div>
  )
}
