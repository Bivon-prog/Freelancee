import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  clientId: { type: String },
  title: { type: String, required: true },
  type: { type: String, enum: ['freelance', 'employment', 'partnership', 'service', 'rental', 'consulting'], required: true },
  content: { type: String, required: true },
  parties: [{
    name: String,
    role: String,
    email: String
  }],
  terms: {
    startDate: Date,
    endDate: Date,
    payment: Number,
    deliverables: [String]
  },
  status: { type: String, enum: ['draft', 'sent', 'signed', 'active', 'completed'], default: 'draft' },
  templateId: String,
}, { timestamps: true });

export const Contract = mongoose.model('Contract', contractSchema);
