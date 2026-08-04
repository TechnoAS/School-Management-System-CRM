import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  duration: { type: String, required: true },
  fees: { type: Number, default: 0 },
  description: { type: String },
  status: { type: String, default: 'Active' },
  logo_url: { type: String },
  banner_url: { type: String },
  start_date: { type: Date },
  end_date: { type: Date },
  extra_data: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export const Course = mongoose.model('Course', schema);