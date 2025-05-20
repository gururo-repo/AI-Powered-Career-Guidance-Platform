import express from 'express';
import { createResume, getResume, getResumeById, updateResume, deleteResume } from '../controllers/resumeC.js';

const router = express.Router();

router.get("/:userId", getResume);
router.get("/id/:id", getResumeById);
router.post("/", createResume);
router.put("/:userId", updateResume);
router.delete("/:userId", deleteResume);

export default router;
