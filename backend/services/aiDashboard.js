import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import { parseJSON } from '../utils/jsonParser.js';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    maxOutputTokens: 2048,
    temperature: 0.2,
    topP: 0.8,
    topK: 40
  }
});

export const generateComparisonInsights = async (userData) => {
  try {
    console.log("Generating comparison insights for:", userData);

    // Validate API key
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set or invalid");
      throw new Error("API key configuration error");
    }

    // Extract user data with defaults
    const industry = userData.industry || "Software Development";
    const experience = userData.experience || 1;
    const skills = userData.skills || [];
    const currentCountry = userData.currentCountry || "US";
    const targetCountry = userData.targetCountry || "US";
    const currentRole = userData.currentRole || "Software Developer";
    const targetRole = userData.targetRole || "Software Developer";
    const salaryExpectation = userData.salaryExpectation || "";

    console.log("Processed comparison data:", {
      industry,
      experience,
      skills: Array.isArray(skills) ? skills : [],
      currentCountry,
      targetCountry,
      currentRole,
      targetRole,
      salaryExpectation
    });

    // Create a structured prompt for comparison data with stronger emphasis on complete JSON
    const currency = "USD"; // Always use USD for currency

    const prompt = `Generate a detailed comparison between the user's current situation and their target situation in the ${industry} industry.

    Current situation:
    - Country: ${currentCountry}
    - Role: ${currentRole}
    - Experience: ${experience} years
    - Skills: ${Array.isArray(skills) ? skills.join(", ") : skills}

    Target situation:
    - Country: ${targetCountry}
    - Role: ${targetRole}
    ${salaryExpectation ? `- Salary Expectation: ${salaryExpectation} ${currency}` : ''}

    CRITICAL INSTRUCTIONS FOR JSON FORMATTING:
    1. You MUST return ONLY valid, complete JSON with NO additional text, notes, or markdown formatting.
    2. DO NOT include any text before or after the JSON.
    3. DO NOT use markdown code blocks or triple backticks.
    4. ENSURE all fields are properly filled with realistic data.
    5. ENSURE all arrays are properly closed with square brackets.
    6. ENSURE all objects are properly closed with curly braces.
    7. ENSURE all strings are properly quoted with double quotes.
    8. ENSURE all property names are properly quoted with double quotes.
    9. DO NOT use trailing commas in arrays or objects.
    10. ENSURE the JSON is properly nested and all brackets match.

    Provide the comparison data in EXACTLY the following JSON format:

    {
      "countrySalaryComparison": {
        "currentCountry": {
          "name": "${currentCountry}",
          "topCities": [
            {
              "city": "string",
              "avgSalary": number,
              "salaryTrend": "Increasing" | "Stable" | "Decreasing",
              "demandLevel": "High" | "Medium" | "Low",
              "rolesSalaries": [
                {
                  "role": "string",
                  "minSalary": number,
                  "medianSalary": number,
                  "maxSalary": number,
                  "location": "string"
                }
              ]
            }
          ]
        },
        "targetCountry": {
          "name": "${targetCountry}",
          "topCities": [
            {
              "city": "string",
              "avgSalary": number,
              "salaryTrend": "Increasing" | "Stable" | "Decreasing",
              "demandLevel": "High" | "Medium" | "Low",
              "rolesSalaries": [
                {
                  "role": "string",
                  "minSalary": number,
                  "medianSalary": number,
                  "maxSalary": number,
                  "location": "string"
                }
              ]
            }
          ]
        }
      },
      "roleComparison": {
        "currentRole": {
          "title": "${currentRole}",
          "requiredSkills": ["string"],
          "avgSalary": number,
          "growthOutlook": "Positive" | "Neutral" | "Negative",
          "demandLevel": "High" | "Medium" | "Low"
        },
        "targetRole": {
          "title": "${targetRole}",
          "requiredSkills": ["string"],
          "avgSalary": number,
          "growthOutlook": "Positive" | "Neutral" | "Negative",
          "demandLevel": "High" | "Medium" | "Low"
        },
        "skillGaps": ["string"],
        "transferableSkills": ["string"]
      },
      "salaryExpectationAnalysis": {
        "isRealistic": boolean,
        "differenceFromMedian": number,
        "percentile": number,
        "recommendation": "string"
      }
    }

    For each country, provide data for exactly the top 3 cities with the highest demand for ${industry} professionals.
    For each city, include at least 5 common job roles with their salary ranges (min, median, max).
    Include at least 5 required skills for each role.
    Include at least 3 skill gaps and 3 transferable skills in the role comparison.
    Provide realistic salary data based on current market conditions.
    ${salaryExpectation ? `Analyze if the user's salary expectation of ${salaryExpectation} ${currency} is realistic for the target role in the target country.` : ''}

    FINAL REMINDER:
    1. Return ONLY the JSON with NO additional text or explanations.
    2. Verify that all arrays and objects are properly closed.
    3. Ensure the JSON is complete and valid before returning.
    4. Do not truncate or omit any part of the required structure.
    `;

    // Maximum number of retries
    const MAX_RETRIES = 3;
    let attempts = 0;
    let data = null;
    let isComplete = false;

    // Keep trying until we get complete data or reach max retries
    while (attempts < MAX_RETRIES && !isComplete) {
      attempts++;
      console.log(`Attempt ${attempts} of ${MAX_RETRIES} to get complete comparison data...`);

      try {
        // Call Gemini API
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        console.log(`Gemini comparison response received (attempt ${attempts})`);
        console.log("Raw response length:", text.length);
        console.log("Raw response preview:", text.substring(0, 200) + (text.length > 200 ? "..." : ""));

        // Parse the JSON response
        data = parseJSON(text, { verbose: true });
        console.log("Successfully parsed comparison JSON data");

        // Validate the data to ensure it's complete
        const validationResult = validateComparisonData(data, currentCountry, targetCountry, currentRole, targetRole);

        if (validationResult.isComplete) {
          console.log("Received complete comparison data");
          isComplete = true;
        } else {
          console.log("Incomplete data detected:", validationResult.missingFields);
          // Wait a moment before retrying to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error in attempt ${attempts}:`, error.message);
        // Wait a moment before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // If we've exhausted all retries and still don't have complete data, return partial data with metadata
    if (!isComplete) {
      console.log("Returning partial comparison data after multiple attempts");

      // Initialize missing sections with empty structures to prevent frontend errors
      if (!data.roleComparison) {
        data.roleComparison = {
          currentRole: { title: currentRole, requiredSkills: [], avgSalary: 0, growthOutlook: "Neutral", demandLevel: "Medium" },
          targetRole: { title: targetRole, requiredSkills: [], avgSalary: 0, growthOutlook: "Neutral", demandLevel: "Medium" },
          skillGaps: [],
          transferableSkills: []
        };
      }

      if (!data.salaryExpectationAnalysis) {
        data.salaryExpectationAnalysis = {
          isRealistic: true,
          differenceFromMedian: 0,
          percentile: 50,
          recommendation: "No salary analysis available. Please try again later."
        };
      }
    }

    // Add metadata about the response
    data._meta = {
      generatedAt: new Date().toISOString(),
      source: "Gemini AI",
      attempts: attempts,
      isComplete: isComplete
    };

    return data;
  } catch (error) {
    console.error("Error in generateComparisonInsights:", error);
    throw error;
  }
};

