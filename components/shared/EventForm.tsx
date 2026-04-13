'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useUploadThing } from '@/lib/uploadthing'
import { eventFormSchema } from '@/lib/validator'
import { eventDefaultValues } from '@/constants'
import { createEvent, updateEvent } from '@/lib/actions/event.actions'
import { FileUploader } from './FileUploader'
import Dropdown from './Dropdown'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MapPin, Link as LinkIcon, Calendar, DollarSign, Image as ImageIcon, Users, Lock, ShieldCheck, ListOrdered, Plus, Trash2 } from 'lucide-react'

type EventFormProps = {
  userId: string
  type: 'Create' | 'Update'
  event?: z.infer<typeof eventFormSchema> & { _id: string }
  eventId?: string
}

const toDatetimeLocal = (date: Date) => {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export default function EventForm({ userId, type, event, eventId }: EventFormProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [useUrlInput, setUseUrlInput] = useState(true)
  const [uploadError, setUploadError] = useState('')
  const router = useRouter()

  const { startUpload, isUploading } = useUploadThing('imageUploader')

  const initialValues =
    event && type === 'Update'
      ? { ...event, startDateTime: new Date(event.startDateTime), endDateTime: new Date(event.endDateTime) }
      : eventDefaultValues

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: initialValues as any,
  })

  const isFree = watch('isFree')
  const imageUrl = watch('imageUrl')
  const isPrivate = watch('isPrivate')
  const agenda = watch('agenda') || []

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    setIsSubmitting(true)
    setUploadError('')

    let uploadedImageUrl = values.imageUrl

    // Try to upload file if one was selected
    if (files.length > 0) {
      try {
        const uploaded = await startUpload(files)
        if (uploaded && uploaded[0]) {
          uploadedImageUrl = uploaded[0].url
        } else {
          // Fall back to blob URL — image will show during session
          uploadedImageUrl = values.imageUrl
        }
      } catch (err) {
        // Upload failed — use placeholder or blob
        uploadedImageUrl = values.imageUrl || 'https://placehold.co/800x400/818CF8/white?text=Event'
      }
    }

    // If still no image, use placeholder
    if (!uploadedImageUrl) {
      uploadedImageUrl = 'https://placehold.co/800x400/818CF8/white?text=Event'
    }

    try {
      if (type === 'Create') {
        const newEvent = await createEvent({
          event: { ...values, imageUrl: uploadedImageUrl },
          userId,
          path: '/profile',
        })
        if (newEvent) router.push(`/events/${newEvent._id}`)
      }

      if (type === 'Update') {
        if (!eventId) { router.back(); return }
        const updatedEvent = await updateEvent({
          userId,
          event: { ...values, imageUrl: uploadedImageUrl, _id: eventId },
          path: `/events/${eventId}`,
        })
        if (updatedEvent) router.push(`/events/${updatedEvent._id}`)
      }
    } catch (error: any) {
      console.error('Event creation error:', error)
      setUploadError(error?.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

      {/* Title + Category */}
      <div className="flex flex-col gap-5 md:flex-row">
        <div className="w-full">
          <Label className="text-gray-700 font-medium mb-1.5 block">Event Title *</Label>
          <Input {...register('title')} placeholder="Event name" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>
        <div className="w-full">
          <Label className="text-gray-700 font-medium mb-1.5 block">Category *</Label>
          <Dropdown onChangeHandler={(val) => setValue('categoryId', val)} value={watch('categoryId')} />
          {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
        </div>
      </div>

      {/* Description + Image */}
      <div className="flex flex-col gap-5 md:flex-row">
        <div className="flex flex-col gap-2 md:w-1/2">
          <Label className="text-gray-700 font-medium mb-1.5 block">Description *</Label>
          <Textarea {...register('description')} placeholder="What is this event about?" className="h-72 resize-none" />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div className="flex flex-col gap-2 md:w-1/2">
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-gray-700 font-medium">Event Image *</Label>
            <button
              type="button"
              onClick={() => { setUseUrlInput(!useUrlInput); setValue('imageUrl', '') }}
              className="text-xs text-primary-400 hover:underline"
            >
              {useUrlInput ? 'Upload file instead' : 'Paste URL instead'}
            </button>
          </div>

          {useUrlInput ? (
            <div>
              <div className="flex items-center h-[54px] w-full rounded-xl bg-gray-50 border border-gray-200 px-4 focus-within:ring-2 focus-within:ring-primary-400 transition-all">
                <ImageIcon className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                <Input
                  {...register('imageUrl')}
                  placeholder="https://example.com/image.jpg"
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              {imageUrl && (
                <img src={imageUrl} alt="preview" className="mt-2 h-40 w-full object-cover rounded-xl" onError={(e) => (e.currentTarget.style.display = 'none')} />
              )}
            </div>
          ) : (
            <FileUploader onFieldChange={(url) => setValue('imageUrl', url)} imageUrl={imageUrl} setFiles={setFiles} />
          )}
          {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>}
        </div>
      </div>

      {/* Location */}
      <div>
        <Label className="text-gray-700 font-medium mb-1.5 block">Location *</Label>
        <div className="flex items-center h-[54px] w-full rounded-full bg-gray-50 border border-gray-200 px-4 focus-within:ring-2 focus-within:ring-primary-400 transition-all">
          <MapPin className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
          <Input {...register('location')} placeholder="Event location or Online" className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0" />
        </div>
        {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
      </div>

      {/* Dates */}
      <div className="flex flex-col gap-5 md:flex-row">
        <div className="w-full">
          <Label className="text-gray-700 font-medium mb-1.5 block">Start Date & Time *</Label>
          <div className="flex items-center h-[54px] w-full rounded-full bg-gray-50 border border-gray-200 px-4 focus-within:ring-2 focus-within:ring-primary-400 transition-all">
            <Calendar className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
            <input
              type="datetime-local"
              defaultValue={toDatetimeLocal(initialValues.startDateTime as Date)}
              onChange={(e) => setValue('startDateTime', new Date(e.target.value))}
              className="bg-transparent text-sm w-full outline-none text-gray-700"
            />
          </div>
        </div>
        <div className="w-full">
          <Label className="text-gray-700 font-medium mb-1.5 block">End Date & Time *</Label>
          <div className="flex items-center h-[54px] w-full rounded-full bg-gray-50 border border-gray-200 px-4 focus-within:ring-2 focus-within:ring-primary-400 transition-all">
            <Calendar className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
            <input
              type="datetime-local"
              defaultValue={toDatetimeLocal(initialValues.endDateTime as Date)}
              onChange={(e) => setValue('endDateTime', new Date(e.target.value))}
              className="bg-transparent text-sm w-full outline-none text-gray-700"
            />
          </div>
          {errors.endDateTime && <p className="text-red-500 text-xs mt-1">{errors.endDateTime.message}</p>}
        </div>
      </div>

      {/* Price + URL */}
      <div className="flex flex-col gap-5 md:flex-row">
        <div className="w-full">
          <Label className="text-gray-700 font-medium mb-1.5 block">Price</Label>
          <div className="flex items-center h-[54px] w-full rounded-full bg-gray-50 border border-gray-200 px-4 focus-within:ring-2 focus-within:ring-primary-400 transition-all">
            <DollarSign className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
            <Input type="number" {...register('price')} placeholder="Price" disabled={isFree} className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0" />
            <div className="flex items-center gap-2 ml-auto flex-shrink-0">
              <input type="checkbox" id="isFree" checked={isFree} onChange={(e) => setValue('isFree', e.target.checked)} className="w-4 h-4 accent-primary-400" />
              <label htmlFor="isFree" className="whitespace-nowrap text-sm font-medium text-gray-700 cursor-pointer">Free Event</label>
            </div>
          </div>
        </div>
        <div className="w-full">
          <Label className="text-gray-700 font-medium mb-1.5 block">Event URL <span className="text-gray-400 font-normal">(optional)</span></Label>
          <div className="flex items-center h-[54px] w-full rounded-full bg-gray-50 border border-gray-200 px-4 focus-within:ring-2 focus-within:ring-primary-400 transition-all">
            <LinkIcon className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
            <Input {...register('url')} placeholder="https://event-website.com" className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0" />
          </div>
          {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url.message}</p>}
        </div>
      </div>

      {/* Capacity */}
      <div className="w-full md:w-1/2">
        <Label className="text-gray-700 font-medium mb-1.5 block">Max Capacity <span className="text-gray-400 font-normal">(optional)</span></Label>
        <div className="flex items-center h-[54px] w-full rounded-full bg-gray-50 border border-gray-200 px-4 focus-within:ring-2 focus-within:ring-primary-400 transition-all">
          <Users className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
          <Input
            type="number"
            min="1"
            {...register('capacity')}
            placeholder="e.g. 200 (leave blank for unlimited)"
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </div>

      {/* Private Event */}
      <div className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">Private Event</p>
            <p className="text-xs text-gray-400">Only accessible via invite link</p>
          </div>
        </div>
        <input
          type="checkbox"
          checked={isPrivate || false}
          onChange={(e) => setValue('isPrivate', e.target.checked)}
          className="w-4 h-4 accent-primary-400"
        />
      </div>

      {/* Refund Policy */}
      <div>
        <Label className="text-gray-700 font-medium mb-1.5 block">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            Refund Policy <span className="text-gray-400 font-normal">(optional)</span>
          </span>
        </Label>
        <Input
          {...register('refundPolicy')}
          placeholder="e.g. Full refund up to 48 hours before the event"
          className="rounded-xl"
        />
      </div>

      {/* Agenda */}
      <div>
        <Label className="text-gray-700 font-medium mb-2 block">
          <span className="flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-primary-400" />
            Event Agenda <span className="text-gray-400 font-normal">(optional)</span>
          </span>
        </Label>
        <div className="flex flex-col gap-2">
          {agenda.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input
                value={item.time}
                onChange={(e) => {
                  const updated = [...agenda]
                  updated[i] = { ...updated[i], time: e.target.value }
                  setValue('agenda', updated)
                }}
                placeholder="9:00 AM"
                className="w-28 flex-shrink-0 rounded-xl text-sm"
              />
              <Input
                value={item.title}
                onChange={(e) => {
                  const updated = [...agenda]
                  updated[i] = { ...updated[i], title: e.target.value }
                  setValue('agenda', updated)
                }}
                placeholder="Session title"
                className="flex-1 rounded-xl text-sm"
              />
              <Input
                value={item.speaker}
                onChange={(e) => {
                  const updated = [...agenda]
                  updated[i] = { ...updated[i], speaker: e.target.value }
                  setValue('agenda', updated)
                }}
                placeholder="Speaker (optional)"
                className="flex-1 rounded-xl text-sm"
              />
              <button
                type="button"
                onClick={() => setValue('agenda', agenda.filter((_, j) => j !== i))}
                className="text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setValue('agenda', [...agenda, { time: '', title: '', speaker: '' }])}
            className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-500 font-medium mt-1"
          >
            <Plus className="w-4 h-4" /> Add agenda item
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {uploadError}
        </div>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting || isUploading} className="w-full rounded-full">
        {isSubmitting || isUploading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {isUploading ? 'Uploading image...' : type === 'Create' ? 'Creating...' : 'Updating...'}
          </span>
        ) : `${type} Event`}
      </Button>
    </form>
  )
}
