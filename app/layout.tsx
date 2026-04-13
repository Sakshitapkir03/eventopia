import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Eventopia — Discover & Create Events',
  description:
    'Eventopia is a global event platform where you can create, discover, and register for events. Powered by Stripe payments and Clerk authentication.',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en">
        <body className={poppins.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
