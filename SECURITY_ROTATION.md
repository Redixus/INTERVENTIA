# 🚨 CRITICAL: Service Role Key Rotation Required

## Issue

The Supabase service role key was exposed in chat logs and must be considered **compromised**.

## Immediate Action Required

### 1. Rotate Service Role Key

1. Go to Supabase Dashboard → **Settings** → **API**
2. Click **"Reset service_role secret"** or **"Regenerate"**
3. Copy the NEW service role key
4. **DO NOT paste it in chat or commit it to git**

### 2. Update Edge Function Secret

```bash
# Set the NEW service role key as a secret
supabase secrets set SERVICE_ROLE_KEY=<NEW_KEY_HERE> --project-ref onhshajjoupjogzyfvkg
```

### 3. Verify Function Still Works

```bash
# Test intake function
curl -X POST \
  https://onhshajjoupjogzyfvkg.supabase.co/functions/v1/intake \
  -H "Content-Type: application/json" \
  -H "apikey: sb_publishable_0qJDrDstB3ZW5WLKXsnQRQ_DfXLfMFr" \
  -H "Authorization: Bearer sb_publishable_0qJDrDstB3ZW5WLKXsnQRQ_DfXLfMFr" \
  -d '{
    "lang":"FR",
    "pest_category":"test",
    "pest_detail":"cafards",
    "urgency":"IMMEDIATE",
    "postal_code":"1000",
    "city":"Bruxelles",
    "description":"test",
    "contact_method":"WHATSAPP",
    "phone":"+32466274251"
  }'
```

Expected: `200 OK` with `{"ok":true,"lead_id":"..."}`

### 4. Revoke Old Key (if possible)

Check if Supabase allows you to explicitly revoke the old key. If not, rotation is sufficient.

---

## What NOT To Do

- ❌ Do NOT paste the service role key in chat
- ❌ Do NOT commit it to git
- ❌ Do NOT use it in frontend code
- ❌ Do NOT share it in documentation

## Where Service Role Key Should Be

- ✅ Supabase Edge Function secrets ONLY
- ✅ Accessed via `Deno.env.get('SERVICE_ROLE_KEY')`

---

## Anon Key (Safe to Expose)

The anon/publishable key is SAFE to use in frontend:
```
sb_publishable_0qJDrDstB3ZW5WLKXsnQRQ_DfXLfMFr
```

This key is:
- ✅ Safe in frontend code
- ✅ Safe in .env files
- ✅ Safe in Vercel env vars
- ✅ Protected by RLS policies

---

## After Rotation

- [ ] Service role key rotated
- [ ] New key set in Edge Function secrets
- [ ] Test intake function works
- [ ] Verify no errors in function logs
- [ ] Document rotation date: __________
