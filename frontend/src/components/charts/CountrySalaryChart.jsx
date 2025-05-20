import React from 'react';
import PropTypes from 'prop-types';

const CountrySalaryChart = ({ data, userSalaryExpectation }) => {
  // If no data, show placeholder
  if (!data || !data.currentCountry || !data.targetCountry) {
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

  // Parse user salary expectation if provided
  const parsedUserSalary = userSalaryExpectation ? parseInt(userSalaryExpectation.replace(/\D/g, '')) : 0;

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

  // Function to get trend badge
  const TrendBadge = ({ trend }) => {
    if (!trend) return null;
    
    const trendLower = trend.toLowerCase();
    
    if (trendLower.includes('increasing')) {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-green-900/50 text-green-400">
          ↑ Increasing
        </span>
      );
    } else if (trendLower.includes('decreasing')) {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-red-900/50 text-red-400">
          ↓ Decreasing
        </span>
      );
    } else {
      return (
        <span className="text-xs px-2 py-1 rounded-full bg-blue-900/50 text-blue-400">
          → Stable
        </span>
      );
    }
  };

  // Combine cities from both countries for comparison
  const currentCountryCities = data.currentCountry.topCities || [];
  const targetCountryCities = data.targetCountry.topCities || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-y-auto">
      {/* Current Country */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-cyan-50 mb-4 text-center">
          {data.currentCountry.name}
        </h3>
        
        {currentCountryCities.length > 0 ? (
          currentCountryCities.map((city, cityIndex) => (
            <div 
              key={`current-city-${city.city}-${cityIndex}`}
              className="bg-gradient-to-br from-zinc-800/70 to-zinc-900/90 p-4 rounded-lg border border-zinc-700 hover:border-cyan-600/50 transition-all shadow-md"
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-cyan-50 font-medium">{city.city}</h4>
                <div className="flex flex-wrap justify-end gap-2">
                  <TrendBadge trend={city.salaryTrend} />
                  <span className={`text-xs px-2 py-1 rounded-full ${getDemandLevelClass(city.demandLevel)}`}>
                    {city.demandLevel} Demand
                  </span>
                </div>
              </div>
              
              <div className="text-cyan-300 font-medium text-sm bg-cyan-900/30 py-1 px-3 rounded-full mb-3 inline-block">
                Avg: {formatCurrency(city.avgSalary)}
              </div>
              
              {city.rolesSalaries && city.rolesSalaries.length > 0 ? (
                <div className="space-y-3 mt-3">
                  {city.rolesSalaries.map((roleData, roleIndex) => (
                    <div key={`current-role-${city.city}-${roleData.role}-${roleIndex}`} className="relative">
                      <div className="bg-gradient-to-br from-zinc-800/70 to-zinc-900/90 p-3 rounded-lg border border-zinc-700">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-cyan-50/90 text-sm font-medium">{roleData.role}</span>
                          <span className="text-cyan-300 font-medium text-sm bg-cyan-900/30 py-1 px-2 rounded-full">
                            {formatCurrency(roleData.medianSalary)}
                          </span>
                        </div>
                        <div className="relative h-2 bg-zinc-800 rounded-full mb-2">
                          <div
                            className="absolute h-2 rounded-full bg-gradient-to-r from-cyan-600/30 via-cyan-500/50 to-cyan-400/70"
                            style={{
                              left: '0%',
                              width: '100%'
                            }}
                          ></div>
                          <div
                            className="absolute h-2 w-1 bg-white rounded-full"
                            style={{
                              left: `${((roleData.medianSalary - roleData.minSalary) / (roleData.maxSalary - roleData.minSalary)) * 100}%`,
                              transform: 'translateX(-50%)'
                            }}
                          ></div>
                          {parsedUserSalary > 0 && (
                            <div
                              className="absolute h-3 w-1 bg-yellow-400 rounded-full -top-0.5"
                              style={{
                                left: `${Math.max(0, Math.min(100, ((parsedUserSalary - roleData.minSalary) / (roleData.maxSalary - roleData.minSalary)) * 100))}%`,
                                transform: 'translateX(-50%)'
                              }}
                            ></div>
                          )}
                        </div>
                        <div className="flex justify-between text-xs text-zinc-400">
                          <span>{formatCurrency(roleData.minSalary)}</span>
                          <span>{formatCurrency(roleData.maxSalary)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-400 text-sm">No role salary data available</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-zinc-400 text-center">No city data available for {data.currentCountry.name}</p>
        )}
      </div>
      
      {/* Target Country */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-cyan-50 mb-4 text-center">
          {data.targetCountry.name}
        </h3>
        
        {targetCountryCities.length > 0 ? (
          targetCountryCities.map((city, cityIndex) => (
            <div 
              key={`target-city-${city.city}-${cityIndex}`}
              className="bg-gradient-to-br from-zinc-800/70 to-zinc-900/90 p-4 rounded-lg border border-zinc-700 hover:border-cyan-600/50 transition-all shadow-md"
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-cyan-50 font-medium">{city.city}</h4>
                <div className="flex flex-wrap justify-end gap-2">
                  <TrendBadge trend={city.salaryTrend} />
                  <span className={`text-xs px-2 py-1 rounded-full ${getDemandLevelClass(city.demandLevel)}`}>
                    {city.demandLevel} Demand
                  </span>
                </div>
              </div>
              
              <div className="text-cyan-300 font-medium text-sm bg-cyan-900/30 py-1 px-3 rounded-full mb-3 inline-block">
                Avg: {formatCurrency(city.avgSalary)}
              </div>
              
              {city.rolesSalaries && city.rolesSalaries.length > 0 ? (
                <div className="space-y-3 mt-3">
                  {city.rolesSalaries.map((roleData, roleIndex) => (
                    <div key={`target-role-${city.city}-${roleData.role}-${roleIndex}`} className="relative">
                      <div className="bg-gradient-to-br from-zinc-800/70 to-zinc-900/90 p-3 rounded-lg border border-zinc-700">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-cyan-50/90 text-sm font-medium">{roleData.role}</span>
                          <span className="text-cyan-300 font-medium text-sm bg-cyan-900/30 py-1 px-2 rounded-full">
                            {formatCurrency(roleData.medianSalary)}
                          </span>
                        </div>
                        <div className="relative h-2 bg-zinc-800 rounded-full mb-2">
                          <div
                            className="absolute h-2 rounded-full bg-gradient-to-r from-cyan-600/30 via-cyan-500/50 to-cyan-400/70"
                            style={{
                              left: '0%',
                              width: '100%'
                            }}
                          ></div>
                          <div
                            className="absolute h-2 w-1 bg-white rounded-full"
                            style={{
                              left: `${((roleData.medianSalary - roleData.minSalary) / (roleData.maxSalary - roleData.minSalary)) * 100}%`,
                              transform: 'translateX(-50%)'
                            }}
                          ></div>
                          {parsedUserSalary > 0 && (
                            <div
                              className="absolute h-3 w-1 bg-yellow-400 rounded-full -top-0.5"
                              style={{
                                left: `${Math.max(0, Math.min(100, ((parsedUserSalary - roleData.minSalary) / (roleData.maxSalary - roleData.minSalary)) * 100))}%`,
                                transform: 'translateX(-50%)'
                              }}
                            ></div>
                          )}
                        </div>
                        <div className="flex justify-between text-xs text-zinc-400">
                          <span>{formatCurrency(roleData.minSalary)}</span>
                          <span>{formatCurrency(roleData.maxSalary)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-400 text-sm">No role salary data available</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-zinc-400 text-center">No city data available for {data.targetCountry.name}</p>
        )}
      </div>
    </div>
  );
};

CountrySalaryChart.propTypes = {
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

export default CountrySalaryChart;
