/**
 * Interventia E2E Automated Tester
 * 
 * Production-grade end-to-end verification for:
 * - Public Intake Edge Function
 * - Database (leads, lead_files tables)
 * - Storage bucket (interventia-intake)
 * - Upload Edge Function
 * 
 * Usage (PowerShell): $env:SUPABASE_ANON_KEY="..."; $env:SERVICE_ROLE_KEY="..."; npm run test:e2e
 * Usage (Bash): SUPABASE_ANON_KEY=... SERVICE_ROLE_KEY=... npm run test:e2e
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://onhshajjoupjogzyfvkg.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'interventia-intake';

// Validate required environment variables
if (!SUPABASE_ANON_KEY) {
  console.error('\x1b[31m❌ Missing SUPABASE_ANON_KEY environment variable\x1b[0m');
  console.error('Get it from: Supabase Dashboard → Settings → API → anon/public key');
  process.exit(1);
}

if (!SERVICE_ROLE_KEY) {
  console.error('\x1b[31m❌ Missing SERVICE_ROLE_KEY environment variable\x1b[0m');
  console.error('Get it from: Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

const CONFIG = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SERVICE_ROLE_KEY,
  BUCKET_NAME,
};

// Test data
const TEST_PAYLOAD = {
  lang: 'FR',
  source: 'e2e-test',
  pest_category: 'test-e2e',
  pest_detail: 'cafards',
  urgency: 'IMMEDIATE',
  postal_code: '1000',
  city: 'Bruxelles',
  description: `AUTOMATED E2E TEST - ${new Date().toISOString()}`,
  contact_method: 'WHATSAPP',
  phone: '+32466274251',
  hp: '', // honeypot empty = not spam
};

// ============================================================================
// UTILITIES
// ============================================================================

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

function success(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function fail(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function info(message) {
  console.log(`${colors.cyan}ℹ️  ${message}${colors.reset}`);
}

function header(message) {
  console.log(`\n${colors.bold}${colors.yellow}═══ ${message} ═══${colors.reset}\n`);
}

function isUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// TEST RESULTS TRACKER
// ============================================================================

const results = {
  intake: { status: 'pending', details: '' },
  leadsTable: { status: 'pending', details: '' },
  uploadFunction: { status: 'pending', details: '' },
  storageBucket: { status: 'pending', details: '' },
  leadFilesTable: { status: 'pending', details: '' },
};

let testLeadId = null;

// ============================================================================
// TEST 1: INTAKE FUNCTION
// ============================================================================

async function testIntakeFunction() {
  header('TEST 1: INTAKE FUNCTION');
  
  const endpoint = `${CONFIG.SUPABASE_URL}/functions/v1/intake`;
  info(`POST ${endpoint}`);
  info(`Payload: ${JSON.stringify(TEST_PAYLOAD, null, 2)}`);
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(TEST_PAYLOAD),
    });
    
    const status = response.status;
    const text = await response.text();
    
    info(`HTTP Status: ${status}`);
    info(`Response: ${text}`);
    
    // Assertion 1: HTTP 200
    if (status !== 200) {
      throw new Error(`Expected HTTP 200, got ${status}. Response: ${text}`);
    }
    
    // Assertion 2: Valid JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Response is not valid JSON: ${text}`);
    }
    
    // Assertion 3: ok === true
    if (data.ok !== true) {
      throw new Error(`Expected ok:true, got: ${JSON.stringify(data)}`);
    }
    
    // Assertion 4: lead_id is UUID
    if (!data.lead_id || !isUUID(data.lead_id)) {
      throw new Error(`Expected valid UUID lead_id, got: ${data.lead_id}`);
    }
    
    testLeadId = data.lead_id;
    
    success(`INTAKE FUNCTION: OK`);
    success(`Lead ID: ${testLeadId}`);
    success(`Priority Score: ${data.priority_score}`);
    
    results.intake = { status: 'pass', details: `lead_id=${testLeadId}` };
    return true;
    
  } catch (error) {
    fail(`INTAKE FUNCTION: FAILED`);
    fail(error.message);
    results.intake = { status: 'fail', details: error.message };
    return false;
  }
}

// ============================================================================
// TEST 2: DATABASE VERIFICATION - LEADS TABLE
// ============================================================================

async function testLeadsTable() {
  header('TEST 2: DATABASE VERIFICATION - LEADS TABLE');
  
  if (!testLeadId) {
    fail('Cannot test leads table - no lead_id from intake test');
    results.leadsTable = { status: 'fail', details: 'No lead_id available' };
    return false;
  }
  
  // Use service role key to bypass RLS for verification
  const endpoint = `${CONFIG.SUPABASE_URL}/rest/v1/leads?id=eq.${testLeadId}&select=*`;
  info(`GET ${endpoint}`);
  
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    const status = response.status;
    const text = await response.text();
    
    info(`HTTP Status: ${status}`);
    
    if (status !== 200) {
      throw new Error(`Expected HTTP 200, got ${status}. Response: ${text}`);
    }
    
    const data = JSON.parse(text);
    
    // Assertion 1: Exactly 1 row
    if (!Array.isArray(data) || data.length !== 1) {
      throw new Error(`Expected 1 row, got ${data.length}`);
    }
    
    const lead = data[0];
    info(`Lead data: ${JSON.stringify(lead, null, 2)}`);
    
    // Assertion 2: status === "NEW"
    if (lead.status !== 'NEW') {
      throw new Error(`Expected status="NEW", got "${lead.status}"`);
    }
    
    // Assertion 3: priority_score > 0
    if (typeof lead.priority_score !== 'number' || lead.priority_score <= 0) {
      throw new Error(`Expected priority_score > 0, got ${lead.priority_score}`);
    }
    
    // Assertion 4: sla_due_at is not null
    if (!lead.sla_due_at) {
      throw new Error(`Expected sla_due_at to be set, got null`);
    }
    
    success(`LEADS TABLE: OK`);
    success(`Status: ${lead.status}`);
    success(`Priority Score: ${lead.priority_score}`);
    success(`SLA Due: ${lead.sla_due_at}`);
    
    results.leadsTable = { status: 'pass', details: `priority=${lead.priority_score}` };
    return true;
    
  } catch (error) {
    fail(`LEADS TABLE: FAILED`);
    fail(error.message);
    results.leadsTable = { status: 'fail', details: error.message };
    return false;
  }
}

// ============================================================================
// TEST 3: FILE UPLOAD FUNCTION
// ============================================================================

async function testUploadFunction() {
  header('TEST 3: FILE UPLOAD FUNCTION');
  
  if (!testLeadId) {
    fail('Cannot test upload - no lead_id from intake test');
    results.uploadFunction = { status: 'fail', details: 'No lead_id available' };
    return false;
  }
  
  // Load test image or create a minimal one
  let base64Image;
  const testImagePath = path.join(__dirname, 'assets', 'test.jpg');
  
  if (fs.existsSync(testImagePath)) {
    info(`Loading test image from ${testImagePath}`);
    const imageBuffer = fs.readFileSync(testImagePath);
    base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
  } else {
    // Create minimal valid JPEG (1x1 red pixel)
    info('Using minimal test image (no test.jpg found)');
    // Minimal valid JPEG bytes
    const minimalJpeg = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
      0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00,
      0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
      0x09, 0x0A, 0x0B, 0xFF, 0xC4, 0x00, 0xB5, 0x10, 0x00, 0x02, 0x01, 0x03,
      0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7D,
      0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
      0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xA1, 0x08,
      0x23, 0x42, 0xB1, 0xC1, 0x15, 0x52, 0xD1, 0xF0, 0x24, 0x33, 0x62, 0x72,
      0x82, 0x09, 0x0A, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x25, 0x26, 0x27, 0x28,
      0x29, 0x2A, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x43, 0x44, 0x45,
      0x46, 0x47, 0x48, 0x49, 0x4A, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
      0x5A, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6A, 0x73, 0x74, 0x75,
      0x76, 0x77, 0x78, 0x79, 0x7A, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
      0x8A, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9A, 0xA2, 0xA3,
      0xA4, 0xA5, 0xA6, 0xA7, 0xA8, 0xA9, 0xAA, 0xB2, 0xB3, 0xB4, 0xB5, 0xB6,
      0xB7, 0xB8, 0xB9, 0xBA, 0xC2, 0xC3, 0xC4, 0xC5, 0xC6, 0xC7, 0xC8, 0xC9,
      0xCA, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0xDA, 0xE1, 0xE2,
      0xE3, 0xE4, 0xE5, 0xE6, 0xE7, 0xE8, 0xE9, 0xEA, 0xF1, 0xF2, 0xF3, 0xF4,
      0xF5, 0xF6, 0xF7, 0xF8, 0xF9, 0xFA, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01,
      0x00, 0x00, 0x3F, 0x00, 0xFB, 0xD5, 0xDB, 0x20, 0xA8, 0xA8, 0xA8, 0x02,
      0x8A, 0x28, 0x03, 0xFF, 0xD9
    ]);
    base64Image = `data:image/jpeg;base64,${minimalJpeg.toString('base64')}`;
  }
  
  const uploadPayload = {
    lead_id: testLeadId,
    file_name: 'e2e-test.jpg',
    file_data: base64Image,
    mime_type: 'image/jpeg',
  };
  
  const endpoint = `${CONFIG.SUPABASE_URL}/functions/v1/upload`;
  info(`POST ${endpoint}`);
  info(`Uploading file for lead: ${testLeadId}`);
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(uploadPayload),
    });
    
    const status = response.status;
    const text = await response.text();
    
    info(`HTTP Status: ${status}`);
    info(`Response: ${text}`);
    
    // Assertion 1: HTTP 200
    if (status !== 200) {
      throw new Error(`Expected HTTP 200, got ${status}. Response: ${text}`);
    }
    
    // Assertion 2: ok === true
    const data = JSON.parse(text);
    if (data.ok !== true) {
      throw new Error(`Expected ok:true, got: ${JSON.stringify(data)}`);
    }
    
    success(`UPLOAD FUNCTION: OK`);
    success(`Storage Path: ${data.storage_path}`);
    
    results.uploadFunction = { status: 'pass', details: data.storage_path };
    return true;
    
  } catch (error) {
    fail(`UPLOAD FUNCTION: FAILED`);
    fail(error.message);
    results.uploadFunction = { status: 'fail', details: error.message };
    return false;
  }
}

// ============================================================================
// TEST 4: STORAGE BUCKET VERIFICATION
// ============================================================================

async function testStorageBucket() {
  header('TEST 4: STORAGE BUCKET VERIFICATION');
  
  if (!testLeadId) {
    fail('Cannot test storage - no lead_id from intake test');
    results.storageBucket = { status: 'fail', details: 'No lead_id available' };
    return false;
  }
  
  // List objects in the bucket under leads/<lead_id>/
  const prefix = `leads/${testLeadId}`;
  const endpoint = `${CONFIG.SUPABASE_URL}/storage/v1/object/list/${CONFIG.BUCKET_NAME}`;
  
  info(`POST ${endpoint}`);
  info(`Listing objects with prefix: ${prefix}`);
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prefix: prefix,
        limit: 100,
        offset: 0,
      }),
    });
    
    const status = response.status;
    const text = await response.text();
    
    info(`HTTP Status: ${status}`);
    
    if (status !== 200) {
      throw new Error(`Expected HTTP 200, got ${status}. Response: ${text}`);
    }
    
    const data = JSON.parse(text);
    info(`Objects found: ${JSON.stringify(data, null, 2)}`);
    
    // Assertion: At least 1 object exists
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`Expected at least 1 file in storage under ${prefix}, got none`);
    }
    
    success(`STORAGE BUCKET: OK`);
    success(`Files found: ${data.length}`);
    data.forEach(obj => success(`  - ${obj.name}`));
    
    results.storageBucket = { status: 'pass', details: `${data.length} file(s)` };
    return true;
    
  } catch (error) {
    fail(`STORAGE BUCKET: FAILED`);
    fail(error.message);
    results.storageBucket = { status: 'fail', details: error.message };
    return false;
  }
}

// ============================================================================
// TEST 5: DATABASE VERIFICATION - LEAD_FILES TABLE
// ============================================================================

async function testLeadFilesTable() {
  header('TEST 5: DATABASE VERIFICATION - LEAD_FILES TABLE');
  
  if (!testLeadId) {
    fail('Cannot test lead_files - no lead_id from intake test');
    results.leadFilesTable = { status: 'fail', details: 'No lead_id available' };
    return false;
  }
  
  const endpoint = `${CONFIG.SUPABASE_URL}/rest/v1/lead_files?lead_id=eq.${testLeadId}&select=*`;
  info(`GET ${endpoint}`);
  
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    const status = response.status;
    const text = await response.text();
    
    info(`HTTP Status: ${status}`);
    
    if (status !== 200) {
      throw new Error(`Expected HTTP 200, got ${status}. Response: ${text}`);
    }
    
    const data = JSON.parse(text);
    info(`Rows found: ${JSON.stringify(data, null, 2)}`);
    
    // Assertion 1: At least 1 row
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`Expected at least 1 row in lead_files for lead ${testLeadId}`);
    }
    
    const file = data[0];
    
    // Assertion 2: storage_path contains leads/<lead_id>
    if (!file.storage_path || !file.storage_path.includes(`leads/${testLeadId}`)) {
      throw new Error(`Expected storage_path to contain leads/${testLeadId}, got: ${file.storage_path}`);
    }
    
    success(`LEAD_FILES TABLE: OK`);
    success(`Files recorded: ${data.length}`);
    success(`Storage path: ${file.storage_path}`);
    
    results.leadFilesTable = { status: 'pass', details: file.storage_path };
    return true;
    
  } catch (error) {
    fail(`LEAD_FILES TABLE: FAILED`);
    fail(error.message);
    results.leadFilesTable = { status: 'fail', details: error.message };
    return false;
  }
}

// ============================================================================
// CLEANUP (OPTIONAL - MARK TEST DATA AS SPAM)
// ============================================================================

async function cleanup() {
  header('CLEANUP');
  
  if (!testLeadId) {
    info('No lead to clean up');
    return;
  }
  
  info(`Marking test lead ${testLeadId} as SPAM for cleanup`);
  
  try {
    const endpoint = `${CONFIG.SUPABASE_URL}/rest/v1/leads?id=eq.${testLeadId}`;
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ status: 'SPAM' }),
    });
    
    if (response.ok) {
      success(`Test lead marked as SPAM`);
    } else {
      info(`Could not mark lead as SPAM: ${response.status}`);
    }
  } catch (error) {
    info(`Cleanup error (non-critical): ${error.message}`);
  }
}

// ============================================================================
// FINAL REPORT
// ============================================================================

function printFinalReport() {
  header('FINAL REPORT');
  
  const allPassed = Object.values(results).every(r => r.status === 'pass');
  
  Object.entries(results).forEach(([test, result]) => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏸️';
    const color = result.status === 'pass' ? colors.green : result.status === 'fail' ? colors.red : colors.yellow;
    console.log(`${color}${icon} ${test.toUpperCase()}: ${result.status.toUpperCase()}${colors.reset}`);
    if (result.details) {
      console.log(`   ${result.details}`);
    }
  });
  
  console.log('');
  
  if (allPassed) {
    console.log(`${colors.bold}${colors.green}🎉 SYSTEM IS PRODUCTION-READY${colors.reset}`);
    console.log(`${colors.green}All 5 tests passed. The pipeline is fully operational.${colors.reset}`);
  } else {
    console.log(`${colors.bold}${colors.red}💥 SYSTEM HAS FAILURES${colors.reset}`);
    console.log(`${colors.red}Fix the failing tests before deploying to production.${colors.reset}`);
  }
  
  return allPassed;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log(`${colors.bold}${colors.cyan}`);
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║       INTERVENTIA E2E AUTOMATED TESTER                       ║');
  console.log('║       Production Pipeline Verification                       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}`);
  
  // Environment variables are validated at the top of the file
  // This check is redundant but kept for clarity
  
  info(`Supabase URL: ${CONFIG.SUPABASE_URL}`);
  info(`Timestamp: ${new Date().toISOString()}`);
  
  // Run all tests in sequence
  await testIntakeFunction();
  
  // Small delay to ensure data is committed
  await sleep(500);
  
  await testLeadsTable();
  await testUploadFunction();
  
  // Small delay for storage to sync
  await sleep(1000);
  
  await testStorageBucket();
  await testLeadFilesTable();
  
  // Optional cleanup
  await cleanup();
  
  // Print final report
  const allPassed = printFinalReport();
  
  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

// Run
main().catch(error => {
  fail(`Unexpected error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
