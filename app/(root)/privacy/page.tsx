export const metadata = { title: 'Privacy Policy — Eventopia' }

export default function PrivacyPage() {
  return (
    <div className="wrapper max-w-3xl mx-auto py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: April 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Information We Collect</h2>
          <p>When you use Eventopia, we collect the following information:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Account information</strong> — name, email address, and profile photo provided during sign-up via Clerk.</li>
            <li><strong>Event data</strong> — events you create, tickets you purchase, and events you save or review.</li>
            <li><strong>Payment information</strong> — processed securely by Stripe. We never store your card number, CVV, or full payment details on our servers.</li>
            <li><strong>Usage data</strong> — pages visited, actions taken, and device/browser information for analytics and debugging.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To process ticket purchases and send confirmation emails.</li>
            <li>To send event reminder emails 24 hours before events you have registered for.</li>
            <li>To notify you when a waitlist spot becomes available.</li>
            <li>To display your profile and activity within the platform.</li>
            <li>To detect and prevent fraud, abuse, or violations of our Terms of Service.</li>
            <li>To improve the platform based on usage patterns.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">3. How We Share Your Information</h2>
          <p>We do not sell your personal information. We share data only with:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Clerk</strong> — handles authentication and identity management.</li>
            <li><strong>Stripe</strong> — processes all payments securely. Subject to Stripe's own privacy policy.</li>
            <li><strong>Resend</strong> — used to deliver transactional emails.</li>
            <li><strong>MongoDB Atlas</strong> — hosts our database on secure, encrypted infrastructure.</li>
            <li><strong>Vercel</strong> — hosts the application and processes server requests.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Data Retention</h2>
          <p>We retain your account and event data for as long as your account is active. If you delete your account, your personal data is removed within 30 days, except where retention is required by law (e.g. financial records).</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your account and associated data.</li>
            <li>Opt out of non-essential communications.</li>
          </ul>
          <p className="mt-2">To exercise these rights, contact us at <a href="mailto:support@eventopia.app" className="text-primary-500 hover:underline">support@eventopia.app</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Cookies</h2>
          <p>Eventopia uses essential cookies for authentication (managed by Clerk). We do not use advertising or tracking cookies.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Security</h2>
          <p>We implement industry-standard security measures including HTTPS encryption, secure authentication via Clerk, and payment processing via Stripe (PCI-DSS compliant). Card data never touches our servers.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Changes to This Policy</h2>
          <p>We may update this policy from time to time. We will notify you of significant changes via email or an in-app notification.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Contact</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@eventopia.app" className="text-primary-500 hover:underline">support@eventopia.app</a>.</p>
        </section>

      </div>
    </div>
  )
}
