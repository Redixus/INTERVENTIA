import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, type Lead, type LeadFile, type LeadEvent, getSignedFileUrl, BUSINESS_WHATSAPP } from '../lib/supabaseClient'
import { ArrowLeft, MapPin, Phone, MessageCircle, Clock, User, Image as ImageIcon, AlertCircle } from 'lucide-react'

export function LeadDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [lead, setLead] = useState<Lead | null>(null)
  const [files, setFiles] = useState<LeadFile[]>([])
  const [events, setEvents] = useState<LeadEvent[]>([])
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (id) loadLead(id)
  }, [id])

  async function loadLead(leadId: string) {
    try {
      // Load lead
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single()

      if (leadError) throw leadError
      setLead(leadData)
      setNotes(leadData.operator_notes || '')

      // Load files
      const { data: filesData, error: filesError } = await supabase
        .from('lead_files')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: true })

      if (filesError) throw filesError
      setFiles(filesData || [])

      // Get signed URLs for files
      const urls: Record<string, string> = {}
      for (const file of filesData || []) {
        try {
          const url = await getSignedFileUrl(file.storage_path)
          urls[file.id] = url
        } catch (err) {
          console.error(`Failed to get URL for ${file.id}:`, err)
        }
      }
      setFileUrls(urls)

      // Load events
      const { data: eventsData, error: eventsError } = await supabase
        .from('lead_events')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })

      if (eventsError) throw eventsError
      setEvents(eventsData || [])

    } catch (err) {
      console.error('Failed to load lead:', err)
      setError(err instanceof Error ? err.message : 'Failed to load lead')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(newStatus: string) {
    if (!lead) return

    try {
      const { error: updateError } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', lead.id)

      if (updateError) throw updateError

      setLead({ ...lead, status: newStatus as any })
    } catch (err) {
      console.error('Failed to update status:', err)
      alert('Failed to update status')
    }
  }

  async function saveNotes() {
    if (!lead) return

    setSaving(true)
    try {
      const { error: updateError } = await supabase
        .from('leads')
        .update({ operator_notes: notes })
        .eq('id', lead.id)

      if (updateError) throw updateError

      setLead({ ...lead, operator_notes: notes })
    } catch (err) {
      console.error('Failed to save notes:', err)
      alert('Failed to save notes')
    } finally {
      setSaving(false)
    }
  }

  async function assignToMe() {
    if (!lead) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: updateError } = await supabase
        .from('leads')
        .update({ assigned_to: user.id })
        .eq('id', lead.id)

      if (updateError) throw updateError

      setLead({ ...lead, assigned_to: user.id })
    } catch (err) {
      console.error('Failed to assign:', err)
      alert('Failed to assign lead')
    }
  }

  function openWhatsApp() {
    if (!lead) return
    const phone = BUSINESS_WHATSAPP.replace('+', '')
    const message = `Bonjour, concernant votre demande ${lead.pest_detail} à ${lead.city} (Réf: ${lead.id.slice(0, 8)})`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading lead...</div>
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-red-600 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error || 'Lead not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/ops/queue')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to queue
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{lead.pest_detail}</h1>
              <p className="text-sm text-slate-600 mt-1">Lead #{lead.id.slice(0, 8)}</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={lead.status}
                onChange={(e) => updateStatus(e.target.value)}
                className="px-4 py-2 border-2 border-slate-300 rounded-lg font-semibold"
              >
                <option value="NEW">NEW</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="DONE">DONE</option>
                <option value="LOST">LOST</option>
                <option value="SPAM">SPAM</option>
              </select>
              <button
                onClick={assignToMe}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-800"
              >
                Assign to me
              </button>
              <button
                onClick={openWhatsApp}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Left column - Lead details */}
          <div className="col-span-2 space-y-6">
            {/* Info card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Lead Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Urgency</label>
                  <p className="text-sm font-bold text-slate-900 mt-1">{lead.urgency}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Priority Score</label>
                  <p className="text-sm font-bold text-slate-900 mt-1">{lead.priority_score}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Location</label>
                  <p className="text-sm text-slate-900 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {lead.postal_code} {lead.city}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Contact</label>
                  <p className="text-sm text-slate-900 mt-1 flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    {lead.phone}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Contact Method</label>
                  <p className="text-sm text-slate-900 mt-1">{lead.contact_method}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Language</label>
                  <p className="text-sm text-slate-900 mt-1">{lead.lang}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">SLA Due</label>
                  <p className="text-sm text-slate-900 mt-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {new Date(lead.sla_due_at).toLocaleString('fr-BE')}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Description</h2>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{lead.description}</p>
            </div>

            {/* Photos */}
            {files.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Photos ({files.length})
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  {files.map((file) => (
                    <div key={file.id} className="aspect-square rounded-lg overflow-hidden border border-slate-200">
                      {fileUrls[file.id] ? (
                        <img
                          src={fileUrls[file.id]}
                          alt="Lead photo"
                          className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                          onClick={() => window.open(fileUrls[file.id], '_blank')}
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Operator Notes</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-slate-700 focus:ring-4 focus:ring-slate-700/10 outline-none resize-none"
                placeholder="Add notes about this lead..."
              />
              <button
                onClick={saveNotes}
                disabled={saving}
                className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>

          {/* Right column - Events */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Activity Log</h2>
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="border-l-2 border-slate-200 pl-3">
                    <p className="text-sm font-semibold text-slate-900">{event.event_type}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(event.created_at).toLocaleString('fr-BE')}
                    </p>
                    {event.payload && (
                      <pre className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded">
                        {JSON.stringify(event.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
