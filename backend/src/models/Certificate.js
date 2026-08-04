import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  cert_no: { type: String, required: true, unique: true },
  student_id: { type: String, required: true },
  course_id: { type: String, required: true },
  grade: { type: String, required: true },
  issue_date: { type: Date, required: true },
  authorised_by: { type: String, required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: false }, toJSON: { virtuals: true }, toObject: { virtuals: true } });

schema.virtual('student', { ref: 'Student', localField: 'student_id', foreignField: 'id', justOne: true });
schema.virtual('course', { ref: 'Course', localField: 'course_id', foreignField: 'id', justOne: true });

export const Certificate = mongoose.model('Certificate', schema);