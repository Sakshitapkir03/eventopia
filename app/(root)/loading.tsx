import { EventGridSkeleton } from '@/components/shared/EventCardSkeleton'

export default function Loading() {
  return (
    <div className="wrapper my-8">
      <div className="h-8 w-48 rounded bg-gray-200 animate-pulse mb-8" />
      <EventGridSkeleton count={6} />
    </div>
  )
}
