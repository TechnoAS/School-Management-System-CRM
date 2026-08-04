import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Using string for UUID
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff', 'faculty', 'super_admin'], default: 'staff' },
  phone: { type: String },
  photo_url: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const User = mongoose.model('User', schema);