import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Business constants
export const BUSINESS_WHATSAPP = import.meta.env.VITE_BUSINESS_WHATSAPP || '+32466274251'

// Database types
export type LeadStatus = 'NEW' | 'CONTACTED' | 'SCHEDULED' | 'DONE' | 'LOST' | 'SPAM'
export type LeadUrgency = 'IMMEDIATE' | 'H48' | 'INSPECTION'
export type ContactMethod = 'WHATSAPP' | 'CALL' | 'ONLINE'
export type LeadLang = 'FR' | 'NL'

export interface Lead {
  id: string
  created_at: string
  lang: LeadLang
  source: string
  utm_source?: string
  utm_campaign?: string
  pest_category: string
  pest_detail: string
  urgency: LeadUrgency
  postal_code: string
  city: string
  description: string
  contact_method: ContactMethod
  phone: string
  status: LeadStatus
  priority_score: number
  sla_due_at: string
  operator_notes?: string
  assigned_to?: string
  updated_at: string
}

export interface LeadFile {
  id: string
  lead_id: string
  storage_bucket: string
  storage_path: string
  mime_type: string
  size_bytes: number
  created_at: string
}

export interface LeadEvent {
  id: string
  lead_id: string
  actor?: string
  event_type: string
  payload?: any
  created_at: string
}

// Helper to get signed URL for file viewing
export async function getSignedFileUrl(path: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from('interventia-intake')
    .createSignedUrl(path, expiresIn)
  
  if (error) throw error
  return data.signedUrl
}

// Helper to upload file
export async function uploadLeadFile(
  leadId: string,
  file: File
): Promise<{ path: string; url: string }> {
  const timestamp = Date.now()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `leads/${leadId}/${timestamp}_${sanitizedName}`
  
  const { error: uploadError } = await supabase.storage
    .from('interventia-intake')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (uploadError) throw uploadError
  
  // Get signed URL
  const url = await getSignedFileUrl(path)
  
  return { path, url }
}

// Helper to record file in database
export async function recordLeadFile(
  leadId: string,
  path: string,
  file: File
): Promise<LeadFile> {
  const { data, error } = await supabase
    .from('lead_files')
    .insert({
      lead_id: leadId,
      storage_path: path,
      mime_type: file.type,
      size_bytes: file.size,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}
