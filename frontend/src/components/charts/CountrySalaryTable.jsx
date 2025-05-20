import React from 'react';
import PropTypes from 'prop-types';

// Trend Badge Component
const TrendBadge = ({ trend }) => {
  if (!trend) return null;

  const trendLower = trend.toLowerCase();

  const getPercentage = (trendText) => {
    const percentMatch = trendText.match(/(\d+(\.\d+)?)\s*%/);
    return percentMatch ? percentMatch[0] : '';
  };

  const percentage = getPercentage(trend);
  const hasPercentage = percentage !== '';

  if (trendLower.includes('rapid') && trendLower.includes('increasing')) {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-green-900/50 text-green-400 flex items-center">
        <span className="mr-1">↑↑</span>
        <span>Rapidly Increasing {hasPercentage ? `(${percentage})` : ''}</span>
      </span>
    );
  } else if (trendLower.includes('increasing')) {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-green-900/50 text-green-400 flex items-center">
        <span className="mr-1">↑</span>
        <span>Increasing {hasPercentage ? `(${percentage})` : ''}</span>
      </span>
    );
  } else if (trendLower.includes('rapid') && trendLower.includes('decreasing')) {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-red-900/50 text-red-400 flex items-center">
        <span className="mr-1">↓↓</span>
        <span>Rapidly Decreasing {hasPercentage ? `(${percentage})` : ''}</span>
      </span>
    );
  } else if (trendLower.includes('decreasing')) {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-red-900/50 text-red-400 flex items-center">
        <span className="mr-1">↓</span>
        <span>Decreasing {hasPercentage ? `(${percentage})` : ''}</span>
      </span>
    );
  } else if (trendLower.includes('slight') && trendLower.includes('up')) {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-green-900/50 text-green-400 flex items-center">
        <span className="mr-1">↗</span>
        <span>Slight Upward {hasPercentage ? `(${percentage})` : ''}</span>
      </span>
    );
  } else if (trendLower.includes('slight') && trendLower.includes('down')) {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-red-900/50 text-red-400 flex items-center">
        <span className="mr-1">↘</span>
        <span>Slight Downward {hasPercentage ? `(${percentage})` : ''}</span>
      </span>
    );
  } else {
    return (
      <span className="text-xs px-2 py-1 rounded-full bg-blue-900/50 text-blue-400 flex items-center">
        <span className="mr-1">→</span>
        <span>Stable {hasPercentage ? `(${percentage})` : ''}</span>
      </span>
    );
  }
};

TrendBadge.propTypes = {
  trend: PropTypes.string
};

