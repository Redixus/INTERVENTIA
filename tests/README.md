# Interventia E2E Automated Tester

Production-grade end-to-end verification for the entire Interventia Supabase pipeline.

## What It Tests

| Test | Description | Endpoint |
|------|-------------|----------|
| 1. Intake Function | Public lead submission | `/functions/v1/intake` |
| 2. Leads Table | Database verification | `public.leads` |
| 3. Upload Function | File upload via Edge Function | `/functions/v1/upload` |
| 4. Storage Bucket | File exists in Storage | `interventia-intake` |
| 5. Lead Files Table | Database file record | `public.lead_files` |

## Prerequisites

1. **Supabase project configured**
2. **Edge Functions deployed** (`intake` and `upload`)
3. **Database migration applied**
4. **Service role key** (never commit this!)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_ANON_KEY` | **YES** | Anon/public key from Supabase Dashboard |
| `SERVICE_ROLE_KEY` | **YES** | Service role key for database verification |
| `SUPABASE_URL` | NO | Defaults to production URL |

### Getting Your Service Role Key

1. Go to Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (NOT the anon key)
4. **Never commit this key to git**

## How to Run

### Option 1: PowerShell (Windows)

```powershell
$env:SUPABASE_ANON_KEY="your_anon_key_here"
$env:SERVICE_ROLE_KEY="your_service_key_here"
npm run test:e2e
```

Or in one line:
```powershell
$env:SUPABASE_ANON_KEY="your_anon_key"; $env:SERVICE_ROLE_KEY="your_service_key"; npm run test:e2e
```

### Option 2: Bash/Linux/macOS

```bash
SUPABASE_ANON_KEY=your_anon_key SERVICE_ROLE_KEY=your_service_key npm run test:e2e
```

Or set separately:
```bash
export SUPABASE_ANON_KEY=your_anon_key
export SERVICE_ROLE_KEY=your_service_key
npm run test:e2e
```

### Option 3: Using .env.local (gitignored)

Create `tests/.env.local`:
```
SUPABASE_ANON_KEY=your_anon_key_here
SERVICE_ROLE_KEY=your_service_key_here
```

Then run:
```bash
# Bash/Linux/macOS
source tests/.env.local && npm run test:e2e

# PowerShell
Get-Content tests/.env.local | ForEach-Object { if ($_ -match '^([^=]+)=(.*)$') { [Environment]::SetEnvironmentVariable($matches[1], $matches[2]) } }; npm run test:e2e
```

## Expected Output (Success)

```
╔══════════════════════════════════════════════════════════════╗
║       INTERVENTIA E2E AUTOMATED TESTER                       ║
║       Production Pipeline Verification                       ║
╚══════════════════════════════════════════════════════════════╝

ℹ️  Supabase URL: https://onhshajjoupjogzyfvkg.supabase.co
ℹ️  Timestamp: 2024-02-03T02:30:00.000Z

═══ TEST 1: INTAKE FUNCTION ═══

ℹ️  POST https://onhshajjoupjogzyfvkg.supabase.co/functions/v1/intake
ℹ️  HTTP Status: 200
ℹ️  Response: {"ok":true,"lead_id":"abc123...","priority_score":110}
✅ INTAKE FUNCTION: OK
✅ Lead ID: abc123-...
✅ Priority Score: 110

═══ TEST 2: DATABASE VERIFICATION - LEADS TABLE ═══

ℹ️  GET /rest/v1/leads?id=eq.abc123...
ℹ️  HTTP Status: 200
✅ LEADS TABLE: OK
✅ Status: NEW
✅ Priority Score: 110
✅ SLA Due: 2024-02-03T04:30:00.000Z

═══ TEST 3: FILE UPLOAD FUNCTION ═══

ℹ️  POST /functions/v1/upload
ℹ️  HTTP Status: 200
✅ UPLOAD FUNCTION: OK
✅ Storage Path: leads/abc123.../1706924400000_e2e-test.jpg

═══ TEST 4: STORAGE BUCKET VERIFICATION ═══

