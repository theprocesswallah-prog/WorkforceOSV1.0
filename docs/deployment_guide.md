# WorkforceOS V-2 - Foundation Layer Deployment Playbook

This document details the configuration and deployment steps for the WorkforceOS V-2 system foundation.

## Backend Deployment (Google Apps Script Web App)

### Step 1: Initialize Database Spreadsheet
1. Create a master Google Spreadsheet.
2. Create sheets with the following names:
   * `EMPLOYEE_MASTER`
   * `TASK_LIST`
   * `ATTENDANCE_LOGS`
   * `ATTENDANCE_CORRECTIONS`
   * `LEAVE_REQUESTS`
   * `SALARY_MASTER`
   * `NOTIFICATIONS`
   * `TASK_HISTORY`
   * `EMPLOYEE_SCORECARD`

### Step 2: Configure Script Environment
1. Open the Spreadsheet and select **Extensions** -> **Apps Script** from the top menu.
2. In the Apps Script project editor, add the following files and paste their respective code blocks:
   * `Constants.gs`
   * `Logger.gs`
   * `ErrorManager.gs`
   * `Validation.gs`
   * `AuthMiddleware.gs`
   * `Router.gs`
3. Click on the gear icon (**Project Settings**) and check **"Show 'appsscript.json' manifest file in editor"**.
4. Open the `appsscript.json` file and verify its contents match the baseline.

### Step 3: Deploy as Web App
1. Click **Deploy** -> **New deployment** at the top right of the editor.
2. Click the gear icon next to "Select type" and select **Web app**.
3. Configure the deployment settings:
   * **Description**: `WorkforceOS V-2 Foundation API Gateway`
   * **Execute as**: `Me (your-email@domain.com)`
   * **Who has access**: `Anyone`
4. Click **Deploy**.
5. Copy the generated **Web app URL** (this will be used as your API gateway URL).

---

## Frontend Integration Setup

### Step 1: Configure Client API Gateway URL
1. Open `src/frontend/config/config.js` in your editor.
2. Replace `"https://script.google.com/macros/s/EXECUTION_API_ID_HERE/exec"` with the **Web app URL** copied in the previous step.

### Step 2: Deploy Frontend on GitHub Pages
1. Push the contents of the `src/frontend` folder to your GitHub repository.
2. Open your repository on GitHub, go to **Settings** -> **Pages**.
3. Under "Build and deployment", configure the source:
   * **Branch**: `main`
   * **Folder**: `/src/frontend` (or root depending on your repository structure)
4. Save the configuration. GitHub will deploy your static frontend application to the generated URL.
