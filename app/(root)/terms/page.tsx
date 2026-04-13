export const metadata = { title: 'Terms of Service — Eventopia' }

export default function TermsPage() {
  return (
    <div className="wrapper max-w-3xl mx-auto py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: April 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Acceptance of Terms</h2>
          <p>By accessing or using Eventopia, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Use of the Platform</h2>
          <p>You agree to use Eventopia only for lawful purposes. You must not:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Create fraudulent or misleading events.</li>
            <li>Use the platform to harass, abuse, or harm other users.</li>
            <li>Attempt to gain unauthorized access to any part of the platform.</li>
            <li>Use automated tools to scrape or abuse the platform.</li>
            <li>Violate any applicable laws or regulations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately if you suspect unauthorized access to your account. Eventopia reserves the right to suspend or terminate accounts that violate these terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Events and Tickets</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Organizers are solely responsible for the accuracy of event information, including date, time, location, and pricing.</li>
            <li>Eventopia is not responsible for cancelled, postponed, or misrepresented events.</li>
            <li>Ticket purchases are subject to the refund policy set by the individual organizer.</li>
            <li>Eventopia may remove events that violate these terms without notice.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Payments and Refunds</h2>
          <p>All payments are processed securely via Stripe. By making a purchase you agree to Stripe's terms of service. Refunds are handled according to the organizer's stated refund policy. Eventopia does not guarantee refunds beyond what the organizer has committed to.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Intellectual Property</h2>
          <p>All content on Eventopia — including logos, design, and code — is the property of Eventopia. Event content (descriptions, images) remains the property of the respective organizers. By posting content on Eventopia, you grant us a non-exclusive license to display it on the platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Limitation of Liability</h2>
          <p>Eventopia is provided "as is" without warranties of any kind. To the maximum extent permitted by law, Eventopia shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Termination</h2>
          <p>We reserve the right to suspend or terminate your access to Eventopia at any time, with or without notice, for conduct that we believe violates these Terms or is harmful to other users, the platform, or third parties.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Changes to Terms</h2>
          <p>We may update these Terms from time to time. Continued use of the platform after changes are posted constitutes acceptance of the new terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">10. Contact</h2>
          <p>For questions about these Terms, contact us at <a href="mailto:support@eventopia.app" className="text-primary-500 hover:underline">support@eventopia.app</a>.</p>
        </section>

      </div>
    </div>
  )
}
