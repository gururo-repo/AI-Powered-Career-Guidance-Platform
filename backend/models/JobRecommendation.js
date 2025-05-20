import mongoose from "mongoose";

const JobRecommendationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  
  jobTitle: { 
    type: String, 
    required: true,
    trim: true 
  },
  
  companyName: { 
    type: String,
    required: true,
    trim: true 
  },
  
  location: { 
    type: String,
    trim: true 
  },
  
  salaryRange: {
    min: { type: Number },
    max: { type: Number }
  },
  
  jobUrl: { 
    type: String,
    required: true 
  },
  
  matchScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  requiredSkills: [{
    type: String,
    trim: true
  }],
  
  jobDescription: {
    type: String
  },
  
  status: {
    type: String,
    enum: ['New', 'Viewed', 'Applied', 'Saved'],
    default: 'New'
  }
}, { 
  timestamps: true 
});

export default mongoose.model("JobRecommendation", JobRecommendationSchema);
