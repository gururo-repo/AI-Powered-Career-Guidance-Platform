import express from 'express';

import { updateProfile, getProfile } from '../controllers/userC.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/api/users/profile', authMiddleware, getProfile);
router.put('/api/users/profile', authMiddleware, updateProfile);  
  

export default router;
