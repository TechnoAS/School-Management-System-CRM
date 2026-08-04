import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  token_hash: { type: String, required: true, unique: true },
  expires_at: { type: Date, required: true },
  revoked_at: { type: Date },
  ip_address: { type: String },
  user_agent: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: false }, toJSON: { virtuals: true }, toObject: { virtuals: true } });

schema.virtual('user', { ref: 'User', localField: 'user_id', foreignField: 'id', justOne: true });

export const RefreshToken = mongoose.model('RefreshToken', schema);