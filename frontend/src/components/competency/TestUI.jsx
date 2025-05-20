import React, { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { CheckCircle, XCircle, Award, BookOpen, Briefcase, ChevronRight, User, TrendingUp, Brain } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { getAssessmentHistory } from "../../../../backend/controllers/quizC"

// Define chartData and COLORS
const COLORS = ['#0088FE', '#FF69B4', '#FFBB28', '#FF8042']

const CompetencyTestUI = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState("results")
  const [assessmentHistory, setAssessmentHistory] = useState([])
  const [loading, setLoading] = useState(false)

  // Get quiz result from location state or use null
  const quizResult = location.state?.quizResult || null

  // Prepare chart data based on quiz result
  const chartData = quizResult ? [
    { name: 'Correct', value: quizResult.quizScore },
    { name: 'Incorrect', value: 100 - quizResult.quizScore }
  ] : []

  // Placeholder functions for job recommendations and learning resources
  const getJobRecommendations = () => {
    // This would typically come from your backend or state management
    return [
      {
        title: "Software Engineer",
        match: 75,
        missingSkills: ["Advanced React", "Microservices"]
      },
      {
        title: "Frontend Developer",
        match: 85,
        missingSkills: ["TypeScript", "Next.js"]
      }
    ]
  }

  const getLearningResources = () => {
    // This would typically come from your backend or state management
    return [
      {
        title: "Advanced React Course",
        type: "Online Course",
        difficulty: "Intermediate"
      },
      {
        title: "Full Stack JavaScript Bootcamp",
        type: "Intensive Training",
        difficulty: "Advanced"
      }
    ]
  }

  const userData = {
    skills: ["React", "JavaScript", "Node.js"]
  }

  // Fetch assessment history
  useEffect(() => {
    const fetchAssessmentHistory = async () => {
      try {
        setLoading(true)
        const history = await getAssessmentHistory()
        setAssessmentHistory(history)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching assessment history:", error)
        setLoading(false)
      }
    }

    fetchAssessmentHistory()
  }, [])

  // If no quiz result is available, redirect to categories
  useEffect(() => {
    if (!quizResult && !loading) {
      navigate("/competency-test")
    }
  }, [quizResult, loading, navigate])

  const handleTryAgain = () => {
    // Navigate back to categories to start a new test
    navigate("/competency-test")
  }

  const recommendations = quizResult?.recommendations || {
    jobRecommendations: [],
    learningResources: [],
    skillDevelopmentAreas: [],
    careerInsights: ""
  }
  return (
    <div className="bg-gradient-to-b from-zinc-900 to-black min-h-screen text-white pt-20 pb-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section - Updated to show sub-industry if available */}
        <div className="relative bg-gradient-to-r from-cyan-900/30 to-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-cyan-50 mb-2 flex items-center">
                <Brain className="mr-3 text-cyan-400" size={28} />
                Competency Test Results
              </h1>
              <h2 className="text-xl text-cyan-300 font-medium">
                {quizResult?.category} - {quizResult?.subIndustry || 'Assessment'}
              </h2>
            </div>
            <button
              onClick={handleTryAgain}
              className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white py-2 px-6 rounded-lg flex items-center transition-all shadow-md self-start md:self-auto"
            >
              <User className="mr-2" size={18} />
              Try Another Test
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-6 border-b border-zinc-700 overflow-x-auto">
          <button
            className={`py-3 px-6 font-medium ${activeTab === "results" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-zinc-400 hover:text-cyan-200"}`}
            onClick={() => setActiveTab("results")}
          >
            Results
          </button>
          <button
            className={`py-3 px-6 font-medium ${activeTab === "recommendations" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-zinc-400 hover:text-cyan-200"}`}
            onClick={() => setActiveTab("recommendations")}
          >
            Job Matches
          </button>
          <button
            className={`py-3 px-6 font-medium ${activeTab === "learning" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-zinc-400 hover:text-cyan-200"}`}
            onClick={() => setActiveTab("learning")}
          >
            Learning Resources
          </button>
        </div>

        {activeTab === "results" && (
          <div className="space-y-6">
            {/* Score and Chart Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-zinc-700 shadow-lg">
                <h3 className="text-xl font-semibold text-cyan-50 mb-4 flex items-center">
                  <Award className="mr-2 text-cyan-400" size={20} />
                  Your Score
                </h3>
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="w-48 h-48 rounded-full bg-gradient-to-br from-cyan-900/20 to-zinc-800/20 border border-zinc-700 flex items-center justify-center text-center">
                      <div>
                        <div className="text-6xl font-bold text-cyan-400">{quizResult.quizScore}%</div>
                        <div className="text-cyan-200 mt-2">
                          {quizResult.quizScore >= 80
                            ? "Excellent!"
                            : quizResult.quizScore >= 60
                              ? "Good job!"
                              : "Keep practicing!"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-zinc-700 shadow-lg">
                <h3 className="text-xl font-semibold text-cyan-50 mb-4 flex items-center">
                  <TrendingUp className="mr-2 text-cyan-400" size={20} />
                  Results Breakdown
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Question Details */}
            <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-zinc-700 shadow-lg">
              <h3 className="text-xl font-semibold text-cyan-50 mb-4 flex items-center">
                <BookOpen className="mr-2 text-cyan-400" size={20} />
                Question Details
              </h3>
              <div className="space-y-4">
                {quizResult.questions.map((question, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-zinc-800/30 to-zinc-900/30 rounded-lg border border-zinc-700 hover:border-cyan-500 transition-all"
                  >
                    <div className="flex items-start">
                      {question.isCorrect ? (
                        <CheckCircle className="text-cyan-400 mr-3 mt-1 flex-shrink-0" size={20} />
                      ) : (
                        <XCircle className="text-rose-500 mr-3 mt-1 flex-shrink-0" size={20} />
                      )}
                      <div>
                        <p className="font-medium text-cyan-50">{question.question}</p>
                        <p className={`mt-2 ${question.isCorrect ? "text-cyan-300" : "text-zinc-400"}`}>
                          Your answer: {question.userAnswer}
                        </p>
                        {!question.isCorrect && <p className="mt-1 text-rose-300">Correct answer: {question.answer}</p>}
                        {question.explanation && (
                          <p className="mt-2 text-zinc-400 text-sm border-t border-zinc-700 pt-2">
                            {question.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvement Tips */}
            {quizResult.improvementTip && (
              <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-zinc-700 shadow-lg">
                <h3 className="text-xl font-semibold text-cyan-50 mb-4 flex items-center">
                  <BookOpen className="mr-2 text-cyan-400" size={20} />
                  Improvement Tips
                </h3>
                <div className="p-4 bg-gradient-to-r from-cyan-900/20 to-zinc-800/20 rounded-lg border border-cyan-900/30">
                  <p className="text-cyan-100">{quizResult.improvementTip}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "recommendations" && (
          <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-zinc-700 shadow-lg">
            <h3 className="text-xl font-semibold text-cyan-50 mb-6 flex items-center">
              <Briefcase className="mr-2 text-cyan-400" size={20} />
              Job Recommendations
            </h3>

            {recommendations.careerInsights && (
              <div className="mb-6 p-4 bg-gradient-to-r from-cyan-900/20 to-zinc-800/20 rounded-lg border border-cyan-900/30">
                <p className="text-cyan-100 italic">
                  <span className="font-semibold text-cyan-300">Career Insight: </span>
                  {recommendations.careerInsights}
                </p>
              </div>
            )}

            <div className="space-y-6">
              {recommendations.jobRecommendations.map((job, index) => (
                <div
                  key={index}
                  className="border border-zinc-700 hover:border-cyan-500 rounded-lg overflow-hidden transition-all shadow-md"
                >
                  <div className="bg-gradient-to-r from-cyan-900/30 to-zinc-800/30 p-4 flex justify-between items-center">
                    <h4 className="text-lg font-semibold text-cyan-50">{job.title}</h4>
                    <div className="bg-cyan-900/40 text-cyan-300 px-3 py-1 rounded-full font-medium">
                      {job.matchPercentage}% Match
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-zinc-800/30 to-zinc-900/30">
                    <div className="mb-4">
                      <p className="text-zinc-400 mb-2">
                        <span className="text-cyan-300">Required Skills:</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.map((skill, i) => (
                          <span key={i} className="bg-cyan-900/20 text-cyan-300 px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-zinc-400 mb-2">
                        <span className="text-cyan-300">Missing Skills:</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.missingSkills.map((skill, i) => (
                          <span key={i} className="bg-zinc-800/40 text-zinc-300 px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <p className="text-zinc-400">
                        <span className="text-cyan-300">Career Path: </span>
                        {job.potentialCareerPath}
                      </p>
                      <p className="text-zinc-400">
                        <span className="text-cyan-300">Company Types: </span>
                        {job.companyTypes.join(", ")}
                      </p>
                      <p className="text-zinc-400">
                        <span className="text-cyan-300">Growth Potential: </span>
                        {job.growthPotential}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "learning" && (
          <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-zinc-700 shadow-lg">
            <h3 className="text-xl font-semibold text-cyan-50 mb-6 flex items-center">
              <Award className="mr-2 text-cyan-400" size={20} />
              Recommended Learning Resources
            </h3>

            {recommendations.skillDevelopmentAreas.length > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-cyan-900/20 to-zinc-800/20 rounded-lg border border-cyan-900/30">
                <p className="text-cyan-100">
                  <span className="font-semibold text-cyan-300">Skill Development Areas: </span>
                  {recommendations.skillDevelopmentAreas.join(", ")}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.learningResources.map((resource, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-zinc-800/30 to-zinc-900/30 p-5 rounded-lg border border-zinc-700 hover:border-cyan-500 transition-all shadow-md h-full flex flex-col"
                >
                  <h4 className="text-cyan-300 font-medium text-lg mb-2">{resource.title}</h4>
                  <div className="flex flex-col space-y-2 mt-2">
                    <div className="flex justify-between text-zinc-400">
                      <span className="bg-zinc-800/40 px-3 py-1 rounded-full text-sm">{resource.type}</span>
                      <span className="bg-cyan-900/20 text-cyan-300 px-3 py-1 rounded-full text-sm">
                        {resource.difficulty}
                      </span>
                    </div>
                    <div className="text-zinc-400">
                      <p><span className="text-cyan-300">Focus Areas:</span> {resource.focusAreas.join(", ")}</p>
                      <p><span className="text-cyan-300">Estimated Time:</span> {resource.estimatedCompletionTime}</p>
                      <p><span className="text-cyan-300">Platform:</span> {resource.platform}</p>
                    </div>
                    <div className="text-zinc-400 mt-2 italic">
                      <p><span className="text-cyan-300">Why Recommended:</span> {resource.recommendationReason}</p>
                    </div>
                  </div>
                  <button className="text-cyan-400 font-medium flex items-center hover:text-cyan-300 transition-colors mt-auto">
                    Access Resource <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}


      </div>
    </div>
  )
}

export default CompetencyTestUI

