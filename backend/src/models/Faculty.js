import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subject: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  salary: { type: Number, default: 0 },
  experience: { type: String },
  qualification: { type: String },
  photo_url: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export const Faculty = mongoose.model('Faculty', schema);