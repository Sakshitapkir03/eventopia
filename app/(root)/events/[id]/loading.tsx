export default function Loading() {
  return (
    <div className="animate-pulse">
      <section className="grid grid-cols-1 md:grid-cols-2 max-w-7xl mx-auto">
        <div className="min-h-[350px] md:min-h-[500px] bg-gray-200" />
        <div className="flex flex-col gap-6 p-6 md:p-10 bg-white">
          <div className="flex gap-2">
            <div className="h-7 w-16 rounded-full bg-gray-200" />
            <div className="h-7 w-20 rounded-full bg-gray-200" />
          </div>
          <div className="h-8 w-3/4 rounded bg-gray-200" />
          <div className="h-12 w-40 rounded-full bg-gray-200" />
          <div className="flex flex-col gap-4 border-t pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="h-3 w-20 rounded bg-gray-200" />
                  <div className="h-4 w-40 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
