/**
 * WORKFORCEOS V-2 - ERROR MANAGEMENT ENGINE
 * Standardizes server-side exception handling and structures API error responses.
 */

const ErrorCodes = {
  BAD_REQUEST: "BAD_REQUEST",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONCURRENCY_TIMEOUT: "CONCURRENCY_TIMEOUT",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR"
};

const ErrorManager = {
  /**
   * Formats an exception object into a standard system error response.
   */
  createErrorResponse: function(errorCode, message, details = []) {
    return {
      success: false,
      error: {
        code: errorCode,
        message: message,
        details: details
      },
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Executes database operations securely within a try-catch block.
   */
  executeSecureTx: function(moduleName, operationCallback) {
    try {
      return operationCallback();
    } catch (e) {
      const errStr = e.toString();
      SystemLogger.audit("SYSTEM", "ERROR", moduleName, `Transaction execution crashed: ${errStr}`);
      
      if (errStr.indexOf("CONCURRENCY_TIMEOUT") !== -1) {
        return this.createErrorResponse(
          ErrorCodes.CONCURRENCY_TIMEOUT, 
          "The database is currently busy. Please try again."
        );
      }
      
      return this.createErrorResponse(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred during database operations.",
        [errStr]
      );
    }
  }
};
