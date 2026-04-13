# Eventopia

A full-featured event management platform built with Next.js, MongoDB, Stripe, and Clerk. Create events, sell tickets, manage attendees, and grow your audience — all in one place.

**Live:** [eventopia-iota-one.vercel.app](https://eventopia-iota-one.vercel.app)

---

## Features

### For Attendees
- Browse and search events with date and price filters
- Buy tickets with Stripe (test card: `4242 4242 4242 4242`)
- Receive ticket confirmation emails with QR codes
- Add events to calendar (.ics download)
- Join waitlist for sold-out events
- Save/bookmark events
- Leave reviews and ratings after attending
- Request refunds before the event starts
- Report inappropriate events
- In-app notifications

### For Organizers
- Create, edit, duplicate, and delete events
- Set ticket capacity, pricing, and refund policy
- Add event agenda with time slots and speakers
- Private events with invite-only access
- Track ticket sales, revenue, and check-ins
- Revenue chart and organizer analytics dashboard
- Export attendee list as CSV
- Check in attendees via QR code

### For Admins
- Dashboard with platform-wide stats
- Manage all events (feature/unfeature, delete)
- Manage all users (ban/unban)
- Manage event categories
- Review and resolve user-submitted reports

### Platform
- Daily email reminders sent 24h before events (Vercel Cron)
- Waitlist promotion emails when spots open
- PWA support (installable on mobile)
- SEO sitemap and Open Graph tags
- Fully responsive design

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Auth | Clerk |
| Database | MongoDB Atlas + Mongoose |
| Payments | Stripe |
| Email | Resend |
| Image Uploads | UploadThing |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Sakshitapkir03/eventopia.git
cd eventopia
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [clerk.com](https://clerk.com) → API Keys |
| `CLERK_SECRET_KEY` | [clerk.com](https://clerk.com) → API Keys |
| `CLERK_WEBHOOK_SECRET` | Clerk Dashboard → Webhooks |
| `MONGODB_URI` | [mongodb.com/atlas](https://mongodb.com/atlas) → Connect |
| `UPLOADTHING_TOKEN` | [uploadthing.com](https://uploadthing.com) → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | [stripe.com](https://stripe.com) → Developers → API Keys |
| `STRIPE_SECRET_KEY` | [stripe.com](https://stripe.com) → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys |
| `NEXT_PUBLIC_SERVER_URL` | `http://localhost:3000` (dev) or your Vercel URL |
| `ADMIN_USER_IDS` | Your Clerk user ID (find it in Clerk Dashboard → Users) |
| `CRON_SECRET` | Any strong random string |

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Set up webhooks locally (optional)

For Stripe webhooks during local development:

```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

---

## Deployment

The app is deployed on Vercel with automatic deployments on every push to `main`.

**Required setup after deploying:**
1. Add all environment variables in Vercel → Settings → Environment Variables
2. Set `NEXT_PUBLIC_SERVER_URL` to your Vercel domain
3. Allow all IPs in MongoDB Atlas → Network Access (`0.0.0.0/0`)
4. Update Clerk webhook URL to `https://your-domain.vercel.app/api/webhook/clerk`
5. Create a Stripe webhook for `checkout.session.completed` pointing to `https://your-domain.vercel.app/api/webhook/stripe`

**Cron job:** The reminder email cron runs daily at 9 AM UTC via `vercel.json`. It is protected by the `CRON_SECRET` environment variable.

---

## Project Structure

```
eventopia/
├── app/
│   ├── (admin)/          # Admin panel pages
│   ├── (auth)/           # Sign in / Sign up
│   ├── (root)/           # Main app pages
│   └── api/              # API routes (webhooks, cron, export)
├── components/
│   ├── admin/            # Admin-only components
│   ├── shared/           # Shared components
│   └── ui/               # shadcn/ui base components
├── lib/
│   ├── actions/          # Server actions
│   ├── database/         # Mongoose models
│   └── utils/            # Utility functions
├── types/                # TypeScript types
└── constants/            # App-wide constants
```

---

## Admin Access

To grant admin access, add the user's Clerk ID to `ADMIN_USER_IDS` in your environment variables (comma-separated for multiple admins):

```
ADMIN_USER_IDS=user_abc123,user_def456
```

Admins can access the panel at `/admin`.

---

## Future Enhancements

### Stripe SMS OTP for Payment Security
Stripe supports SMS-based one-time passwords (OTP) for verifying high-value transactions. This can be implemented using **Stripe Radar** rules combined with **3D Secure (3DS)** authentication:
- Trigger 3DS challenges for transactions above a set threshold
- Stripe automatically sends an OTP to the cardholder's registered phone via their bank
- Reduces fraud and chargebacks significantly
- Implementation: set `payment_method_options.card.request_three_d_secure: 'automatic'` in the Stripe checkout session

### Payment Security Best Practices
The following can be implemented to further protect card and payment information:

- **Stripe Radar** — AI-powered fraud detection built into Stripe. Add custom rules (e.g. block cards from high-risk countries, flag unusual purchase patterns)
- **3D Secure (3DS2)** — Adds an extra authentication step (OTP via SMS/app) for card payments, shifting fraud liability to the card issuer
- **Rate limiting on checkout** — Prevent brute-force card testing attacks by limiting checkout attempts per IP per hour (e.g. using Upstash Redis + `@upstash/ratelimit`)
- **Idempotency keys** — Already partially handled by Stripe sessions, but adding explicit idempotency keys prevents duplicate charges on network retries
- **Webhook signature verification** — Already implemented (`stripe.webhooks.constructEvent`), ensuring only genuine Stripe events are processed
- **PCI compliance** — Never log or store raw card data. Stripe Elements (used in this app) ensures card data never touches your server, keeping you out of PCI scope
- **HTTPS only** — Enforced by Vercel on all deployments
- **Content Security Policy (CSP)** — Add CSP headers in `next.config.mjs` to prevent XSS attacks that could intercept payment forms

### Other Planned Features
- **Social login** — Google/Apple sign-in via Clerk (one config toggle)
- **Event co-organizers** — Allow multiple organizers to manage one event
- **Recurring events** — Weekly/monthly event series with a single setup
- **Promo codes & discounts** — Stripe coupon integration
- **Embeddable ticket widget** — Let organizers embed a checkout button on their own website
- **Mobile app** — React Native app sharing the same API layer
- **Multi-currency support** — Stripe supports 135+ currencies

---

## License

MIT
