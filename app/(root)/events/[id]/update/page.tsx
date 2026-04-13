export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { getEventById } from '@/lib/actions/event.actions'
import EventForm from '@/components/shared/EventForm'

type UpdateEventProps = {
  params: Promise<{ id: string }>
}

export default async function UpdateEvent({ params }: UpdateEventProps) {
  const { id } = await params
  const { sessionClaims } = await auth()
  const userId = sessionClaims?.sub as string

  const event = await getEventById(id)

  return (
    <>
      <section className="bg-gradient-to-b from-primary-50 to-white py-10 md:py-14">
        <div className="wrapper text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-600 mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Update Event
          </div>
          <h1 className="h2-bold text-gray-900">Update Your Event</h1>
          <p className="text-gray-500 mt-2 max-w-xl mx-auto">
            Modify the details below to keep your attendees informed.
          </p>
        </div>
      </section>

      <div className="wrapper my-8">
        <EventForm
          type="Update"
          event={event}
          eventId={event._id}
          userId={userId}
        />
      </div>
    </>
  )
}
