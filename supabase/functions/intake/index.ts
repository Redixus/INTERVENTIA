// Interventia Intake Edge Function
// Handles public lead submissions with validation, anti-spam, and priority scoring

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Simple in-memory rate limiting (per instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX = 5 // 5 requests per minute per IP

interface IntakePayload {
  lang: 'FR' | 'NL'
  source?: string
  utm_source?: string
  utm_campaign?: string
  pest_category: string
  pest_detail: string
  urgency: 'IMMEDIATE' | '48H' | 'H48' | 'INSPECTION'
  postal_code: string
  city: string
  description: string
  contact_method: 'WHATSAPP' | 'CALL' | 'ONLINE'
  phone: string
  hp?: string // honeypot field
  name?: string
}

interface SpamCheckResult {
  isSpam: boolean
  score: number
  reasons: string[]
}

function checkServerSpam(payload: IntakePayload): SpamCheckResult {
  const reasons: string[] = []
  let score = 0
  
  // 1. Honeypot filled
  if (payload.hp && payload.hp.trim() !== '') {
    reasons.push('honeypot_filled')
    score += 50
  }
  
  // 2. URLs in description
  const desc = payload.description?.toLowerCase() || ''
  if (/https?:\/\/|www\./i.test(desc)) {
    reasons.push('contains_url')
    score += 30
  }
  
  // 3. Spam keywords
  const spamKeywords = ['bitcoin', 'crypto', 'casino', 'viagra', 'lottery', 'winner', 'click here', 'free money']
  for (const keyword of spamKeywords) {
    if (desc.includes(keyword)) {
      reasons.push('spam_keyword')
      score += 25
      break
    }
  }
  
  // 4. Repeated characters (aaaaaaa)
  if (/(.){6,}/.test(desc)) {
    reasons.push('repeated_chars')
    score += 15
  }
  
  // 5. Invalid Belgian postal code
  const postal = payload.postal_code?.replace(/\D/g, '') || ''
  if (postal.length !== 4 || parseInt(postal) < 1000 || parseInt(postal) > 9999) {
    reasons.push('invalid_postal')
    score += 10
  }
  
  // 6. Invalid phone (too short)
  const phoneDigits = payload.phone?.replace(/\D/g, '') || ''
  if (phoneDigits.length < 9) {
    reasons.push('invalid_phone')
    score += 10
  }
  
  return {
    isSpam: score >= 50,
    score: Math.min(score, 100),
    reasons
  }
}

function normalizePhone(phone: string): string {
  // Strip spaces, keep + if present
  return phone.replace(/\s/g, '')
}

function mapUrgency(urgency: string): 'IMMEDIATE' | 'H48' | 'INSPECTION' {
  if (urgency === '48H') return 'H48'
  return urgency as 'IMMEDIATE' | 'H48' | 'INSPECTION'
}

function calculatePriorityScore(pestDetail: string, urgency: 'IMMEDIATE' | 'H48' | 'INSPECTION'): number {
  const normalized = pestDetail.toLowerCase()
  
  let baseScore = 30 // default
  if (normalized.includes('punaise')) baseScore = 90
  else if (normalized.includes('cafard')) baseScore = 85
  else if (normalized.includes('rat')) baseScore = 80
  else if (normalized.includes('guepe')) baseScore = 70
  else if (normalized.includes('souris')) baseScore = 60
  else if (normalized.includes('fourmi')) baseScore = 45
  else if (normalized.includes('pigeon')) baseScore = 40
  
  const multiplier = urgency === 'IMMEDIATE' ? 1.3 : urgency === 'H48' ? 1.0 : 0.7
  
  return Math.round(baseScore * multiplier)
}

function calculateSLA(urgency: 'IMMEDIATE' | 'H48' | 'INSPECTION'): Date {
  const now = new Date()
  
  if (urgency === 'IMMEDIATE') {
    now.setHours(now.getHours() + 2)
  } else if (urgency === 'H48') {
    now.setHours(now.getHours() + 12)
  } else {
    now.setHours(now.getHours() + 48)
  }
  
  return now
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false
  }
  
  record.count++
  return true
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  try {
    // Get client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const payload: IntakePayload = await req.json()
    
    console.log('Intake request received:', { ip, lang: payload.lang, pest: payload.pest_detail })
    
    // Server-side spam detection
    const spamCheck = checkServerSpam(payload)
    const isSpam = spamCheck.isSpam
    
    if (isSpam) {
      console.log('Spam detected:', { ip, reasons: spamCheck.reasons, score: spamCheck.score })
    }
    
    // Validate required fields
    const requiredFields = [
      'lang', 'pest_category', 'pest_detail', 'urgency',
      'postal_code', 'city', 'description', 'contact_method', 'phone'
    ]
    
    for (const field of requiredFields) {
      if (!payload[field as keyof IntakePayload]) {
        return new Response(
          JSON.stringify({ ok: false, error: `Missing required field: ${field}` }),
          { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
      }
    }
    
    // Normalize data
    const normalizedPhone = normalizePhone(payload.phone)
    const normalizedUrgency = mapUrgency(payload.urgency)
    const priorityScore = calculatePriorityScore(payload.pest_detail, normalizedUrgency)
    const slaDueAt = calculateSLA(normalizedUrgency)
    
    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Insert lead
    const { data: lead, error: insertError } = await supabase
      .from('leads')
      .insert({
        lang: payload.lang,
        source: payload.source || 'website',
        utm_source: payload.utm_source || null,
        utm_campaign: payload.utm_campaign || null,
        pest_category: payload.pest_category,
        pest_detail: payload.pest_detail,
        urgency: normalizedUrgency,
        postal_code: payload.postal_code,
        city: payload.city,
        description: payload.description,
        contact_method: payload.contact_method,
        phone: normalizedPhone,
        status: isSpam ? 'SPAM' : 'NEW',
        priority_score: priorityScore,
        sla_due_at: slaDueAt.toISOString(),
      })
      .select('id')
      .single()
    
    if (insertError) {
      console.error('Database insert error:', insertError)
      return new Response(
        JSON.stringify({ ok: false, error: 'Failed to create lead' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('Lead created:', lead.id)
    
    // Create initial event
    await supabase
      .from('lead_events')
      .insert({
        lead_id: lead.id,
        actor: null,
        event_type: 'lead_created',
        payload: {
          source: payload.source || 'website',
          ip,
          user_agent: req.headers.get('user-agent'),
        }
      })
    
    // Return success
    return new Response(
      JSON.stringify({
        ok: true,
        lead_id: lead.id,
        priority_score: priorityScore,
      }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Intake error:', error)
    return new Response(
      JSON.stringify({ ok: false, error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }
})
