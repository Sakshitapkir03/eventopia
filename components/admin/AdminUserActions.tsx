'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toggleBanUser } from '@/lib/actions/admin.actions'
import { ShieldOff, ShieldCheck, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Props = { targetClerkId: string; banned: boolean; adminClerkId: string }

export default function AdminUserActions({ targetClerkId, banned: initialBanned, adminClerkId }: Props) {
  const [banned, setBanned] = useState(initialBanned)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    const action = banned ? 'unban' : 'ban'
    if (!confirm(`Are you sure you want to ${action} this user?`)) return
    setLoading(true)
    try {
      await toggleBanUser(targetClerkId, adminClerkId)
      setBanned(b => !b)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size="sm" variant="outline"
      className={`rounded-full gap-1.5 text-xs ${banned ? 'border-green-200 text-green-700 hover:bg-green-50' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : banned ? (
        <ShieldCheck className="w-3 h-3" />
      ) : (
        <ShieldOff className="w-3 h-3" />
      )}
      {banned ? 'Unban' : 'Ban'}
    </Button>
  )
}
