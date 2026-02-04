# Interventia - Production Deployment Checklist

## 🚀 Pre-Deployment Verification

### 1. Environment Variables ✅
- [x] `.env` updated with production Supabase URL
- [x] `.env` updated with production anon key
- [ ] Verify keys match Supabase Dashboard → Settings → API

### 2. Supabase Backend ✅
- [x] Database migration applied (`supabase db push`)
- [x] Edge Functions deployed (`intake` and `upload`)
- [x] Service role key set as secret
- [x] Storage bucket `interventia-intake` exists (private)
- [x] RLS policies active

### 3. Frontend Build Test
```bash
npm run build
```
Expected: No errors, `dist/` folder created

### 4. E2E Tests Passing
```powershell
$env:SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
$env:SERVICE_ROLE_KEY="sb_secret_..."
npm run test:e2e
```
Expected: All 5 tests pass

---

## 📦 Vercel Deployment

### Step 1: Install Vercel CLI (if needed)
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy to Production
```bash
vercel --prod
```

### Step 4: Set Environment Variables in Vercel

Go to Vercel Dashboard → Project → Settings → Environment Variables

Add:
```
VITE_SUPABASE_URL=https://onhshajjoupjogzyfvkg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uaHNoYWpqb3Vwam9nenl2dmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzNDY3NTcsImV4cCI6MjA1MzkyMjc1N30.tMiHJGUWEsYYFNQQMXLNMPLdHIJMR2Cz8jCjEcRPAFE
```

### Step 5: Redeploy After Setting Env Vars
```bash
vercel --prod
```

---

## ✅ Post-Deployment Verification

### 1. Test Public Onboarding Flow

Visit: `https://your-app.vercel.app/onboarding`

**Test steps:**
1. Select pest category
2. Select urgency (IMMEDIATE)
3. Enter postal code + city
4. Add description
5. Upload 1 photo
6. Select WhatsApp contact method
7. Enter phone + name
8. Accept consent
9. Click "Aanvraag verzenden"

**Expected:**
- ✅ Form submits successfully
- ✅ Redirects to WhatsApp with pre-filled message
- ✅ Message includes lead ID, pest detail, location, urgency

### 2. Verify Database Entry

Supabase Dashboard → Table Editor → `leads`
- [ ] New row exists with status `NEW`
- [ ] Priority score calculated
- [ ] SLA due date set

### 3. Verify Photo Upload

Supabase Dashboard → Storage → `interventia-intake`
- [ ] Folder `leads/[lead_id]/` exists
- [ ] Photo file uploaded

Supabase Dashboard → Table Editor → `lead_files`
- [ ] Row exists with correct `storage_path`

### 4. Test Ops Dashboard

Visit: `https://your-app.vercel.app/login`

**Test steps:**
1. Login with operator credentials
2. Navigate to `/ops/queue`
3. Verify new lead appears
4. Click on lead → opens detail page
5. Click "Assign to me"
6. Click "Open WhatsApp" → opens WhatsApp with pre-filled message
7. Update status → `CONTACTED`
8. Add operator note

**Expected:**
- ✅ Queue shows leads sorted by priority
- ✅ Red badge on overdue leads
- ✅ WhatsApp button works
- ✅ Status updates save
- ✅ Notes save

---

## 🔒 Security Final Check

- [ ] Service role key NOT exposed in frontend code
- [ ] Service role key NOT in git history
- [ ] RLS policies prevent unauthorized access
- [ ] Storage bucket is private
- [ ] Only Edge Functions use service role key

---

## 📱 WhatsApp Integration

### Verify WhatsApp Number
- [ ] Number `+32466274251` is correct
- [ ] Number is WhatsApp Business account
- [ ] Test redirect on mobile device
- [ ] Message opens WhatsApp app correctly

### Operator Training
- [ ] Operators have access to `/ops` dashboard
- [ ] Operators bookmarked `OPERATOR_WHATSAPP_SCRIPTS.md`
- [ ] Operators understand status workflow
- [ ] Operators know SLA targets

---

## 🎯 Go-Live Checklist

- [ ] Frontend deployed to Vercel
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Environment variables set in Vercel
- [ ] E2E tests passing on production
- [ ] Test submission completed successfully
- [ ] WhatsApp redirect working
- [ ] Ops dashboard accessible
- [ ] Operators trained
- [ ] Monitoring setup (optional)

---

## 🚨 Rollback Plan

If critical issues occur:

1. **Revert deployment:**
   ```bash
   vercel rollback
   ```

2. **Check Edge Function logs:**
   ```bash
   supabase functions logs intake --project-ref onhshajjoupjogzyfvkg
   supabase functions logs upload --project-ref onhshajjoupjogzyfvkg
   ```

3. **Check database:**
   - Supabase Dashboard → Database → Logs
   - Look for errors in recent queries

4. **Disable public access temporarily:**
   - Remove onboarding route from public site
   - Show maintenance message

---

## 📊 Success Metrics (First Week)

Track:
- Total leads submitted
- Conversion rate (submitted → WhatsApp opened)
- Average response time (submission → first contact)
- Status distribution (NEW/CONTACTED/SCHEDULED/DONE)
- SLA compliance (% within target)

---

## 🎉 You're Live!

Once all checks pass:
1. Share onboarding URL with customers
2. Monitor `/ops` queue regularly
3. Respond to WhatsApp messages within SLA
4. Update lead statuses after each interaction
5. Review metrics weekly

**The system is production-ready. No more building. Just operate.**
