import winston from 'winston';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = './logs';
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

// Create logger
const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: `${logsDir}/error.log`, level: 'error' }),
    new winston.transports.File({ filename: `${logsDir}/combined.log` })
  ]
});

// Add request logger middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    logger.info(`${req.method} ${req.originalUrl}`, {
      ip: userIp,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id || 'unauthenticated'
    });
  });
  next();
};

export default logger;