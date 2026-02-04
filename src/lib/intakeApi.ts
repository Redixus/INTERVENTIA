/**
 * Interventia Intake API - Supabase Edge Function Integration
 */

// Removed unused imports - uploads now handled via Edge Function

export interface IntakeFormData {
  lang: 'FR' | 'NL'
  source?: string
  utm_source?: string
  utm_campaign?: string
  pest_category: string
  pest_detail: string
  urgency: 'IMMEDIATE' | '48H' | 'INSPECTION'
  postal_code: string
  city: string
  description: string
  contact_method: 'WHATSAPP' | 'CALL' | 'ONLINE'
  phone: string
  photos?: File[]
}

export interface IntakeResponse {
  ok: boolean
  lead_id?: string
  priority_score?: number
  error?: string
}

/**
 * Submit intake form to Supabase Edge Function
 */
export async function submitIntake(formData: IntakeFormData): Promise<IntakeResponse> {
  const endpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/intake`
  
  console.log('🚀 submitIntake called')
  console.log('📍 Endpoint:', endpoint)
  console.log('📦 Payload:', { ...formData, photos: formData.photos?.length || 0 })

  try {
    // Prepare payload (exclude photos from initial submission)
    const { photos, ...payload } = formData
    
    // Add UTM parameters from URL if not provided
    if (!payload.utm_source) {
      payload.utm_source = new URLSearchParams(window.location.search).get('utm_source') || undefined
    }
    if (!payload.utm_campaign) {
      payload.utm_campaign = new URLSearchParams(window.location.search).get('utm_campaign') || undefined
    }
    
    console.log('🌐 Sending POST request to intake function...')
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(payload),
    })
    
    console.log('✅ Response status:', response.status)
    
    const responseText = await response.text()
    console.log('📄 Raw response:', responseText)
    
    let data: IntakeResponse
    try {
      data = JSON.parse(responseText)
      console.log('📦 Parsed response:', data)
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      throw new Error('Invalid response from server')
    }
    
    if (!response.ok || !data.ok) {
      throw new Error(data.error || `Server error: ${response.status}`)
    }
    
    // Upload photos if provided
    if (photos && photos.length > 0 && data.lead_id) {
      console.log(`📸 Uploading ${photos.length} photos...`)
      await uploadPhotos(data.lead_id, photos)
    }
    
    return data
    
  } catch (error) {
    console.error('Intake submission error:', error)
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('Failed to submit intake. Please try again.')
  }
}

/**
 * Upload photos for a lead via Edge Function (secure server-side upload)
 */
async function uploadPhotos(leadId: string, photos: File[]): Promise<void> {
  const endpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload`
  
  const uploadPromises = photos.map(async (photo) => {
    try {
      console.log(`📤 Uploading ${photo.name}...`)
      
      // Convert File to base64
      const base64 = await fileToBase64(photo)
      
      // Upload via Edge Function
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          lead_id: leadId,
          file_name: photo.name,
          file_data: base64,
          mime_type: photo.type,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }
      
      const result = await response.json()
      console.log(`✅ Uploaded ${photo.name}:`, result)
      
    } catch (error) {
      console.error(`❌ Failed to upload ${photo.name}:`, error)
      // Don't throw - allow partial uploads
    }
  })
  
  await Promise.all(uploadPromises)
  console.log('✅ All photos processed')
}

/**
 * Convert File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Map onboarding form data to intake format
 */
export function mapOnboardingToIntake(data: {
  pest_category: string
  urgency: string
  postal_code: string
  city: string
  housing_type: string
  description: string
  contact_method: string
  phone: string
  name: string
  language: string
  photo_urls?: string[]
  photos?: File[]
}): IntakeFormData {
  // Map urgency values
  const urgencyMap: Record<string, 'IMMEDIATE' | '48H' | 'INSPECTION'> = {
    'immediate': 'IMMEDIATE',
    'today': 'IMMEDIATE',
    '48h': '48H',
    'week': 'INSPECTION',
  }

  // Map contact method
  const contactMap: Record<string, 'WHATSAPP' | 'CALL' | 'ONLINE'> = {
    'whatsapp': 'WHATSAPP',
    'phone': 'CALL',
    'email': 'ONLINE',
  }

  return {
    lang: data.language.toUpperCase() as 'FR' | 'NL',
    source: 'website',
    pest_category: data.pest_category,
    pest_detail: data.housing_type,
    urgency: urgencyMap[data.urgency] || 'INSPECTION',
    postal_code: data.postal_code,
    city: data.city,
    description: `${data.description}\n\nNom: ${data.name}`,
    contact_method: contactMap[data.contact_method] || 'WHATSAPP',
    phone: data.phone,
    photos: data.photos,
  }
}
