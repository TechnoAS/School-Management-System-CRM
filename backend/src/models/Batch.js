import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  course_id: { type: String, required: true },
  name: { type: String, required: true },
  timing: { type: String, required: true },
  faculty_id: { type: String },
  status: { type: String, default: 'Upcoming' },
  start_date: { type: Date },
  end_date: { type: Date },
  extra_data: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: { createdAt: 'created_at', updatedAt: false }, toJSON: { virtuals: true }, toObject: { virtuals: true } });

schema.virtual('course', { ref: 'Course', localField: 'course_id', foreignField: 'id', justOne: true });
schema.virtual('faculty', { ref: 'Faculty', localField: 'faculty_id', foreignField: 'id', justOne: true });

export const Batch = mongoose.model('Batch', schema);