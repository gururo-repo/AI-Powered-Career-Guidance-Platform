import Resume from "../models/Resume.js"
import mongoose from "mongoose";

export const createResume = async (req, res) => {
  const { userId, content, atsScore, feedback } = req.body;

  // Validate userId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  try {
    const resume = new Resume({ userId, content, atsScore, feedback });
    await resume.save();
    res.status(201).json(resume);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.params.userId });
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateResume = async (req, res) => {
  try {
    const updatedResume = await Resume.findOneAndUpdate({ userId: req.params.userId }, req.body, { new: true });
    res.json(updatedResume);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteResume = async (req, res) => {
  try {
    await Resume.findOneAndDelete({ userId: req.params.userId });
    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
