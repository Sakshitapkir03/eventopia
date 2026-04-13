'use server'

import { connectToDatabase } from '@/lib/database'
import Category from '@/lib/database/models/category.model'
import { handleError } from '@/lib/utils'

const DEFAULT_CATEGORIES = [
  'Music', 'Technology', 'Sports', 'Food & Drink', 'Art',
  'Business', 'Health & Wellness', 'Education', 'Travel', 'Gaming', 'Other',
]

export const createCategory = async (categoryName: string) => {
  try {
    await connectToDatabase()
    const newCategory = await Category.create({ name: categoryName })
    return JSON.parse(JSON.stringify(newCategory))
  } catch (error) {
    handleError(error)
  }
}

export const getAllCategories = async () => {
  try {
    await connectToDatabase()
    let categories = await Category.find().sort({ name: 1 })
    if (categories.length === 0) {
      await Category.insertMany(DEFAULT_CATEGORIES.map((name) => ({ name })))
      categories = await Category.find().sort({ name: 1 })
    }
    return JSON.parse(JSON.stringify(categories))
  } catch (error) {
    handleError(error)
  }
}
