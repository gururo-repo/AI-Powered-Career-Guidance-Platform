import mongoose from "mongoose";
import crypto from "crypto";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email",
    ],
  },
  password: {
    type: String,
    select: false,
  },
  profilePicture: {
    type: String,
    default: "",
  },
  authProvider: {
    type: String,
    enum: ["local", "google", "facebook"],
    default: "local",
  },
  isProfileComplete: {
    type: Boolean,
    default: false,
  },
  // New verification fields
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,

  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    trim: true,
  },
  phoneVerificationCode: String,
  phoneVerificationExpires: Date,

  // Location information
  zipCode: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
    default: "US"
  },

  // Password reset fields
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Google SSO fields
  googleId: String,

  // Facebook SSO fields
  facebookId: String,

  // Existing fields
  industry: {
    type: String,
    trim: true,
  },
  subIndustry: {
    type: String,
    trim: true,
  },
  experience: {
    type: Number,
    min: 0,
    max: 50,
  },
  skills: [String],
  bio: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  preferredRoles: [String],
  salaryExpectation: {
    type: String,
    trim: true,
  },
  industryInsight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "IndustryInsight",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedTests: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompTest'
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  }
});

// Generate email verification token
UserSchema.methods.generateEmailVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return token;
};

// Generate phone verification code
UserSchema.methods.generatePhoneVerificationCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

  this.phoneVerificationCode = code;
  this.phoneVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return code;
};

// Generate password reset token
UserSchema.methods.generatePasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

  return token;
};

// Update the updatedAt field before saving
UserSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("User", UserSchema);