import express from "express";
import { generateInsights, getInsights, generateComparisonData } from "../controllers/industryInsightC.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// router.put('/api/users/profile', authMiddleware, updateProfile);
router.post('/generate', authMiddleware, generateInsights);
router.get('/user', authMiddleware, getInsights);
router.post('/comparison', authMiddleware, generateComparisonData);

export default router;