const CountrySalaryTable = ({ data, userSalaryExpectation }) => {
  // If no data, show placeholder
  if (!data?.currentCountry || !data?.targetCountry) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-cyan-50/70">No salary comparison data available</p>
      </div>
    );
  }

  // Format currency - always use USD
  const formatCurrency = (amount) => {
    // Always use USD with US locale
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Function to get CSS class based on demand level
  const getDemandLevelClass = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'bg-green-900/50 text-green-400';
      case 'medium':
        return 'bg-yellow-900/50 text-yellow-400';
      case 'low':
        return 'bg-red-900/50 text-red-400';
      default:
        return 'bg-zinc-800 text-zinc-400';
    }
  };

  // Combine cities from both countries for comparison
  const currentCountryCities = data.currentCountry.topCities || [];
  const targetCountryCities = data.targetCountry.topCities || [];

  // Get all unique roles across both countries
  const getAllUniqueRoles = () => {
    const roles = new Set();

    // Add roles from current country
    currentCountryCities.forEach(city => {
      if (city.rolesSalaries && city.rolesSalaries.length > 0) {
        city.rolesSalaries.forEach(role => {
          roles.add(role.role);
        });
      }
    });

    // Add roles from target country
    targetCountryCities.forEach(city => {
      if (city.rolesSalaries && city.rolesSalaries.length > 0) {
        city.rolesSalaries.forEach(role => {
          roles.add(role.role);
        });
      }
    });

    return Array.from(roles).sort((a, b) => a.localeCompare(b));
  };

  const uniqueRoles = getAllUniqueRoles();

  // Process data for each country
  const processCountryData = (countryCities, countryName, isCurrentCountry) => {
    const roleData = {};

    // Initialize with empty arrays for each role
    uniqueRoles.forEach(role => {
      roleData[role] = [];
    });

    // Fill in data for each role and city
    countryCities.forEach(city => {
      if (city.rolesSalaries && city.rolesSalaries.length > 0) {
        city.rolesSalaries.forEach(roleSalary => {
          if (roleData[roleSalary.role]) {
            roleData[roleSalary.role].push({
              ...roleSalary,
              city: city.city,
              country: countryName,
              isCurrentCountry,
              avgSalary: city.avgSalary,
              salaryTrend: city.salaryTrend,
              demandLevel: city.demandLevel
            });
          }
        });
      }
    });

    // Sort each role's data by median salary (descending)
    Object.keys(roleData).forEach(role => {
      roleData[role].sort((a, b) => b.medianSalary - a.medianSalary);
    });

    return roleData;
  };

  const currentCountryData = processCountryData(currentCountryCities, data.currentCountry.name, true);
  const targetCountryData = processCountryData(targetCountryCities, data.targetCountry.name, false);

  // Create a combined data structure for side-by-side comparison
  const combinedData = {};

  // Initialize with all roles
  uniqueRoles.forEach(role => {
    combinedData[role] = {
      current: {},
      target: {}
    };

    // Process current country data
    if (currentCountryData[role] && currentCountryData[role].length > 0) {
      currentCountryData[role].forEach(item => {
        if (!combinedData[role].current[item.city]) {
          combinedData[role].current[item.city] = item;
        }
      });
    }

    // Process target country data
    if (targetCountryData[role] && targetCountryData[role].length > 0) {
      targetCountryData[role].forEach(item => {
        if (!combinedData[role].target[item.city]) {
          combinedData[role].target[item.city] = item;
        }
      });
    }
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-1 gap-6">
        {/* Main comparison table */}
        <div className="overflow-x-auto bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-4 rounded-xl border border-zinc-700 shadow-lg">
          <table className="w-full text-sm text-left text-cyan-50 border-collapse border-2 border-zinc-600 shadow-lg">
            <thead className="text-xs uppercase bg-zinc-800 text-cyan-300 sticky top-0">
              {/* Main header with JOB ROLE and COUNTRIES */}
              <tr className="border-b-2 border-zinc-600">
                <th scope="col" className="px-4 py-4 border-r-2 border-zinc-600 bg-zinc-900/80 font-bold">JOB ROLE</th>
                <th scope="col" className="px-4 py-4 text-center border-r-2 border-zinc-600 bg-gradient-to-r from-cyan-900/30 to-cyan-800/20" colSpan="3">
                  <div className="flex items-center justify-center">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 mr-2"></span>
                    {data.currentCountry.name}
                  </div>
                </th>
                <th scope="col" className="px-4 py-4 text-center bg-gradient-to-r from-indigo-900/30 to-blue-800/20" colSpan="3">
                  <div className="flex items-center justify-center">
                    <span className="w-3 h-3 rounded-full bg-blue-400 mr-2"></span>
                    {data.targetCountry.name}
                  </div>
                </th>
              </tr>

              {/* City headers */}
              <tr className="border-b-2 border-zinc-600">
                <th scope="col" className="px-4 py-3 border-r-2 border-zinc-600 bg-zinc-900/80"></th>

                {/* Current Country City Headers */}
                {currentCountryCities.slice(0, 3).map((city) => (
                  <th
                    key={`current-city-header-${city.city}`}
                    scope="col"
                    className="px-4 py-3 text-center border-r border-zinc-600 text-cyan-300 bg-cyan-900/20 font-medium"
                  >
                    {city.city}
                  </th>
                ))}
                {/* Fill empty slots if less than 3 cities */}
                {Array.from({ length: Math.max(0, 3 - currentCountryCities.slice(0, 3).length) }).map((_, index) => (
                  <th
                    key={`current-empty-header-${data.currentCountry.name}-${index}`}
                    scope="col"
                    className="px-4 py-3 text-center border-r border-zinc-600 text-zinc-500 bg-cyan-900/10"
                  >
                    -
                  </th>
                ))}

                {/* Target Country City Headers */}
                {targetCountryCities.slice(0, 3).map((city, index) => (
                  <th
                    key={`target-city-header-${city.city}`}
                    scope="col"
                    className={`px-4 py-3 text-center ${index < 2 ? 'border-r border-zinc-600' : ''} text-blue-300 bg-indigo-900/20 font-medium`}
                  >
                    {city.city}
                  </th>
                ))}
                {/* Fill empty slots if less than 3 cities */}
                {Array.from({ length: Math.max(0, 3 - targetCountryCities.slice(0, 3).length) }).map((_, index) => (
                  <th
                    key={`target-empty-header-${data.targetCountry.name}-${index}`}
                    scope="col"
                    className={`px-4 py-3 text-center ${index < (3 - targetCountryCities.slice(0, 3).length - 1) ? 'border-r border-zinc-600' : ''} text-zinc-500 bg-indigo-900/10`}
                  >
                    -
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {uniqueRoles.length > 0 ? (
                uniqueRoles.map(role => {
                  // Get cities for both countries
                  const currentCities = Object.keys(combinedData[role].current).slice(0, 3);
                  const targetCities = Object.keys(combinedData[role].target).slice(0, 3);

                  // Create a row for this role
                  return (
                    <tr
                      key={`role-${role}`}
                      className="border-b border-zinc-600 hover:bg-zinc-700/20"
                    >
                      {/* Role column */}
                      <td className="px-4 py-3 font-medium bg-zinc-900/50 border-r-2 border-zinc-600 text-cyan-50">
                        {role}
                      </td>

                      {/* Current Country Cities */}
                      {[0, 1, 2].map(index => {
                        const cityName = currentCities[index];
                        const cityData = cityName ? combinedData[role].current[cityName] : null;

                        return (
                          <td
                            key={cityName ? `current-${role}-city-${cityName}` : `current-${role}-empty-${index}`}
                            className="px-3 py-2 border-r border-zinc-600 align-top bg-cyan-900/5"
                          >
                            {cityData ? (
                              <div className="flex flex-col gap-1">
                                <div className="text-cyan-50 font-medium">
                                  {formatCurrency(cityData.medianSalary)}
                                  <span className="text-zinc-400 text-xs ml-1">
                                    ({formatCurrency(cityData.minSalary)} - {formatCurrency(cityData.maxSalary)})
                                  </span>
                                </div>
                                <div className="flex items-center mt-1">
                                  <TrendBadge trend={cityData.salaryTrend} />
                                </div>
                                <div className="mt-1">
                                  <span className={`text-xs px-2 py-1 rounded-full ${getDemandLevelClass(cityData.demandLevel)}`}>
                                    {cityData.demandLevel}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-zinc-500 text-xs">No data</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Target Country Cities */}
                      {[0, 1, 2].map(index => {
                        const cityName = targetCities[index];
                        const cityData = cityName ? combinedData[role].target[cityName] : null;
                        const isLastColumn = index === 2;

                        return (
                          <td
                            key={cityName ? `target-${role}-city-${cityName}` : `target-${role}-empty-${index}`}
                            className={`px-3 py-2 ${!isLastColumn ? 'border-r border-zinc-600' : ''} align-top bg-indigo-900/5`}
                          >
                            {cityData ? (
                              <div className="flex flex-col gap-1">
                                <div className="text-cyan-50 font-medium">
                                  {formatCurrency(cityData.medianSalary)}
                                  <span className="text-zinc-400 text-xs ml-1">
                                    ({formatCurrency(cityData.minSalary)} - {formatCurrency(cityData.maxSalary)})
                                  </span>
                                </div>
                                <div className="flex items-center mt-1">
                                  <TrendBadge trend={cityData.salaryTrend} />
                                </div>
                                <div className="mt-1">
                                  <span className={`text-xs px-2 py-1 rounded-full ${getDemandLevelClass(cityData.demandLevel)}`}>
                                    {cityData.demandLevel}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-zinc-500 text-xs">No data</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr className="border-b border-zinc-600">
                  <td colSpan="7" className="px-4 py-5 text-center text-zinc-400 bg-zinc-800/30">
                    No salary data available for comparison
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Salary Insights Summary */}
        <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900 p-4 rounded-xl border border-zinc-700 shadow-lg mt-6">
          <h3 className="text-lg font-medium text-cyan-50 mb-3">Salary Comparison Insights</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Country Summary */}
            <div className="bg-zinc-800/50 p-3 rounded-lg border border-cyan-800/30">
              <h4 className="text-md font-medium text-cyan-300 mb-2 flex items-center">
                <span className="w-2 h-2 rounded-full bg-cyan-400 mr-2"></span>
                Current Country Overview
              </h4>
              <ul className="list-disc list-inside text-sm text-cyan-50/90 space-y-1">
                <li>Average salary trends are {currentCountryCities.some(c => c.salaryTrend?.toLowerCase().includes('increasing')) ? 'generally increasing' : 'mostly stable'}</li>
                <li>Job market demand is {currentCountryCities.some(c => c.demandLevel?.toLowerCase() === 'high') ? 'high in major cities' : 'moderate across regions'}</li>
                <li>Salary ranges vary by location and specific role</li>
              </ul>
            </div>

            {/* Target Country Summary */}
            <div className="bg-zinc-800/50 p-3 rounded-lg border border-indigo-800/30">
              <h4 className="text-md font-medium text-blue-300 mb-2 flex items-center">
                <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
                Target Country Overview
              </h4>
              <ul className="list-disc list-inside text-sm text-cyan-50/90 space-y-1">
                <li>Average salary trends are {targetCountryCities.some(c => c.salaryTrend?.toLowerCase().includes('increasing')) ? 'generally increasing' : 'mostly stable'}</li>
                <li>Job market demand is {targetCountryCities.some(c => c.demandLevel?.toLowerCase() === 'high') ? 'high in major cities' : 'moderate across regions'}</li>
                <li>Salary ranges vary by location and specific role</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CountrySalaryTable.propTypes = {
  data: PropTypes.shape({
    currentCountry: PropTypes.shape({
      name: PropTypes.string.isRequired,
      topCities: PropTypes.arrayOf(
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
      )
    }),
    targetCountry: PropTypes.shape({
      name: PropTypes.string.isRequired,
      topCities: PropTypes.arrayOf(
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
      )
    })
  }),
  userSalaryExpectation: PropTypes.string
};

export default CountrySalaryTable;
