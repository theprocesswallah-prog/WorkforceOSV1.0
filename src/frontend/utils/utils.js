/**
 * WORKFORCEOS V-2 - FRONTEND SYSTEM UTILITIES
 * Reusable helper functions for common client-side calculations and formatting.
 */

const ClientUtils = {
  /**
   * Sanitizes input strings to prevent XSS vulnerability risks.
   */
  escapeHTML: function(str) {
    if (typeof str !== 'string') {
      return '';
    }
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      "/": '&#x2F;'
    };
    return str.replace(/[&<>"'/]/g, function(m) { return map[m]; });
  },

  /**
   * Formats raw bytes into standardized MB string values.
   */
  formatBytesToMB: function(bytes) {
    if (isNaN(bytes) || bytes === 0) {
      return "0.00 MB";
    }
    const mbValue = bytes / (1024 * 1024);
    return `${mbValue.toFixed(2)} MB`;
  },

  /**
   * Parses standard date strings into user-friendly date format strings.
   */
  formatUserDate: function(dateString) {
    if (!dateString) {
      return 'N/A';
    }
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) {
      return dateString;
    }
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};
