import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, type Lead } from '../lib/supabaseClient'
import { Clock, AlertCircle, MapPin, Phone, MessageCircle } from 'lucide-react'

export function OpsQueue() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadQueue()
  }, [])

  async function loadQueue() {
    try {
      const { data, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .eq('status', 'NEW')
        .order('priority_score', { ascending: false })
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError

      setLeads(data || [])
    } catch (err) {
      console.error('Failed to load queue:', err)
      setError(err instanceof Error ? err.message : 'Failed to load queue')
    } finally {
      setLoading(false)
    }
  }

  function getUrgencyColor(urgency: string) {
    switch (urgency) {
      case 'IMMEDIATE': return 'bg-red-100 text-red-800 border-red-300'
      case 'H48': return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'INSPECTION': return 'bg-slate-100 text-slate-700 border-slate-300'
      default: return 'bg-slate-100 text-slate-700 border-slate-300'
    }
  }

  function formatSLA(slaDate: string) {
    const now = new Date()
    const sla = new Date(slaDate)
    const diffMs = sla.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffMs < 0) return <span className="text-red-600 font-bold">OVERDUE</span>
    if (diffHours < 1) return <span className="text-amber-600">{diffMins}m</span>
    return <span>{diffHours}h {diffMins}m</span>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading queue...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-red-600 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Intake Queue</h1>
          <p className="text-sm text-slate-600 mt-1">{leads.length} new leads</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {leads.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-slate-500">No new leads in queue</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => navigate(`/ops/leads/${lead.id}`)}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-400 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-slate-900">
                        {lead.pest_detail}
                      </span>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${getUrgencyColor(lead.urgency)}`}>
                        {lead.urgency}
                      </span>
                      <span className="px-2.5 py-1 text-xs font-semibold bg-slate-900 text-white rounded-md">
                        {lead.priority_score}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {lead.postal_code} {lead.city}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4" />
                        {lead.phone}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {lead.contact_method === 'WHATSAPP' && <MessageCircle className="w-4 h-4 text-green-600" />}
                        {lead.contact_method}
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 line-clamp-2">
                      {lead.description}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-2">
                      <Clock className="w-4 h-4" />
                      SLA: {formatSLA(lead.sla_due_at)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {new Date(lead.created_at).toLocaleString('fr-BE', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
