import mongoose from 'mongoose';

// Email validation regex
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const evaluationSchema = new mongoose.Schema({
  odId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  partnerId: {
    type: String,
    index: true
  },
  partnerKey: {
    type: String,
    index: true
  },
  
  // User Information with validation
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return emailRegex.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  // Visa Details
  country: {
    type: String,
    required: true,
    enum: ['Germany', 'Canada', 'Ireland', 'Netherlands', 'Australia', 'Poland', 'France', 'Italy', 'UK']
  },
  visaType: {
    type: String,
    required: true
  },
  
  // Uploaded Documents
  documents: [{
    type: {
      type: String,
      enum: ['resume', 'degree', 'jobOffer', 'salaryProof', 'languageCert', 'portfolio', 'other'],
      required: true
    },
    filename: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Extracted Data from Documents
  extractedData: {
    education: [{
      degree: String,
      institution: String,
      year: Number,
      field: String
    }],
    experience: [{
      role: String,
      company: String,
      duration: Number, // in months
      description: String
    }],
    totalExperienceYears: Number,
    salary: {
      amount: Number,
      currency: String,
      frequency: String // annual, monthly
    },
    skills: [String],
    languages: [{
      language: String,
      proficiency: String,
      testScore: String
    }],
    certifications: [String]
  },
  
  // User Confirmed Data (after review)
  confirmedData: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Evaluation Results
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Detailed Breakdown
  breakdown: {
    education: { score: Number, maxScore: Number, notes: String },
    experience: { score: Number, maxScore: Number, notes: String },
    salary: { score: Number, maxScore: Number, notes: String },
    skills: { score: Number, maxScore: Number, notes: String },
    language: { score: Number, maxScore: Number, notes: String },
    documents: { score: Number, maxScore: Number, notes: String }
  },
  
  // AI Explanation
  explanation: {
    summary: String,
    strengths: [String],
    gaps: [String],
    recommendations: [String]
  },
  
  // Official Sources
  sources: [{
    title: String,
    url: String,
    relevance: String
  }],
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  
  // Metadata
  ipAddress: String,
  userAgent: String,
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
evaluationSchema.index({ email: 1, createdAt: -1 });
evaluationSchema.index({ partnerId: 1, createdAt: -1 });
evaluationSchema.index({ country: 1, visaType: 1 });

export default mongoose.model('Evaluation', evaluationSchema);
