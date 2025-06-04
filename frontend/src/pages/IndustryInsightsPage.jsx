import {
  FaArrowUp,
  FaChartBar,
  FaInfoCircle,
  FaCheck,
  FaBullhorn,
  FaRocket,
  FaFire,
  FaCalendar,
  FaUser,
  FaLightbulb,
  FaBriefcase,
  FaGraduationCap,
  FaChartLine,
  FaMapMarkerAlt,
  FaExchangeAlt
} from "react-icons/fa";
import InfoTooltip from "../components/ui/InfoTooltip";
import SkillsVsMarketChart from "../components/charts/skillVsmarket";
import CitySalaryRanges from "../components/charts/CitySalaryRanges";
import { useEffect, useState } from "react";
import api from "../lib/axios";
import TopCompaniesTable from "../components/tables/TopCompaniesTable";
import RecommendedCoursesTable from "../components/tables/RecommendedCoursesTable";
import InsightCard from "../components/cards/InsightCard";
import ActionCard from "../components/cards/ActionCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const NextActionsSection = ({ nextActions }) => (
  <div className="mt-8">
    <h3 className="text-xl font-semibold text-cyan-50 mb-4 flex items-center">
      <FaLightbulb className="mr-2 text-yellow-400" />
      Recommended Actions
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {nextActions.map((action, index) => (
        <div
          key={index}
          className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-4 rounded-lg border border-zinc-700 hover:border-cyan-500 transition-all shadow-lg h-full"
        >
          <div className="flex items-start h-full">
            <div className="bg-cyan-800/30 p-3 rounded-full mr-4 flex-shrink-0">
              <FaCheck className="text-cyan-400" />
            </div>
            <div>
              <h4 className="text-lg font-medium text-cyan-50 mb-1">{action.title}</h4>
              <p className="text-zinc-400 text-sm">{action.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

function IndustryInsightsPage() {
  const [insightData, setInsightData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  // Removed zipCode and location filtering
  const navigate = useNavigate();

  // Function to fetch insights data
  const fetchInsights = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      // Get industry insights
      const params = {};

      // Only regenerate insights if forceRefresh is true
      if (forceRefresh) {
        try {
          // Get user profile data to use for regenerating insights
          const userRes = await api.get("/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` }
          });

          // Generate new insights with the latest profile data
          try {
            await api.post('/api/industry-insights/generate', {
              industry: userRes.data.subIndustry || userRes.data.industry,
              experience: parseInt(userRes.data.experience),
              skills: userRes.data.skills,
              country: userRes.data.country,
              salaryExpectation: userRes.data.salaryExpectation,
              isIndianData: userRes.data.country.toLowerCase().includes('india'),
              forceRefresh: true
            }, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            console.log("Insights regenerated with latest profile data");
          } catch (error) {
            console.error("Failed to generate real-time insights from Gemini AI:", error.response?.data?.message || error.message);
            // Show a more specific error message but continue to fetch existing insights
          }
        } catch (regenerateErr) {
          console.error("Error regenerating insights:", regenerateErr);
          // Continue to fetch existing insights even if regeneration fails
        }
      }

      // Now fetch the insights (which should be the newly generated ones if forceRefresh was true)
      const insightRes = await api.get("/api/industry-insights/user", {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Industry insights loaded:", insightRes.data);

      // Check if we have city salary data
      if (!insightRes.data.citySalaryData || insightRes.data.citySalaryData.length === 0) {
        console.warn("No city salary data received from API");
      }

      setInsightData(insightRes.data);
    } catch (err) {
      console.error("Error fetching insights:", err);
      setError("Failed to load real-time industry insights. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Removed zipCode filter handlers

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/auth');
          return;
        }

        // Get user profile data
        const userRes = await api.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(userRes.data);
        console.log("User data loaded:", userRes.data);

        // If user has no industry, redirect to onboarding
        if (!userRes.data.industry) {
          navigate('/onboarding');
          return;
        }

        // For returning users, show a welcome back message
        const isReturningUser = localStorage.getItem('previousUserData') !== null;
        if (isReturningUser) {
          setShowWelcomeBack(true);
          console.log("Welcome back! Showing updated insights.");
        }

        // Get industry insights without forcing refresh
        await fetchInsights(false);

        // Update the previous user data record
        localStorage.setItem('previousUserData', JSON.stringify({
          email: userRes.data.email,
          lastLogin: new Date().toISOString()
        }));
      } catch (err) {
        console.error("Error fetching insights:", err);
        setError("Failed to load industry insights. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // We're removing the automatic refresh on window focus to prevent unnecessary refreshes
    // Instead, we'll add a refresh button for users to manually refresh insights when needed
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-zinc-900 to-black">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-cyan-400 mt-4 animate-pulse">Loading industry insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-zinc-900 to-black p-4">
        <div className="bg-zinc-800/70 p-8 rounded-xl border border-red-500/30 shadow-lg max-w-md w-full">
          <div className="text-red-400 text-xl mb-4 flex items-center">
            <FaInfoCircle className="mr-3 text-2xl" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!insightData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-zinc-900 to-black p-4">
        <div className="bg-zinc-800/70 p-8 rounded-xl border border-cyan-500/30 shadow-lg max-w-md w-full">
          <div className="text-cyan-400 text-xl mb-4 flex justify-center items-center">
            <FaInfoCircle className="mr-3 text-2xl" />
            <span>No insights available yet</span>
          </div>
          <p className="text-zinc-400 mb-6 text-center">
            We couldn't find any industry insights for your profile. Try updating your profile information to generate insights.
          </p>
          <button
            onClick={() => navigate('/profile/edit')}
            className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-md"
          >
            Update Profile
          </button>
        </div>
      </div>
    );
  }

  const {
    industryOverview,
    marketDemand,
    citySalaryData,
    expectedSalaryRange,
    skillBasedBoosts,
    topCompanies,
    recommendedCourses,
    careerPathInsights,
    emergingTrends,
    nextActions
  } = insightData;

  // Determine content availability
  const hasSkillsMarketDemand = marketDemand && marketDemand.length > 0;
  const hasTopCompanies = topCompanies && topCompanies.length > 0;
  const hasRecommendedCourses = recommendedCourses && recommendedCourses.length > 0;
  const hasCareerPathInsights = careerPathInsights && careerPathInsights.length > 0;
  const hasEmergingTrends = emergingTrends && emergingTrends.length > 0;
  const hasSkillBasedBoosts = skillBasedBoosts && skillBasedBoosts.length > 0;
  const hasNextActions = nextActions && nextActions.length > 0;

  // Content availability is used to determine the layout of the page

  return (
    <div className="bg-gradient-to-b from-zinc-900 to-black min-h-screen text-white pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-cyan-900/30 to-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-cyan-50 mb-2 flex items-center">
                <FaChartLine className="mr-3 text-cyan-400" />
                Industry Insights
              </h1>
              <h2 className="text-xl text-cyan-300 font-medium">
                {userData?.industry || "Your Industry"}
              </h2>

              {/* Welcome back message for returning users */}
              {showWelcomeBack && (
                <div className="mt-2 text-green-400 text-sm flex items-center">
                  <FaCheck className="mr-2" />
                  Welcome back! Here are your updated insights.
                </div>
              )}
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={() => navigate('/profile/edit')}
                className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white py-2 px-6 rounded-lg flex items-center transition-all shadow-md self-start md:self-auto"
              >
                <FaUser className="mr-2" />
                Edit Profile
              </button>
              <button
                onClick={() => navigate('/comparison')}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white py-2 px-6 rounded-lg flex items-center transition-all shadow-md self-start md:self-auto"
              >
                <FaExchangeAlt className="mr-2" />
                Compare Countries & Roles
              </button>
            </div>
          </div>

          {/* Country display */}
          {userData?.country && (
            <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <div className="flex items-center text-cyan-300">
                <FaMapMarkerAlt className="mr-2" />
                <span className="font-medium">Country: {userData.country}</span>
              </div>
            </div>
          )}

          {/* Last updated info */}
          <div className="flex flex-wrap items-center mt-4 text-cyan-300/80 text-sm">
            <FaCalendar className="mr-2" />
            <span>Last updated: {formatDate(insightData.lastUpdated)}</span>
            <span className="mx-2 hidden md:inline">•</span>
            <span className="mt-1 md:mt-0">Next update: {formatDate(insightData.nextUpdate)}</span>
          </div>
        </div>

        {/* Quick Actions - Always show at the top */}
        <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-zinc-700 shadow-lg mb-6">
          <h3 className="text-xl font-semibold text-cyan-50 mb-4 flex items-center">
            <FaRocket className="mr-3 text-cyan-400" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ActionCard
              icon={<FaUser className="text-cyan-400" />}
              title="Update Your Skills"
              description="Add your latest skills to get more accurate insights"
              actionText="Update Profile"
              onClick={() => navigate('/profile/edit')}
              className="hover:translate-y-px transition-all h-full"
            />
            <ActionCard
              icon={<FaFire className="text-orange-400" />}
              title="Trending Skills"
              description="See what skills are in high demand right now"
              actionText="View Skills"
              onClick={() => document.getElementById('skills-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:translate-y-px transition-all h-full"
            />
            <ActionCard
              icon={<FaExchangeAlt className="text-purple-400" />}
              title="Compare Countries & Roles"
              description="Compare salary and skills between countries and roles"
              actionText="Compare Now"
              onClick={() => navigate('/comparison')}
              className="hover:translate-y-px transition-all h-full"
            />
            <ActionCard
              icon={<FaCalendar className="text-blue-400" />}
              title="Career Planning"
              description="Get personalized career path recommendations"
              actionText="View Paths"
              onClick={() => document.getElementById('career-paths')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:translate-y-px transition-all h-full"
            />
          </div>
        </div>

        {/* Industry Overview - Always full width if available */}
        {industryOverview && (
          <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-zinc-700 shadow-lg mb-6">
            <h2 className="text-2xl font-bold text-cyan-50 mb-4 flex items-center">
              <FaBriefcase className="mr-3 text-cyan-400" />
              Industry Overview
            </h2>
            <div className="prose prose-invert max-w-none">
              {/* Split the overview into paragraphs for better readability */}
              {industryOverview.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-zinc-300 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Next Actions Section - Full width inside overview */}
            {hasNextActions && (
              <NextActionsSection nextActions={nextActions} />
            )}
          </div>
        )}

        {/* Content Grid - Adaptive Layout */}
        <div className="grid grid-cols-1 gap-6">
          {/* Skills vs Market Demand */}
          {hasSkillsMarketDemand && (
            <div id="skills-section" className="bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-zinc-700 shadow-lg">
              <h3 className="text-xl font-semibold text-cyan-50 mb-4 flex items-center">
                <FaChartBar className="mr-3 text-cyan-400" />
                <span className="mr-3">Skills vs Market Demand</span>
                <InfoTooltip
                  title="Skills vs Market Demand"
                  content={
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <p className="text-xs">• Shows skills demand percentage</p>
                      <p className="text-xs">• Green bars = skills you have</p>
                      <p className="text-xs">• Blue bars = skills to acquire</p>
                      <p className="text-xs">• Higher % = greater demand</p>
                    </div>
                  }
                  position="right"
                  iconClass="text-cyan-400 hover:text-cyan-300"
                  iconSize="lg"
                  delay={400}
                />
              </h3>
              <div className="h-80 p-2">
                <SkillsVsMarketChart marketDemand={marketDemand} userSkills={userData?.skills || []} />
              </div>
            </div>
          )}

          {/* City Salary Information - Now full width and below Skills vs Market Demand */}
          <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-zinc-700 shadow-lg">
            <h3 className="text-xl font-semibold text-cyan-50 mb-4 flex items-center">
              <FaChartLine className="mr-3 text-cyan-400" />
              <span className="mr-3">City Salary Information</span>
              <InfoTooltip
                title="City Salary Information"
                content={
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <p className="text-xs">• Shows city salary ranges</p>
                    <p className="text-xs">• White marker = median salary</p>
                    <p className="text-xs">• Yellow marker = your expectation</p>
                    <p className="text-xs">• Trend indicators show direction</p>
                    <p className="text-xs">• Compare cities for best pay</p>
                    <p className="text-xs">• Based on current market data</p>
                  </div>
                }
                position="right"
                iconClass="text-cyan-400 hover:text-cyan-300"
                iconSize="lg"
                delay={400}
              />
            </h3>

            {expectedSalaryRange && (
              <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 mb-6 p-4 bg-gradient-to-r from-cyan-900/20 to-zinc-800/20 rounded-lg border border-zinc-700">
                <div className="text-center">
                  <p className="text-cyan-400/80 text-sm uppercase tracking-wide font-medium">Expected Salary Range</p>
                  <p className="text-xl font-bold text-cyan-50 mt-1">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      maximumFractionDigits: 0
                    }).format(expectedSalaryRange.min)}
                    {' - '}
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      maximumFractionDigits: 0
                    }).format(expectedSalaryRange.max)}
                  </p>
                </div>
              </div>
            )}

            <div className="min-h-[500px]">
              {citySalaryData && citySalaryData.length > 0 ? (
                <CitySalaryRanges
                  data={citySalaryData}
                  userSalaryExpectation={userData?.salaryExpectation}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                  <p className="text-cyan-50/70 mb-2">No city salary data available</p>
                  <p className="text-cyan-50/50 text-sm text-center">
                    We couldn't retrieve salary data for cities in this country. Please try again later or select a different country.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Other sections */}
          {/* Skill-Based Salary Boosts */}
          {hasSkillBasedBoosts && (
            <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-zinc-700 shadow-lg">
              <h3 className="text-xl font-semibold text-cyan-50 mb-4 flex items-center">
                <FaChartLine className="mr-3 text-cyan-400" />
                <span className="mr-3">Skill-Based Salary Boosts</span>
                <InfoTooltip
                  title="Skill-Based Salary Boosts"
                  content={
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <p className="text-xs">• Shows how skills increase salary</p>
                      <p className="text-xs">• Each skill has estimated boost</p>
                      <p className="text-xs">• Acquire skills for higher pay</p>
                      <p className="text-xs">• Based on current market data</p>
                    </div>
                  }
                  position="right"
                  iconClass="text-cyan-400 hover:text-cyan-300"
                  iconSize="lg"
                  delay={400}
                />
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {skillBasedBoosts.map((boost, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gradient-to-r from-zinc-700/30 to-zinc-800/30 rounded-lg border border-zinc-700 hover:border-green-500 transition-all"
                  >
                    <span className="text-cyan-50 font-medium">{boost.skill}</span>
                    <span className="text-green-400 font-bold bg-green-900/20 py-1 px-3 rounded-full text-sm">
                      +{new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0
                      }).format(boost.salaryIncrease < 30 ? boost.salaryIncrease * 30 : boost.salaryIncrease)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Companies */}
          {hasTopCompanies && (
            <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-zinc-700 shadow-lg">
              <h3 className="text-xl font-semibold text-cyan-50 mb-4 flex items-center">
                <FaBriefcase className="mr-3 text-cyan-400" />
                Top Companies Hiring
              </h3>
              <div className="overflow-hidden rounded-lg border border-zinc-700">
                <TopCompaniesTable companies={topCompanies} />
              </div>
            </div>
          )}


          {/* Career Path Insights */}
          {hasCareerPathInsights && (
            <div id="career-paths" className="bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-zinc-700 shadow-lg">
              <h3 className="text-xl font-semibold text-cyan-50 mb-4 flex items-center">
                <FaArrowUp className="mr-3 text-cyan-400" />
                Career Path Insights
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {careerPathInsights.map((path, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-zinc-700/30 to-zinc-800/30 p-5 rounded-lg border border-zinc-700 hover:border-cyan-500 transition-all shadow-md h-full flex flex-col"
                  >
                    <h4 className="text-cyan-300 font-medium text-lg mb-2">{path.title}</h4>
                    <p className="text-zinc-300 mb-3 text-sm flex-grow">{path.description}</p>
                    <div className="flex items-center text-cyan-400 text-sm bg-cyan-900/20 p-2 rounded-lg mt-auto">
                      <FaArrowUp className="mr-2" />
                      <span>Growth Potential: <span className="font-semibold">{path.growthPotential}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emerging Trends */}
          {hasEmergingTrends && (
            <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-zinc-700 shadow-lg">
              <h3 className="text-xl font-semibold text-cyan-50 mb-4 flex items-center">
                <FaBullhorn className="mr-3 text-cyan-400" />
                Emerging Trends
              </h3>
              <div className="space-y-3">
                {emergingTrends.map((trend, index) => (
                  <InsightCard
                    key={index}
                    icon={<FaBullhorn className="text-cyan-400" />}
                    title={trend.name}
                    description={trend.description}
                    className="hover:border-cyan-500 transition-all h-full"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IndustryInsightsPage;
