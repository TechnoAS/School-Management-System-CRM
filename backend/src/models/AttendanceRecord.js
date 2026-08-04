import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  student_id: { type: String, required: true },
  batch_id: { type: String, required: true },
  record_date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'leave'], default: 'present' },
  marked_by: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: false }, toJSON: { virtuals: true }, toObject: { virtuals: true } });

schema.index({ student_id: 1, batch_id: 1, record_date: 1 }, { unique: true });

schema.virtual('student', { ref: 'Student', localField: 'student_id', foreignField: 'id', justOne: true });
schema.virtual('batch', { ref: 'Batch', localField: 'batch_id', foreignField: 'id', justOne: true });
schema.virtual('marker', { ref: 'User', localField: 'marked_by', foreignField: 'id', justOne: true });

export const AttendanceRecord = mongoose.model('AttendanceRecord', schema);