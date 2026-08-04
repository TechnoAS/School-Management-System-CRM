import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  user_id: { type: String },
  action: { type: String, required: true },
  entity: { type: String },
  entity_id: { type: String },
  before_data: { type: mongoose.Schema.Types.Mixed },
  after_data: { type: mongoose.Schema.Types.Mixed },
  ip_address: { type: String },
  user_agent: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: false }, toJSON: { virtuals: true }, toObject: { virtuals: true } });

schema.virtual('user', { ref: 'User', localField: 'user_id', foreignField: 'id', justOne: true });

export const AuditLog = mongoose.model('AuditLog', schema);