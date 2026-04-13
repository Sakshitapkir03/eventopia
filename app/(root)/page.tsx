export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Collection from '@/components/shared/Collection'
import Search from '@/components/shared/Search'
import CategoryFilter from '@/components/shared/CategoryFilter'
import EventFilters from '@/components/shared/EventFilters'
import CreateEventCTA from '@/components/shared/CreateEventCTA'
import { getAllEvents } from '@/lib/actions/event.actions'
import { SearchParamProps } from '@/types'
import { ArrowRight, Sparkles, Globe, Shield } from 'lucide-react'

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams
  const page = Number(resolvedSearchParams?.page) || 1
  const searchText = (resolvedSearchParams?.query as string) || ''
  const category = (resolvedSearchParams?.category as string) || ''
  const dateFilter = (resolvedSearchParams?.date as string) || ''
  const priceFilter = (resolvedSearchParams?.price as string) || ''

  const events = await getAllEvents({
    query: searchText,
    category,
    page,
    limit: 6,
    dateFilter,
    priceFilter,
  })

  return (
    <>
      {/* Hero Section */}
      <section className="bg-hero-gradient relative overflow-hidden py-20 md:py-28">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(129,140,248,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(129,140,248,0.05)_1px,transparent_1px)] bg-[size:64px_64px]" />

        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-400/10 rounded-full blur-3xl" />

        <div className="wrapper relative flex flex-col gap-8 items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-400/30 bg-primary-400/10 px-4 py-1.5 text-sm text-primary-400 font-medium animate-fade-in">
            <Sparkles className="w-4 h-4" />
            The Global Event Platform
          </div>

          {/* Headline */}
          <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl text-white max-w-3xl leading-tight animate-fade-in">
            Host, Connect,{' '}
            <span className="text-primary-400">Celebrate.</span>
            <br />
            Life is better with events.
          </h1>

          <p className="max-w-xl text-gray-300 text-lg md:text-xl animate-fade-in">
            Discover thousands of events happening around you. Create, manage, and sell tickets — all in one place.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
            <Button size="lg" asChild className="rounded-full text-base px-8 bg-primary-400 hover:bg-primary-500 shadow-lg shadow-primary-400/25">
              <Link href="#events">
                Explore Events
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <CreateEventCTA />
          </div>

          {/* Stats */}
          <div className="flex gap-10 mt-4 animate-fade-in">
            {[
              { value: '10K+', label: 'Events' },
              { value: '500K+', label: 'Attendees' },
              { value: '150+', label: 'Countries' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-b border-gray-100 py-6">
        <div className="wrapper flex flex-col sm:flex-row justify-center gap-8 sm:gap-16">
          {[
            { icon: Shield, text: 'Secure Payments with Stripe' },
            { icon: Globe, text: 'Global Event Discovery' },
            { icon: Sparkles, text: 'Instant Ticket Delivery' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-gray-600">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary-400" />
              </div>
              <span className="text-sm font-medium">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="wrapper my-8 flex flex-col gap-8 md:gap-12">
        <div className="text-center">
          <h2 className="font-bold text-3xl md:text-4xl text-gray-900">
            Discover <span className="text-primary-400">Events</span>
          </h2>
          <p className="text-gray-500 mt-2">Find the perfect event near you</p>
        </div>

        {/* Filters */}
        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full flex-col gap-5 md:flex-row">
            <Search />
            <CategoryFilter />
          </div>
          <EventFilters />
        </div>

        <Collection
          data={events?.data || []}
          emptyTitle="No Events Found"
          emptyStateSubtext="Come back later or create your own event!"
          collectionType="All_Events"
          limit={6}
          page={page}
          totalPages={events?.totalPages}
        />
      </section>
    </>
  )
}
