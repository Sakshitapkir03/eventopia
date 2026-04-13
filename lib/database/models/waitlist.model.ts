import { Schema, model, models } from 'mongoose'

const WaitlistSchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  notified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

WaitlistSchema.index({ event: 1, createdAt: 1 })
WaitlistSchema.index({ event: 1, user: 1 }, { unique: true })

const Waitlist = models.Waitlist || model('Waitlist', WaitlistSchema)

export default Waitlist
