import { Schema, model, models } from 'mongoose'

const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  createdAt: { type: Date, default: Date.now },
  imageUrl: { type: String, required: true },
  startDateTime: { type: Date, default: Date.now },
  endDateTime: { type: Date, default: Date.now },
  price: { type: String },
  isFree: { type: Boolean, default: false },
  url: { type: String },
  capacity: { type: Number, default: null },
  isPrivate: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  inviteCode: { type: String, default: null },
  refundPolicy: { type: String, default: '' },
  agenda: [{ time: String, title: String, speaker: String }],
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  organizer: { type: Schema.Types.ObjectId, ref: 'User' },
})

// Indexes for performance at scale
EventSchema.index({ category: 1, createdAt: -1 })
EventSchema.index({ organizer: 1, createdAt: -1 })
EventSchema.index({ startDateTime: 1 })
EventSchema.index({ title: 'text', description: 'text' })

const Event = models.Event || model('Event', EventSchema)

export default Event
