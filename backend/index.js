import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import industryInsightRoutes from './routes/industryInsightsRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import logger, { requestLogger } from './utils/logger.js';
import backup from './utils/backup.js';
import session from 'express-session';
import Tokens from 'csrf';

dotenv.config();
const app = express();

// Check for required environment variables
if (!process.env.JWT_SECRET) {
  logger.error('JWT_SECRET is not defined in environment variables');
  process.exit(1);
}


if (!process.env.MONGO_URI) {
  logger.error('MONGO_URI is not defined in environment variables');
  process.exit(1);
}

// Security middleware
app.use(express.json({ limit: '10kb' })); // Body limit
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'Cache-Control'],
}));

// Log CORS configuration
logger.info('CORS configured with origins:', ['http://localhost:5174', process.env.FRONTEND_URL].filter(Boolean));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Generate CSRF token for all requests
app.use((req, res, next) => {
  if (!req.session.csrfSecret) {
    const tokens = new Tokens();
    req.session.csrfSecret = tokens.secretSync();
  }
  next();
});

// Add request logging middleware
app.use(requestLogger);

// Test route to verify API is working
app.get('/api/test', (req, res) => {
  logger.info('Test endpoint accessed');
  res.json({ message: 'API is working' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/', userRoutes);
app.use('/api/industry-insights', industryInsightRoutes);
app.use('/api/competency-quiz', quizRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Server error:', { error: err.message, stack: err.stack });
  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn('404 for route:', { method: req.method, url: req.url });
  res.status(404).json({ message: 'Route not found' });
});

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => logger.info("MongoDB Connected"))
  .catch(err => logger.error("MongoDB Connection Error:", err));

  const startServer = async (currentPort = process.env.PORT || 8000) => {
    try {
      // Convert port to number
      currentPort = parseInt(currentPort, 10);

      // Validate port
      if (isNaN(currentPort)) {
        logger.error('Invalid port number:', currentPort);
        process.exit(1);
      }

      if (currentPort > 65535) {
        logger.error('No available ports found');
        process.exit(1);
      }

      // Create HTTP server
      app.listen(currentPort, () => {
        logger.info(`HTTP Server running on port ${currentPort}`);
      }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          logger.warn(`Port ${currentPort} is busy, trying ${currentPort + 1}`);
          startServer(currentPort + 1);
        } else if (err.code === 'EACCES') {
          logger.error(`Permission denied for port ${currentPort}. Trying higher port...`);
          startServer(currentPort + 1);
        } else {
          logger.error('Server error:', err);
          process.exit(1);
        }
      });

      // Setup backup cron job
      setupBackupCronJob();

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  };

// Setup backup cron job function
const setupBackupCronJob = () => {
  backup.scheduleBackups();
  logger.info('Backup cron job scheduled');
};

startServer();

export default app;

