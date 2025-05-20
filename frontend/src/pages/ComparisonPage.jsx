import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaExchangeAlt, FaGlobe, FaBriefcase, FaMoneyBillWave } from 'react-icons/fa';
import api from '../lib/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CountrySalaryTable from '../components/charts/CountrySalaryTable';
import RoleSkillsComparisonChart from '../components/charts/RoleSkillsComparisonChart';

// Helper function to get color class based on percentile
const getPercentileColorClass = (percentile) => {
  if (percentile > 75) return "bg-green-600/70";
  if (percentile > 50) return "bg-blue-600/70";
  if (percentile > 25) return "bg-yellow-600/70";
  return "bg-red-600/70";
};

// Helper function to get description text based on percentile
const getPercentileDescription = (percentile) => {
  if (percentile > 75) return " This is in the top quartile of the salary range.";
  if (percentile > 50) return " This is above the median salary range.";
  if (percentile > 25) return " This is below the median but still within a common range.";
  return " This is in the bottom quartile of the salary range.";
};

const ComparisonPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [targetCountry, setTargetCountry] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Load saved comparison data and user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/auth');
          return;
        }

        // Check for saved comparison data in localStorage
        const savedComparisonData = localStorage.getItem('comparisonData');
        const savedComparisonInputs = localStorage.getItem('comparisonInputs');

        // Fetch user profile data
        const userRes = await api.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUserData(userRes.data);

        // If we have saved comparison data, restore it
        if (savedComparisonData && savedComparisonInputs) {
          const parsedComparisonData = JSON.parse(savedComparisonData);
          const parsedInputs = JSON.parse(savedComparisonInputs);

          // Restore form inputs
          setTargetCountry(parsedInputs.targetCountry || '');
          setTargetRole(parsedInputs.targetRole || '');
          setCurrentRole(parsedInputs.currentRole || '');

          // If the user data has a different country than what was saved, update the userData state
          if (parsedInputs.currentCountry && parsedInputs.currentCountry !== userRes.data.country) {
            setUserData(prev => ({...prev, country: parsedInputs.currentCountry}));
          }

          // Restore comparison results
          setComparisonData(parsedComparisonData);
          setFormSubmitted(true);
        } else {
          // No saved data, set default values
          setTargetRole('');
          setCurrentRole('');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormSubmitted(true);
    setError(null);

    // Validate that countries are different
    if (userData.country.trim().toLowerCase() === targetCountry.trim().toLowerCase()) {
      setError("Please select different countries for comparison. Current country and target country cannot be the same.");
      setLoading(false);
      setFormSubmitted(false);
      return;
    }

    // Validate that roles are different (only if both are provided)
    if (currentRole && targetRole &&
        currentRole.trim().toLowerCase() === targetRole.trim().toLowerCase()) {
      setError("Please select different roles for comparison. Current role and target role cannot be the same.");
      setLoading(false);
      setFormSubmitted(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // Create request data object
      const requestData = {
        industry: userData.industry,
        experience: userData.experience,
        skills: userData.skills,
        currentCountry: userData.country, // This will now be the user-entered value
        targetCountry: targetCountry,
        currentRole: currentRole, // Using the user-provided current role
        targetRole: targetRole,
        salaryExpectation: userData.salaryExpectation
      };

      console.log('Sending comparison request with data:', requestData);

      const response = await api.post('/api/industry-insights/comparison', requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Received comparison response:', response.data);

      // Check if we have at least some valid data to display
      const hasValidData = response.data && (
        response.data.countrySalaryComparison ||
        response.data.roleComparison ||
        response.data.salaryExpectationAnalysis
      );

      if (!hasValidData) {
        throw new Error('The server returned an empty or invalid response');
      }

      // Log detailed structure for debugging
      if (response.data.roleComparison) {
        console.log('roleComparison structure:', JSON.stringify(response.data.roleComparison, null, 2));
      } else {
        console.log('roleComparison data is missing');
      }

      if (response.data.countrySalaryComparison) {
        console.log('countrySalaryComparison structure:', JSON.stringify(response.data.countrySalaryComparison, null, 2));
      } else {
        console.log('countrySalaryComparison data is missing');
      }

      // Add metadata if not present to indicate data completeness
      if (!response.data._meta) {
        response.data._meta = {
          status: 'partial',
          message: 'Some comparison data is incomplete or missing'
        };
      }

      // Save the comparison data to localStorage
      localStorage.setItem('comparisonData', JSON.stringify(response.data));

      // Save the form inputs to localStorage
      const comparisonInputs = {
        currentCountry: userData.country,
        targetCountry: targetCountry,
        currentRole: currentRole,
        targetRole: targetRole
      };
      localStorage.setItem('comparisonInputs', JSON.stringify(comparisonInputs));

      // Update state with the comparison data
      setComparisonData(response.data);
    } catch (error) {
      console.error('Error generating comparison data:', error);

      // Provide more detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response error data:', error.response.data);
        console.error('Response error status:', error.response.status);

        // Set a more specific error message based on the response
        if (error.response?.data?.message) {
          setError(`Error: ${error.response.data.message}`);
        } else {
          setError(`Failed to generate comparison data. Server returned status: ${error.response.status}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        setError('Failed to generate comparison data. No response received from server.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', error.message);
        setError(`Failed to generate comparison data: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle back button click
  const handleBack = () => {
    navigate('/industry-insights');
  };

  // Clear saved comparison data and start a new comparison
  const handleNewComparison = () => {
    // Clear saved comparison data from localStorage
    localStorage.removeItem('comparisonData');
    localStorage.removeItem('comparisonInputs');

    // Reset form state
    setFormSubmitted(false);
    setComparisonData(null);
  };

  // Render loading state
  if (loading && !formSubmitted) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !loading) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-12">
        <button
          onClick={handleBack}
          className="flex items-center text-cyan-400 hover:text-cyan-300 mb-6"
        >
          <FaArrowLeft className="mr-2" /> Back to Industry Insights
        </button>
        <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="flex items-center text-cyan-400 hover:text-cyan-300 mb-6"
      >
        <FaArrowLeft className="mr-2" /> Back to Industry Insights
      </button>

      <h1 className="text-3xl font-bold text-cyan-50 mb-8 flex items-center">
        <FaExchangeAlt className="mr-3 text-cyan-400" />
        Salary & Skills Comparison
      </h1>

      {!formSubmitted ? (
        // Comparison form
        <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-zinc-700 shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-cyan-50 mb-4">Enter Comparison Details</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="currentCountry" className="block text-cyan-50 mb-2">Current Country</label>
                <input
                  id="currentCountry"
                  type="text"
                  value={userData?.country || ''}
                  onChange={(e) => {
                    setUserData(prev => ({...prev, country: e.target.value}));
                  }}
                  required
                  className="w-full bg-zinc-700 text-cyan-50 border border-zinc-600 rounded-lg p-2.5 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Enter your current country"
                />
              </div>
              <div>
                <label htmlFor="targetCountry" className="block text-cyan-50 mb-2">Target Country</label>
                <input
                  id="targetCountry"
                  type="text"
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  required
                  className="w-full bg-zinc-700 text-cyan-50 border border-zinc-600 rounded-lg p-2.5 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Enter target country"
                />
              </div>
              <div>
                <label htmlFor="currentRole" className="block text-cyan-50 mb-2">Current Role</label>
                <input
                  id="currentRole"
                  type="text"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  required
                  className="w-full bg-zinc-700 text-cyan-50 border border-zinc-600 rounded-lg p-2.5 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Enter your current role (e.g. Software Engineer)"
                />
              </div>
              <div>
                <label htmlFor="targetRole" className="block text-cyan-50 mb-2">Target Role</label>
                <input
                  id="targetRole"
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  required
                  className="w-full bg-zinc-700 text-cyan-50 border border-zinc-600 rounded-lg p-2.5 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Enter your target role (e.g. Data Scientist)"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-cyan-600 text-white py-2.5 px-4 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
            >
              Generate Comparison
            </button>
          </form>
        </div>
      ) : (
        // Comparison results
        <>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {comparisonData ? (
                <div className="grid grid-cols-1 gap-6">
                  {/* Warning message for partial data */}
                  {(comparisonData._meta?.status === 'partial' ||
                    !comparisonData.roleComparison ||
                    !comparisonData.salaryExpectationAnalysis) && (
                    <div className="bg-yellow-900/30 border border-yellow-800 text-yellow-200 p-4 rounded-lg mb-4">
                      <p className="font-medium">
                        {comparisonData._meta?.message ||
                         "Note: Some comparison data is incomplete or missing. We're showing all available information."}
                      </p>
                      <p className="mt-2 text-sm">
                        This may happen when comparing unusual role and country combinations or during high server load.
                      </p>
                    </div>
                  )}



                  {/* Salary Comparison Chart */}
                  {comparisonData.countrySalaryComparison?.currentCountry && comparisonData.countrySalaryComparison?.targetCountry && (
                    <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-zinc-700 shadow-lg">
                      <h3 className="text-xl font-semibold text-cyan-50 mb-4 flex items-center">
                        <FaGlobe className="mr-3 text-cyan-400" />
                        Salary Comparison: {comparisonData.countrySalaryComparison.currentCountry.name || userData?.country} vs {comparisonData.countrySalaryComparison.targetCountry.name || targetCountry}
                      </h3>
                      <div className="h-[600px] p-2">
                        <CountrySalaryTable
                          data={comparisonData.countrySalaryComparison}
                          userSalaryExpectation={userData?.salaryExpectation}
                        />
                      </div>
                    </div>
                  )}

                  {/* Skills Comparison Chart */}
                  {(() => {
                    // Complete role comparison data
                    if (comparisonData.roleComparison?.currentRole && comparisonData.roleComparison?.targetRole) {
                      return (
                        <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-zinc-700 shadow-lg">
                          <h3 className="text-xl font-semibold text-cyan-50 mb-4 flex items-center">
                            <FaBriefcase className="mr-3 text-cyan-400" />
                            Skills Comparison: {comparisonData.roleComparison.currentRole.title || currentRole} vs {comparisonData.roleComparison.targetRole.title || targetRole}
                          </h3>
                          <div className="h-96 p-2">
                            <RoleSkillsComparisonChart
                              data={comparisonData.roleComparison}
                              userSkills={userData?.skills || []}
                            />
                          </div>
                        </div>
                      );
                    }
                    // Partial role comparison data
                    else if (comparisonData.roleComparison) {
                      return (
                        <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-zinc-700 shadow-lg">
                          <h3 className="text-xl font-semibold text-cyan-50 mb-4 flex items-center">
                            <FaBriefcase className="mr-3 text-cyan-400" />
                            Skills Comparison: {currentRole} vs {targetRole}
                          </h3>
                          <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                            <p className="text-cyan-50 mb-4">
                              The skills comparison data is incomplete. Here's what we know:
                            </p>

                            {/* Display any available skills data */}
                            {comparisonData.roleComparison.skillGaps && comparisonData.roleComparison.skillGaps.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-cyan-300 font-medium mb-2">Skill Gaps:</h4>
                                <ul className="list-disc pl-5 text-cyan-50">
                                  {comparisonData.roleComparison.skillGaps.map((skill) => (
                                    <li key={`gap-${skill}`}>{skill}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {comparisonData.roleComparison.transferableSkills && comparisonData.roleComparison.transferableSkills.length > 0 && (
                              <div>
                                <h4 className="text-cyan-300 font-medium mb-2">Transferable Skills:</h4>
                                <ul className="list-disc pl-5 text-cyan-50">
                                  {comparisonData.roleComparison.transferableSkills.map((skill) => (
                                    <li key={`transferable-${skill}`}>{skill}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {(!comparisonData.roleComparison.skillGaps || comparisonData.roleComparison.skillGaps.length === 0) &&
                             (!comparisonData.roleComparison.transferableSkills || comparisonData.roleComparison.transferableSkills.length === 0) && (
                              <p className="text-yellow-300">No detailed skills data available.</p>
                            )}
                          </div>
                        </div>
                      );
                    }
                    // No role comparison data
                    return null;
                  })()}

                  {/* Salary Expectation Analysis - Enhanced Version or Fallback */}
                  {comparisonData.salaryExpectationAnalysis ? (
                    <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-zinc-700 shadow-lg">
                      <h3 className="text-xl font-semibold text-cyan-50 mb-4 flex items-center">
                        <FaMoneyBillWave className="mr-3 text-cyan-400" />
                        Salary Expectation Analysis
                      </h3>

                      {/* User's salary expectation display */}
                      <div className="mb-6 p-4 bg-gradient-to-br from-zinc-800/80 via-zinc-800/50 to-zinc-900 rounded-xl border border-yellow-500/30">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2 shadow-glow-yellow"></div>
                            <span className="text-yellow-400 font-medium text-lg">Your Salary Expectation:</span>
                          </div>
                          <span className="text-cyan-50 sm:ml-2 text-lg bg-zinc-800/70 py-1 px-4 rounded-full">
                            {userData?.salaryExpectation ?
                              new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(userData.salaryExpectation))
                              : 'Not specified'}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 bg-zinc-800/50 rounded-lg border border-zinc-700">
                        {/* Realistic assessment with explanation */}
                        <div className="mb-5">
                          <div className="flex items-center mb-2">
                            <span className="font-medium text-lg text-cyan-50">Is Your Expectation Realistic? </span>
                            <span className={`ml-2 px-3 py-1 rounded-full font-medium ${comparisonData.salaryExpectationAnalysis.isRealistic ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                              {comparisonData.salaryExpectationAnalysis.isRealistic ? "Yes" : "No"}
                            </span>
                          </div>
                          <p className="text-cyan-50/80 text-sm ml-1">
                            {comparisonData.salaryExpectationAnalysis.isRealistic
                              ? "Your salary expectation is within the realistic range for this role in the target market."
                              : "Your salary expectation may be outside the typical range for this role in the target market."}
                          </p>
                        </div>

                        {/* Difference from median with visual indicator */}
                        <div className="mb-5">
                          <div className="flex items-center mb-2">
                            <span className="font-medium text-lg text-cyan-50">Difference from Market Median: </span>
                            <span className={`ml-2 px-3 py-1 rounded-full font-medium ${comparisonData.salaryExpectationAnalysis.differenceFromMedian >= 0 ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                              {comparisonData.salaryExpectationAnalysis.differenceFromMedian >= 0 ? "+" : ""}
                              {comparisonData.salaryExpectationAnalysis.differenceFromMedian.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </span>
                          </div>
                          <p className="text-cyan-50/80 text-sm ml-1">
                            Your expected salary is {Math.abs(comparisonData.salaryExpectationAnalysis.differenceFromMedian).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            {comparisonData.salaryExpectationAnalysis.differenceFromMedian >= 0 ? " above " : " below "}
                            the median salary for {comparisonData.roleComparison?.targetRole?.title || targetRole} in {comparisonData.countrySalaryComparison?.targetCountry?.name || targetCountry}.
                          </p>
                        </div>

                        {/* Percentile with visual representation */}
                        <div className="mb-5">
                          <div className="flex items-center mb-2">
                            <span className="font-medium text-lg text-cyan-50">Market Percentile: </span>
                            <span className="ml-2 px-3 py-1 rounded-full font-medium bg-blue-900/30 text-blue-400">
                              {comparisonData.salaryExpectationAnalysis.percentile}%
                            </span>
                          </div>

                          {/* Percentile bar visualization */}
                          <div className="mt-2 mb-3 relative h-8 bg-zinc-700/50 rounded-lg overflow-hidden">
                            <div
                              className={`absolute top-0 left-0 h-full ${getPercentileColorClass(comparisonData.salaryExpectationAnalysis.percentile)}`}
                              style={{ width: `${comparisonData.salaryExpectationAnalysis.percentile}%` }}
                            ></div>
                            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm drop-shadow-md">
                                {comparisonData.salaryExpectationAnalysis.percentile}th Percentile
                              </span>
                            </div>
                          </div>

                          <p className="text-cyan-50/80 text-sm ml-1">
                            Your salary expectation is higher than {comparisonData.salaryExpectationAnalysis.percentile}% of salaries for this role in the target market.
                            {getPercentileDescription(comparisonData.salaryExpectationAnalysis.percentile)}
                          </p>
                        </div>

                        {/* Market context */}
                        <div className="mb-5">
                          <h4 className="font-medium text-lg text-cyan-50 mb-2">Market Context</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div className="bg-zinc-700/30 p-3 rounded-lg border border-zinc-600">
                              <p className="text-cyan-300 text-sm font-medium">Role Demand</p>
                              <p className="text-cyan-50 text-lg">
                                {comparisonData.roleComparison?.targetRole?.demandLevel || "Medium"}
                              </p>
                            </div>
                            <div className="bg-zinc-700/30 p-3 rounded-lg border border-zinc-600">
                              <p className="text-cyan-300 text-sm font-medium">Growth Outlook</p>
                              <p className="text-cyan-50 text-lg">
                                {comparisonData.roleComparison?.targetRole?.growthOutlook || "Stable"}
                              </p>
                            </div>
                            <div className="bg-zinc-700/30 p-3 rounded-lg border border-zinc-600">
                              <p className="text-cyan-300 text-sm font-medium">Avg. Market Salary</p>
                              <p className="text-cyan-50 text-lg">
                                {comparisonData.roleComparison?.targetRole?.avgSalary?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || "Not available"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Detailed recommendation */}
                        <div className="mt-5 p-4 bg-gradient-to-br from-zinc-700/50 to-zinc-700/30 rounded-lg border border-zinc-600">
                          <h4 className="font-medium text-lg text-cyan-50 mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Expert Recommendation
                          </h4>
                          <p className="text-cyan-50 leading-relaxed">
                            {comparisonData.salaryExpectationAnalysis.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : userData?.salaryExpectation ? (
                    <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-6 rounded-xl border border-zinc-700 shadow-lg">
                      <h3 className="text-xl font-semibold text-cyan-50 mb-4 flex items-center">
                        <FaMoneyBillWave className="mr-3 text-cyan-400" />
                        Salary Expectation
                      </h3>
                      <div className="p-5 bg-zinc-800/50 rounded-lg border border-zinc-700">
                        <div className="mb-5">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <div className="flex items-center">
                              <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2 shadow-glow-yellow"></div>
                              <span className="text-yellow-400 font-medium text-lg">Your Salary Expectation:</span>
                            </div>
                            <span className="text-cyan-50 sm:ml-2 text-lg bg-zinc-800/70 py-1 px-4 rounded-full">
                              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(userData.salaryExpectation))}
                            </span>
                          </div>
                        </div>
                        <div className="mt-5 p-4 bg-gradient-to-br from-zinc-700/50 to-zinc-700/30 rounded-lg border border-zinc-600">
                          <h4 className="font-medium text-lg text-cyan-50 mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Note
                          </h4>
                          <p className="text-cyan-50 leading-relaxed">
                            We couldn't generate a detailed salary analysis for this comparison. This may happen when comparing unusual role and country combinations.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Try again button */}
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={handleNewComparison}
                      className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white py-2 px-6 rounded-lg flex items-center transition-all shadow-md"
                    >
                      <FaExchangeAlt className="mr-2" />
                      Try Another Comparison
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg">
                  <p className="font-medium">Failed to generate comparison data.</p>
                  <p className="mt-2">{error || "Please try again with different parameters."}</p>
                  <button
                    onClick={handleNewComparison}
                    className="mt-4 bg-red-700 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center transition-all shadow-md"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ComparisonPage;
