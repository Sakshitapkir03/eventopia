'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

type Props = { startDateTime: string | Date }

function calcDiff(target: Date) {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

export default function EventCountdown({ startDateTime }: Props) {
  const target = new Date(startDateTime)
  const [timeLeft, setTimeLeft] = useState(calcDiff(target))

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcDiff(target)), 1000)
    return () => clearInterval(id)
  }, [])

  if (!timeLeft) return null

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Mins', value: timeLeft.minutes },
    { label: 'Secs', value: timeLeft.seconds },
  ]

  return (
    <div className="flex items-center gap-3 bg-primary-50 border border-primary-100 rounded-xl px-4 py-3">
      <Clock className="w-4 h-4 text-primary-400 flex-shrink-0" />
      <div className="flex items-center gap-2">
        {units.map(({ label, value }, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className="text-center">
              <span className="text-lg font-bold text-primary-600 tabular-nums">
                {String(value).padStart(2, '0')}
              </span>
              <p className="text-xs text-gray-400 leading-none">{label}</p>
            </div>
            {i < units.length - 1 && <span className="text-primary-300 font-bold mb-3">:</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
