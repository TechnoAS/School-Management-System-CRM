import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  user_id: { type: String },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  is_read: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: false }, toJSON: { virtuals: true }, toObject: { virtuals: true } });

schema.virtual('user', { ref: 'User', localField: 'user_id', foreignField: 'id', justOne: true });

export const Notification = mongoose.model('Notification', schema);