// utils/backup.js
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import cron from 'node-cron';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backup directory
const backupDir = path.join(__dirname, '..', 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Function to create MongoDB backup
const createMongoBackup = () => {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `mongodb_backup_${timestamp}`);
    
    // Create backup directory
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }
    
    // Extract database name from MONGO_URI
    const dbName = process.env.MONGO_URI.split('/').pop().split('?')[0];
    
    // Build mongodump command
    const cmd = `mongodump --uri="${process.env.MONGO_URI}" --out=${backupPath}`;
    
    logger.info('Starting MongoDB backup...');
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        logger.error('MongoDB backup failed:', error);
        reject(error);
        return;
      }
      
      logger.info(`MongoDB backup created successfully at ${backupPath}`);
      
      // Create a log file for the backup
      fs.writeFileSync(
        path.join(backupPath, 'backup_info.txt'),
        `Backup created: ${new Date().toISOString()}\nDatabase: ${dbName}\n`
      );
      
      // Clean up old backups (keep only last 7)
      cleanupOldBackups();
      
      resolve(backupPath);
    });
  });
};

// Cleanup old backups (keep only the most recent 7)
const cleanupOldBackups = () => {
  try {
    const backups = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('mongodb_backup_'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        time: fs.statSync(path.join(backupDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Sort newest to oldest
    
    // Keep only the most recent 7 backups
    if (backups.length > 7) {
      backups.slice(7).forEach(backup => {
        fs.rmSync(backup.path, { recursive: true, force: true });
        logger.info(`Removed old backup: ${backup.name}`);
      });
    }
  } catch (error) {
    logger.error('Error cleaning up old backups:', error);
  }
};

// Function to restore MongoDB from backup
export const restoreMongoBackup = (backupPath) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(backupPath)) {
      reject(new Error(`Backup path ${backupPath} does not exist`));
      return;
    }
    
    // Build mongorestore command
    const cmd = `mongorestore --uri="${process.env.MONGO_URI}" ${backupPath}`;
    
    logger.info(`Starting MongoDB restore from ${backupPath}...`);
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        logger.error('MongoDB restore failed:', error);
        reject(error);
        return;
      }
      
      logger.info('MongoDB restore completed successfully');
      resolve(true);
    });
  });
};

// Schedule daily backup at 3 AM
export const scheduleBackups = () => {
  // Schedule backup at 3 AM every day
  cron.schedule('0 3 * * *', async () => {
    try {
      logger.info('Running scheduled database backup');
      await createMongoBackup();
    } catch (error) {
      logger.error('Scheduled backup failed:', error);
    }
  });
  
  logger.info('Database backup scheduled to run daily at 3 AM');
};

// On-demand backup
export const runBackup = async () => {
  try {
    return await createMongoBackup();
  } catch (error) {
    logger.error('On-demand backup failed:', error);
    throw error;
  }
};

export default {
  scheduleBackups,
  runBackup,
  restoreMongoBackup
};