import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true,
    unique: true  
  },
  
  content: { 
    type: String, 
    required: true 
  },
  
  atsScore: { 
    type: Number,  
  },
  
  feedback: { 
    type: String,
    default: null
  }
}, { 
  timestamps: true  
});

export default mongoose.model("Resume", ResumeSchema);
