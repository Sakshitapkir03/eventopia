import { Schema, model, models } from 'mongoose'

const ReportSchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  details: { type: String, default: '' },
  resolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

ReportSchema.index({ event: 1 })
ReportSchema.index({ event: 1, reporter: 1 }, { unique: true })

const Report = models.Report || model('Report', ReportSchema)
export default Report
