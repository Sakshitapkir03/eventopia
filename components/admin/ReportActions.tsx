'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { resolveReport, deleteReportedEvent } from '@/lib/actions/admin.actions'
import { CheckCircle2, Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Props = { reportId: string; eventId: string; adminClerkId: string }

export default function ReportActions({ reportId, eventId, adminClerkId }: Props) {
  const [loading, setLoading] = useState<'resolve' | 'delete' | null>(null)
  const [done, setDone] = useState(false)
  const router = useRouter()

  const handle = async (action: 'resolve' | 'delete') => {
    setLoading(action)
    try {
      if (action === 'resolve') await resolveReport(reportId, adminClerkId)
      else await deleteReportedEvent(reportId, eventId, adminClerkId)
      setDone(true)
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  if (done) return <span className="text-xs text-gray-400">Done</span>

  return (
    <div className="flex gap-2">
      <Button
        size="sm" variant="outline"
        className="rounded-full gap-1.5 text-xs border-green-200 text-green-700 hover:bg-green-50"
        onClick={() => handle('resolve')}
        disabled={!!loading}
      >
        {loading === 'resolve' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
        Dismiss
      </Button>
      <Button
        size="sm" variant="outline"
        className="rounded-full gap-1.5 text-xs border-red-200 text-red-600 hover:bg-red-50"
        onClick={() => handle('delete')}
        disabled={!!loading}
      >
        {loading === 'delete' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
        Delete Event
      </Button>
    </div>
  )
}