ℹ️  POST /storage/v1/object/list/interventia-intake
ℹ️  HTTP Status: 200
✅ STORAGE BUCKET: OK
✅ Files found: 1
✅   - 1706924400000_e2e-test.jpg

═══ TEST 5: DATABASE VERIFICATION - LEAD_FILES TABLE ═══

ℹ️  GET /rest/v1/lead_files?lead_id=eq.abc123...
ℹ️  HTTP Status: 200
✅ LEAD_FILES TABLE: OK
✅ Files recorded: 1
✅ Storage path: leads/abc123.../1706924400000_e2e-test.jpg

═══ CLEANUP ═══

✅ Test lead marked as SPAM

═══ FINAL REPORT ═══

✅ INTAKE: PASS
✅ LEADSTABLE: PASS
✅ UPLOADFUNCTION: PASS
✅ STORAGEBUCKET: PASS
✅ LEADFILESTABLE: PASS

🎉 SYSTEM IS PRODUCTION-READY
All 5 tests passed. The pipeline is fully operational.
```

## Expected Output (Failure)

```
═══ FINAL REPORT ═══

✅ INTAKE: PASS
✅ LEADSTABLE: PASS
❌ UPLOADFUNCTION: FAIL
   Expected HTTP 200, got 500. Response: {"error":"Internal error"}
⏸️ STORAGEBUCKET: PENDING
⏸️ LEADFILESTABLE: PENDING

💥 SYSTEM HAS FAILURES
Fix the failing tests before deploying to production.
```

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | All tests passed |
| `1` | One or more tests failed |

## Troubleshooting

### Error: "Missing SUPABASE_ANON_KEY" or "Missing SERVICE_ROLE_KEY"

You forgot to set environment variables. Get both keys from Supabase Dashboard → Settings → API.

**PowerShell:**
```powershell
$env:SUPABASE_ANON_KEY="sb_publishable_..."
$env:SERVICE_ROLE_KEY="sb_secret_..."
npm run test:e2e
```

**Bash:**
```bash
SUPABASE_ANON_KEY=sb_publishable_... SERVICE_ROLE_KEY=sb_secret_... npm run test:e2e
```

### Error: "Unregistered API key" or "Invalid Compact JWS"

Your keys are outdated or incorrect. Get **current** keys from Supabase Dashboard → Settings → API:
- Copy **anon/public** key → set as `SUPABASE_ANON_KEY`
- Copy **service_role** key → set as `SERVICE_ROLE_KEY`

If you rotated keys, the old hardcoded values won't work.

### Error: Intake returns 401/403

Edge Function auth is misconfigured. Check:
1. Function is deployed
2. Headers include both `apikey` and `Authorization`

### Error: Leads table returns empty

1. RLS policies may be blocking
2. Service role key may be wrong
3. Migration may not have run

### Error: Upload returns 404 "Lead not found"

The intake test likely failed. Check intake results first.

### Error: Storage returns empty

1. Upload function may have failed
2. Storage bucket may not exist
3. Check Supabase Storage dashboard

## Security Notes

- ⚠️ **NEVER commit the service role key**
- ⚠️ **NEVER log the service role key**
- ⚠️ **NEVER use the service role key in frontend code**
- ✅ Test data is automatically marked as SPAM for easy cleanup

## Test Assets

The test uses a minimal embedded JPEG image. Optionally, you can add a real test image:

```
tests/
├── e2e.test.js
├── README.md
└── assets/
    └── test.jpg  (optional, any JPEG image)
```

## Integration with CI/CD

Example GitHub Actions workflow:

```yaml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Run E2E Tests
        env:
          SERVICE_ROLE_KEY: ${{ secrets.SERVICE_ROLE_KEY }}
        run: node tests/e2e.test.cjs
```

## Contact

For issues with this tester, check:
1. Supabase Dashboard → Edge Functions → Logs
2. Supabase Dashboard → Database → SQL Editor
3. This README for troubleshooting steps
