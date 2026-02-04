# Interventia - Supabase Deployment Guide

## 🎯 Overview

Production-grade intake + dispatch system using:
- **Frontend**: Vite + React (deployed on Vercel)
- **Backend**: Supabase (Postgres + Auth + Storage + Edge Functions)
- **No Google Apps Script** - reliable, scalable, maintainable

---

## 📋 Prerequisites

1. **Supabase Project**: `https://onhshajjoupjogzyfvkg.supabase.co`
2. **Supabase CLI** installed: `npm install -g supabase`
3. **Node.js** 18+ and npm
4. **Vercel CLI** (optional): `npm install -g vercel`

---

## 🗄️ Step 1: Database Setup

### 1.1 Run Migration

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref onhshajjoupjogzyfvkg

# Run the migration
supabase db push
```

Or manually in Supabase Dashboard:
1. Go to **SQL Editor**
2. Copy contents of `supabase/migrations/20240203_interventia_schema.sql`
3. Click **Run**

### 1.2 Verify Tables Created

Check in Supabase Dashboard → **Table Editor**:
- ✅ `leads`
- ✅ `lead_files`
- ✅ `lead_events`

### 1.3 Verify Storage Bucket

Check in Supabase Dashboard → **Storage**:
- ✅ Bucket `interventia-intake` exists
- ✅ Bucket is **private** (not public)

---

## 🔐 Step 2: Authentication Setup

### 2.1 Enable Email Auth

Supabase Dashboard → **Authentication** → **Providers**:
1. Enable **Email** provider
2. Disable email confirmation (or configure SMTP)
3. Save

### 2.2 Create Operator Account

```bash
# In Supabase Dashboard → Authentication → Users
# Click "Add user" → "Create new user"
# Email: ops@interventia.be
# Password: [secure password]
# Auto Confirm User: YES
```

Or via SQL:
```sql
-- Create operator user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'ops@interventia.be',
  crypt('YOUR_SECURE_PASSWORD', gen_salt('bf')),
  now(),
  now(),
  now()
);
```

---

## ⚡ Step 3: Deploy Edge Function

### 3.1 Deploy Intake Function

```bash
# From project root
cd supabase/functions

# Deploy the intake function
supabase functions deploy intake --project-ref onhshajjoupjogzyfvkg
```

### 3.2 Set Function Secrets

**CRITICAL**: Never expose service role key in frontend code.

```bash
# Set the service role key as a secret
supabase secrets set SERVICE_ROLE_KEY=your_service_role_key_here --project-ref onhshajjoupjogzyfvkg
```

To get your service role key:
1. Supabase Dashboard → **Settings** → **API**
2. Copy **service_role** key (NOT the anon key)
3. Run the command above

### 3.3 Verify Function Deployed

```bash
# List functions
supabase functions list --project-ref onhshajjoupjogzyfvkg

# Test function
curl -X POST \
  https://onhshajjoupjogzyfvkg.supabase.co/functions/v1/intake \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{
    "lang": "FR",
    "pest_category": "test",
    "pest_detail": "rats",
    "urgency": "IMMEDIATE",
    "postal_code": "1000",
    "city": "Bruxelles",
    "description": "Test submission",
    "contact_method": "WHATSAPP",
    "phone": "+32470123456"
  }'
```

Expected response:
```json
{
  "ok": true,
  "lead_id": "uuid-here",
  "priority_score": 104
}
```

---

## 🎨 Step 4: Frontend Configuration

### 4.1 Install Dependencies

```bash
# Install Supabase client
npm install @supabase/supabase-js

# Install React Router (for ops dashboard)
npm install react-router-dom
```

### 4.2 Environment Variables

Create/update `.env`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://onhshajjoupjogzyfvkg.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_0qJDrDstB3ZW5WLKXsnQRQ_DfXLfMFr

# Business Configuration
VITE_BUSINESS_WHATSAPP=+32466274251
```

### 4.3 Update App.tsx for Routing

Add routes for ops dashboard:

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Onboarding } from './components/Onboarding'
import { OpsQueue } from './pages/OpsQueue'
import { LeadDetail } from './pages/LeadDetail'
import { supabase } from './lib/supabaseClient'
import { useEffect, useState } from 'react'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public onboarding */}
        <Route path="/" element={<Navigate to="/onboarding" />} />
        <Route path="/onboarding" element={<Onboarding />} />
        
        {/* Protected ops routes */}
        <Route
          path="/ops/queue"
          element={session ? <OpsQueue /> : <Navigate to="/login" />}
        />
        <Route
          path="/ops/leads/:id"
          element={session ? <LeadDetail /> : <Navigate to="/login" />}
        />
        
        {/* Login page - create this */}
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

### 4.4 Create Login Page

Create `src/pages/Login.tsx`:

```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Shield } from 'lucide-react'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      navigate('/ops/queue')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Interventia Ops</h1>
          <p className="text-slate-600 mt-2">Operator Login</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-xl border border-slate-200 p-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-slate-700 focus:ring-4 focus:ring-slate-700/10 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-slate-700 focus:ring-4 focus:ring-slate-700/10 outline-none"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

---

## 🚀 Step 5: Deploy to Vercel

### 5.1 Vercel Environment Variables

In Vercel Dashboard → **Settings** → **Environment Variables**, add:

```
VITE_SUPABASE_URL=https://onhshajjoupjogzyfvkg.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_0qJDrDstB3ZW5WLKXsnQRQ_DfXLfMFr
VITE_BUSINESS_WHATSAPP=+32466274251
```

### 5.2 Deploy

```bash
# Using Vercel CLI
vercel --prod

# Or push to GitHub and connect Vercel to auto-deploy
```

### 5.3 Configure Vercel Rewrites

Create/update `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures React Router works correctly.

