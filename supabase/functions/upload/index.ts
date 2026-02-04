// Interventia File Upload Edge Function
// Handles secure file uploads to private Storage bucket

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

interface UploadRequest {
  lead_id: string
  file_name: string
  file_data: string // base64
  mime_type: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  try {
    // Parse request
    const { lead_id, file_name, file_data, mime_type }: UploadRequest = await req.json()

    console.log('Upload request:', { lead_id, file_name, mime_type })

    // Validate inputs
    if (!lead_id || !file_name || !file_data || !mime_type) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(mime_type)) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid file type. Only images allowed.' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Decode base64
    const base64Data = file_data.split(',')[1] || file_data
    const fileBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))

    // Check file size
    if (fileBuffer.length > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ ok: false, error: 'File too large. Max 10MB.' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verify lead exists
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id')
      .eq('id', lead_id)
      .single()

    if (leadError || !lead) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Lead not found' }),
        { status: 404, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Generate storage path
    const timestamp = Date.now()
    const sanitizedName = file_name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `leads/${lead_id}/${timestamp}_${sanitizedName}`

    console.log('Uploading to:', storagePath)

    // Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from('interventia-intake')
      .upload(storagePath, fileBuffer, {
        contentType: mime_type,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return new Response(
        JSON.stringify({ ok: false, error: 'Failed to upload file' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Upload successful')

    // Record in database
    const { data: fileRecord, error: dbError } = await supabase
      .from('lead_files')
      .insert({
        lead_id,
        storage_path: storagePath,
        mime_type,
        size_bytes: fileBuffer.length,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // File uploaded but DB insert failed - not critical
      // Could add cleanup logic here
    }

    // Generate signed URL for immediate viewing
    const { data: signedUrlData } = await supabase.storage
      .from('interventia-intake')
      .createSignedUrl(storagePath, 3600)

    return new Response(
      JSON.stringify({
        ok: true,
        file_id: fileRecord?.id,
        storage_path: storagePath,
        signed_url: signedUrlData?.signedUrl,
      }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Upload error:', error)
    return new Response(
      JSON.stringify({ ok: false, error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }
})
