import { GoogleGenerativeAI } from "@google/generative-ai"

class RecommendationService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  }

  async generateRecommendations(assessmentData) {
    try {
      const prompt = `
        Generate comprehensive career and learning recommendations based on the following assessment details:
        - Category: ${assessmentData.category}
        - Sub-Industry: ${assessmentData.subIndustry}
        - Quiz Score: ${assessmentData.quizScore}%
        - Specific Performance Areas:
        ${assessmentData.questions.map(q => 
          `  - ${q.question}: ${q.isCorrect ? 'Correct' : 'Incorrect'}`
        ).join('\n')}

        Provide recommendations in this detailed JSON format:
        {
          "jobRecommendations": [
            {
              "title": "Job Title",
              "matchPercentage": 0-100,
              "requiredSkills": ["Skill1", "Skill2"],
              "missingSkills": ["Skill3", "Skill4"],
              "potentialCareerPath": "Brief description of career trajectory",
              "companyTypes": ["Startup", "Enterprise", "Consulting"],
              "growthPotential": "Short description of career growth"
            }
          ],
          "learningResources": [
            {
              "title": "Resource Title",
              "type": "Online Course/Certification/Workshop",
              "difficulty": "Beginner/Intermediate/Advanced",
              "focusAreas": ["Skill1", "Skill2"],
              "estimatedCompletionTime": "X weeks",
              "recommendationReason": "Why this resource is suggested",
              "platform": "Coursera/Udemy/edX",
              "certificateValue": "Industry recognition details"
            }
          ],
          "skillDevelopmentAreas": ["Area1", "Area2"],
          "careerInsights": "Personalized career advice based on assessment"
        }
      `

      const result = await this.model.generateContent(prompt)
      const response = result.response
      const text = response.text()
      const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim()
      
      return JSON.parse(cleanedText)
    } catch (error) {
      console.error("Error generating recommendations:", error)
      
      // Fallback recommendations
      return {
        jobRecommendations: [
          {
            title: assessmentData.category === "technical" 
              ? "Software Engineer" 
              : assessmentData.category === "behavioral"
                ? "Project Manager"
                : "Industry Consultant",
            matchPercentage: assessmentData.quizScore,
            requiredSkills: ["Communication", "Technical Skills", "Problem-Solving"],
            missingSkills: this.identifyMissingSkills(assessmentData),
            potentialCareerPath: "Continuous learning and skill development",
            companyTypes: ["Tech Startups", "Multinational Corporations"],
            growthPotential: "Strong opportunities for skill advancement"
          }
        ],
        learningResources: [
          {
            title: `${assessmentData.subIndustry} Skill Mastery Course`,
            type: "Online Course",
            difficulty: assessmentData.quizScore < 50 ? "Beginner" : "Intermediate",
            focusAreas: this.identifyMissingSkills(assessmentData),
            estimatedCompletionTime: "8-12 weeks",
            recommendationReason: "Targeted skill development based on assessment",
            platform: "Coursera",
            certificateValue: "Industry-recognized certification"
          }
        ],
        skillDevelopmentAreas: this.identifyDevelopmentAreas(assessmentData),
        careerInsights: "Focus on continuous learning and adapting to industry trends"
      }
    }
  }

  // These methods remain the same as in the previous implementation
  identifyMissingSkills(assessmentData) {
    const incorrectQuestions = assessmentData.questions.filter(q => !q.isCorrect)
    
    const missingSkills = incorrectQuestions.map(q => {
      const keywords = [
        "programming", "communication", "leadership", "technical", 
        "problem-solving", "analysis", "strategy", "implementation"
      ]
      
      const matchedSkills = keywords.filter(keyword => 
        q.question.toLowerCase().includes(keyword)
      )
      
      return matchedSkills.length > 0 ? matchedSkills[0] : "Generic Skill"
    })

    return [...new Set(missingSkills)].slice(0, 3)
  }

  identifyDevelopmentAreas(assessmentData) {
    const incorrectQuestions = assessmentData.questions.filter(q => !q.isCorrect)
    
    const developmentAreas = incorrectQuestions.map(q => {
      if (assessmentData.category === "technical") {
        return "Technical Skill Enhancement"
      } else if (assessmentData.category === "behavioral") {
        return "Soft Skill Development"
      } else {
        return "Industry Knowledge Expansion"
      }
    })

    return [...new Set(developmentAreas)]
  }
}

export default new RecommendationService()