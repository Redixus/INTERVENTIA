# Interventia - End-to-End Validation Test

## 🔐 Step 0: Security - Rotate Service Role Key

**CRITICAL**: Service role key was exposed in chat. Must rotate immediately.

1. Supabase Dashboard → **Settings** → **API**
2. Click **"Reset service_role secret"**
3. Copy NEW key (do NOT paste in chat)
4. Update Edge Function secret:

```bash
supabase secrets set SERVICE_ROLE_KEY=<NEW_KEY> --project-ref onhshajjoupjogzyfvkg
```

---

## ✅ Step 1: Verify Database Migration

**Check in Supabase Dashboard → Table Editor:**

- [ ] Table `leads` exists
- [ ] Table `lead_files` exists
- [ ] Table `lead_events` exists
- [ ] Storage bucket `interventia-intake` exists (private)

**If missing, run:**
```bash
supabase link --project-ref onhshajjoupjogzyfvkg
supabase db push
```

---

## ✅ Step 2: Deploy Edge Functions

### Deploy Intake Function

```bash
supabase functions deploy intake --project-ref onhshajjoupjogzyfvkg
```

### Deploy Upload Function (NEW - for secure photo uploads)

```bash
supabase functions deploy upload --project-ref onhshajjoupjogzyfvkg
```

### Set Secrets

```bash
# Set service role key (use NEW rotated key)
supabase secrets set SERVICE_ROLE_KEY=<YOUR_NEW_KEY> --project-ref onhshajjoupjogzyfvkg
```

---

## ✅ Step 3: Test Intake Function (Public Access)

### Test with curl

```bash
curl -i \
  -X POST "https://onhshajjoupjogzyfvkg.supabase.co/functions/v1/intake" \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_0qJDrDstB3ZW5WLKXsnQRQ_DfXLfMFr" \
  -H "Authorization: Bearer sb_publishable_0qJDrDstB3ZW5WLKXsnQRQ_DfXLfMFr" \
  --data '{
    "lang":"FR",
    "source":"website",
    "pest_category":"test",
    "pest_detail":"cafards",
    "urgency":"IMMEDIATE",
    "postal_code":"1000",
    "city":"Bruxelles",
    "description":"test submission",
    "contact_method":"WHATSAPP",
    "phone":"+32466274251"
  }'
```

### Expected Response

```
HTTP/2 200
content-type: application/json

{"ok":true,"lead_id":"uuid-here","priority_score":110}
```

### If you get 401/403

The function auth mode is wrong. Check function logs:
```bash
supabase functions logs intake --project-ref onhshajjoupjogzyfvkg
```

---

## ✅ Step 4: Verify Lead in Database

**Supabase Dashboard → Table Editor → `leads`**

- [ ] New row exists
- [ ] `status` = 'NEW'
- [ ] `priority_score` calculated correctly (cafards + IMMEDIATE = 85 × 1.3 = 110)
- [ ] `sla_due_at` set to ~2 hours from now
- [ ] All fields populated

**Check events:**
- [ ] Row in `lead_events` with `event_type` = 'lead_created'

---

## ✅ Step 5: Test Upload Function

### Create test image as base64

```bash
# Create a small test image (1x1 red pixel PNG)
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==" > test.b64
```

### Test upload

```bash
curl -i \
  -X POST "https://onhshajjoupjogzyfvkg.supabase.co/functions/v1/upload" \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_0qJDrDstB3ZW5WLKXsnQRQ_DfXLfMFr" \
  -H "Authorization: Bearer sb_publishable_0qJDrDstB3ZW5WLKXsnQRQ_DfXLfMFr" \
  --data '{
    "lead_id":"<LEAD_ID_FROM_STEP_3>",
    "file_name":"test.png",
    "file_data":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==",
    "mime_type":"image/png"
  }'
```

### Expected Response

```json
{
  "ok": true,
  "file_id": "uuid-here",
  "storage_path": "leads/<lead_id>/timestamp_test.png",
  "signed_url": "https://..."
}
```

### Verify Upload

**Supabase Dashboard → Storage → `interventia-intake`**
- [ ] Folder `leads/<lead_id>/` exists
- [ ] File `timestamp_test.png` exists

**Table Editor → `lead_files`**
- [ ] Row exists with `lead_id` matching
- [ ] `storage_path` correct
- [ ] `mime_type` = 'image/png'

