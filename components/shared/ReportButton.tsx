'use client'

import { useState } from 'react'
import { Flag, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { submitReport } from '@/lib/actions/report.actions'

const REASONS = [
  'Misleading information',
  'Inappropriate content',
  'Spam or scam',
  'Duplicate event',
  'Other',
]

type Props = { eventId: string; userId: string; initialReported?: boolean }

export default function ReportButton({ eventId, userId, initialReported }: Props) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(initialReported || false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!reason) { setError('Please select a reason'); return }
    setLoading(true)
    setError('')
    try {
      await submitReport({ eventId, clerkId: userId, reason, details })
      setDone(true)
      setOpen(false)
    } catch (err: any) {
      setError(err.message || 'Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <span className="text-xs text-gray-400 flex items-center gap-1">
        <Flag className="w-3 h-3" /> Reported
      </span>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors"
      >
        <Flag className="w-3 h-3" /> Report event
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Report Event</h3>
              <button onClick={() => setOpen(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">Why are you reporting this event?</p>

            <div className="flex flex-col gap-2 mb-4">
              {REASONS.map(r => (
                <label key={r} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="accent-primary-400"
                  />
                  <span className="text-sm text-gray-700">{r}</span>
                </label>
              ))}
            </div>

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Additional details (optional)"
              rows={3}
              maxLength={300}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-300 mb-3"
            />

            {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button className="flex-1 rounded-full bg-red-500 hover:bg-red-600" onClick={submit} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Report'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
