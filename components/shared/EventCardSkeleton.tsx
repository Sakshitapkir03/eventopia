export default function EventCardSkeleton() {
  return (
    <div className="flex min-h-[380px] w-full max-w-[400px] flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 animate-pulse">
      <div className="min-h-[220px] w-full bg-gray-200" />
      <div className="flex flex-col gap-3 p-5">
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-gray-200" />
          <div className="h-6 w-20 rounded-full bg-gray-200" />
        </div>
        <div className="h-4 w-32 rounded bg-gray-200" />
        <div className="h-5 w-full rounded bg-gray-200" />
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="flex justify-between mt-2">
          <div className="h-4 w-28 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  )
}

export function EventGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  )
}
