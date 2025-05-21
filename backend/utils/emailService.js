import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false
  },
  // Add debug information
  debug: process.env.NODE_ENV !== 'production'
});


transporter.verify()
  .then(() => logger.info('Email service ready'))
  .catch(err => logger.error('Email service error:', err));

export const sendVerificationEmail = async (email, token) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    const mailOptions = {
      from: `"JobNest" <${process.env.EMAIL_USER}>`, // Use the actual Gmail address
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to: ${email}`);
  } catch (error) {
    logger.error(`Failed to send verification email to ${email}:`, error);
    throw error;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, token) => {
  try {
    // Get the base URL from environment or use a default
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Use the React component for password reset
    const resetUrl = `${baseUrl}/reset-password/${token}`;

    logger.info(`Generated reset URL: ${resetUrl}`);
    logger.info(`Sending password reset email to: ${email}`);
    logger.info(`Using email configuration: Host=${process.env.EMAIL_HOST}, Port=${process.env.EMAIL_PORT}, Secure=${process.env.EMAIL_SECURE}`);

    // Email subject and content
    const mailOptions = {
      from: `"JobNest" <${process.env.EMAIL_USER}>`, // Use the actual Gmail address instead of EMAIL_FROM
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset</h2>
          <p>You requested a password reset. Please click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    // Add more detailed logging for debugging
    logger.info('Attempting to send email with the following options:', {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to: ${email}`, {
      messageId: info.messageId,
      response: info.response
    });
    return true;
  } catch (error) {
    logger.error('Failed to send password reset email:', {
      error: error.message,
      stack: error.stack,
      email: email
    });

    // Check for specific nodemailer errors
    if (error.code === 'EAUTH') {
      logger.error('Authentication error with email provider. Check credentials.');
    } else if (error.code === 'ESOCKET') {
      logger.error('Socket error when connecting to email provider.');
    } else if (error.code === 'ECONNECTION') {
      logger.error('Connection error with email provider.');
    }

    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

// Send welcome email after registration
export const sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: `"JobNest" <${process.env.EMAIL_USER}>`, // Use the actual Gmail address
      to: email,
      subject: 'Welcome to Our Platform!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome, ${name}!</h2>
          <p>Thank you for joining our platform! We're excited to have you as a member.</p>
          <p>Here are some tips to get started:</p>
          <ul>
            <li>Complete your profile</li>
            <li>Explore available resources</li>
            <li>Connect with other users</li>
          </ul>
          <p>If you have any questions, feel free to contact our support team.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Welcome email sent to: ${email}`);
  } catch (error) {
    logger.error(`Failed to send welcome email to ${email}:`, error);
    // Non-critical, so we don't throw
  }
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
};