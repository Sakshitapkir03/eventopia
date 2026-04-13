import { Schema, model, models } from 'mongoose'

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // 'waitlist_promoted' | 'event_updated' | 'event_cancelled' | 'review_received'
  message: { type: String, required: true },
  link: { type: String, default: '' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

NotificationSchema.index({ user: 1, read: 1, createdAt: -1 })

const Notification = models.Notification || model('Notification', NotificationSchema)
export default Notification
