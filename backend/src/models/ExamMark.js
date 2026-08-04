import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  exam_id: { type: String, required: true },
  student_id: { type: String, required: true },
  marks: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_at', updatedAt: false }, toJSON: { virtuals: true }, toObject: { virtuals: true } });

schema.index({ exam_id: 1, student_id: 1 }, { unique: true });

schema.virtual('exam', { ref: 'Exam', localField: 'exam_id', foreignField: 'id', justOne: true });
schema.virtual('student', { ref: 'Student', localField: 'student_id', foreignField: 'id', justOne: true });

export const ExamMark = mongoose.model('ExamMark', schema);