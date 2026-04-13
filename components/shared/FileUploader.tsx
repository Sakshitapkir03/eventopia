'use client'

import { useCallback, Dispatch, SetStateAction } from 'react'
import { UploadCloud } from 'lucide-react'
import { convertFileToUrl } from '@/lib/utils'

type FileUploaderProps = {
  onFieldChange: (url: string) => void
  imageUrl: string
  setFiles: Dispatch<SetStateAction<File[]>>
}

export function FileUploader({ imageUrl, onFieldChange, setFiles }: FileUploaderProps) {
  const onDrop = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        setFiles([file])
        onFieldChange(convertFileToUrl(file))
      }
    },
    [setFiles, onFieldChange]
  )

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith('image/')) {
        setFiles([file])
        onFieldChange(convertFileToUrl(file))
      }
    },
    [setFiles, onFieldChange]
  )

  return (
    <label
      htmlFor="image-upload"
      className="flex-center bg-dark-3 flex h-72 cursor-pointer flex-col overflow-hidden rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 hover:border-primary-400 hover:bg-primary-50/30 transition-all"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onDrop}
      />

      {imageUrl ? (
        <div className="flex h-full w-full flex-1 justify-center overflow-hidden">
          <img src={imageUrl} alt="event image" className="w-full object-cover object-center" />
        </div>
      ) : (
        <div className="flex-center flex-col py-5 text-gray-500 gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex-center">
            <UploadCloud className="w-6 h-6 text-primary-400" />
          </div>
          <p className="p-medium-12 mb-2 mt-2 text-center text-gray-500">
            <span className="text-primary-400 font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-400">SVG, PNG, JPG, GIF (max 4MB)</p>
        </div>
      )}
    </label>
  )
}
