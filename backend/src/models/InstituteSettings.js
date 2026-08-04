import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, default: 1 },
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  registration_no: { type: String },
  academic_year: { type: String },
  logo_url: { type: String },
  receipt_config: { type: mongoose.Schema.Types.Mixed },
  certificate_config: { type: mongoose.Schema.Types.Mixed },
  page_layouts: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: { createdAt: false, updatedAt: 'updated_at' } });

export const InstituteSettings = mongoose.model('InstituteSettings', schema);