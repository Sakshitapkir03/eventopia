export const metadata = { title: 'Support — Eventopia' }

export default function SupportPage() {
  return (
    <div className="wrapper max-w-3xl mx-auto py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Support</h1>
      <p className="text-gray-500 mb-10">We're here to help. Find answers below or reach out directly.</p>

      <div className="space-y-8">

        {/* Contact */}
        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Contact Us</h2>
          <p className="text-gray-600 text-sm mb-3">For account issues, payment problems, or anything else — email us and we'll get back to you within 24 hours.</p>
          <a
            href="mailto:support@eventopia.app"
            className="inline-block bg-primary-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-primary-600 transition-colors"
          >
            support@eventopia.app
          </a>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Frequently Asked Questions</h2>

          <div className="space-y-4">

            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-1">How do I buy a ticket?</h3>
              <p className="text-sm text-gray-600">Browse events on the homepage, click on an event, and click "Get Tickets". You'll be taken to a secure Stripe checkout. After payment, a ticket confirmation with QR code will be emailed to you.</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-1">How do I get a refund?</h3>
              <p className="text-sm text-gray-600">Go to your ticket page and click "Cancel Ticket" if the event hasn't started yet and the organizer allows refunds. The refund will be returned to your original payment method within 5–10 business days.</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-1">I didn't receive my ticket email. What should I do?</h3>
              <p className="text-sm text-gray-600">Check your spam folder first. If it's not there, go to your Profile → My Tickets to view and download your ticket. Still having trouble? Email us at support@eventopia.app.</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-1">How do I create an event?</h3>
              <p className="text-sm text-gray-600">Sign in and click "Create Event" in the navigation. Fill in the event details, set a price (or mark it free), upload an image, and publish. Your event will appear on the homepage immediately.</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-1">Can I attend an event I organised?</h3>
              <p className="text-sm text-gray-600">Organizers cannot buy tickets to their own events. You can manage your event from the event page or your Profile. You can however attend events organised by other people using the same account.</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-1">What payment methods are accepted?</h3>
              <p className="text-sm text-gray-600">We accept all major credit and debit cards (Visa, Mastercard, American Express) via Stripe. Your card details are never stored on our servers.</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-1">How do I report an event?</h3>
              <p className="text-sm text-gray-600">On any event page, scroll down and click "Report Event". Select a reason and add details. Our admin team will review the report within 48 hours.</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-1">The event is sold out. Can I still register?</h3>
              <p className="text-sm text-gray-600">Yes — click "Join Waitlist" on the event page. If a ticket becomes available (due to a cancellation), you'll be automatically notified by email and can purchase the ticket.</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
