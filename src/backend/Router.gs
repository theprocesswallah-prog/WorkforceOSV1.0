/**
 * WORKFORCEOS V-2 - API DISPATCH ROUTER
 * Handles incoming HTTPS POST requests and executes authorization and validation checks.
 */

// Route dispatch registry mapping endpoints to handlers, roles, and validation rules
const API_DISPATCH_REGISTRY = {
  "/auth/check": {
    handler: "getOrCreateAttachmentsRootFolder", // Temporary root verification endpoint for Phase 0
    roles: [], 
    schema: {}
  }
};

/**
 * Apps Script Web App post request entry-point handler.
 */
function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      return sendJsonResponse(ErrorManager.createErrorResponse(
        ErrorCodes.BAD_REQUEST,
        "Request payload body is missing."
      ));
    }

    // Parse the JSON request payload
    let request;
    try {
      request = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return sendJsonResponse(ErrorManager.createErrorResponse(
        ErrorCodes.BAD_REQUEST,
        "Malformed JSON payload in request."
      ));
    }

    const route = request.route;
    const payload = request.payload || {};
    const empId = request.empId;
    const sessionToken = request.token; // Stamped login timestamp

    // Verify route exists in registry
    const endpoint = API_DISPATCH_REGISTRY[route];
    if (!endpoint) {
      return sendJsonResponse(ErrorManager.createErrorResponse(
        ErrorCodes.NOT_FOUND,
        `Endpoint '${route}' not found.`
      ));
    }

    // Enforce authentication check if endpoint requires specific roles
    let activeUser = null;
    if (endpoint.roles && endpoint.roles.length > 0) {
      const authResult = AuthMiddleware.validateSession(empId, sessionToken);
      if (!authResult.isValid) {
        return sendJsonResponse(ErrorManager.createErrorResponse(
          ErrorCodes.UNAUTHORIZED,
          authResult.message
        ));
      }

      // Enforce role-based access control checks
      const isAuthorized = AuthMiddleware.authorize(authResult.user.role, endpoint.roles);
      if (!isAuthorized) {
        return sendJsonResponse(ErrorManager.createErrorResponse(
          ErrorCodes.FORBIDDEN,
          "Access denied: Unauthorized operation for your role."
        ));
      }
      activeUser = authResult.user;
    }

    // Enforce strict schema validation rules
    if (endpoint.schema) {
      const valResult = ValidationEngine.validatePayload(payload, endpoint.schema);
      if (!valResult.isValid) {
        return sendJsonResponse(String(valResult.error) ? {
          success: false,
          errors: valResult
        } : {
          success: false,
          message: "Request failed schema validation rules.",
          details: valResult.errors.mismatches.concat(
            valResult.errors.missing.map(f => `Required field missing: '${f}'`)
          )
        });
      }
    }

    // Route execution to target server function safely
    const responseData = ErrorManager.executeSecureTx(route, function() {
      return this[endpoint.handler](payload, activeUser);
    });

    return sendJsonResponse({
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    });

  } catch (globalErr) {
    SystemLogger.audit("ROUTER_CRITICAL", "CRITICAL", "doPost", `Fatal exception caught: ${globalErr.toString()}`);
    return sendJsonResponse(ErrorManager.createErrorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      "A fatal system error occurred.",
      [globalErr.toString()]
    ));
  }
}

/**
 * Returns a JSON output response to the client.
 */
function sendJsonResponse(jsonObj) {
  return ContentService.createTextOutput(JSON.stringify(jsonObj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Standard dynamic file include helper for serving raw script blocks.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
