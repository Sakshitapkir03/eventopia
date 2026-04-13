import { MetadataRoute } from 'next'
import { connectToDatabase } from '@/lib/database'
import Event from '@/lib/database/models/event.model'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

  try {
    await connectToDatabase()
    const events = await Event.find(
      { isPrivate: { $ne: true }, endDateTime: { $gte: new Date() } },
      '_id createdAt'
    ).limit(5000)

    const eventUrls: MetadataRoute.Sitemap = events.map((e: any) => ({
      url: `${base}/events/${e._id}`,
      lastModified: e.createdAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    return [
      { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
      { url: `${base}/events/create`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
      { url: `${base}/profile`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
      ...eventUrls,
    ]
  } catch {
    return [{ url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 }]
  }
}
