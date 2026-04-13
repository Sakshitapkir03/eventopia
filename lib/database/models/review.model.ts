import { Schema, model, models } from 'mongoose'

const ReviewSchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 500, default: '' },
  createdAt: { type: Date, default: Date.now },
})

ReviewSchema.index({ event: 1, createdAt: -1 })
ReviewSchema.index({ event: 1, reviewer: 1 }, { unique: true })

const Review = models.Review || model('Review', ReviewSchema)

export default Review
