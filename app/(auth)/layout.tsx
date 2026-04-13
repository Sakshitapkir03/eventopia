export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-center min-h-screen w-full bg-gradient-to-br from-slate-50 via-indigo-50/30 to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary-400 flex-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">Eventopia</span>
          </div>
          <p className="text-sm text-gray-500">The global event platform</p>
        </div>
        {children}
      </div>
    </div>
  )
}
