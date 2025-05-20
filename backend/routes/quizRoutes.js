// quizC.js (Backend router)
import { generateQuiz, saveQuizResult, getAssessments } from "../services/aiQuiz.js";
import RecommendationService from "../services/aiRecommendation.js"; 
import express from "express";
const router = express.Router();

router.get("/generate", async (req, res) => {
  try {
    const { category, subIndustry } = req.query;
    if (!category || !subIndustry) {
      return res.status(400).json({ error: "Category and subIndustry are required" });
    }
    
    try {
      const questions = await generateQuiz(category, subIndustry);
      res.json(questions);
    } catch (generateError) {
      console.error("Quiz generation error:", generateError);
      res.status(500).json({ 
        error: "Failed to generate quiz", 
        details: generateError.message 
      });
    }
  } catch (error) {
    console.error("Unexpected error in quiz generation route:", error);
    res.status(500).json({ error: "Unexpected server error" });
  }
});

// router.post("/submit", async (req, res) => {
//   try {
//     const { questions, answers, score, category, subIndustry } = req.body;
//     const result = await saveQuizResult(questions, answers, score, category, subIndustry);
//     res.json(result);
//   } catch (error) {
//     console.error("Error submitting quiz:", error);
//     res.status(500).json({ error: "Failed to submit quiz" });
//   }
// });


router.post("/submit", async (req, res) => {
  try {
    const { questions, answers, score, category, subIndustry } = req.body
    
    // Save quiz result
    const result = await saveQuizResult(questions, answers, score, category, subIndustry)
    
    // Generate AI-powered recommendations
    const assessmentData = {
      category,
      subIndustry,
      quizScore: score,
      questions: questions.map((q, index) => ({
        question: q.question,
        isCorrect: q.correctAnswer === answers[index]
      }))
    }
    
    const recommendations = await RecommendationService.generateRecommendations(assessmentData)
    
    // Merge result with recommendations
    const finalResult = {
      ...result,
      recommendations
    }
    
    res.json(finalResult)
  } catch (error) {
    console.error("Error submitting quiz:", error)
    res.status(500).json({ error: "Failed to submit quiz" })
  }
})
router.get("/assessments", async (req, res) => {
  try {
    const assessments = await getAssessments();
    res.json(assessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    res.status(500).json({ error: "Failed to fetch assessments" });
  }
});

export default router;