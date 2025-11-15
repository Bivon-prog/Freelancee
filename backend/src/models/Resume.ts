import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    location: String,
    website: String,
    linkedin: String,
    summary: String
  },
  experience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    description: String,
    achievements: [String]
  }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    gpa: String
  }],
  skills: [String],
  projects: [{
    name: String,
    description: String,
    technologies: [String],
    url: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    url: String
  }],
  templateId: { type: String, default: 'modern' },
  atsScore: Number,
}, { timestamps: true });

export const Resume = mongoose.model('Resume', resumeSchema);
