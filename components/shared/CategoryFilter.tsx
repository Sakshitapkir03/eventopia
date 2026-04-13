'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAllCategories } from '@/lib/actions/category.actions'
import { formUrlQuery, removeKeysFromQuery } from '@/lib/utils'
import { CategoryItem } from '@/types'
import { useEffect, useState } from 'react'

export default function CategoryFilter() {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const getCategories = async () => {
      const categoryList = await getAllCategories()
      categoryList && setCategories(categoryList as CategoryItem[])
    }
    getCategories()
  }, [])

  const onSelectCategory = (category: string) => {
    let newUrl = ''

    if (category && category !== 'All') {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'category',
        value: category,
      })
    } else {
      newUrl = removeKeysFromQuery({
        params: searchParams.toString(),
        keysToRemove: ['category'],
      })
    }

    router.push(newUrl, { scroll: false })
  }

  return (
    <Select onValueChange={(value: string) => onSelectCategory(value)}>
      <SelectTrigger className="select-field min-h-[54px] rounded-full bg-gray-50 border-gray-200 px-5 focus:ring-primary-400">
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="All">All Categories</SelectItem>

        {categories.map((category) => (
          <SelectItem value={category.name} key={category._id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