// Helper function to validate if the comparison data is complete
function validateComparisonData(data, currentCountry, targetCountry, currentRole, targetRole) {
  if (!data) {
    return {
      isComplete: false,
      missingFields: ['entire data structure']
    };
  }

  const missingFields = [];

  // Check countrySalaryComparison structure
  if (!data.countrySalaryComparison) {
    missingFields.push('countrySalaryComparison');
  } else {
    // Check currentCountry
    if (!data.countrySalaryComparison.currentCountry) {
      missingFields.push('countrySalaryComparison.currentCountry');
    } else {
      if (data.countrySalaryComparison.currentCountry.name !== currentCountry) {
        missingFields.push(`countrySalaryComparison.currentCountry.name (expected: ${currentCountry})`);
      }

      if (!Array.isArray(data.countrySalaryComparison.currentCountry.topCities) ||
          data.countrySalaryComparison.currentCountry.topCities.length === 0) {
        missingFields.push('countrySalaryComparison.currentCountry.topCities');
      } else {
        // Validate each city in topCities has a valid rolesSalaries array
        data.countrySalaryComparison.currentCountry.topCities.forEach((city, index) => {
          if (!city || typeof city !== 'object') {
            missingFields.push(`countrySalaryComparison.currentCountry.topCities[${index}] is not a valid object`);
          } else if (!Array.isArray(city.rolesSalaries)) {
            missingFields.push(`countrySalaryComparison.currentCountry.topCities[${index}].rolesSalaries is not an array`);
            // Initialize it as an empty array to prevent errors
            city.rolesSalaries = [];
          }
        });
      }
    }

    // Check targetCountry
    if (!data.countrySalaryComparison.targetCountry) {
      missingFields.push('countrySalaryComparison.targetCountry');
    } else {
      if (data.countrySalaryComparison.targetCountry.name !== targetCountry) {
        missingFields.push(`countrySalaryComparison.targetCountry.name (expected: ${targetCountry})`);
      }

      if (!Array.isArray(data.countrySalaryComparison.targetCountry.topCities) ||
          data.countrySalaryComparison.targetCountry.topCities.length === 0) {
        missingFields.push('countrySalaryComparison.targetCountry.topCities');
      } else {
        // Validate each city in topCities has a valid rolesSalaries array
        data.countrySalaryComparison.targetCountry.topCities.forEach((city, index) => {
          if (!city || typeof city !== 'object') {
            missingFields.push(`countrySalaryComparison.targetCountry.topCities[${index}] is not a valid object`);
          } else if (!Array.isArray(city.rolesSalaries)) {
            missingFields.push(`countrySalaryComparison.targetCountry.topCities[${index}].rolesSalaries is not an array`);
            // Initialize it as an empty array to prevent errors
            city.rolesSalaries = [];
          }
        });
      }
    }
  }

  // Check roleComparison structure
  if (!data.roleComparison) {
    missingFields.push('roleComparison');
  } else {
    // Check currentRole
    if (!data.roleComparison.currentRole) {
      missingFields.push('roleComparison.currentRole');
    } else {
      if (data.roleComparison.currentRole.title !== currentRole) {
        missingFields.push(`roleComparison.currentRole.title (expected: ${currentRole})`);
      }

      if (!Array.isArray(data.roleComparison.currentRole.requiredSkills) ||
          data.roleComparison.currentRole.requiredSkills.length === 0) {
        missingFields.push('roleComparison.currentRole.requiredSkills');
      }
    }

    // Check targetRole
    if (!data.roleComparison.targetRole) {
      missingFields.push('roleComparison.targetRole');
    } else {
      if (data.roleComparison.targetRole.title !== targetRole) {
        missingFields.push(`roleComparison.targetRole.title (expected: ${targetRole})`);
      }

      if (!Array.isArray(data.roleComparison.targetRole.requiredSkills) ||
          data.roleComparison.targetRole.requiredSkills.length === 0) {
        missingFields.push('roleComparison.targetRole.requiredSkills');
      }
    }

    // Check skill arrays
    if (!Array.isArray(data.roleComparison.skillGaps)) {
      missingFields.push('roleComparison.skillGaps');
    }

    if (!Array.isArray(data.roleComparison.transferableSkills)) {
      missingFields.push('roleComparison.transferableSkills');
    }
  }

  // Check salaryExpectationAnalysis structure
  if (!data.salaryExpectationAnalysis) {
    missingFields.push('salaryExpectationAnalysis');
  } else {
    if (typeof data.salaryExpectationAnalysis.isRealistic !== 'boolean') {
      missingFields.push('salaryExpectationAnalysis.isRealistic');
    }

    if (typeof data.salaryExpectationAnalysis.percentile !== 'number') {
      missingFields.push('salaryExpectationAnalysis.percentile');
    }

    if (!data.salaryExpectationAnalysis.recommendation) {
      missingFields.push('salaryExpectationAnalysis.recommendation');
    }
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields
  };
}

