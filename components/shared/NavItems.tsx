'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { headerLinks } from '@/constants'
import { cn } from '@/lib/utils'
import { ShieldCheck } from 'lucide-react'

type Props = { isAdmin?: boolean }

export default function NavItems({ isAdmin }: Props) {
  const pathname = usePathname()

  return (
    <ul className="md:flex-between flex w-full flex-col items-start gap-5 md:flex-row">
      {headerLinks.map((link) => {
        const isActive = pathname === link.route

        return (
          <li
            key={link.route}
            className={cn(
              'flex-center p-medium-16 whitespace-nowrap transition-colors',
              isActive
                ? 'text-primary-400 font-semibold'
                : 'text-gray-600 hover:text-primary-400'
            )}
          >
            <Link href={link.route}>{link.label}</Link>
          </li>
        )
      })}
      {isAdmin && (
        <li
          className={cn(
            'flex-center p-medium-16 whitespace-nowrap transition-colors gap-1',
            pathname.startsWith('/admin')
              ? 'text-primary-400 font-semibold'
              : 'text-gray-600 hover:text-primary-400'
          )}
        >
          <ShieldCheck className="w-4 h-4" />
          <Link href="/admin">Admin</Link>
        </li>
      )}
    </ul>
  )
}