---

## ✅ Step 6: Test Full Onboarding Flow

### Frontend Test

1. Navigate to `http://localhost:5173/onboarding` (or Vercel URL)
2. Complete all 6 steps:
   - Select pest category
   - Select urgency
   - Enter postal code + city
   - Add description
   - Upload 1-2 photos
   - Select contact method
   - Enter phone + name
   - Accept consent
3. Click "Envoyer ma demande"

### Expected Behavior

**Console logs:**
```
🎯 SUBMIT FUNCTION CALLED
📋 Form data: {...}
🔄 Mapped intake data: {...}
🚀 submitIntake called
📍 Endpoint: https://...
📦 Payload: {...}
🌐 Sending POST request to intake function...
✅ Response status: 200
📄 Raw response: {"ok":true,"lead_id":"..."}
📦 Parsed response: {...}
📸 Uploading 2 photos...
📤 Uploading photo1.jpg...
✅ Uploaded photo1.jpg: {...}
📤 Uploading photo2.jpg...
✅ Uploaded photo2.jpg: {...}
✅ All photos processed
```

**UI:**
- [ ] Success screen appears
- [ ] Lead ID displayed
- [ ] WhatsApp button works

**Database:**
- [ ] New row in `leads`
- [ ] 2 rows in `lead_files`
- [ ] Files in Storage bucket
- [ ] Event in `lead_events`

---

## ✅ Step 7: Test Ops Dashboard

### Create Operator User

**Supabase Dashboard → Authentication → Users → Add user**
- Email: `ops@interventia.be`
- Password: `[secure password]`
- Auto Confirm User: YES

### Test Login

1. Navigate to `/login`
2. Enter operator credentials
3. Should redirect to `/ops/queue`

### Verify Queue

- [ ] Lead from Step 6 appears
- [ ] Sorted by priority score (highest first)
- [ ] Shows urgency badge
- [ ] Shows location, phone
- [ ] SLA countdown visible

### Test Lead Detail

1. Click on lead
2. Should navigate to `/ops/leads/<id>`

**Verify:**
- [ ] All lead data displayed
- [ ] Photos visible (signed URLs working)
- [ ] Can change status dropdown
- [ ] "Assign to me" button works
- [ ] WhatsApp button opens with pre-filled message
- [ ] Can add/save operator notes
- [ ] Activity log shows events

---

## 🐛 Troubleshooting

### Issue: Intake returns 401/403

**Cause:** Function auth mode misconfigured

**Fix:** Edge Functions accept anon key by default. Verify headers:
```
apikey: sb_publishable_...
Authorization: Bearer sb_publishable_...
```

### Issue: Upload returns 404 "Lead not found"

**Cause:** Lead ID doesn't exist or wrong

**Fix:** Use actual lead ID from intake response

### Issue: Photos don't appear in ops dashboard

**Cause:** Signed URL generation failing

**Fix:** Check Storage policies allow authenticated users to read:
```sql
-- In Supabase SQL Editor
CREATE POLICY "Authenticated operators can view intake files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'interventia-intake');
```

### Issue: "Cannot read leads" in ops dashboard

**Cause:** User not authenticated or RLS blocking

**Fix:** 
1. Verify user is logged in (check browser console for session)
2. Verify RLS policies exist (Dashboard → Authentication → Policies)

---

## 📊 Success Criteria

Answer these 3 questions:

1. **Does intake work?**
   - [ ] YES - curl returns `{"ok":true,"lead_id":"..."}`
   - [ ] NO - Error: __________

2. **Does database insert work?**
   - [ ] YES - Row appears in `leads` table
   - [ ] NO - Error: __________

3. **Do photo uploads work?**
   - [ ] YES - Files in Storage + rows in `lead_files`
   - [ ] NO - Error: __________

If all 3 are YES: **System is production-ready** ✅

If any is NO: Paste the error message for exact fix.

---

## 🎉 Final Verification

Once all tests pass:

- [ ] Service role key rotated
- [ ] Intake function deployed and working
- [ ] Upload function deployed and working
- [ ] Database migration applied
- [ ] Storage bucket configured
- [ ] RLS policies active
- [ ] Operator user created
- [ ] Public onboarding works end-to-end
- [ ] Ops dashboard works with auth
- [ ] Photos upload and display correctly

**Status: Production-ready** 🚀
