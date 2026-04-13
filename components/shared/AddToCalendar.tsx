'use client'

import { CalendarPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  title: string
  description: string
  location: string
  startDateTime: string | Date
  endDateTime: string | Date
}

function formatICSDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function escapeICS(str: string) {
  return (str || '').replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n')
}

export default function AddToCalendar({ title, description, location, startDateTime, endDateTime }: Props) {
  const download = () => {
    const start = new Date(startDateTime)
    const end = new Date(endDateTime)
    const uid = `${Date.now()}@eventopia`

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Eventopia//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(start)}`,
      `DTEND:${formatICSDate(end)}`,
      `SUMMARY:${escapeICS(title)}`,
      `DESCRIPTION:${escapeICS(description)}`,
      `LOCATION:${escapeICS(location)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([ics], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '-')}.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" className="rounded-full gap-2" onClick={download} size="sm">
      <CalendarPlus className="w-4 h-4" />
      Add to Calendar
    </Button>
  )
}
