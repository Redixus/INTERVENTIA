-- Interventia Database Schema Migration
-- Production-grade intake + dispatch system

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE lead_status AS ENUM (
  'NEW',
  'CONTACTED',
  'SCHEDULED',
  'DONE',
  'LOST',
  'SPAM'
);

CREATE TYPE lead_urgency AS ENUM (
  'IMMEDIATE',
  'H48',
  'INSPECTION'
);

CREATE TYPE contact_method AS ENUM (
  'WHATSAPP',
  'CALL',
  'ONLINE'
);

CREATE TYPE lead_lang AS ENUM (
  'FR',
  'NL'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Main leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Language and source tracking
  lang lead_lang NOT NULL,
  source TEXT NOT NULL DEFAULT 'website',
  utm_source TEXT,
  utm_campaign TEXT,
  
  -- Pest information
  pest_category TEXT NOT NULL,
  pest_detail TEXT NOT NULL,
  urgency lead_urgency NOT NULL,
  
  -- Location
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  
  -- Contact details
  description TEXT NOT NULL,
  contact_method contact_method NOT NULL,
  phone TEXT NOT NULL,
  
  -- Status and priority
  status lead_status NOT NULL DEFAULT 'NEW',
  priority_score INTEGER NOT NULL,
  sla_due_at TIMESTAMPTZ NOT NULL,
  
  -- Operator management
  operator_notes TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Timestamps
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lead files (photos, documents)
CREATE TABLE public.lead_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  
  -- Storage information
  storage_bucket TEXT NOT NULL DEFAULT 'interventia-intake',
  storage_path TEXT NOT NULL,
  
  -- File metadata
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lead events (audit log)
CREATE TABLE public.lead_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  
  -- Actor (can be null for system events)
  actor UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Event details
  event_type TEXT NOT NULL,
  payload JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Queue optimization: status + priority + created_at
CREATE INDEX idx_leads_queue ON public.leads (
  status,
  priority_score DESC,
  created_at ASC
) WHERE status = 'NEW';

-- Lead files lookup
CREATE INDEX idx_lead_files_lead_id ON public.lead_files (lead_id);

-- Lead events lookup
CREATE INDEX idx_lead_events_lead_id ON public.lead_events (lead_id, created_at DESC);

-- Assigned leads lookup
CREATE INDEX idx_leads_assigned_to ON public.leads (assigned_to) WHERE assigned_to IS NOT NULL;

-- Search by phone
CREATE INDEX idx_leads_phone ON public.leads (phone);

-- Search by postal code
CREATE INDEX idx_leads_postal_code ON public.leads (postal_code);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create event on lead status change
CREATE OR REPLACE FUNCTION log_lead_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.lead_events (lead_id, actor, event_type, payload)
    VALUES (
      NEW.id,
      auth.uid(),
      'status_changed',
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_lead_status_change_trigger
  AFTER UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION log_lead_status_change();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;

-- Leads policies
CREATE POLICY "Authenticated operators can view all leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated operators can insert leads"
  ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated operators can update leads"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Anonymous users cannot access leads directly
-- (intake goes through Edge Function with service role)

-- Lead files policies
CREATE POLICY "Authenticated operators can view lead files"
  ON public.lead_files
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated operators can insert lead files"
  ON public.lead_files
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Lead events policies
CREATE POLICY "Authenticated operators can view lead events"
  ON public.lead_events
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated operators can insert lead events"
  ON public.lead_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Calculate priority score
CREATE OR REPLACE FUNCTION calculate_priority_score(
  p_pest_detail TEXT,
  p_urgency lead_urgency
)
RETURNS INTEGER AS $$
DECLARE
  base_score INTEGER;
  multiplier NUMERIC;
  final_score INTEGER;
BEGIN
  -- Base scores (case-insensitive)
  base_score := CASE LOWER(p_pest_detail)
    WHEN 'punaises' THEN 90
    WHEN 'cafards' THEN 85
    WHEN 'rats' THEN 80
    WHEN 'guepes' THEN 70
    WHEN 'souris' THEN 60
    WHEN 'fourmis' THEN 45
    WHEN 'pigeons' THEN 40
    ELSE 30
  END;
  
  -- Urgency multipliers
  multiplier := CASE p_urgency
    WHEN 'IMMEDIATE' THEN 1.3
    WHEN 'H48' THEN 1.0
    WHEN 'INSPECTION' THEN 0.7
  END;
  
  final_score := ROUND(base_score * multiplier);
  
  RETURN final_score;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate SLA due date
CREATE OR REPLACE FUNCTION calculate_sla_due_at(
  p_urgency lead_urgency,
  p_created_at TIMESTAMPTZ DEFAULT now()
)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN CASE p_urgency
    WHEN 'IMMEDIATE' THEN p_created_at + INTERVAL '2 hours'
    WHEN 'H48' THEN p_created_at + INTERVAL '12 hours'
    WHEN 'INSPECTION' THEN p_created_at + INTERVAL '48 hours'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- STORAGE BUCKET
-- ============================================================================

-- Create private storage bucket for intake files
INSERT INTO storage.buckets (id, name, public)
VALUES ('interventia-intake', 'interventia-intake', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for interventia-intake bucket
CREATE POLICY "Authenticated operators can view intake files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'interventia-intake');

CREATE POLICY "Authenticated operators can upload intake files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'interventia-intake');

CREATE POLICY "Authenticated operators can delete intake files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'interventia-intake');

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.leads IS 'Main intake leads table for pest control interventions';
COMMENT ON TABLE public.lead_files IS 'Files (photos, documents) attached to leads';
COMMENT ON TABLE public.lead_events IS 'Audit log of all lead state changes';

COMMENT ON FUNCTION calculate_priority_score IS 'Calculate priority score based on pest type and urgency';
COMMENT ON FUNCTION calculate_sla_due_at IS 'Calculate SLA deadline based on urgency level';
