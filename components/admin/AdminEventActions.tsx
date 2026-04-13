'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toggleFeaturedEvent, adminDeleteEvent } from '@/lib/actions/admin.actions'
import { Star, Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Props = { eventId: string; featured: boolean; adminClerkId: string }

export default function AdminEventActions({ eventId, featured: initialFeatured, adminClerkId }: Props) {
  const [featured, setFeatured] = useState(initialFeatured)
  const [loading, setLoading] = useState<'feature' | 'delete' | null>(null)
  const [deleted, setDeleted] = useState(false)
  const router = useRouter()

  if (deleted) return <span className="text-xs text-gray-400">Deleted</span>

  const handleFeature = async () => {
    setLoading('feature')
    try {
      await toggleFeaturedEvent(eventId, adminClerkId)
      setFeatured(f => !f)
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this event and all its orders? This cannot be undone.')) return
    setLoading('delete')
    try {
      await adminDeleteEvent(eventId, adminClerkId)
      setDeleted(true)
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex gap-2 justify-end">
      <Button
        size="sm" variant="outline"
        className={`rounded-full gap-1.5 text-xs ${featured ? 'border-amber-300 text-amber-600 bg-amber-50 hover:bg-amber-100' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
        onClick={handleFeature}
        disabled={!!loading}
      >
        {loading === 'feature' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Star className={`w-3 h-3 ${featured ? 'fill-amber-400' : ''}`} />}
        {featured ? 'Unfeature' : 'Feature'}
      </Button>
      <Button
        size="sm" variant="outline"
        className="rounded-full gap-1.5 text-xs border-red-200 text-red-600 hover:bg-red-50"
        onClick={handleDelete}
        disabled={!!loading}
      >
        {loading === 'delete' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
        Delete
      </Button>
    </div>
  )
}
