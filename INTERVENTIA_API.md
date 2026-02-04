# Interventia API Integration

## Overview

The onboarding flow submits lead data to a Google Apps Script Web App endpoint that creates a new row in Google Sheets and a corresponding Drive folder for document uploads.

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# Google Apps Script endpoint for Interventia onboarding submissions
# Format: https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
VITE_INTERVENTIA_ENDPOINT=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

**Important:** Replace `YOUR_DEPLOYMENT_ID` with your actual Apps Script deployment ID.

### Getting Your Deployment ID

1. Open your Google Apps Script project
2. Click **Deploy** → **New deployment**
3. Select type: **Web app**
4. Set "Execute as": **Me**
5. Set "Who has access": **Anyone** (or as needed)
6. Click **Deploy**
7. Copy the **Web app URL** (ends with `/exec`)
8. Paste the full URL into your `.env` file

## API Specification

### Request

**Endpoint:** `POST {VITE_INTERVENTIA_ENDPOINT}`

**Headers:**
```
Content-Type: application/json
```

**Payload:**
```json
{
  "lang": "FR|NL",
  "source": "website",
  "utm_source": "",
  "utm_campaign": "",
  "pest_category": "wasps|hornets|rats|mice|cockroaches|bedbugs|ants|fleas|pigeons|other",
  "pest_detail": "house|apartment|business|warehouse|restaurant|other",
  "urgency": "IMMEDIATE|48H|INSPECTION",
  "postal_code": "1000",
  "city": "Bruxelles",
  "description": "Description of the situation\n\nNom: John Doe",
  "contact_method": "WHATSAPP|CALL|ONLINE",
  "phone": "0470123456"
}
```

### Response

**Success (200 OK):**
```json
{
  "ok": true,
  "lead_id": "LEAD-2024-001",
  "folder_url": "https://drive.google.com/drive/folders/...",
  "priority_score": 75,
  "file_urls": []
}
```

**Error:**
```json
{
  "ok": false,
  "error": "Error message"
}
```

## Implementation

### API Module

The API integration is implemented in `src/lib/interventiaApi.ts`:

```typescript
import { submitLead, mapOnboardingToLead } from '../lib/interventiaApi';

// Submit lead
const leadData = mapOnboardingToLead(formData);
const response = await submitLead(leadData);
```

### Functions

#### `submitLead(formData: LeadFormData): Promise<LeadResponse>`

Submits lead data to the Apps Script endpoint.

**Parameters:**
- `formData`: Lead form data matching the API specification

**Returns:**
- Promise resolving to `LeadResponse` with `ok`, `lead_id`, `folder_url`, etc.

**Throws:**
- Error if endpoint is not configured
- Error on network failure
- Error on submission failure

#### `mapOnboardingToLead(data: OnboardingData): LeadFormData`

Maps the internal onboarding form state to the API format.

**Parameters:**
- `data`: Onboarding form data from the UI

**Returns:**
- `LeadFormData` formatted for the API

### CORS Considerations

The default implementation uses `mode: 'no-cors'` which is required for Apps Script endpoints that don't have CORS configured. This means:

- The request will be sent successfully
- You cannot read the response body
- The function assumes success if no error is thrown

**Alternative:** If you configure your Apps Script to return proper CORS headers, use `submitLeadWithCORS()` instead to read the actual response.

To enable CORS in Apps Script, add this to your `doPost()` function:

```javascript
function doPost(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Your logic here
  const result = { ok: true, lead_id: "..." };
  
  output.setContent(JSON.stringify(result));
  
  // Add CORS headers
  return output
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
```

## UI Integration

### Onboarding Component

The `Onboarding.tsx` component handles the submission:

```typescript
const submit = async () => {
  setLoading(true);
  setError('');
  
  try {
    const leadData = mapOnboardingToLead(data);
    const response = await submitLead(leadData);
    
    if (response.ok) {
      setLeadId(response.lead_id || '');
      setDone(true);
    }
  } catch (e) {
    setError(e.message);
  } finally {
    setLoading(false);
  }
};
```

### States

- **Loading:** Shows spinner on submit button
- **Error:** Displays error toast at bottom of screen (auto-dismisses after 3s)
- **Success:** Shows success screen with lead ID and WhatsApp CTA

### Success Screen

After successful submission:
- Displays confirmation message
- Shows lead reference ID (if available)
- Provides WhatsApp button with pre-filled message including lead ID
- Shows estimated response time (< 30 minutes)
- Displays pricing reassurance

## Data Mapping

### Urgency Mapping

| UI Value | API Value |
|----------|-----------|
| immediate | IMMEDIATE |
| today | IMMEDIATE |
| 48h | 48H |
| week | INSPECTION |

### Contact Method Mapping

| UI Value | API Value |
|----------|-----------|
| whatsapp | WHATSAPP |
| phone | CALL |
| email | ONLINE |

### Language Mapping

| UI Value | API Value |
|----------|-----------|
| fr | FR |
| nl | NL |

## Testing

### Local Testing

1. Set up a test Apps Script endpoint
2. Configure `.env` with the test endpoint URL
3. Run the development server: `npm run dev`
4. Navigate to `http://localhost:5173/#onboarding`
5. Complete the onboarding flow
6. Check the Apps Script logs and Google Sheet for the submitted data

### Production Deployment

1. Deploy your Apps Script as a web app
2. Update `.env` (or production environment variables) with the production endpoint
3. Test the full flow in production
4. Monitor Google Sheets for incoming leads

## Error Handling

The API module handles the following error scenarios:

- **Missing configuration:** Throws error if `VITE_INTERVENTIA_ENDPOINT` is not set
- **Network errors:** Catches fetch errors and displays user-friendly message
- **Invalid responses:** Handles non-JSON responses from Apps Script
- **Submission failures:** Displays error message from API response

All errors are logged to the console for debugging and shown to the user via a toast notification.

## Security Notes

- The endpoint URL is public (client-side)
- Apps Script handles authentication and authorization
- No sensitive data should be stored in the client
- Consider rate limiting on the Apps Script side
- Validate all input data on the server side (Apps Script)

## Future Enhancements

- File upload support (photos)
- Retry logic for failed submissions
- Offline queue for submissions
- Analytics tracking for conversion funnel
- A/B testing for form variations
