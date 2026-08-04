import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  course_id: { type: String, required: true },
  batch_id: { type: String, required: true },
  exam_date: { type: Date, required: true },
  max_marks: { type: Number, default: 100 },
  status: { type: String, default: 'Upcoming' },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

schema.virtual('course', { ref: 'Course', localField: 'course_id', foreignField: 'id', justOne: true });
schema.virtual('batch', { ref: 'Batch', localField: 'batch_id', foreignField: 'id', justOne: true });

export const Exam = mongoose.model('Exam', schema);