/**
 * WORKFORCEOS V-2 - FRONTEND CONFIGURATION
 * Defines API routing targets, environment flags, and global constants.
 */

const EnvConfig = {
  ENVIRONMENT: "production", // "staging" or "production"
  
  // Decoupled API Execution Endpoint Gateway URL
  API_GATEWAY_URL: "https://script.google.com/macros/s/EXECUTION_API_ID_HERE/exec",
  
  // API Route Map definitions
  ROUTES: {
    AUTH_CHECK: "/auth/check",
    AUTH_LOGIN: "/auth/login",
    TASK_DELEGATE: "/tasks/delegate",
    ATTENDANCE_CHECKIN: "/attendance/checkin"
  },

  SYSTEM: {
    VERSION: "2.0.0",
    MAX_FILE_BYTES: 26214400, // 25 MB
    POLLING_INTERVAL_MS: 30000 // 30 Seconds notification fetch loops
  }
};

// Freeze the object to prevent runtime manipulation
Object.freeze(EnvConfig);
