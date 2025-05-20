/**
 * Enhanced JSON Parser Utility
 *
 * A robust utility for parsing potentially malformed JSON responses from AI services.
 * Uses multiple parsing strategies and libraries to handle complex nested structures and common JSON errors.
 * Specifically optimized for handling Gemini API responses with comparison data.
 */

import JSON5 from 'json5';
import { jsonrepair } from 'jsonrepair';

/**
 * Parse JSON with multiple fallback strategies
 * @param {string} text - The raw text to parse as JSON
 * @param {Object} options - Options for parsing
 * @param {boolean} options.verbose - Whether to log detailed information (default: false)
 * @param {Object} options.fallbackData - Data to return if all parsing methods fail
 * @param {string} options.dataType - Type of data being parsed (e.g., 'comparison', 'countryComparison', 'roleComparison')
 * @returns {Object} The parsed JSON object
 */
export const parseJSON = (text, options = {}) => {
  const { verbose = false, fallbackData = {}, dataType = 'general' } = options;

  // Store parsing attempts and errors for diagnostics
  const attempts = [];

  // Helper function to log if verbose is enabled
  const log = (message) => {
    if (verbose) {
      console.log(`[JSONParser] ${message}`);
    }
  };

  // Helper function to log errors if verbose is enabled
  const logError = (method, error) => {
    if (verbose) {
      console.error(`[JSONParser] ${method} failed: ${error.message}`);
    }
    attempts.push({ method, error: error.message });
  };

  // Helper function to extract JSON from text that might contain non-JSON content
  const extractJSONString = (inputText) => {
    // Find the first opening brace and last closing brace
    const firstBrace = inputText.indexOf('{');
    const lastBrace = inputText.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      log('No valid JSON object structure found in text');
      return inputText; // Return original if no valid JSON structure found
    }

    // Extract what looks like a JSON object
    const extracted = inputText.substring(firstBrace, lastBrace + 1);
    log(`Extracted JSON-like content from position ${firstBrace} to ${lastBrace}`);
    return extracted;
  };

  // Clean the input text before attempting to parse
  const cleanText = (inputText) => {
    // Remove markdown code block markers
    let cleaned = inputText.replace(/```json/g, '').replace(/```/g, '');

    // Remove any explanatory text before and after the JSON
    cleaned = extractJSONString(cleaned);

    // Fix common JSON syntax issues
    cleaned = cleaned
      // Fix trailing commas in arrays and objects
      .replace(/,\s*]/g, ']')
      .replace(/,\s*}/g, '}')
      // Fix missing quotes around property names
      .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
      // Fix single quotes
      .replace(/:\s*'([^']*)'/g, ':"$1"')
      // Fix undefined and NaN values
      .replace(/:\s*undefined/g, ':null')
      .replace(/:\s*NaN/g, ':0')
      // Fix missing commas between array elements
      .replace(/}\s*{/g, '},{')
      .replace(/]\s*{/g, '],[')
      .replace(/}\s*\[/g, '},')
      .replace(/]\s*\[/g, '],')
      // Fix multiple closing braces/brackets without proper separation
      .replace(/}+}/g, '}}')
      .replace(/]+]/g, ']]')
      .replace(/}+]/g, '}]')
      // Fix extra closing braces/brackets
      .replace(/}{/g, '},{')
      .replace(/]\[/g, '],[')
      // Fix truncated JSON by adding closing brackets
      .replace(/([^}])\s*$/g, (match, p1) => {
        if (p1 === '{' || p1 === '[' || p1 === ',' || p1 === ':') {
          return p1 + 'null';
        }
        return match;
      });

    // Apply data-type specific fixes
    if (dataType === 'comparison' || dataType === 'countryComparison' || dataType === 'roleComparison') {
      // Fix common issues with comparison data
      cleaned = fixComparisonDataStructure(cleaned, dataType);
    }

    // Check for unbalanced brackets and fix them
    const counts = { '{': 0, '}': 0, '[': 0, ']': 0 };
    for (const char of cleaned) {
      if (char in counts) counts[char]++;
    }

    // Add missing closing brackets/braces
    if (counts['{'] > counts['}']) {
      log(`Adding ${counts['{'] - counts['}']} missing closing braces during cleaning`);
      cleaned += '}'.repeat(counts['{'] - counts['}']);
    }

    if (counts['['] > counts[']']) {
      log(`Adding ${counts['['] - counts[']']} missing closing brackets during cleaning`);
      cleaned += ']'.repeat(counts['['] - counts[']']);
    }

    return cleaned;
  };

  // Helper function to fix common issues with comparison data structure
  const fixComparisonDataStructure = (text, type) => {
    let fixed = text;

    // Fix common issues with rolesSalaries arrays
    if (type === 'comparison' || type === 'countryComparison') {
      // Fix incomplete rolesSalaries arrays
      const rolesSalariesRegex = /"rolesSalaries"\s*:\s*\[\s*{[^}\]]*$/;
      if (rolesSalariesRegex.test(fixed)) {
        log('Found incomplete rolesSalaries array, adding closing bracket');
        fixed += '}]';
      }

      // Fix missing commas between rolesSalaries items
      fixed = fixed.replace(/}(\s*){/g, '},\n$1{');
    }

    // Fix common issues with skill arrays in role comparison
    if (type === 'comparison' || type === 'roleComparison') {
      // Fix incomplete requiredSkills arrays
      const requiredSkillsRegex = /"requiredSkills"\s*:\s*\[\s*"[^"\]]*$/;
      if (requiredSkillsRegex.test(fixed)) {
        log('Found incomplete requiredSkills array, adding closing bracket');
        fixed += '"]';
      }

      // Fix missing commas between skill items
      fixed = fixed.replace(/"(\s*)"/g, '",\n$1"');
    }

    return fixed;
  };

  // Try to parse the text using multiple methods
  try {
    // Method 1: Standard JSON.parse with cleaned text
    const cleanedText = cleanText(text);
    log(`Attempting standard JSON.parse with cleaned text (${cleanedText.length} chars)`);

    try {
      const result = JSON.parse(cleanedText);
      log('Successfully parsed with standard JSON.parse');
      return result;
    } catch (error) {
      logError('JSON.parse', error);

      // Log detailed error information for debugging
      const positionMatch = error.message.match(/position (\d+)/);
      if (positionMatch) {
        const position = parseInt(positionMatch[1]);
        const errorContext = cleanedText.substring(
          Math.max(0, position - 50),
          Math.min(cleanedText.length, position + 50)
        );
        log(`JSON error context around position ${position}: ${errorContext}`);
      }
    }

    // Method 2: Use JSON5 (more lenient JSON parser)
    log('Attempting to parse with JSON5');
    try {
      const result = JSON5.parse(cleanedText);
      log('Successfully parsed with JSON5');
      return result;
    } catch (error) {
      logError('JSON5', error);
    }

    // Method 3: Use jsonrepair library
    log('Attempting to repair and parse with jsonrepair');
    try {
      const repaired = jsonrepair(cleanedText);
      const result = JSON.parse(repaired);
      log('Successfully parsed with jsonrepair');
      return result;
    } catch (error) {
      logError('jsonrepair', error);
    }

    // Method 4: Try with a more aggressive approach - manually fix truncated JSON
    log('Attempting to fix truncated JSON');
    try {
      // Look for common patterns that indicate truncation
      let fixedText = cleanedText;

      // Check if the JSON ends with a property name but no value
      if (/[{,]\s*"[^"]+"\s*:(\s*)$/.test(fixedText)) {
        log('JSON appears to be truncated after a property name, adding null value');
        fixedText += 'null';
      }

      // Check if the JSON ends with a comma
      if (/,\s*$/.test(fixedText)) {
        log('JSON appears to be truncated after a comma, removing trailing comma');
        fixedText = fixedText.replace(/,\s*$/, '');
      }

      // Try parsing with these fixes
      const result = JSON.parse(fixedText);
      log('Successfully parsed after fixing truncated JSON');
      return result;
    } catch (error) {
      logError('truncation-fixing', error);
    }

    // Method 5: Handle specific issue with rolesSalaries array
    log('Attempting to fix rolesSalaries array issues');
    try {
      // The error in the logs shows issues with rolesSalaries array
      // Look for incomplete rolesSalaries arrays and fix them
      const rolesSalariesRegex = /"rolesSalaries"\s*:\s*\[\s*{[^}]*}\s*$/;
      if (rolesSalariesRegex.test(cleanedText)) {
        log('Found incomplete rolesSalaries array, adding closing bracket');
        let fixedText = cleanedText + ']';

        // Check if we need to close any other structures
        const counts = { '{': 0, '}': 0, '[': 0, ']': 0 };
        for (const char of fixedText) {
          if (char in counts) counts[char]++;
        }

        if (counts['{'] > counts['}']) {
          fixedText += '}'.repeat(counts['{'] - counts['}']);
        }

        if (counts['['] > counts[']']) {
          fixedText += ']'.repeat(counts['['] - counts[']']);
        }

        const result = JSON.parse(fixedText);
        log('Successfully parsed after fixing rolesSalaries array');
        return result;
      }
    } catch (error) {
      logError('rolesSalaries-fixing', error);
    }

    // Method 6: Handle specific issue with nested objects in countrySalaryComparison
    log('Attempting to fix nested objects in countrySalaryComparison');
    try {
      // Look for patterns that indicate nested object issues in countrySalaryComparison
      const nestedObjectRegex = /"(currentCountry|targetCountry)"\s*:\s*{[^}]*}\s*}+\s*]?\s*]?\s*}?\s*$/;
      if (nestedObjectRegex.test(cleanedText)) {
        log('Found potentially malformed nested objects in countrySalaryComparison');

        // Try to balance the structure by counting and fixing brackets
        let fixedText = cleanedText;

        // Count all opening and closing brackets
        const counts = { '{': 0, '}': 0, '[': 0, ']': 0 };
        for (const char of fixedText) {
          if (char in counts) counts[char]++;
        }

        // Fix unbalanced brackets
        if (counts['{'] > counts['}']) {
          log(`Adding ${counts['{'] - counts['}']} missing closing braces`);
          fixedText += '}'.repeat(counts['{'] - counts['}']);
        }

        if (counts['['] > counts[']']) {
          log(`Adding ${counts['['] - counts[']']} missing closing brackets`);
          fixedText += ']'.repeat(counts['['] - counts[']']);
        }

        // Try parsing with these fixes
        const result = JSON.parse(fixedText);
        log('Successfully parsed after fixing nested objects in countrySalaryComparison');
        return result;
      }
    } catch (error) {
      logError('nested-objects-fixing', error);
    }

    // Method 7: Handle specific issue with multiple closing braces at the end
    log('Attempting to fix multiple closing braces at the end');
    try {
      // Look for patterns that indicate multiple closing braces at the end
      const multipleClosingBracesRegex = /}+\]+$/;
      if (multipleClosingBracesRegex.test(cleanedText)) {
        log('Found multiple closing braces at the end');

        // Try to fix by removing extra closing braces and brackets
        let fixedText = cleanedText;

        // Count all opening and closing brackets
        const counts = { '{': 0, '}': 0, '[': 0, ']': 0 };
        for (let i = 0; i < fixedText.length; i++) {
          const char = fixedText[i];
          if (char in counts) {
            counts[char]++;

            // Check for imbalance as we go
            if ((char === '}' && counts['}'] > counts['{']) ||
                (char === ']' && counts[']'] > counts['['])) {
              // Found an extra closing brace/bracket, remove it
              fixedText = fixedText.substring(0, i) + fixedText.substring(i + 1);
              counts[char]--; // Decrement the count since we removed it
              i--; // Adjust index since we removed a character
            }
          }
        }

        // Try parsing with these fixes
        const result = JSON.parse(fixedText);
        log('Successfully parsed after fixing multiple closing braces at the end');
        return result;
      }
    } catch (error) {
      logError('multiple-closing-braces-fixing', error);
    }

    // If all methods fail, throw an error with detailed diagnostics
    const errorDetails = attempts.map(a => `${a.method}: ${a.error}`).join('; ');
    throw new Error(`All JSON parsing methods failed: ${errorDetails}`);

  } catch (error) {
    log(`All parsing methods failed: ${error.message}`);

    // Return fallback data if provided
    if (Object.keys(fallbackData).length > 0) {
      log('Returning fallback data');
      return fallbackData;
    }

    // Re-throw the error if no fallback data
    throw error;
  }
};

export default parseJSON;
