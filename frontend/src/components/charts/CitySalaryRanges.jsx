import React from 'react';
import PropTypes from 'prop-types';

// TrendBadge component
const TrendBadge = ({ trend }) => {
  // Determine trend class based on trend value
  let trendClass = 'bg-blue-900/30 text-blue-400'; // Default for 'Stable'
  if (trend === 'Increasing') {
    trendClass = 'bg-green-900/30 text-green-400';
  } else if (trend === 'Decreasing') {
    trendClass = 'bg-red-900/30 text-red-400';
  }

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${trendClass}`}>
      {trend}
    </span>
  );
};

TrendBadge.propTypes = {
  trend: PropTypes.string.isRequired
};

// Helper function to get demand level class based on level
const getDemandLevelClass = (demandLevel) => {
  if (demandLevel === 'High') return 'bg-green-900/30 text-green-400';
  if (demandLevel === 'Low') return 'bg-red-900/30 text-red-400';
  return 'bg-cyan-900/30 text-cyan-300'; // Default for 'Medium' or any other value
};

// Helper function to validate and parse data
const validateAndParseData = (inputData) => {
  // Debug the data being received
  console.log("CitySalaryRanges received data:", inputData);
  console.log("CitySalaryRanges data type:", typeof inputData);
  console.log("CitySalaryRanges data is array:", Array.isArray(inputData));
  console.log("CitySalaryRanges data length:", inputData?.length);

  let data = inputData;

  // Log the structure of the first city if available
  if (data && data.length > 0) {
    console.log("First city structure:", data[0]);
    console.log("First city rolesSalaries:", data[0].rolesSalaries);
    if (data[0].rolesSalaries && data[0].rolesSalaries.length > 0) {
      console.log("First role in first city:", data[0].rolesSalaries[0]);
    }
  }

  // If data is not an array, try to convert it
  if (data && !Array.isArray(data)) {
    try {
      console.log("Attempting to parse data:", data);
      if (typeof data === 'string') {
        data = JSON.parse(data);
        console.log("Parsed data:", data);
      }
    } catch (error) {
      console.error("Error parsing data:", error);
      return { isValid: false, data: null, error: "Failed to parse data" };
    }
  }

  // If no data, return invalid
  if (!data || data.length === 0) {
    console.error("No city salary data available or data is empty");
    return { isValid: false, data: null, error: "No city salary data available" };
  }

  // Check if data has the expected structure
  const hasValidStructure = data.every(city => {
    const isValid = city &&
      typeof city === 'object' &&
      city.city &&
      city.rolesSalaries &&
      Array.isArray(city.rolesSalaries);

    // Log more detailed validation info
    if (!isValid) {
      console.error("Invalid city structure:", city);
      console.error("Has city property:", !!city?.city);
      console.error("Has rolesSalaries property:", !!city?.rolesSalaries);
      console.error("rolesSalaries is array:", Array.isArray(city?.rolesSalaries));
      console.error("rolesSalaries length:", city?.rolesSalaries?.length);
    }

    // Allow empty rolesSalaries array - we'll add a default role later
    return isValid;
  });

  if (!hasValidStructure) {
    console.error("City salary data has invalid structure:", data);
    return { isValid: false, data: null, error: "Invalid city salary data format" };
  }

  return { isValid: true, data, error: null };
};

// Main component
const CitySalaryRanges = ({ data = [], userSalaryExpectation }) => {
  // Validate and parse the data
  const { isValid, data: validatedData, error } = validateAndParseData(data);

  // If data is invalid, show error message
  if (!isValid) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-cyan-50/70">{error}</p>
      </div>
    );
  }

  // Use the validated data
  data = validatedData;

  // Format currency - always use USD
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Parse user salary expectation if provided
  let parsedUserSalary = null;
  if (userSalaryExpectation) {
    // Try to extract a number from the string (handle formats like "$100,000" or "100k")
    const numericValue = userSalaryExpectation.replace(/[^0-9.]/g, '');
    if (numericValue) {
      parsedUserSalary = parseFloat(numericValue);

      // Handle "k" notation (e.g., "100k" = 100,000)
      if (userSalaryExpectation.toLowerCase().includes('k')) {
        parsedUserSalary *= 1000;
      }
    }
  }

  // Helper function to process city data
  const processCityData = (cityData) => {
    if (!cityData || typeof cityData !== 'object') {
      console.error("Invalid city data:", cityData);
      // Return a default city object with empty roles
      return {
        city: "Unknown City",
        baseSalary: 0,
        trend: "Stable",
        demandLevel: "Medium",
        roles: []
      };
    }

    console.log("Processing city data:", cityData);
    console.log("City has rolesSalaries:", !!cityData.rolesSalaries);
    if (cityData.rolesSalaries) {
      console.log("rolesSalaries length:", cityData.rolesSalaries.length);
      console.log("First role:", cityData.rolesSalaries[0]);
    }

    // Create base city data with fallbacks for missing properties
    const processedCity = {
      city: cityData.city || "Unknown City",
      baseSalary: cityData.avgSalary || 0,
      trend: cityData.salaryTrend || "Stable",
      demandLevel: cityData.demandLevel || "Medium"
    };

    // Process role salary data
    let roles = [];
    if (cityData.rolesSalaries && Array.isArray(cityData.rolesSalaries)) {
      roles = cityData.rolesSalaries.map(role => {
        if (!role || typeof role !== 'object') {
          return {
            role: "Unknown Role",
            minSalary: 0,
            medianSalary: 0,
            maxSalary: 0,
            location: processedCity.city
          };
        }

        return {
          role: role.role || "Unknown Role",
          minSalary: role.minSalary || 0,
          medianSalary: role.medianSalary || 0,
          maxSalary: role.maxSalary || 0,
          location: role.location || processedCity.city
        };
      });
    }

    // If no roles were found, add a default role
    if (roles.length === 0) {
      console.warn(`No roles found for ${processedCity.city}, adding default role`);
      roles = [
        {
          role: "Software Developer",
          minSalary: 60000,
          medianSalary: 90000,
          maxSalary: 120000,
          location: processedCity.city
        }
      ];
    }

    const result = {
      ...processedCity,
      roles: roles
    };

    console.log(`Processed city ${processedCity.city} with ${roles.length} roles`);
    return result;
  };

  // Limit to top 3 cities and process each city
  const topCities = data.slice(0, 3);
  const cityRoleRanges = topCities.map(processCityData);

  // Check if we have valid city data after processing
  if (!cityRoleRanges || cityRoleRanges.length === 0) {
    console.error("No valid city data after processing");
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
        <p className="text-cyan-50/70 mb-2">No city salary data available</p>
        <p className="text-cyan-50/50 text-sm text-center">
          We couldn't retrieve salary data for cities in this country. Please try again later or select a different country.
        </p>
      </div>
    );
  }

  // Log the processed city data for debugging
  console.log("Processed city data:", cityRoleRanges);
  console.log("Cities with roles:", cityRoleRanges.filter(city => city.roles && city.roles.length > 0).length);

  return (
    <div className="min-h-[500px] overflow-y-auto">
      {/* City headers in 3-column layout with enhanced styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cityRoleRanges.map((city, index) => (
          <div
            key={`city-header-${city.city}-${index}`}
            className="text-center bg-gradient-to-br from-cyan-900/30 via-zinc-800/50 to-zinc-900 p-5 rounded-xl border border-cyan-700/50 shadow-lg hover:shadow-cyan-900/10 transition-all"
          >
            <h3 className="text-cyan-50 font-medium text-xl mb-3">{city.city}</h3>
            <div className="flex flex-wrap justify-center gap-2 mb-3">
              <TrendBadge trend={city.trend} />
              <span className={`text-xs px-2 py-1 rounded-full ${getDemandLevelClass(city.demandLevel)}`}>
                {city.demandLevel} Demand
              </span>
            </div>
            <div className="text-cyan-50/70 text-sm bg-zinc-800/50 py-2 px-3 rounded-lg inline-block">
              Base Salary: <span className="text-cyan-300 font-medium">{formatCurrency(city.baseSalary)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Salary ranges organized by city columns */}
      {cityRoleRanges.some(city => city.roles && city.roles.length > 0) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {cityRoleRanges.map((city, cityIndex) => (
            <div key={`city-column-${city.city}-${cityIndex}`} className="mb-6">
              <div className="bg-gradient-to-r from-cyan-900/30 to-zinc-900 p-4 rounded-lg border-l-4 border-cyan-500 mb-5 shadow-md">
                <h4 className="text-cyan-50 font-medium text-lg flex items-center">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></span>
                  {city.city}
                </h4>
              </div>
              <div className="space-y-4">
                {city.roles && city.roles.map((roleData, roleIndex) => {
                  // Calculate percentage for visual indicators
                  const medianPercentage = ((roleData.medianSalary - roleData.minSalary) / (roleData.maxSalary - roleData.minSalary)) * 100;
                  const userSalaryPercentage = parsedUserSalary ?
                    Math.max(0, Math.min(100, ((parsedUserSalary - roleData.minSalary) / (roleData.maxSalary - roleData.minSalary)) * 100)) : null;

                  return (
                    <div key={`city-role-${city.city}-${roleData.role}-${roleIndex}`} className="relative">
                      <div className="bg-gradient-to-br from-zinc-800/70 to-zinc-900/90 p-4 rounded-lg border border-zinc-700 hover:border-cyan-600/50 transition-all shadow-md">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-cyan-50/90 text-sm font-medium">{roleData.role}</span>
                          <span className="text-cyan-300 font-medium text-sm bg-cyan-900/30 py-1 px-3 rounded-full">
                            {formatCurrency(roleData.medianSalary)}
                          </span>
                        </div>
                        <div className="relative h-3 bg-zinc-800 rounded-full mb-3">
                          <div
                            className="absolute h-3 rounded-full bg-gradient-to-r from-cyan-600/30 via-cyan-500/50 to-cyan-400/70"
                            style={{
                              left: '0%',
                              width: '100%'
                            }}
                          ></div>
                          <div
                            className="absolute w-1.5 h-3 bg-white rounded-full shadow-glow-cyan"
                            style={{
                              left: `${medianPercentage}%`,
                              transform: 'translateX(-50%)'
                            }}
                          ></div>
                          {parsedUserSalary && (
                            <div
                              className="absolute w-2.5 h-5 bg-yellow-400 rounded-full top-1/2 transform -translate-y-1/2 shadow-glow-yellow"
                              style={{
                                left: `${userSalaryPercentage}%`,
                                transform: 'translateX(-50%)'
                              }}
                            ></div>
                          )}
                        </div>
                        <div className="flex justify-between text-xs text-cyan-50/70 font-medium">
                          <span>{formatCurrency(roleData.minSalary)}</span>
                          <span>{formatCurrency(roleData.maxSalary)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-6 bg-zinc-800/50 rounded-lg border border-zinc-700 shadow-inner">
          <p className="text-cyan-50/70">No role data available for these cities</p>
        </div>
      )}

      {/* User salary expectation comparison with improved styling */}
      {userSalaryExpectation && (
        <div className="mt-8 p-5 bg-gradient-to-br from-zinc-800/80 via-zinc-800/50 to-zinc-900 rounded-xl border border-yellow-500/30 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center mb-4 gap-2">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2 shadow-glow-yellow"></div>
              <span className="text-yellow-400 font-medium text-lg">Your Salary Expectation:</span>
            </div>
            <span className="text-cyan-50 sm:ml-2 text-lg bg-zinc-800/70 py-1 px-4 rounded-full">
              {formatCurrency(parsedUserSalary)}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-zinc-800/30 p-3 rounded-lg border border-zinc-700">
              <p className="text-cyan-50/80 text-sm">
                The yellow markers on each salary range show where your expected salary falls within each role's salary range across different cities. This helps you compare your expectations with market rates.
              </p>
            </div>
            <div className="bg-zinc-800/30 p-3 rounded-lg border border-zinc-700">
              <p className="text-cyan-50/80 text-sm">
                Consider how your salary expectation compares to different roles in each city. This can help you identify which roles and locations might be the best match for your salary expectations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

CitySalaryRanges.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      city: PropTypes.string,
      avgSalary: PropTypes.number,
      salaryTrend: PropTypes.string,
      demandLevel: PropTypes.string,
      rolesSalaries: PropTypes.arrayOf(
        PropTypes.shape({
          role: PropTypes.string,
          minSalary: PropTypes.number,
          medianSalary: PropTypes.number,
          maxSalary: PropTypes.number,
          location: PropTypes.string
        })
      )
    })
  ),
  userSalaryExpectation: PropTypes.string
};

export default CitySalaryRanges;