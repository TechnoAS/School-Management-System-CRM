import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  email: { type: String, required: true },
  ip_address: { type: String, required: true },
  succeeded: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'attempted_at', updatedAt: false } });

export const LoginAttempt = mongoose.model('LoginAttempt', schema);