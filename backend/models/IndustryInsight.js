import mongoose from "mongoose";

const IndustryInsightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  industry: {
    type: String,
    required: true,
    trim: true
  },

  // Fields aligned with frontend expectations
  industryOverview: {
    type: String,
    default: "Industry overview information not available"
  },

  marketDemand: [{
    skill: String,
    demandScore: Number
  }],

  salaryRanges: [{
    role: String,
    minSalary: Number,
    medianSalary: Number,
    maxSalary: Number
  }],

  citySalaryData: [{
    city: String,
    avgSalary: Number,
    salaryTrend: String,
    demandLevel: String,
    rolesSalaries: [{
      role: String,
      minSalary: Number,
      medianSalary: Number,
      maxSalary: Number,
      location: String
    }]
  }],

  expectedSalaryRange: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },

  skillBasedBoosts: [{
    skill: String,
    salaryIncrease: Number
  }],

  topCompanies: [{
    name: String,
    openPositions: Number,
    roles: [String]
  }],

  recommendedCourses: [{
    name: String,
    platform: String,
    url: String,
    skillsCovered: [String]
  }],

  careerPathInsights: [{
    title: String,
    description: String,
    growthPotential: String
  }],

  emergingTrends: [{
    name: String,
    description: String
  }],

  quickInsights: {
    type: [{
      title: String,
      type: String
    }],
    default: []
  },

  lastUpdated: {
    type: Date,
    default: Date.now
  },

  nextUpdate: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }
}, {
  timestamps: true
});

// Method to check if insights need updating
IndustryInsightSchema.methods.needsUpdate = function() {
  return new Date() >= this.nextUpdate;
};

// Virtual for time until next update
IndustryInsightSchema.virtual('timeUntilUpdate').get(function() {
  return this.nextUpdate - new Date();
});

// Ensure virtuals are included in JSON output
IndustryInsightSchema.set('toJSON', { virtuals: true });
IndustryInsightSchema.set('toObject', { virtuals: true });

export default mongoose.model("IndustryInsight", IndustryInsightSchema);