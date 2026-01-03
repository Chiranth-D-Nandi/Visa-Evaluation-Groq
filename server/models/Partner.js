import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema({
  firmName: {
    type: String,
    required: true,
    trim: true
  },
  apiKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Contact Information
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  contactPerson: String,
  
  // Branding
  branding: {
    logo: String,
    primaryColor: {
      type: String,
      default: '#6366f1'
    },
    headline: String,
    subdomain: String
  },
  
  // Statistics
  stats: {
    totalEvaluations: {
      type: Number,
      default: 0
    },
    lastEvaluationDate: Date,
    averageScore: Number,
    conversionRate: Number
  },
  
  // Access Control
  isActive: {
    type: Boolean,
    default: true
  },
  allowedCountries: [{
    type: String
  }],
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Partner', partnerSchema);
