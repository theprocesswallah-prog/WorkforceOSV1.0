/**
 * WORKFORCEOS V-2 - SECURITY CONTROLS GATEWAY
 * Manages access control lists, validates active sessions, and processes permissions matrix.
 */

const AuthMiddleware = {
  /**
   * Validates session token lifespan and role mapping attributes against EMPLOYEE_MASTER.
   */
  validateSession: function(empId, tokenTimestamp) {
    if (!empId || !tokenTimestamp) {
      return { isValid: false, message: "Authentication required: Session parameters missing." };
    }

    // Check token lifespan against system TTL parameters
    const loginTime = new Date(tokenTimestamp).getTime();
    const now = new Date().getTime();
    if (isNaN(loginTime) || (now - loginTime) > SYSTEM_CONFIG.SESSION_TTL_MS) {
      return { isValid: false, message: "Session expired. Please log in again." };
    }

    // Validate employee record and status in EMPLOYEE_MASTER
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAMES.EMPLOYEE_MASTER);
    if (!sheet) {
      return { isValid: false, message: "System Error: Employee master registry unmapped." };
    }

    const data = sheet.getDataRange().getValues();
    const idCol = COL_INDEX.EMPLOYEE_MASTER.EMP_ID;
    const statusCol = COL_INDEX.EMPLOYEE_MASTER.STATUS;
    const roleCol = COL_INDEX.EMPLOYEE_MASTER.ROLE;

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idCol]).trim() === String(empId).trim()) {
        const status = String(data[i][statusCol]).trim().toUpperCase();
        if (status === "INACTIVE") {
          return { isValid: false, message: "Your account has been deactivated. Please contact the administrator." };
        }
        return { 
          isValid: true, 
          user: {
            empId: data[i][idCol],
            role: data[i][roleCol] || ROLES.EMPLOYEE
          }
        };
      }
    }

    return { isValid: false, message: "Authentication failed: Profile not found." };
  },

  /**
   * Validates user roles against system permissions.
   */
  authorize: function(userRole, allowedRoles) {
    if (!allowedRoles || allowedRoles.length === 0) {
      return true; // No route restrictions
    }
    return allowedRoles.includes(userRole);
  }
};
