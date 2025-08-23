/**
 * Utility functions for handling time ranges
 */

/**
 * Get start and end dates based on timeframe
 * @param {string} timeframe - 'day', 'week', 'month', 'year', or 'all'
 * @returns {Object} Object with start and end Date objects
 */
function getTimeRange(timeframe) {
  const now = new Date();
  const start = new Date();
  const end = new Date(now);

  switch (timeframe.toLowerCase()) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    
    case 'week':
      const dayOfWeek = now.getDay();
      start.setDate(now.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
    
    case 'year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
    
    case 'all':
      start.setFullYear(2020, 0, 1); // Start from 2020
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    
    default:
      // Default to current month
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
}

/**
 * Format date for display
 * @param {Date} date 
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Get the difference between two dates in days
 * @param {Date} start 
 * @param {Date} end 
 * @returns {number} Number of days
 */
function getDaysDifference(start, end) {
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

module.exports = {
  getTimeRange,
  formatDate,
  getDaysDifference
};
