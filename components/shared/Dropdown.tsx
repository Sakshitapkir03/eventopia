'use client'

import { startTransition, useEffect, useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Plus } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createCategory, getAllCategories } from '@/lib/actions/category.actions'
import { CategoryItem } from '@/types'

type DropdownProps = {
  value?: string
  onChangeHandler?: (value: string) => void
}

export default function Dropdown({ value, onChangeHandler }: DropdownProps) {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleAddCategory = () => {
    createCategory(newCategory.trim()).then((category) => {
      setCategories((prevState) => [...prevState, category])
      setDialogOpen(false)
      setNewCategory('')
    })
  }

  useEffect(() => {
    const getCategories = async () => {
      const categoryList = await getAllCategories()
      categoryList && setCategories(categoryList as CategoryItem[])
    }
    getCategories()
  }, [])

  return (
    <Select onValueChange={onChangeHandler} defaultValue={value}>
      <SelectTrigger className="select-field w-full">
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent>
        {categories.length > 0 &&
          categories.map((category) => (
            <SelectItem
              key={category._id}
              value={category._id}
              className="select-item p-regular-14"
            >
              {category.name}
            </SelectItem>
          ))}

        <DialogPrimitive.Root open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogPrimitive.Trigger asChild>
            <button className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-primary-400 hover:bg-primary-50 transition-colors">
              <Plus className="w-4 h-4" />
              Add new category
            </button>
          </DialogPrimitive.Trigger>

          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
            <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
              <DialogPrimitive.Title className="text-lg font-semibold mb-4 text-gray-900">
                New Category
              </DialogPrimitive.Title>
              <Input
                type="text"
                placeholder="Category name"
                className="mb-4"
                onChange={(e) => setNewCategory(e.target.value)}
                value={newCategory}
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => startTransition(handleAddCategory)}
                  className="flex-1"
                  disabled={!newCategory.trim()}
                >
                  Add Category
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </SelectContent>
    </Select>
  )
}
