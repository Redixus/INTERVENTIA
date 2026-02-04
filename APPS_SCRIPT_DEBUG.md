# Apps Script Debugging Guide - Interventia

## ✅ FRONTEND FIXED (CORS WORKAROUND)

The frontend now:
- ✅ Sends `Content-Type: text/plain;charset=UTF-8` (avoids CORS preflight)
- ✅ Uses `JSON.stringify(payload)`
- ✅ Targets `/exec` endpoint
- ✅ **NO `mode: 'no-cors'`** (can read response)
- ✅ Logs full request/response for debugging

**Why text/plain?** Google Apps Script doesn't support OPTIONS requests (CORS preflight). Using `application/json` triggers OPTIONS, which returns 405. Using `text/plain` bypasses preflight and allows POST to succeed.

## 🔍 APPS SCRIPT DEBUGGING CHECKLIST

### 1️⃣ VERIFY DEPLOYMENT

**Check your deployment settings:**

1. Open your Apps Script project
2. Click **Deploy** → **Manage deployments**
3. Verify the active deployment:
   - ✅ **Execute as:** Me (your account)
   - ✅ **Who has access:** Anyone
   - ✅ **Version:** Latest (not HEAD)

**If you edited code after deploying:**
- Click **Deploy** → **New deployment**
- Select **Web app**
- Click **Deploy**
- **Copy the NEW `/exec` URL** and update `.env`

### 2️⃣ VERIFY SCRIPT PROPERTIES (CRITICAL)

**Required Script Property:**

1. In Apps Script, click **Project Settings** (⚙️)
2. Scroll to **Script Properties**
3. Verify this property exists:

```
Key: INTERVENTIA_SS_ID
Value: [Your Spreadsheet ID from URL]
```

**To get Spreadsheet ID:**
- Open your "Interventia – Ops" spreadsheet
- Copy the ID from URL: `https://docs.google.com/spreadsheets/d/[THIS_IS_THE_ID]/edit`

**If missing, add it:**
- Click **Add script property**
- Key: `INTERVENTIA_SS_ID`
- Value: Paste your spreadsheet ID
- Click **Save**

### 3️⃣ TEST DRIVE ACCESS

**Run this test function in Apps Script:**

```javascript
function testDriveAccess() {
  const PARENT_FOLDER_ID = "YOUR_FOLDER_ID_HERE"; // Replace with your folder ID
  
  try {
    const folder = DriveApp.getFolderById(PARENT_FOLDER_ID);
    Logger.log("✅ Folder found: " + folder.getName());
    
    // Test creating a subfolder
    const testFolder = folder.createFolder("TEST_" + new Date().getTime());
    Logger.log("✅ Test folder created: " + testFolder.getUrl());
    
    // Clean up
    testFolder.setTrashed(true);
    Logger.log("✅ Test folder deleted");
    
    return "SUCCESS";
  } catch (e) {
    Logger.log("❌ Error: " + e.message);
    return "FAILED: " + e.message;
  }
}
```

**Run it:**
1. Select `testDriveAccess` from dropdown
2. Click **Run**
3. If prompted, click **Review permissions** → **Allow**
4. Check **Execution log** for results

### 4️⃣ HARDENED doPost FUNCTION

**Replace your `doPost` with this defensive version:**

