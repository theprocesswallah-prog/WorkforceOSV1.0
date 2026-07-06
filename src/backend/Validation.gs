/**
 * WORKFORCEOS V-2 - SCHEMA VALIDATION ENGINE
 * Sanitizes input types, validates schemas, and checks file upload sizes.
 */

const ValidationEngine = {
  /**
   * Sanitizes text strings to prevent cross-site scripting (XSS) risks.
   */
  sanitizeString: function(input) {
    if (typeof input !== 'string') {
      return "";
    }
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  },

  /**
   * Validates standard string structure patterns.
   */
  isValidEmail: function(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  },

  isValidPhone: function(phone) {
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return phoneRegex.test(phone);
  },

  isValidDate: function(dateStr) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      return false;
    }
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
  },

  /**
   * Validates parameter presence and data types in the request payload.
   */
  validatePayload: function(payload, schema) {
    const missingFields = [];
    const typeMismatches = [];

    for (let field in schema) {
      const rules = schema[field];
      const value = payload[field];

      // Verify presence of required fields
      if (rules.required && (value === undefined || value === null || value === "")) {
        missingFields.push(field);
        continue;
      }

      if (value !== undefined && value !== null && value !== "") {
        // Verify value data types
        if (rules.type === "string" && typeof value !== "string") {
          typeMismatches.push(`${field} must be a string`);
        } else if (rules.type === "number" && typeof value !== "number") {
          typeMismatches.push(`${field} must be a number`);
        } else if (rules.type === "boolean" && typeof value !== "boolean") {
          typeMismatches.push(`${field} must be a boolean`);
        } else if (rules.type === "email" && !this.isValidEmail(value)) {
          typeMismatches.push(`${field} must be a valid email address`);
        } else if (rules.type === "phone" && !this.isValidPhone(value)) {
          typeMismatches.push(`${field} must be a valid phone number`);
        } else if (rules.type === "date" && !this.isValidDate(value)) {
          typeMismatches.push(`${field} must be in format YYYY-MM-DD`);
        }
      }
    }

    if (missingFields.length > 0 || typeMismatches.length > 0) {
      return {
        isValid: false,
        errors: {
          missing: missingFields,
          mismatches: typeMismatches
        }
      };
    }

    return { isValid: true };
  }
};
