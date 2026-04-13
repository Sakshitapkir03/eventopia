'use client'

import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { toggleSaveEvent } from '@/lib/actions/user.actions'

type Props = {
  eventId: string
  userId: string
  initialSaved: boolean
}

export default function BookmarkButton({ eventId, userId, initialSaved }: Props) {
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    try {
      const result = await toggleSaveEvent(userId, eventId)
      if (result) setSaved(result.isSaved)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={saved ? 'Remove from saved' : 'Save event'}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm border ${
        saved
          ? 'bg-primary-400 border-primary-400 text-white'
          : 'bg-white/90 border-gray-200 text-gray-400 hover:text-primary-400 hover:border-primary-300'
      }`}
    >
      <Bookmark className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
    </button>
  )
}