export const generateIndustryInsights = async (userData) => {
  try {
    console.log("Generating insights for:", userData);

    // Validate API key
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set or invalid");
      throw new Error("API key configuration error");
    }

    // Extract user data with defaults
    const industry = userData.industry || "Software Development";
    const experience = userData.experience || 1;
    const skills = userData.skills || [];
    const country = userData.country || "US";
    const salaryExpectation = userData.salaryExpectation || "";
    const isIndianData = userData.isIndianData || (country && country.toLowerCase().includes('india'));

    console.log("Processed user data:", {
      industry,
      experience,
      skills: Array.isArray(skills) ? skills : [],
      country,
      salaryExpectation,
      isIndianData
    });

    // Create a more structured prompt with explicit instructions
    const currency = "USD"; // Always use USD for currency


    const prompt = `Analyze the current state of the ${industry} industry in ${country} and provide insights.

    CRITICAL INSTRUCTIONS FOR JSON FORMATTING:
    1. You MUST return ONLY valid, complete JSON with NO additional text, notes, or markdown formatting.
    2. DO NOT include any text before or after the JSON.
    3. DO NOT use markdown code blocks or triple backticks.
    4. ENSURE all fields are properly filled with realistic data.
    5. ENSURE all arrays are properly closed with square brackets.
    6. ENSURE all objects are properly closed with curly braces.
    7. ENSURE all strings are properly quoted with double quotes.
    8. ENSURE all property names are properly quoted with double quotes.
    9. DO NOT use trailing commas in arrays or objects.
    10. ENSURE the JSON is properly nested and all brackets match.

    Provide the insights in EXACTLY the following JSON format:

    {
      "growthRate": number,
      "demandLevel": "High" | "Medium" | "Low",
      "topSkills": ["skill1", "skill2"],
      "marketOutlook": "Positive" | "Neutral" | "Negative",
      "industryOverview": "Honest Industry overview for next 5 years",
      "marketDemand": [
        { "skill": "string", "demandScore": number, "location": "string" }
      ],
      "expectedSalaryRange": {
        "min": number,
        "max": number,
        "currency": "${currency}",
        "location": "${country}"
      },
      "citySalaryData": [
        {
          "city": "string",
          "avgSalary": number,
          "salaryTrend": "Increasing" | "Stable" | "Decreasing",
          "demandLevel": "High" | "Medium" | "Low",
          "rolesSalaries": [
            {
              "role": "string",
              "minSalary": number,
              "medianSalary": number,
              "maxSalary": number,
              "location": "string"
            }
          ]
        }
      ],
      "skillBasedBoosts": [
        { "skill": "string", "salaryIncrease": number, "location": "string" }
      ],
      "topCompanies": [
        { "name": "string", "openPositions": number, "roles": ["string"], "location": "string" }
      ],
      "recommendedCourses": [
        { "name": "string", "platform": "string", "url": "string", "skillsCovered": ["string"], "location": "string" }
      ],
      "careerPathInsights": [
        { "title": "string", "description": "string", "growthPotential": "string", "location": "string" }
      ],
      "emergingTrends": [
        { "name": "string", "description": "string", "location": "string" }
      ],
      "quickInsights": [
        { "title": "string", "type": "string", "location": "string" }
      ],
      "nextActions": [
        { "title": "string", "description": "string", "priority": number }
      ]
    }

    CONTENT REQUIREMENTS:
    - For citySalaryData, provide data for exactly the top 3 cities in ${country} with the highest demand for ${industry} professionals according to the ${experience}.
    - For each city, include at least 5 common job roles with their salary ranges (min, median, max).
    - Growth rate should be a percentage.
    - Include at least 5 skills in topSkills and marketDemand.
    - Include at least 3 companies in topCompanies.
    - Include at least 3 courses in recommendedCourses.
    - Include at least 3 career paths in careerPathInsights.
    - Include at least 3 trends in emergingTrends.
    - Include at least 3 quick insights in quickInsights.
    - Include at least 3 next actions in nextActions.
    ${salaryExpectation ? `- Consider the user's salary expectation of ${salaryExpectation} ${currency} when providing insights.` : ''}

    FINAL REMINDER:
    1. Return ONLY the JSON with NO additional text or explanations.
    2. Verify that all arrays and objects are properly closed.
    3. Ensure the JSON is complete and valid before returning.
    4. Do not truncate or omit any part of the required structure.
    5. Double-check that all rolesSalaries arrays are properly closed with square brackets.
  `;

    console.log("Sending prompt to Gemini");

    // Call Gemini API
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      console.log("Gemini response received");

      // Try to extract and parse JSON from the response
      try {
        // Log the raw response for debugging
        console.log("Raw response length:", text.length);
        console.log("Raw response preview:", text.substring(0, 200) + (text.length > 200 ? "..." : ""));

        // Define fallback data structure for industry insights
        const fallbackData = {
          growthRate: 10,
          demandLevel: "Medium",
          topSkills: [],
          marketOutlook: "Data unavailable due to parsing error",
          industryOverview: "Industry overview information not available due to parsing error.",
          marketDemand: [],
          expectedSalaryRange: { min: 80000, max: 120000, currency: "USD" },
          citySalaryData: [],
          skillBasedBoosts: [],
          topCompanies: [],
          recommendedCourses: [],
          careerPathInsights: [],
          emergingTrends: [],
          quickInsights: []
        };

        // Use the robust JSON parser with verbose logging and fallback data
        let data = parseJSON(text, {
          verbose: true,
          fallbackData
        });

        // Check if we got the fallback data (parsing failed)
        if (data === fallbackData) {
          console.log("JSON parsing failed, using fallback industry insights data structure");
        } else {
          console.log("Successfully parsed industry insights JSON data");
        }

        // Validate and sanitize the data
        if (!data) {
          throw new Error("Empty data object after parsing");
        }

        // Post-processing: Handle specific fields that might need additional processing

        // Handle industryOverview field - ensure it's properly formatted
        if (data.industryOverview) {
          // If it's not a string, convert it to a string
          if (typeof data.industryOverview !== 'string') {
            console.warn("industryOverview is not a string, converting to string");
            data.industryOverview = String(data.industryOverview);
          }

          try {
            // Clean up any special characters or formatting issues
            data.industryOverview = data.industryOverview
              .replace(/\\n/g, '\n') // Convert escaped newlines to actual newlines
              .replace(/\\"/g, '"')  // Convert escaped quotes to actual quotes
              .replace(/\s+/g, ' ')  // Normalize whitespace
              .trim();               // Remove leading/trailing whitespace

            console.log("Processed industryOverview field");
          } catch (overviewError) {
            console.warn("Error processing industryOverview field:", overviewError.message);
            // If processing fails, provide a fallback
            data.industryOverview = "Industry overview information not available due to formatting issues.";
          }
        } else {
          console.warn("No industryOverview field found in response");
          data.industryOverview = "Industry overview information not available.";
        }

        // Ensure all required arrays exist and are valid
        const arrayFields = [
          'marketDemand', 'quickInsights', 'topSkills', 'citySalaryData',
          'skillBasedBoosts', 'topCompanies', 'recommendedCourses',
          'careerPathInsights', 'emergingTrends', 'nextActions'
        ];

        // Process each array field to ensure it's a valid array
        arrayFields.forEach(field => {
          // If field doesn't exist or isn't an array, set to empty array
          if (!data[field] || !Array.isArray(data[field])) {
            console.warn(`${field} is not a valid array, setting to empty array`);
            data[field] = [];
          } else {
            // For fields that have specific validation requirements
            switch (field) {
              case 'quickInsights':
                // Filter valid quickInsights items
                data[field] = data[field].filter(item =>
                  item && typeof item === 'object' &&
                  (item.title || item.name) && // Accept either title or name
                  (item.type || item.category)  // Accept either type or category
                );
                break;

              case 'marketDemand':
                // Filter valid marketDemand items
                data[field] = data[field].filter(item =>
                  item && typeof item === 'object' &&
                  item.skill &&
                  (typeof item.demandScore === 'number' || typeof item.demandScore === 'string')
                );
                break;

              case 'topCompanies':
                // Process and validate topCompanies
                data[field] = data[field].filter(item => item && typeof item === 'object' && item.name)
                  .map(company => {
                    // Ensure roles is an array of strings
                    if (!company.roles || !Array.isArray(company.roles)) {
                      company.roles = [];
                    } else {
                      // Ensure each role is a string
                      company.roles = company.roles.map(role => {
                        if (typeof role === 'string') {
                          return role;
                        } else if (role && typeof role === 'object') {
                          // If it's an object, try to extract a string representation
                          return String(role.name || role.title || role.role || JSON.stringify(role));
                        } else {
                          // Convert to string
                          return String(role);
                        }
                      });
                    }
                    return company;
                  });
                break;

              case 'citySalaryData':
                // Process and validate citySalaryData
                data[field] = data[field].filter(item =>
                  item && typeof item === 'object' && item.city &&
                  (typeof item.avgSalary === 'number' || typeof item.avgSalary === 'string')
                ).map(city => {
                  // Ensure rolesSalaries is a valid array
                  if (!city.rolesSalaries || !Array.isArray(city.rolesSalaries)) {
                    city.rolesSalaries = [];
                  } else {
                    // Filter valid role salary entries
                    city.rolesSalaries = city.rolesSalaries.filter(role =>
                      role && typeof role === 'object' && role.role &&
                      (typeof role.minSalary === 'number' || typeof role.minSalary === 'string') &&
                      (typeof role.medianSalary === 'number' || typeof role.medianSalary === 'string') &&
                      (typeof role.maxSalary === 'number' || typeof role.maxSalary === 'string')
                    );
                  }
                  return city;
                });
                break;

              case 'careerPathInsights':
                // Filter valid careerPathInsights items
                data[field] = data[field].filter(item =>
                  item && typeof item === 'object' && item.title && item.description
                );
                break;

              case 'emergingTrends':
                // Filter valid emergingTrends items
                data[field] = data[field].filter(item =>
                  item && typeof item === 'object' && item.name && item.description
                );
                break;

              case 'recommendedCourses':
                // Filter valid recommendedCourses items
                data[field] = data[field].filter(item =>
                  item && typeof item === 'object' && item.name && item.platform
                );
                break;

              case 'skillBasedBoosts':
                // Filter valid skillBasedBoosts items
                data[field] = data[field].filter(item =>
                  item && typeof item === 'object' && item.skill &&
                  (typeof item.salaryIncrease === 'number' || typeof item.salaryIncrease === 'string')
                );
                break;
            }
          }
        });

        // Ensure expectedSalaryRange exists and is valid
        if (!data.expectedSalaryRange || typeof data.expectedSalaryRange !== 'object') {
          data.expectedSalaryRange = { min: 80000, max: 120000, currency: "USD" };
        }

        return data;
      } catch (parseError) {
        console.error("Error parsing JSON from Gemini:", parseError);
        console.error("Raw response text:", text);
        throw new Error("Failed to parse response: " + parseError.message);
      }
    } catch (apiError) {
      console.error("Gemini API error:", apiError);
      throw new Error("Gemini API error: " + apiError.message);
    }
  } catch (error) {
    console.error("Error in generateIndustryInsights:", error);
    throw new Error("Failed to generate insights: " + error.message);
  }
};

// // Function to generate fallback data based on user's industry
// function generateFallbackData(userData) {
//   const industry = userData.industry || "Software Development";
//   const experience = userData.experience || 1;
//   const skills = userData.skills || [];
//   const country = userData.country || "US";
//   const isIndianData = userData.isIndianData || (country && country.toLowerCase().includes('india'));
//   const currency = "USD"; // Always use USD for currency
//   const adjustmentFactor = 0.25; // For Indian locations, adjust salary to 1/4 of US salaries

//   // Determine location string
//   let locationStr = isIndianData ? "India" : "Global";

//   // Base data structure
//   const baseData = {
//     "marketOutlook": "Positive",
//     "growthRate": 12,
//     "demandLevel": "High",
//     "topSkills": ["JavaScript", "React", "Node.js", "Python", "AWS"],
//     "citySalaryData": [
//       {
//         "city": isIndianData ? "Bangalore" : "San Francisco",
//         "avgSalary": isIndianData ? 1200000 : 120000,
//         "salaryTrend": "Increasing",
//         "demandLevel": "High",
//         "rolesSalaries": [
//           { "role": "Junior Developer", "minSalary": isIndianData ? 600000 : 60000, "medianSalary": isIndianData ? 750000 : 75000, "maxSalary": isIndianData ? 900000 : 90000, "location": isIndianData ? "Bangalore" : "San Francisco" },
//           { "role": "Mid-level Developer", "minSalary": isIndianData ? 800000 : 80000, "medianSalary": isIndianData ? 950000 : 95000, "maxSalary": isIndianData ? 1100000 : 110000, "location": isIndianData ? "Bangalore" : "San Francisco" },
//           { "role": "Senior Developer", "minSalary": isIndianData ? 1000000 : 100000, "medianSalary": isIndianData ? 1200000 : 120000, "maxSalary": isIndianData ? 1500000 : 150000, "location": isIndianData ? "Bangalore" : "San Francisco" },
//           { "role": "DevOps Engineer", "minSalary": isIndianData ? 900000 : 90000, "medianSalary": isIndianData ? 1100000 : 110000, "maxSalary": isIndianData ? 1300000 : 130000, "location": isIndianData ? "Bangalore" : "San Francisco" },
//           { "role": "Product Manager", "minSalary": isIndianData ? 1200000 : 120000, "medianSalary": isIndianData ? 1500000 : 150000, "maxSalary": isIndianData ? 1800000 : 180000, "location": isIndianData ? "Bangalore" : "San Francisco" }
//         ]
//       },
//       {
//         "city": isIndianData ? "Hyderabad" : "New York",
//         "avgSalary": isIndianData ? 1100000 : 110000,
//         "salaryTrend": "Stable",
//         "demandLevel": "High",
//         "rolesSalaries": [
//           { "role": "Junior Developer", "minSalary": isIndianData ? 550000 : 55000, "medianSalary": isIndianData ? 700000 : 70000, "maxSalary": isIndianData ? 850000 : 85000, "location": isIndianData ? "Hyderabad" : "New York" },
//           { "role": "Mid-level Developer", "minSalary": isIndianData ? 750000 : 75000, "medianSalary": isIndianData ? 900000 : 90000, "maxSalary": isIndianData ? 1050000 : 105000, "location": isIndianData ? "Hyderabad" : "New York" },
//           { "role": "Senior Developer", "minSalary": isIndianData ? 950000 : 95000, "medianSalary": isIndianData ? 1150000 : 115000, "maxSalary": isIndianData ? 1400000 : 140000, "location": isIndianData ? "Hyderabad" : "New York" },
//           { "role": "DevOps Engineer", "minSalary": isIndianData ? 850000 : 85000, "medianSalary": isIndianData ? 1050000 : 105000, "maxSalary": isIndianData ? 1250000 : 125000, "location": isIndianData ? "Hyderabad" : "New York" },
//           { "role": "Product Manager", "minSalary": isIndianData ? 1150000 : 115000, "medianSalary": isIndianData ? 1400000 : 140000, "maxSalary": isIndianData ? 1700000 : 170000, "location": isIndianData ? "Hyderabad" : "New York" }
//         ]
//       },
//       {
//         "city": isIndianData ? "Pune" : "Seattle",
//         "avgSalary": isIndianData ? 1000000 : 100000,
//         "salaryTrend": "Increasing",
//         "demandLevel": "Medium",
//         "rolesSalaries": [
//           { "role": "Junior Developer", "minSalary": isIndianData ? 500000 : 50000, "medianSalary": isIndianData ? 650000 : 65000, "maxSalary": isIndianData ? 800000 : 80000, "location": isIndianData ? "Pune" : "Seattle" },
//           { "role": "Mid-level Developer", "minSalary": isIndianData ? 700000 : 70000, "medianSalary": isIndianData ? 850000 : 85000, "maxSalary": isIndianData ? 1000000 : 100000, "location": isIndianData ? "Pune" : "Seattle" },
//           { "role": "Senior Developer", "minSalary": isIndianData ? 900000 : 90000, "medianSalary": isIndianData ? 1100000 : 110000, "maxSalary": isIndianData ? 1300000 : 130000, "location": isIndianData ? "Pune" : "Seattle" },
//           { "role": "DevOps Engineer", "minSalary": isIndianData ? 800000 : 80000, "medianSalary": isIndianData ? 1000000 : 100000, "maxSalary": isIndianData ? 1200000 : 120000, "location": isIndianData ? "Pune" : "Seattle" },
//           { "role": "Product Manager", "minSalary": isIndianData ? 1100000 : 110000, "medianSalary": isIndianData ? 1350000 : 135000, "maxSalary": isIndianData ? 1600000 : 160000, "location": isIndianData ? "Pune" : "Seattle" }
//         ]
//       }
//     ],
//     "marketDemand": [
//       { "skill": "JavaScript", "demandScore": 85, "location": locationStr },
//       { "skill": "React", "demandScore": 90, "location": locationStr },
//       { "skill": "Node.js", "demandScore": 80, "location": locationStr },
//       { "skill": "Python", "demandScore": 88, "location": locationStr },
//       { "skill": "AWS", "demandScore": 92, "location": locationStr }
//     ],
//     "topCompanies": isIndianData ? [
//       { "name": "TCS", "openPositions": 200, "roles": ["Software Engineer", "Project Manager"], "location": "India" },
//       { "name": "Infosys", "openPositions": 180, "roles": ["Full Stack Developer", "DevOps Engineer"], "location": "India" },
//       { "name": "Wipro", "openPositions": 150, "roles": ["Software Developer", "Solutions Architect"], "location": "India" }
//     ] : [
//       { "name": "Google", "openPositions": 150, "roles": ["Software Engineer", "Product Manager"], "location": locationStr },
//       { "name": "Microsoft", "openPositions": 120, "roles": ["Full Stack Developer", "DevOps Engineer"], "location": locationStr },
//       { "name": "Amazon", "openPositions": 200, "roles": ["Software Developer", "Solutions Architect"], "location": locationStr }
//     ],
//     "quickInsights": [
//       { "title": "Remote work continues to be popular in " + industry, "type": "trend", "location": locationStr },
//       { "title": "AI skills are increasingly in demand", "type": "trend", "location": locationStr },
//       { "title": "Cybersecurity concerns are driving new hiring", "type": "alert", "location": locationStr }
//     ],
//     "nextActions": [
//       { "title": "Learn cloud technologies", "type": "skill development", "priority": 4 },
//       { "title": "Build a portfolio project", "type": "career development", "priority": 5 },
//       { "title": "Network with industry professionals", "type": "networking", "priority": 3 }
//     ],
//     "expectedSalaryRange": {
//       "min": isIndianData ? 80000 * adjustmentFactor : 80000,
//       "max": isIndianData ? 120000 * adjustmentFactor : 120000,
//       "currency": currency,
//       "location": locationStr
//     },
//     "skillBasedBoosts": [
//       { "skill": "AWS", "salaryIncrease": isIndianData ? 15000 * adjustmentFactor : 15000, "location": locationStr },
//       { "skill": "Machine Learning", "salaryIncrease": isIndianData ? 20000 * adjustmentFactor : 20000, "location": locationStr }
//     ],
//     "isIndianData": isIndianData
//   };

//   // Customize based on industry
//   const industryLower = industry.toLowerCase();

//   // Prepare industry-specific data
//   let industryData = {};

//   if (industryLower.includes('software') || industryLower.includes('web') || industryLower.includes('development')) {
//     // Software Development specific data
//     industryData = {
//       "marketOutlook": "Very Positive",
//       "growthRate": 15,
//       "topSkills": ["JavaScript", "React", "Node.js", "TypeScript", "AWS"],
//       "quickInsights": [
//         { "title": "Full-stack developers are in high demand", "type": "trend", "location": locationStr },
//         { "title": "Remote work is standard in software development", "type": "trend", "location": locationStr },
//         { "title": "AI integration skills becoming essential", "type": "alert", "location": locationStr }
//       ]
//     };

//     // Add India-specific companies if needed
//     if (isIndianData) {
//       industryData.topCompanies = [
//         { "name": "TCS", "openPositions": 250, "roles": ["Software Engineer", "Full Stack Developer"], "location": "India" },
//         { "name": "Infosys", "openPositions": 200, "roles": ["React Developer", "Node.js Developer"], "location": "India" },
//         { "name": "Wipro", "openPositions": 180, "roles": ["JavaScript Developer", "DevOps Engineer"], "location": "India" }
//       ];
//     }
//   }
//   else if (industryLower.includes('data') || industryLower.includes('analytics')) {
//     // Data Science specific data
//     const salaryMultiplier = isIndianData ? adjustmentFactor : 1;

//     industryData = {
//       "topSkills": ["Python", "SQL", "Machine Learning", "TensorFlow", "Data Visualization"],
//       "citySalaryData": [
//         {
//           "city": isIndianData ? "Bangalore" : "San Francisco",
//           "avgSalary": isIndianData ? 1500000 * salaryMultiplier : 150000 * salaryMultiplier,
//           "salaryTrend": "Increasing",
//           "demandLevel": "High",
//           "rolesSalaries": [
//             { "role": "Data Analyst", "minSalary": isIndianData ? 650000 * salaryMultiplier : 65000 * salaryMultiplier, "medianSalary": isIndianData ? 850000 * salaryMultiplier : 85000 * salaryMultiplier, "maxSalary": isIndianData ? 1050000 * salaryMultiplier : 105000 * salaryMultiplier, "location": isIndianData ? "Bangalore" : "San Francisco" },
//             { "role": "Data Scientist", "minSalary": isIndianData ? 900000 * salaryMultiplier : 90000 * salaryMultiplier, "medianSalary": isIndianData ? 1150000 * salaryMultiplier : 115000 * salaryMultiplier, "maxSalary": isIndianData ? 1400000 * salaryMultiplier : 140000 * salaryMultiplier, "location": isIndianData ? "Bangalore" : "San Francisco" },
//             { "role": "ML Engineer", "minSalary": isIndianData ? 1100000 * salaryMultiplier : 110000 * salaryMultiplier, "medianSalary": isIndianData ? 1350000 * salaryMultiplier : 135000 * salaryMultiplier, "maxSalary": isIndianData ? 1600000 * salaryMultiplier : 160000 * salaryMultiplier, "location": isIndianData ? "Bangalore" : "San Francisco" },
//             { "role": "Data Engineer", "minSalary": isIndianData ? 850000 * salaryMultiplier : 85000 * salaryMultiplier, "medianSalary": isIndianData ? 1050000 * salaryMultiplier : 105000 * salaryMultiplier, "maxSalary": isIndianData ? 1250000 * salaryMultiplier : 125000 * salaryMultiplier, "location": isIndianData ? "Bangalore" : "San Francisco" },
//             { "role": "AI Researcher", "minSalary": isIndianData ? 1200000 * salaryMultiplier : 120000 * salaryMultiplier, "medianSalary": isIndianData ? 1500000 * salaryMultiplier : 150000 * salaryMultiplier, "maxSalary": isIndianData ? 1800000 * salaryMultiplier : 180000 * salaryMultiplier, "location": isIndianData ? "Bangalore" : "San Francisco" }
//           ]
//         },
//         {
//           "city": isIndianData ? "Hyderabad" : "New York",
//           "avgSalary": isIndianData ? 1400000 * salaryMultiplier : 140000 * salaryMultiplier,
//           "salaryTrend": "Stable",
//           "demandLevel": "High",
//           "rolesSalaries": [
//             { "role": "Data Analyst", "minSalary": isIndianData ? 600000 * salaryMultiplier : 60000 * salaryMultiplier, "medianSalary": isIndianData ? 800000 * salaryMultiplier : 80000 * salaryMultiplier, "maxSalary": isIndianData ? 1000000 * salaryMultiplier : 100000 * salaryMultiplier, "location": isIndianData ? "Hyderabad" : "New York" },
//             { "role": "Data Scientist", "minSalary": isIndianData ? 850000 * salaryMultiplier : 85000 * salaryMultiplier, "medianSalary": isIndianData ? 1100000 * salaryMultiplier : 110000 * salaryMultiplier, "maxSalary": isIndianData ? 1350000 * salaryMultiplier : 135000 * salaryMultiplier, "location": isIndianData ? "Hyderabad" : "New York" },
//             { "role": "ML Engineer", "minSalary": isIndianData ? 1050000 * salaryMultiplier : 105000 * salaryMultiplier, "medianSalary": isIndianData ? 1300000 * salaryMultiplier : 130000 * salaryMultiplier, "maxSalary": isIndianData ? 1550000 * salaryMultiplier : 155000 * salaryMultiplier, "location": isIndianData ? "Hyderabad" : "New York" },
//             { "role": "Data Engineer", "minSalary": isIndianData ? 800000 * salaryMultiplier : 80000 * salaryMultiplier, "medianSalary": isIndianData ? 1000000 * salaryMultiplier : 100000 * salaryMultiplier, "maxSalary": isIndianData ? 1200000 * salaryMultiplier : 120000 * salaryMultiplier, "location": isIndianData ? "Hyderabad" : "New York" },
//             { "role": "AI Researcher", "minSalary": isIndianData ? 1150000 * salaryMultiplier : 115000 * salaryMultiplier, "medianSalary": isIndianData ? 1450000 * salaryMultiplier : 145000 * salaryMultiplier, "maxSalary": isIndianData ? 1750000 * salaryMultiplier : 175000 * salaryMultiplier, "location": isIndianData ? "Hyderabad" : "New York" }
//           ]
//         },
//         {
//           "city": isIndianData ? "Pune" : "Seattle",
//           "avgSalary": isIndianData ? 1300000 * salaryMultiplier : 130000 * salaryMultiplier,
//           "salaryTrend": "Increasing",
//           "demandLevel": "Medium",
//           "rolesSalaries": [
//             { "role": "Data Analyst", "minSalary": isIndianData ? 550000 * salaryMultiplier : 55000 * salaryMultiplier, "medianSalary": isIndianData ? 750000 * salaryMultiplier : 75000 * salaryMultiplier, "maxSalary": isIndianData ? 950000 * salaryMultiplier : 95000 * salaryMultiplier, "location": isIndianData ? "Pune" : "Seattle" },
//             { "role": "Data Scientist", "minSalary": isIndianData ? 800000 * salaryMultiplier : 80000 * salaryMultiplier, "medianSalary": isIndianData ? 1050000 * salaryMultiplier : 105000 * salaryMultiplier, "maxSalary": isIndianData ? 1300000 * salaryMultiplier : 130000 * salaryMultiplier, "location": isIndianData ? "Pune" : "Seattle" },
//             { "role": "ML Engineer", "minSalary": isIndianData ? 1000000 * salaryMultiplier : 100000 * salaryMultiplier, "medianSalary": isIndianData ? 1250000 * salaryMultiplier : 125000 * salaryMultiplier, "maxSalary": isIndianData ? 1500000 * salaryMultiplier : 150000 * salaryMultiplier, "location": isIndianData ? "Pune" : "Seattle" },
//             { "role": "Data Engineer", "minSalary": isIndianData ? 750000 * salaryMultiplier : 75000 * salaryMultiplier, "medianSalary": isIndianData ? 950000 * salaryMultiplier : 95000 * salaryMultiplier, "maxSalary": isIndianData ? 1150000 * salaryMultiplier : 115000 * salaryMultiplier, "location": isIndianData ? "Pune" : "Seattle" },
//             { "role": "AI Researcher", "minSalary": isIndianData ? 1100000 * salaryMultiplier : 110000 * salaryMultiplier, "medianSalary": isIndianData ? 1400000 * salaryMultiplier : 140000 * salaryMultiplier, "maxSalary": isIndianData ? 1700000 * salaryMultiplier : 170000 * salaryMultiplier, "location": isIndianData ? "Pune" : "Seattle" }
//           ]
//         }
//       ],
//       "topCompanies": isIndianData ? [
//         { "name": "Mu Sigma", "openPositions": 120, "roles": ["Data Scientist", "ML Engineer"], "location": "India" },
//         { "name": "Tiger Analytics", "openPositions": 100, "roles": ["Data Analyst", "Data Engineer"], "location": "India" },
//         { "name": "Fractal Analytics", "openPositions": 80, "roles": ["Data Scientist", "AI Researcher"], "location": "India" }
//       ] : [
//         { "name": "Google", "openPositions": 120, "roles": ["Data Scientist", "ML Engineer"], "location": locationStr },
//         { "name": "Amazon", "openPositions": 150, "roles": ["Data Analyst", "Data Engineer"], "location": locationStr },
//         { "name": "Microsoft", "openPositions": 100, "roles": ["Data Scientist", "AI Researcher"], "location": locationStr }
//       ]
//     };
//   }
//   else if (industryLower.includes('finance') || industryLower.includes('banking')) {
//     // Finance specific data
//     const salaryMultiplier = isIndianData ? adjustmentFactor : 1;

//     industryData = {
//       "topSkills": ["Financial Analysis", "Excel", "SQL", "Python", "Risk Management"],
//       "citySalaryData": [
//         {
//           "city": isIndianData ? "Mumbai" : "New York",
//           "avgSalary": isIndianData ? 1800000 * salaryMultiplier : 180000 * salaryMultiplier,
//           "salaryTrend": "Increasing",
//           "demandLevel": "High",
//           "rolesSalaries": [
//             { "role": "Financial Analyst", "minSalary": isIndianData ? 700000 * salaryMultiplier : 70000 * salaryMultiplier, "medianSalary": isIndianData ? 900000 * salaryMultiplier : 90000 * salaryMultiplier, "maxSalary": isIndianData ? 1100000 * salaryMultiplier : 110000 * salaryMultiplier, "location": isIndianData ? "Mumbai" : "New York" },
//             { "role": "Investment Banker", "minSalary": isIndianData ? 1000000 * salaryMultiplier : 100000 * salaryMultiplier, "medianSalary": isIndianData ? 1500000 * salaryMultiplier : 150000 * salaryMultiplier, "maxSalary": isIndianData ? 2000000 * salaryMultiplier : 200000 * salaryMultiplier, "location": isIndianData ? "Mumbai" : "New York" },
//             { "role": "Risk Manager", "minSalary": isIndianData ? 850000 * salaryMultiplier : 85000 * salaryMultiplier, "medianSalary": isIndianData ? 1100000 * salaryMultiplier : 110000 * salaryMultiplier, "maxSalary": isIndianData ? 1350000 * salaryMultiplier : 135000 * salaryMultiplier, "location": isIndianData ? "Mumbai" : "New York" },
//             { "role": "Financial Advisor", "minSalary": isIndianData ? 650000 * salaryMultiplier : 65000 * salaryMultiplier, "medianSalary": isIndianData ? 850000 * salaryMultiplier : 85000 * salaryMultiplier, "maxSalary": isIndianData ? 1050000 * salaryMultiplier : 105000 * salaryMultiplier, "location": isIndianData ? "Mumbai" : "New York" },
//             { "role": "Portfolio Manager", "minSalary": isIndianData ? 1200000 * salaryMultiplier : 120000 * salaryMultiplier, "medianSalary": isIndianData ? 1600000 * salaryMultiplier : 160000 * salaryMultiplier, "maxSalary": isIndianData ? 2200000 * salaryMultiplier : 220000 * salaryMultiplier, "location": isIndianData ? "Mumbai" : "New York" }
//           ]
//         },
//         {
//           "city": isIndianData ? "Delhi" : "Chicago",
//           "avgSalary": isIndianData ? 1600000 * salaryMultiplier : 160000 * salaryMultiplier,
//           "salaryTrend": "Stable",
//           "demandLevel": "High",
//           "rolesSalaries": [
//             { "role": "Financial Analyst", "minSalary": isIndianData ? 650000 * salaryMultiplier : 65000 * salaryMultiplier, "medianSalary": isIndianData ? 850000 * salaryMultiplier : 85000 * salaryMultiplier, "maxSalary": isIndianData ? 1050000 * salaryMultiplier : 105000 * salaryMultiplier, "location": isIndianData ? "Delhi" : "Chicago" },
//             { "role": "Investment Banker", "minSalary": isIndianData ? 950000 * salaryMultiplier : 95000 * salaryMultiplier, "medianSalary": isIndianData ? 1400000 * salaryMultiplier : 140000 * salaryMultiplier, "maxSalary": isIndianData ? 1900000 * salaryMultiplier : 190000 * salaryMultiplier, "location": isIndianData ? "Delhi" : "Chicago" },
//             { "role": "Risk Manager", "minSalary": isIndianData ? 800000 * salaryMultiplier : 80000 * salaryMultiplier, "medianSalary": isIndianData ? 1050000 * salaryMultiplier : 105000 * salaryMultiplier, "maxSalary": isIndianData ? 1300000 * salaryMultiplier : 130000 * salaryMultiplier, "location": isIndianData ? "Delhi" : "Chicago" },
//             { "role": "Financial Advisor", "minSalary": isIndianData ? 600000 * salaryMultiplier : 60000 * salaryMultiplier, "medianSalary": isIndianData ? 800000 * salaryMultiplier : 80000 * salaryMultiplier, "maxSalary": isIndianData ? 1000000 * salaryMultiplier : 100000 * salaryMultiplier, "location": isIndianData ? "Delhi" : "Chicago" },
//             { "role": "Portfolio Manager", "minSalary": isIndianData ? 1150000 * salaryMultiplier : 115000 * salaryMultiplier, "medianSalary": isIndianData ? 1550000 * salaryMultiplier : 155000 * salaryMultiplier, "maxSalary": isIndianData ? 2100000 * salaryMultiplier : 210000 * salaryMultiplier, "location": isIndianData ? "Delhi" : "Chicago" }
//           ]
//         },
//         {
//           "city": isIndianData ? "Bangalore" : "Boston",
//           "avgSalary": isIndianData ? 1500000 * salaryMultiplier : 150000 * salaryMultiplier,
//           "salaryTrend": "Increasing",
//           "demandLevel": "Medium",
//           "rolesSalaries": [
//             { "role": "Financial Analyst", "minSalary": isIndianData ? 600000 * salaryMultiplier : 60000 * salaryMultiplier, "medianSalary": isIndianData ? 800000 * salaryMultiplier : 80000 * salaryMultiplier, "maxSalary": isIndianData ? 1000000 * salaryMultiplier : 100000 * salaryMultiplier, "location": isIndianData ? "Bangalore" : "Boston" },
//             { "role": "Investment Banker", "minSalary": isIndianData ? 900000 * salaryMultiplier : 90000 * salaryMultiplier, "medianSalary": isIndianData ? 1350000 * salaryMultiplier : 135000 * salaryMultiplier, "maxSalary": isIndianData ? 1850000 * salaryMultiplier : 185000 * salaryMultiplier, "location": isIndianData ? "Bangalore" : "Boston" },
//             { "role": "Risk Manager", "minSalary": isIndianData ? 750000 * salaryMultiplier : 75000 * salaryMultiplier, "medianSalary": isIndianData ? 1000000 * salaryMultiplier : 100000 * salaryMultiplier, "maxSalary": isIndianData ? 1250000 * salaryMultiplier : 125000 * salaryMultiplier, "location": isIndianData ? "Bangalore" : "Boston" },
//             { "role": "Financial Advisor", "minSalary": isIndianData ? 550000 * salaryMultiplier : 55000 * salaryMultiplier, "medianSalary": isIndianData ? 750000 * salaryMultiplier : 75000 * salaryMultiplier, "maxSalary": isIndianData ? 950000 * salaryMultiplier : 95000 * salaryMultiplier, "location": isIndianData ? "Bangalore" : "Boston" },
//             { "role": "Portfolio Manager", "minSalary": isIndianData ? 1100000 * salaryMultiplier : 110000 * salaryMultiplier, "medianSalary": isIndianData ? 1500000 * salaryMultiplier : 150000 * salaryMultiplier, "maxSalary": isIndianData ? 2000000 * salaryMultiplier : 200000 * salaryMultiplier, "location": isIndianData ? "Bangalore" : "Boston" }
//           ]
//         }
//       ],
//       "topCompanies": isIndianData ? [
//         { "name": "HDFC Bank", "openPositions": 150, "roles": ["Financial Analyst", "Investment Banker"], "location": "India" },
//         { "name": "ICICI Bank", "openPositions": 120, "roles": ["Investment Banker", "Risk Analyst"], "location": "India" },
//         { "name": "SBI", "openPositions": 180, "roles": ["Financial Advisor", "Credit Analyst"], "location": "India" }
//       ] : [
//         { "name": "JPMorgan Chase", "openPositions": 180, "roles": ["Financial Analyst", "Investment Banker"], "location": locationStr },
//         { "name": "Goldman Sachs", "openPositions": 150, "roles": ["Investment Banker", "Risk Analyst"], "location": locationStr },
//         { "name": "Bank of America", "openPositions": 200, "roles": ["Financial Advisor", "Credit Analyst"], "location": locationStr }
//       ]
//     };
//   }

//   // Apply experience multiplier to salaries
//   const experienceMultiplier = 1 + (Math.min(experience, 15) * 0.05);

//   // Create a merged data object
//   const mergedData = { ...baseData, ...industryData };

//   // Adjust salary ranges based on experience
//   if (mergedData.salaryRanges) {
//     mergedData.salaryRanges = mergedData.salaryRanges.map(range => ({
//       ...range,
//       minSalary: Math.round(range.minSalary * experienceMultiplier),
//       medianSalary: Math.round(range.medianSalary * experienceMultiplier),
//       maxSalary: Math.round(range.maxSalary * experienceMultiplier)
//     }));
//   }

//   // Adjust expected salary range
//   if (mergedData.expectedSalaryRange) {
//     mergedData.expectedSalaryRange = {
//       ...mergedData.expectedSalaryRange,
//       min: Math.round(mergedData.expectedSalaryRange.min * experienceMultiplier),
//       max: Math.round(mergedData.expectedSalaryRange.max * experienceMultiplier)
//     };
//   }

//   // Add user's skills to market demand if they're not already there
//   if (skills && skills.length > 0 && mergedData.marketDemand) {
//     const existingSkills = new Set(mergedData.marketDemand.map(item => item.skill.toLowerCase()));

//     skills.forEach(skill => {
//       if (!existingSkills.has(skill.toLowerCase())) {
//         // Add user's skill with a random demand score between 60-85
//         mergedData.marketDemand.push({
//           skill: skill,
//           demandScore: Math.floor(Math.random() * 25) + 60,
//           location: locationStr
//         });
//       }
//     });

//     // Sort by demand score
//     mergedData.marketDemand.sort((a, b) => b.demandScore - a.demandScore);
//   }

//   return mergedData;
// }