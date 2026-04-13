'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminCreateCategory, adminDeleteCategory } from '@/lib/actions/admin.actions'
import { Trash2, Plus, Loader2, Tag } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Category = { _id: string; name: string }
type Props = { categories: Category[]; adminClerkId: string }

export default function CategoryManager({ categories: initial, adminClerkId }: Props) {
  const [categories, setCategories] = useState(initial)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setCreating(true)
    try {
      const created = await adminCreateCategory(name, adminClerkId)
      setCategories(c => [...c, created])
      setNewName('')
      router.refresh()
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Events using it will lose their category.`)) return
    setDeletingId(id)
    try {
      await adminDeleteCategory(id, adminClerkId)
      setCategories(c => c.filter(cat => cat._id !== id))
      router.refresh()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <form onSubmit={handleCreate} className="flex gap-3 mb-6">
        <Input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="New category name..."
          className="rounded-full text-sm"
        />
        <Button type="submit" disabled={creating || !newName.trim()} className="rounded-full gap-1.5 whitespace-nowrap">
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add Category
        </Button>
      </form>

      {categories.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Tag className="w-8 h-8 mx-auto mb-2" />
          <p>No categories yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {categories.map(cat => (
            <div key={cat._id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-800">{cat.name}</span>
              </div>
              <Button
                size="sm" variant="ghost"
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                onClick={() => handleDelete(cat._id, cat.name)}
                disabled={deletingId === cat._id}
              >
                {deletingId === cat._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
