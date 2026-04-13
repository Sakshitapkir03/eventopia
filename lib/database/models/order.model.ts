import { Schema, model, models } from 'mongoose'

const OrderSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  stripeId: { type: String, required: true, unique: true },
  totalAmount: { type: String },
  status: {
    type: String,
    enum: ['active', 'refunded', 'checked_in'],
    default: 'active',
  },
  event: { type: Schema.Types.ObjectId, ref: 'Event' },
  buyer: { type: Schema.Types.ObjectId, ref: 'User' },
})

// Indexes for performance at scale
OrderSchema.index({ event: 1 })
OrderSchema.index({ buyer: 1 })
OrderSchema.index({ event: 1, status: 1 })

const Order = models.Order || model('Order', OrderSchema)

export default Order
