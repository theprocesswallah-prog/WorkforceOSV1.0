/**
 * WORKFORCEOS V-2 - SYSTEM LOGGER
 * Standardized logging interface to record transactions to history sheets and Stackdriver.
 */

const SystemLogger = {
  /**
   * Appends an operational event into the TASK_HISTORY sheet.
   * Runs inside a failsafe block to prevent logger failures from breaking main database transactions.
   */
  logTaskHistory: function(taskNo, status, remarks, executionUser, actionType) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let histSheet = ss.getSheetByName(SHEET_NAMES.TASK_HISTORY);
      if (!histSheet) {
        histSheet = ss.insertSheet(SHEET_NAMES.TASK_HISTORY);
        histSheet.appendRow(["Log Timestamp", "Task No", "Status", "Remarks", "Updated By", "Action Type"]);
      }
      histSheet.appendRow([
        new Date(),
        taskNo,
        status,
        remarks || "",
        executionUser,
        actionType || "STATUS_CHANGE"
      ]);
      console.log(`[TASK_HISTORY_LOG] Task: ${taskNo} | Action: ${actionType} | Operator: ${executionUser}`);
    } catch (e) {
      console.error(`[CRITICAL_LOGGER_FAIL] Failed to append task history row: ${e.toString()}`);
    }
  },

  /**
   * Appends an alert entry to the NOTIFICATIONS transaction sheet.
   */
  createNotification: function(empId, message) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheet = ss.getSheetByName(SHEET_NAMES.NOTIFICATIONS);
      if (!sheet) {
        sheet = ss.insertSheet(SHEET_NAMES.NOTIFICATIONS);
        sheet.appendRow(["Notification_ID", "Emp_ID", "Message", "Timestamp", "Is_Read"]);
      }
      const nextId = "NOT" + String(sheet.getLastRow() + 1).padStart(5, '0');
      sheet.appendRow([
        nextId,
        empId,
        message,
        new Date(),
        "NO"
      ]);
      console.log(`[NOTIFICATION_LOG] User: ${empId} | Message: ${message}`);
      return true;
    } catch (e) {
      console.error(`[CRITICAL_LOGGER_FAIL] Failed to create system notification: ${e.toString()}`);
      return false;
    }
  },

  /**
   * Stackdriver Audit Log wrapper.
   */
  audit: function(operatorId, level, module, eventDesc) {
    const timestamp = new Date().toISOString();
    const logPayload = {
      timestamp: timestamp,
      operator: operatorId,
      level: level,
      module: module,
      description: eventDesc
    };
    if (level === "ERROR" || level === "CRITICAL") {
      console.error(JSON.stringify(logPayload));
    } else if (level === "WARNING") {
      console.warn(JSON.stringify(logPayload));
    } else {
      console.log(JSON.stringify(logPayload));
    }
  }
};
