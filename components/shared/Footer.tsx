import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="wrapper flex-between flex-col gap-4 p-5 text-center sm:flex-row">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-400 flex-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-bold text-gray-800">Event<span className="text-primary-400">opia</span></span>
        </Link>

        <p className="p-regular-14 text-gray-500">
          &copy; {new Date().getFullYear()} Eventopia. All rights reserved.
        </p>

        <div className="flex gap-4 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-primary-400 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-primary-400 transition-colors">Terms</Link>
          <Link href="/support" className="hover:text-primary-400 transition-colors">Support</Link>
        </div>
      </div>
    </footer>
  )
}
