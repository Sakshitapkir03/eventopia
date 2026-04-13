import { Schema, model, models } from 'mongoose'

const UserSchema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: false, default: '' },
  photo: { type: String, required: true },
  savedEvents: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
  banned: { type: Boolean, default: false },
})

const User = models.User || model('User', UserSchema)

export default User