---

## ✅ Step 6: End-to-End Testing

### 6.1 Test Public Intake Flow

1. Go to `https://your-vercel-url.vercel.app/onboarding`
2. Complete all steps
3. Upload 1-2 photos
4. Submit

**Expected:**
- ✅ Success screen appears
- ✅ Lead ID displayed
- ✅ WhatsApp button works

### 6.2 Verify in Supabase

**Check Database:**
1. Supabase Dashboard → **Table Editor** → `leads`
2. New row should appear with:
   - Correct data
   - Status: `NEW`
   - Priority score calculated
   - SLA due date set

**Check Storage:**
1. Supabase Dashboard → **Storage** → `interventia-intake`
2. Folder `leads/[lead-id]/` should contain uploaded photos

**Check Events:**
1. Table Editor → `lead_events`
2. Event `lead_created` should exist for the lead

### 6.3 Test Ops Dashboard

1. Go to `https://your-vercel-url.vercel.app/login`
2. Login with operator credentials
3. Should redirect to `/ops/queue`

**Queue Page:**
- ✅ New lead appears in queue
- ✅ Sorted by priority score (highest first)
- ✅ Shows urgency, location, phone
- ✅ Shows SLA countdown

**Lead Detail:**
1. Click on a lead
2. Should show `/ops/leads/[id]`

**Verify:**
- ✅ All lead data displayed
- ✅ Photos visible (signed URLs)
- ✅ Can change status
- ✅ Can assign to self
- ✅ WhatsApp button opens with pre-filled message
- ✅ Can add/save operator notes
- ✅ Activity log shows events

---

## 🔒 Security Checklist

- [ ] Service role key is ONLY in Edge Function secrets (never in frontend)
- [ ] RLS policies enabled on all tables
- [ ] Storage bucket is private (not public)
- [ ] Anon key is safe to expose (read-only, RLS enforced)
- [ ] Operators must authenticate to access `/ops/*` routes
- [ ] Edge Function validates all input
- [ ] Rate limiting enabled in Edge Function
- [ ] Honeypot field (`hp`) implemented for spam detection

---

## 📊 Monitoring & Maintenance

### Check Edge Function Logs

```bash
supabase functions logs intake --project-ref onhshajjoupjogzyfvkg
```

Or in Supabase Dashboard → **Edge Functions** → `intake` → **Logs**

### Database Queries

**Count new leads:**
```sql
SELECT COUNT(*) FROM leads WHERE status = 'NEW';
```

**Average priority score:**
```sql
SELECT AVG(priority_score) FROM leads WHERE status = 'NEW';
```

**Overdue SLAs:**
```sql
SELECT * FROM leads 
WHERE status IN ('NEW', 'CONTACTED') 
AND sla_due_at < now()
ORDER BY sla_due_at ASC;
```

---

## 🐛 Troubleshooting

### Issue: "Failed to submit intake"

**Check:**
1. Edge Function deployed: `supabase functions list`
2. Service role key set: `supabase secrets list`
3. Function logs for errors: `supabase functions logs intake`

### Issue: "Cannot read leads in ops dashboard"

**Check:**
1. User is authenticated: Check browser console for session
2. RLS policies exist: Verify in Supabase Dashboard → **Authentication** → **Policies**
3. User has `authenticated` role

### Issue: "Photos not uploading"

**Check:**
1. Storage bucket exists and is private
2. Storage policies allow authenticated users to insert
3. File size under limit (default 50MB)
4. Browser console for upload errors

### Issue: "CORS error on intake submission"

**Check:**
1. Edge Function has CORS headers (already in code)
2. Using correct endpoint URL
3. `apikey` header included in request

---

## 📝 Data Schema Reference

### Leads Table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| created_at | timestamptz | Submission timestamp |
| lang | lead_lang | FR or NL |
| source | text | Always "website" |
| utm_source | text | UTM tracking |
| utm_campaign | text | UTM tracking |
| pest_category | text | Pest type |
| pest_detail | text | Housing type |
| urgency | lead_urgency | IMMEDIATE, H48, INSPECTION |
| postal_code | text | Belgian postal code |
| city | text | City name |
| description | text | User description + name |
| contact_method | contact_method | WHATSAPP, CALL, ONLINE |
| phone | text | Phone number |
| status | lead_status | NEW, CONTACTED, SCHEDULED, DONE, LOST, SPAM |
| priority_score | integer | Calculated score (0-130) |
| sla_due_at | timestamptz | Deadline based on urgency |
| operator_notes | text | Internal notes |
| assigned_to | uuid | Operator user ID |

### Priority Scoring

**Base scores:**
- Punaises: 90
- Cafards: 85
- Rats: 80
- Guêpes: 70
- Souris: 60
- Fourmis: 45
- Pigeons: 40
- Default: 30

**Multipliers:**
- IMMEDIATE: ×1.3
- H48: ×1.0
- INSPECTION: ×0.7

**Example:** Rats + IMMEDIATE = 80 × 1.3 = **104**

### SLA Rules

- IMMEDIATE: +2 hours
- H48: +12 hours
- INSPECTION: +48 hours

---

## 🎉 Success Criteria

Your system is fully operational when:

1. ✅ Public can submit leads via `/onboarding`
2. ✅ Photos upload to Supabase Storage
3. ✅ Leads appear in database with correct priority
4. ✅ Operators can login to `/ops/queue`
5. ✅ Queue shows leads sorted by priority
6. ✅ Lead detail page shows all data + photos
7. ✅ WhatsApp integration works
8. ✅ Status updates trigger events
9. ✅ No Google Apps Script dependencies
10. ✅ All data persists in Supabase

**Build once, then basta.** 🚀