```javascript
function doPost(e) {
  // CRITICAL: Log everything for debugging
  Logger.log("=== doPost CALLED ===");
  Logger.log("Request method: " + e.parameter);
  
  try {
    // Parse incoming JSON
    Logger.log("Raw postData: " + e.postData.contents);
    const payload = JSON.parse(e.postData.contents);
    Logger.log("Parsed payload: " + JSON.stringify(payload));
    
    // Get Script Property
    const ssId = PropertiesService.getScriptProperties().getProperty('INTERVENTIA_SS_ID');
    Logger.log("Spreadsheet ID: " + ssId);
    
    if (!ssId) {
      throw new Error("INTERVENTIA_SS_ID not configured in Script Properties");
    }
    
    // Open spreadsheet
    const ss = SpreadsheetApp.openById(ssId);
    const sheet = ss.getSheetByName('LEADS');
    Logger.log("Sheet found: " + sheet.getName());
    
    // Generate lead ID
    const leadId = "LEAD-" + new Date().getTime();
    Logger.log("Generated lead ID: " + leadId);
    
    // Create Drive folder
    const PARENT_FOLDER_ID = "YOUR_PARENT_FOLDER_ID"; // REPLACE THIS
    const parentFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);
    const leadFolder = parentFolder.createFolder(leadId);
    Logger.log("Folder created: " + leadFolder.getUrl());
    
    // Calculate priority score
    const priorityScore = calculatePriority(payload.urgency, payload.pest_category);
    Logger.log("Priority score: " + priorityScore);
    
    // Prepare row data
    const timestamp = new Date().toISOString();
    const rowData = [
      timestamp,              // A: submitted_at
      leadId,                 // B: lead_id
      payload.lang,           // C: language
      payload.source,         // D: source
      payload.utm_source,     // E: utm_source
      payload.utm_campaign,   // F: utm_campaign
      payload.pest_category,  // G: pest_category
      payload.pest_detail,    // H: pest_detail
      payload.urgency,        // I: urgency
      payload.postal_code,    // J: postal_code
      payload.city,           // K: city
      payload.description,    // L: description
      payload.contact_method, // M: contact_method
      payload.phone,          // N: phone
      leadFolder.getUrl(),    // O: folder_url
      priorityScore,          // P: priority_score
      "NEW"                   // Q: status
    ];
    
    Logger.log("Row data prepared: " + JSON.stringify(rowData));
    
    // Append row to sheet
    sheet.appendRow(rowData);
    Logger.log("✅ Row appended to sheet");
    
    // Return success response
    const response = {
      ok: true,
      lead_id: leadId,
      folder_url: leadFolder.getUrl(),
      priority_score: priorityScore,
      file_urls: []
    };
    
    Logger.log("Response: " + JSON.stringify(response));
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log("❌ ERROR: " + error.message);
    Logger.log("Stack trace: " + error.stack);
    
    const errorResponse = {
      ok: false,
      error: error.message
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function calculatePriority(urgency, pestCategory) {
  let score = 0;
  
  // Urgency scoring
  if (urgency === "IMMEDIATE") score += 50;
  else if (urgency === "48H") score += 30;
  else score += 10;
  
  // Pest category scoring
  const highPriority = ["wasps", "hornets", "rats", "bedbugs"];
  if (highPriority.includes(pestCategory)) score += 30;
  else score += 10;
  
  return score;
}
```

**IMPORTANT: Replace `YOUR_PARENT_FOLDER_ID` with your actual Drive folder ID**

To get folder ID:
1. Open the parent folder in Drive
2. Copy ID from URL: `https://drive.google.com/drive/folders/[THIS_IS_THE_ID]`

### 5️⃣ DEPLOY NEW VERSION

After updating the code:

1. Click **Deploy** → **Manage deployments**
2. Click ✏️ (Edit) on your active deployment
3. Change **Version** to **New version**
4. Add description: "Added defensive logging"
5. Click **Deploy**
6. **Copy the `/exec` URL** (it should be the same)

### 6️⃣ CHECK EXECUTION LOGS

After submitting from the frontend:

1. In Apps Script, click **Executions** (⏱️ icon)
2. Find the most recent execution
3. Click on it to see logs
4. Look for:
   - ✅ "doPost CALLED"
   - ✅ "Parsed payload"
   - ✅ "Sheet found"
   - ✅ "Folder created"
   - ✅ "Row appended"
   - ❌ Any error messages

### 7️⃣ COMMON ISSUES & FIXES

| Issue | Cause | Fix |
|-------|-------|-----|
| "INTERVENTIA_SS_ID not configured" | Script Property missing | Add it in Project Settings |
| "Cannot find folder" | Wrong folder ID | Verify folder ID in Drive URL |
| "Permission denied" | Not authorized | Run test function and authorize |
| "Cannot find sheet LEADS" | Sheet name mismatch | Rename sheet or update code |
| "JSON parse error" | Invalid payload | Check frontend logs for payload |

### 8️⃣ VERIFICATION CHECKLIST

After deploying, verify:

- [ ] Script Property `INTERVENTIA_SS_ID` exists
- [ ] Parent folder ID is correct in code
- [ ] Sheet named "LEADS" exists in spreadsheet
- [ ] Deployment is set to "Execute as: Me"
- [ ] Deployment is set to "Who has access: Anyone"
- [ ] Latest version is deployed (not HEAD)
- [ ] Test function runs without errors
- [ ] Execution logs show all steps completing

### 9️⃣ TEST END-TO-END

1. Open frontend: `http://localhost:5173/#onboarding`
2. Open browser console (F12)
3. Complete onboarding flow
4. Submit form
5. Check console for:
   - ✅ "🌐 Sending POST request"
   - ✅ "✅ Fetch response status: 200"
   - ✅ "📦 Parsed response: {ok: true, lead_id: ...}"
6. Check Google Sheets for new row
7. Check Drive for new folder

### 🆘 IF STILL NOT WORKING

**Provide these details:**

1. **Frontend console logs** (all 🚀 🌐 ✅ messages)
2. **Apps Script execution log** (from Executions tab)
3. **Response status code** (from console)
4. **Raw response text** (from console)
5. **Screenshot of Script Properties**
6. **Screenshot of Deployment settings**

This will pinpoint the exact failure point.
