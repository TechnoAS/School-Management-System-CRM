import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  course_id: { type: String, required: true },
  batch_id: { type: String },
  guardian: { type: String },
  guardian_phone: { type: String },
  address: { type: String },
  admission_date: { type: Date, required: true },
  fees_total: { type: Number, default: 0 },
  fees_paid: { type: Number, default: 0 },
  status: { type: String, default: 'Active' },
  dob: { type: Date },
  grade: { type: String },
  photo_url: { type: String },
  extra_data: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: { createdAt: 'created_at', updatedAt: false }, toJSON: { virtuals: true }, toObject: { virtuals: true } });

schema.virtual('course', { ref: 'Course', localField: 'course_id', foreignField: 'id', justOne: true });
schema.virtual('batch', { ref: 'Batch', localField: 'batch_id', foreignField: 'id', justOne: true });

export const Student = mongoose.model('Student', schema);