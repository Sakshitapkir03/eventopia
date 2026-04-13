import { auth } from '@clerk/nextjs/server'
import EventForm from '@/components/shared/EventForm'
import AuthRequired from '@/components/shared/AuthRequired'

export default async function CreateEvent() {
  const { sessionClaims } = await auth()
  const userId = sessionClaims?.sub as string | undefined

  if (!userId) {
    return (
      <div className="wrapper my-8">
        <AuthRequired message="Please sign in to create and publish events on Eventopia." />
      </div>
    )
  }

  return (
    <>
      <section className="bg-gradient-to-b from-primary-50 to-white py-10 md:py-14">
        <div className="wrapper text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-600 mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Event
          </div>
          <h1 className="h2-bold text-gray-900">Bring Your Event to Life</h1>
          <p className="text-gray-500 mt-2 text-lg max-w-xl mx-auto">
            Fill in the details below to create and publish your event on Eventopia.
          </p>
        </div>
      </section>

      <div className="wrapper my-8">
        <EventForm userId={userId} type="Create" />
      </div>
    </>
  )
}
