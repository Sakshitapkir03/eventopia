# Eventopia — Setup Guide

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes (Node.js), MongoDB + Mongoose
- **Auth**: Clerk
- **Payments**: Stripe + Stripe Webhooks
- **Image Uploads**: UploadThing
- **Forms**: React Hook Form + Zod

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Copy `.env.example` to `.env.local` and fill in all values:
```bash
cp .env.example .env.local
```

#### Required services:
- **Clerk**: Create an app at https://clerk.com → get publishable & secret keys
- **MongoDB**: Create a cluster at https://mongodb.com/atlas
- **Stripe**: Create account at https://stripe.com → get test keys
- **UploadThing**: Create app at https://uploadthing.com

### 3. Configure Clerk Webhooks
1. Go to Clerk Dashboard → Webhooks → Add Endpoint
2. URL: `https://your-domain/api/webhook/clerk`
3. Events to listen: `user.created`, `user.updated`, `user.deleted`
4. Copy signing secret to `CLERK_WEBHOOK_SECRET`

### 4. Configure Stripe Webhooks
1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. For local dev: `stripe listen --forward-to localhost:3000/api/webhook/stripe`
3. For production: Add webhook endpoint in Stripe Dashboard
4. Event: `checkout.session.completed`
5. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 5. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure
```
eventopia/
├── app/
│   ├── (auth)/              # Clerk auth pages
│   ├── (root)/              # Main app pages
│   │   ├── page.tsx         # Home / event discovery
│   │   ├── events/
│   │   │   ├── create/      # Create event
│   │   │   └── [id]/        # Event details + update
│   │   ├── profile/         # User dashboard
│   │   └── orders/          # Order management
│   └── api/
│       ├── webhook/clerk/   # Sync Clerk users → MongoDB
│       ├── webhook/stripe/  # Confirm Stripe payments
│       └── uploadthing/     # Image upload handler
├── components/
│   ├── shared/              # App-specific components
│   └── ui/                  # Base UI components
├── lib/
│   ├── database/            # MongoDB connection + models
│   ├── actions/             # Server actions (CRUD)
│   ├── utils.ts
│   └── validator.ts
├── types/                   # TypeScript types
└── constants/               # App constants
```

## Key Features
- **Event CRUD**: Create, read, update, delete events with image uploads
- **Search & Filter**: Real-time search + category filter with debouncing
- **Stripe Checkout**: Secure payment flow with webhook validation
- **Clerk Auth**: Sign up/in, user sync via webhooks
- **Attendee Management**: View orders per event in Orders page
- **Mobile First**: Fully responsive with mobile navigation
- **Pagination**: Server-side pagination on all collection pages
