/**
 * WORKFORCEOS V-2 - SESSION & STATE COORDINATOR
 * Manages browser-side session caching, storage security, and API requests.
 */

const SessionManager = {
  /**
   * Caches authenticated user profiles in sessionStorage.
   */
  startSession: function(userProfile) {
    const timestamp = new Date().toISOString();
    const sessionPayload = {
      empId: userProfile.empId,
      name: userProfile.name,
      role: userProfile.role,
      designation: userProfile.designation,
      department: userProfile.department,
      photoUrl: userProfile.photoUrl,
      token: timestamp // Stamped timestamp used as validation token
    };
    sessionStorage.setItem("user_session", JSON.stringify(sessionPayload));
    console.log(`[SESSION] Session initiated for ID: ${userProfile.empId}`);
  },

  /**
   * Clears the current user session and state details on logout.
   */
  terminateSession: function() {
    sessionStorage.removeItem("user_session");
    console.log("[SESSION] Current active user session terminated.");
  },

  /**
   * Resolves cached user session data.
   */
  getActiveSession: function() {
    const rawSession = sessionStorage.getItem("user_session");
    if (!rawSession) {
      return null;
    }
    try {
      return JSON.parse(rawSession);
    } catch (e) {
      this.terminateSession();
      return null;
    }
  },

  /**
   * Sends transactional post requests to the server API gateway.
   */
  postRequest: async function(route, payload = {}) {
    const activeSession = this.getActiveSession();
    const requestBody = {
      route: route,
      payload: payload,
      empId: activeSession ? activeSession.empId : null,
      token: activeSession ? activeSession.token : null
    };

    try {
      const response = await fetch(EnvConfig.API_GATEWAY_URL, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8" // Bypass CORS preflight issues in GAS webapps
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP network exception caught: Status ${response.status}`);
      }

      const responseJson = await response.json();
      if (!responseJson.success) {
        throw new Error(responseJson.error ? responseJson.error.message : "API processing failed.");
      }

      return responseJson;
    } catch (err) {
      console.error(`[API_TRANSACTION_FAIL] Endpoint: ${route} | Error: ${err.message}`);
      throw err;
    }
  }
};
