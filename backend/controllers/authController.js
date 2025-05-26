import User from "../models/Users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/emailService.js";
import rateLimit from "express-rate-limit";
import logger from "../utils/logger.js";
import { validationResult } from "express-validator";
import { sendPasswordResetEmail } from "../utils/emailService.js";
import { sendWelcomeEmail } from "../utils/emailService.js";

const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI
});


// Rate limiting for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many attempts. Please try again later."
});

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Login with email and password
export const login = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    logger.info(`Login attempt for user: ${user._id}`);

    // Check if password matches
    logger.info(`Comparing password for user: ${user._id}`);
    logger.info(`Password from DB (first 10 chars): ${user.password.substring(0, 10)}...`);

    try {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        logger.warn(`Invalid password for user: ${user._id}`);

        // For debugging only - in production, don't log actual passwords
        logger.warn(`Password comparison failed. Input length: ${password.length}, DB hash length: ${user.password.length}`);

        return res.status(401).json({ message: "Invalid credentials" });
      }

      logger.info(`Password match successful for user: ${user._id}`);
    } catch (bcryptError) {
      logger.error(`Bcrypt error during password comparison: ${bcryptError.message}`);
      return res.status(500).json({ message: "Error verifying credentials" });
    }

    // Check if email is verified (except for SSO users)
    if (user.authProvider === 'local' && !user.isEmailVerified) {
      try {
        // Generate a new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

        // Save the token to the user
        user.emailVerificationToken = hashedToken;
        user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await user.save();

        // Send verification email
        await sendVerificationEmail(user.email, verificationToken);

        logger.info(`Generated new verification token for user: ${user._id}`);

        return res.status(403).json({
          message: "Email not verified. A new verification email has been sent."
        });
      } catch (verificationError) {
        logger.error(`Error generating verification token: ${verificationError.message}`);
        return res.status(403).json({
          message: "Email not verified. Please contact support."
        });
      }
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login time
    user.lastLogin = Date.now();
    await user.save();

    // Remove password from response
    user.password = undefined;

    // Log successful login
    logger.info(`User logged in: ${user._id}`, { userId: user._id, email: user.email });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        isProfileComplete: user.isProfileComplete,
        phone: user.phone,
        industry: user.industry,
        subIndustry: user.subIndustry,
        experience: user.experience,
        skills: user.skills,
        bio: user.bio,
      },
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        errors: [{ field: 'email', message: 'User already exists' }]
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      isProfileComplete: false,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpires: verificationTokenExpires,
      isEmailVerified: false
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    // Generate token
    const token = generateToken(user._id);

    // Remove sensitive data from response
    user.password = undefined;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isProfileComplete: user.isProfileComplete,
        isEmailVerified: user.isEmailVerified
      },
      message: 'Registration successful. Please check your email to verify your account.'
    });
  } catch (error) {
    logger.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with this token and token not expired
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Set email as verified and remove verification fields
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Log email verification
    logger.info(`Email verified for user: ${user._id}`, { userId: user._id, email: user.email });

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    logger.error("Email verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Resend email verification
export const resendEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    // Save the token to the user
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    // Log resend verification
    logger.info(`Email verification resent: ${user._id}`, { userId: user._id, email });

    res.json({ message: "Verification email has been sent" });
  } catch (error) {
    logger.error("Resend verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Always return success even if user not found (security best practice)
    if (!user) {
      logger.info(`Password reset requested for non-existent email: ${email}`);
      return res.status(200).json({
        message: 'If your email exists in our system, you will receive a password reset link shortly.'
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send password reset email
    await sendPasswordResetEmail(user.email, resetToken);

    logger.info(`Password reset email sent to: ${user.email}`);

    res.status(200).json({
      message: 'If your email exists in our system, you will receive a password reset link shortly.'
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    logger.info('Password reset request received', {
      body: req.body,
      headers: req.headers,
      method: req.method,
      url: req.originalUrl
    });

    // Log the raw request body for debugging
    logger.info('Raw request body:', typeof req.body === 'string' ? req.body : JSON.stringify(req.body));

    const { token, password } = req.body;

    logger.info(`Reset password request with token: ${token ? token.substring(0, 10) + '...' : 'undefined'}`);
    logger.info(`Reset password request with password: ${password ? '********' : 'undefined'}`);

    if (!token || !password) {
      logger.warn('Missing token or password in reset request');
      return res.status(400).json({
        message: 'Token and password are required'
      });
    }

    // Validate password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,])[A-Za-z\d@$!%*?&.,]{8,}$/;

    logger.info(`Password validation: Length=${password.length}, Has lowercase=${/[a-z]/.test(password)}, Has uppercase=${/[A-Z]/.test(password)}, Has number=${/\d/.test(password)}, Has special=${/[@$!%*?&.,]/.test(password)}`);

    const isValid = passwordRegex.test(password);
    logger.info(`Password validation result: ${isValid}`);

    if (!isValid) {
      logger.warn('Password complexity validation failed');
      return res.status(400).json({
        message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character'
      });
    }

    // Hash the token for comparison with stored token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    logger.info(`Looking for user with reset token hash: ${hashedToken.substring(0, 10)}...`);

    // Find user with this token and token not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      logger.warn('No user found with valid reset token');
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    logger.info(`User found for password reset: ${user._id}, email: ${user.email}`);

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    logger.info('Hashed password created, updating user document');
    logger.info(`Original password hash: ${user.password}`);
    logger.info(`New password hash (first 10 chars): ${hashedPassword.substring(0, 10)}...`);

    try {
      // First try direct update
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;


      if (!user.isEmailVerified) {
        logger.info(`Marking email as verified during password reset for user: ${user._id}`);
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
      }

      if (user.isProfileComplete) {
        logger.info(`Preserving profile completion status for user: ${user._id}`);
      }

      await user.save();
      logger.info('User password updated with direct save method');

      // Verify the password was updated
      const updatedUser = await User.findById(user._id).select('+password');
      logger.info(`Updated password hash (first 10 chars): ${updatedUser.password.substring(0, 10)}...`);

      // Test password comparison
      const testCompare = await bcrypt.compare(password, updatedUser.password);
      logger.info(`Test password comparison result: ${testCompare}`);

      if (!testCompare) {
        throw new Error('Password comparison test failed');
      }
    } catch (directUpdateError) {
      logger.error('Error with direct update:', directUpdateError);

      // Fallback to updateOne
      logger.info('Trying alternative update method with updateOne');

      // Check if email needs to be verified
      const updateFields = { password: hashedPassword };
      const unsetFields = { resetPasswordToken: "", resetPasswordExpires: "" };

      if (!user.isEmailVerified) {
        logger.info(`Marking email as verified during password reset for user: ${user._id} (updateOne method)`);
        updateFields.isEmailVerified = true;
        unsetFields.emailVerificationToken = "";
        unsetFields.emailVerificationExpires = "";
      }

      // Preserve the user's profile completion status
      if (user.isProfileComplete) {
        logger.info(`Preserving profile completion status for user: ${user._id} (updateOne method)`);
        // No need to set isProfileComplete as we're not changing it
      }

      const updateResult = await User.updateOne(
        { _id: user._id },
        {
          $set: updateFields,
          $unset: unsetFields
        }
      );

      logger.info('Update result:', updateResult);

      if (updateResult.modifiedCount !== 1) {
        throw new Error('Failed to update user password with both methods');
      }

      logger.info('User password updated successfully with updateOne');

      // Verify the password was updated
      const updatedUser = await User.findById(user._id).select('+password');
      logger.info(`Updated password hash (first 10 chars): ${updatedUser.password.substring(0, 10)}...`);

      // Test password comparison
      const testCompare = await bcrypt.compare(password, updatedUser.password);
      logger.info(`Test password comparison result: ${testCompare}`);

      if (!testCompare) {
        throw new Error('Password comparison test failed after updateOne');
      }
    }

    // Log password reset
    logger.info(`Password reset successful: ${user._id}`, { userId: user._id });

    // Send a clear success response with user profile status
    res.status(200).json({
      success: true,
      message: "Password has been reset successfully. Please login with your new password.",
      isProfileComplete: user.isProfileComplete
    });

    logger.info('Password reset response sent successfully');
  } catch (error) {
    logger.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Google authentication
export const googleAuth = async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ message: "No token provided" });
    }

    // Verify Google token
    const ticket = await oauth2Client.verifyIdToken({
      idToken: access_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, name, email, picture } = payload;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if not exists
      user = await User.create({
        name,
        email,
        googleId,
        profilePicture: picture,
        isProfileComplete: false,
        authProvider: "google",
        isEmailVerified: true,
      });


      logger.info(`New Google SSO user created: ${user._id}`, { userId: user._id, email });
    } else {

      user.googleId = googleId;
      user.isEmailVerified = true;
      user.authProvider = "google";
      if (!user.profilePicture && picture) {
        user.profilePicture = picture;
      }
      await user.save();


      logger.info(`Google SSO login: ${user._id}`, { userId: user._id, email });
    }


    user.lastLogin = Date.now();
    await user.save();


    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        isProfileComplete: user.isProfileComplete,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        industry: user.industry,
        subIndustry: user.subIndustry,
        experience: user.experience,
        skills: user.skills,
        bio: user.bio,
      },
    });
  } catch (error) {
    logger.error("Google auth error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};

// Facebook authentication
export const facebookAuth = async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ message: "No token provided" });
    }

    // Get user data from Facebook
    const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${access_token}`);
    const data = await response.json();

    if (!data || data.error) {
      return res.status(400).json({ message: "Invalid Facebook token" });
    }

    const { id: facebookId, name, email } = data;
    const picture = data.picture?.data?.url;

    if (!email) {
      return res.status(400).json({
        message: "Email not provided by Facebook. Please ensure email permission is granted."
      });
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if not exists
      user = await User.create({
        name,
        email,
        facebookId,
        profilePicture: picture || "",
        isProfileComplete: false,
        authProvider: "facebook",
        isEmailVerified: true, // Trust Facebook's verification
      });

      // Log new Facebook user
      logger.info(`New Facebook SSO user created: ${user._id}`, { userId: user._id, email });
    } else {
      // Update existing user with Facebook info
      user.facebookId = facebookId;
      user.isEmailVerified = true;
      user.authProvider = "facebook";
      if (!user.profilePicture && picture) {
        user.profilePicture = picture;
      }
      await user.save();

      // Log Facebook login
      logger.info(`Facebook SSO login: ${user._id}`, { userId: user._id, email });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        isProfileComplete: user.isProfileComplete,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        industry: user.industry,
        subIndustry: user.subIndustry,
        experience: user.experience,
        skills: user.skills,
        bio: user.bio,
      },
    });
  } catch (error) {
    logger.error("Facebook auth error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};


// export const googleTokenExchange = async (req, res) => {
//   try {
//     const { code } = req.body;

//     if (!code) {
//       return res.status(400).json({ message: "No code provided" });
//     }

//     // Exchange code for tokens
//     const { tokens } = await client.getToken({
//       code,
//       client_id: process.env.GOOGLE_CLIENT_ID,
//       client_secret: process.env.GOOGLE_CLIENT_SECRET,
//       redirect_uri: process.env.GOOGLE_REDIRECT_URI // Set this to your frontend URL
//     });

//     // Verify the ID token
//     const ticket = await client.verifyIdToken({
//       idToken: tokens.id_token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     const { sub: googleId, name, email, picture } = payload;

//     // Find or create user (rest of your existing logic)
//     let user = await User.findOne({ email });

//     if (!user) {
//       // Create new user
//       user = await User.create({
//         name,
//         email,
//         googleId,
//         profilePicture: picture,
//         isProfileComplete: false,
//         authProvider: "google",
//         isEmailVerified: true,
//       });

//       logger.info(`New Google SSO user created: ${user._id}`);
//     } else {
//       // Update existing user
//       user.googleId = googleId;
//       user.isEmailVerified = true;
//       user.authProvider = "google";
//       if (!user.profilePicture && picture) {
//         user.profilePicture = picture;
//       }
//       await user.save();

//       logger.info(`Google SSO login: ${user._id}`);
//     }

//     // Update last login
//     user.lastLogin = Date.now();
//     await user.save();

//     // Generate token
//     const token = generateToken(user._id);

//     res.json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         profilePicture: user.profilePicture,
//         isProfileComplete: user.isProfileComplete,
//         isEmailVerified: user.isEmailVerified,
//         isPhoneVerified: user.isPhoneVerified,
//         industry: user.industry,
//         subIndustry: user.subIndustry,
//         experience: user.experience,
//         skills: user.skills,
//         bio: user.bio,
//       },
//     });
//   } catch (error) {
//     logger.error("Google token exchange error:", error);
//     res.status(500).json({ message: "Authentication failed" });
//   }
// };
export const googleTokenExchange = async (req, res) => {
  try {
    const { code, code_verifier, redirect_uri } = req.body;

    logger.info("Google token exchange attempt", {
      codeLength: code ? code.length : 0,
      hasVerifier: !!code_verifier,
      redirectUri: redirect_uri
    });

    if (!code) {
      return res.status(400).json({ message: "No code provided" });
    }

    // Make sure these environment variables are set correctly
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    // Use redirect_uri from request if provided, otherwise fall back to env variable
    const redirectUri = redirect_uri || process.env.GOOGLE_REDIRECT_URI;

    // Validate that the redirect URI is one of our allowed domains
    const allowedDomains = [
      'https://tools.gururo.com',
      'https://ai-powered-career-guidance-platform.vercel.app',
      'http://localhost:5173',
      'http://localhost:5174'
    ];

    const isValidRedirectUri = allowedDomains.some(domain =>
      redirectUri && redirectUri.startsWith(domain)
    );

    if (!isValidRedirectUri) {
      logger.error("Invalid redirect URI", { redirectUri, allowedDomains });
      return res.status(400).json({ message: "Invalid redirect URI" });
    }

    logger.info("Google OAuth config", {
      clientId: clientId ? `${clientId.substring(0, 10)}...` : "missing",
      clientSecret: clientSecret ? "present" : "missing",
      redirectUri: redirectUri || "missing"
    });

    // Include all necessary parameters for token exchange
    const tokenParams = {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri
    };

    if (code_verifier) {
      tokenParams.code_verifier = code_verifier;
    }









    const { tokens } = await oauth2Client.getToken(tokenParams);

    // Verify the ID token
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, name, email, picture } = payload;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        profilePicture: picture,
        isProfileComplete: false,
        authProvider: "google",
        isEmailVerified: true,
      });

      logger.info(`New Google SSO user created: ${user._id}`);
    } else {
      // Update existing user
      user.googleId = googleId;
      user.isEmailVerified = true;
      user.authProvider = "google";
      if (!user.profilePicture && picture) {
        user.profilePicture = picture;
      }
      await user.save();

      logger.info(`Google SSO login: ${user._id}`);
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        isProfileComplete: user.isProfileComplete,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        industry: user.industry,
        subIndustry: user.subIndustry,
        experience: user.experience,
        skills: user.skills,
        bio: user.bio,
      },
    });
  } catch (error) {
    logger.error("Google token exchange error:", error);

    // Add more detailed logging for debugging
    if (error.response) {
      logger.error("Google API error details:", {
        status: error.response.status,
        data: error.response.data
      });
    }

    res.status(500).json({ message: "Authentication failed" });
  }
};