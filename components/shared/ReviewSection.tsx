'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { submitReview } from '@/lib/actions/review.actions'

type Review = {
  _id: string
  rating: number
  comment: string
  createdAt: string
  reviewer: { firstName: string; lastName: string; photo: string; username: string }
}

type Props = {
  eventId: string
  userId: string | null
  reviews: Review[]
  hasAttended: boolean
  existingReview: { rating: number; comment: string } | null
  eventEnded: boolean
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            className="w-5 h-5"
            fill={(hover || value) >= star ? '#f59e0b' : 'none'}
            stroke={(hover || value) >= star ? '#f59e0b' : '#d1d5db'}
          />
        </button>
      ))}
    </div>
  )
}

function avgRating(reviews: Review[]) {
  if (!reviews.length) return 0
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
}

export default function ReviewSection({ eventId, userId, reviews, hasAttended, existingReview, eventEnded }: Props) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(!!existingReview)
  const [error, setError] = useState('')
  const [allReviews, setAllReviews] = useState(reviews)

  const avg = avgRating(allReviews)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating) { setError('Please select a rating'); return }
    if (!userId) return
    setSubmitting(true)
    setError('')
    try {
      await submitReview({ eventId, clerkId: userId, rating, comment })
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="border-t pt-6 mt-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 text-lg">Reviews</h3>
        {allReviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(avg)} />
            <span className="text-sm text-gray-500">
              {avg.toFixed(1)} · {allReviews.length} review{allReviews.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Write a review */}
      {eventEnded && hasAttended && !submitted && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-3">Leave a review</p>
          <StarRating value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience... (optional)"
            maxLength={500}
            rows={3}
            className="mt-3 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          <Button type="submit" size="sm" className="mt-3 rounded-full" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      )}

      {submitted && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-4 text-sm text-green-700 font-medium">
          Your review has been submitted. Thank you!
        </div>
      )}

      {eventEnded && hasAttended === false && userId && (
        <p className="text-sm text-gray-400 mb-4 italic">Only verified attendees can leave a review.</p>
      )}

      {!eventEnded && (
        <p className="text-sm text-gray-400 mb-4 italic">Reviews open after the event ends.</p>
      )}

      {/* Reviews list */}
      {allReviews.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No reviews yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {allReviews.map((r) => (
            <div key={r._id} className="flex gap-3">
              {r.reviewer.photo ? (
                <img src={r.reviewer.photo} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary-100 flex-center flex-shrink-0 text-primary-500 font-bold text-sm">
                  {r.reviewer.firstName[0]}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {r.reviewer.firstName} {r.reviewer.lastName}
                  </span>
                  <StarRating value={r.rating} />
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
