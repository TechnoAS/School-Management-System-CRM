import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  receipt: { type: String, required: true, unique: true },
  student_id: { type: String, required: true },
  amount: { type: Number, required: true },
  mode: { type: String, required: true },
  pay_date: { type: Date, required: true },
  remarks: { type: String },
  created_by: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: false }, toJSON: { virtuals: true }, toObject: { virtuals: true } });

schema.virtual('student', { ref: 'Student', localField: 'student_id', foreignField: 'id', justOne: true });
schema.virtual('creator', { ref: 'User', localField: 'created_by', foreignField: 'id', justOne: true });

export const Payment = mongoose.model('Payment', schema);