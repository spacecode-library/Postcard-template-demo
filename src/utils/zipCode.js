/**
 * ZIP Code Utilities
 * Handles ZIP code validation, formatting, and range expansion
 */

/**
 * Validate a single ZIP code
 * @param {string} zipCode - ZIP code to validate
 * @returns {boolean} True if valid
 */
export function isValidZipCode(zipCode) {
  if (!zipCode) return false;

  // Remove any spaces or dashes
  const cleaned = zipCode.replace(/[\s-]/g, '');

  // US ZIP codes are 5 digits or 5+4 digits
  return /^\d{5}(\d{4})?$/.test(cleaned);
}

/**
 * Format ZIP code (add dash for ZIP+4)
 * @param {string} zipCode - ZIP code to format
 * @returns {string} Formatted ZIP code
 */
export function formatZipCode(zipCode) {
  if (!zipCode) return '';

  const cleaned = zipCode.replace(/[\s-]/g, '');

  // Add dash for ZIP+4 format
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }

  return cleaned.slice(0, 5);
}

/**
 * Extract base ZIP code (5 digits only)
 * @param {string} zipCode - ZIP code (may include +4)
 * @returns {string} Base 5-digit ZIP code
 */
export function getBaseZipCode(zipCode) {
  if (!zipCode) return '';

  const cleaned = zipCode.replace(/[\s-]/g, '');
  return cleaned.slice(0, 5);
}

/**
 * Parse ZIP code range input
 * Supports formats: "10001-10005", "10001 - 10005", "10001, 10002, 10003"
 * @param {string} input - ZIP code range input
 * @returns {Array<string>} Array of individual ZIP codes
 */
export function parseZipCodeRange(input) {
  if (!input || typeof input !== 'string') return [];

  // Remove extra whitespace
  input = input.trim();

  // Check if it's a range format (e.g., "10001-10005" or "10001 - 10005")
  const rangeMatch = input.match(/^(\d{5})\s*-\s*(\d{5})$/);

  if (rangeMatch) {
    const startZip = rangeMatch[1];
    const endZip = rangeMatch[2];
    return expandZipCodeRange(startZip, endZip);
  }

  // Otherwise, treat as comma-separated list
  const zips = input.split(/[,\s]+/)
    .map(zip => zip.trim())
    .filter(zip => zip && /^\d{5}$/.test(zip));

  // Remove duplicates
  return [...new Set(zips)];
}

/**
 * Expand a ZIP code range into individual ZIP codes
 * Example: expandZipCodeRange('10001', '10005') → ['10001', '10002', '10003', '10004', '10005']
 * @param {string|number} startZip - Starting ZIP code
 * @param {string|number} endZip - Ending ZIP code
 * @returns {Array<string>} Array of ZIP codes in the range
 */
export function expandZipCodeRange(startZip, endZip) {
  // Validate inputs
  const start = String(startZip).padStart(5, '0');
  const end = String(endZip).padStart(5, '0');

  if (!isValidZipCode(start) || !isValidZipCode(end)) {
    console.error('Invalid ZIP codes provided:', { startZip, endZip });
    return [];
  }

  const startNum = parseInt(start, 10);
  const endNum = parseInt(end, 10);

  // Validate range
  if (startNum > endNum) {
    console.error('Start ZIP must be less than or equal to end ZIP:', { start, end });
    return [];
  }

  // Limit range size to prevent memory issues
  const MAX_RANGE_SIZE = 1000;
  if (endNum - startNum > MAX_RANGE_SIZE) {
    console.error(`ZIP range too large (max ${MAX_RANGE_SIZE}):`, { start, end, size: endNum - startNum });
    return [];
  }

  // Generate array of ZIP codes
  const zipCodes = [];
  for (let i = startNum; i <= endNum; i++) {
    zipCodes.push(String(i).padStart(5, '0'));
  }

  return zipCodes;
}

/**
 * Parse multiple ZIP code inputs (handles ranges and individual ZIPs)
 * Example: "10001-10003, 10010, 10020-10022" → ['10001', '10002', '10003', '10010', '10020', '10021', '10022']
 * @param {string} input - ZIP code input with ranges and/or individual ZIPs
 * @returns {Object} Result object with expanded ZIPs and errors
 */
export function parseMultipleZipCodes(input) {
  if (!input || typeof input !== 'string') {
    return {
      zipCodes: [],
      errors: ['No input provided']
    };
  }

  const allZips = [];
  const errors = [];

  // Split by comma to handle multiple entries
  const entries = input.split(',').map(e => e.trim()).filter(e => e);

  for (const entry of entries) {
    // Check if it's a range
    const rangeMatch = entry.match(/^(\d{5})\s*-\s*(\d{5})$/);

    if (rangeMatch) {
      // It's a range
      const startZip = rangeMatch[1];
      const endZip = rangeMatch[2];
      const expanded = expandZipCodeRange(startZip, endZip);

      if (expanded.length === 0) {
        errors.push(`Invalid range: ${entry}`);
      } else {
        allZips.push(...expanded);
      }
    } else if (/^\d{5}$/.test(entry)) {
      // It's a single ZIP code
      allZips.push(entry);
    } else {
      errors.push(`Invalid ZIP code format: ${entry}`);
    }
  }

  // Remove duplicates
  const uniqueZips = [...new Set(allZips)];

  return {
    zipCodes: uniqueZips,
    count: uniqueZips.length,
    errors: errors
  };
}

/**
 * Validate ZIP code range
 * @param {string} startZip - Starting ZIP code
 * @param {string} endZip - Ending ZIP code
 * @returns {Object} Validation result
 */
export function validateZipCodeRange(startZip, endZip) {
  const start = String(startZip).padStart(5, '0');
  const end = String(endZip).padStart(5, '0');

  if (!isValidZipCode(start)) {
    return { valid: false, error: 'Invalid start ZIP code' };
  }

  if (!isValidZipCode(end)) {
    return { valid: false, error: 'Invalid end ZIP code' };
  }

  const startNum = parseInt(start, 10);
  const endNum = parseInt(end, 10);

  if (startNum > endNum) {
    return { valid: false, error: 'Start ZIP must be less than or equal to end ZIP' };
  }

  const rangeSize = endNum - startNum + 1;
  if (rangeSize > 1000) {
    return { valid: false, error: 'ZIP range too large (max 1000 ZIP codes)' };
  }

  return { valid: true, rangeSize };
}

/**
 * Get ZIP code suggestions based on input
 * Useful for autocomplete features
 * @param {string} input - Partial ZIP code
 * @param {Array<string>} existingZips - List of existing ZIP codes to search
 * @returns {Array<string>} Matching ZIP codes
 */
export function getZipCodeSuggestions(input, existingZips = []) {
  if (!input || !existingZips.length) return [];

  const cleaned = input.replace(/\D/g, '');
  if (cleaned.length === 0) return [];

  return existingZips
    .filter(zip => zip.startsWith(cleaned))
    .slice(0, 10); // Limit to 10 suggestions
}

export default {
  isValidZipCode,
  formatZipCode,
  getBaseZipCode,
  parseZipCodeRange,
  expandZipCodeRange,
  parseMultipleZipCodes,
  validateZipCodeRange,
  getZipCodeSuggestions
};
