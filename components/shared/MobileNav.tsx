'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Menu, X } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import NavItems from './NavItems'
import Link from 'next/link'

type Props = { isAdmin?: boolean }

export default function MobileNav({ isAdmin }: Props) {
  const [open, setOpen] = React.useState(false)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Menu className="h-5 w-5 text-gray-700" />
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-0 top-0 z-50 h-full w-[280px] bg-white shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-300">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-5 border-b">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-400 flex-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-bold text-gray-900">Event<span className="text-primary-400">opia</span></span>
              </Link>
              <DialogPrimitive.Close className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="h-4 w-4" />
              </DialogPrimitive.Close>
            </div>
            <nav className="flex-1 p-5">
              <NavItems isAdmin={isAdmin} />
            </nav>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
