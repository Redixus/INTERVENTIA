import { useState, useRef, useEffect, useCallback, type ChangeEvent } from 'react';
import { 
  Shield, ArrowRight, ArrowLeft, Check, MapPin, Camera, X, Clock,
  MessageCircle, User, CheckCircle2, AlertCircle, Home, RotateCcw
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { submitIntake, mapOnboardingToIntake } from '../lib/intakeApi';
import { BUSINESS_WHATSAPP } from '../lib/supabaseClient';
import { 
  normalizeBelgianPhone, 
  checkForSpam,
  saveDraft,
  loadDraft,
  clearDraft
} from '../lib/validation';

const WHATSAPP = BUSINESS_WHATSAPP.replace('+', '');

interface OnboardingData {
  pest_category: string;
  urgency: string;
  postal_code: string;
  city: string;
  housing_type: string;
  description: string;
  photo_urls: string[];
  photos: File[];
  contact_method: string;
  phone: string;
  phone_normalized: string;
  name: string;
  language: string;
  submitted_at: string;
  utm_source: string;
  priority_score: number;
  consent: boolean;
  honeypot: string;
  formStartTime: number;
}

const initialData: OnboardingData = {
  pest_category: '', urgency: '', postal_code: '', city: '', housing_type: '',
  description: '', photo_urls: [], photos: [], contact_method: 'whatsapp', phone: '', phone_normalized: '', name: '',
  language: 'fr', submitted_at: '', utm_source: '', priority_score: 0, consent: false,
  honeypot: '', formStartTime: Date.now()
};


const t = {
  fr: {
    header: { title: "Demande d'intervention", time: 'Environ 2 minutes' },
    steps: ['Nuisible', 'Urgence', 'Localisation', 'Situation', 'Contact', 'Confirmation'],
    step1: {
      title: 'Quel nuisible devons-nous traiter ?',
      subtitle: 'Sélectionnez la catégorie correspondante',
      pests: [
        { id: 'wasps', label: 'Guêpes' }, { id: 'hornets', label: 'Frelons' },
        { id: 'rats', label: 'Rats' }, { id: 'mice', label: 'Souris' },
        { id: 'cockroaches', label: 'Cafards' }, { id: 'bedbugs', label: 'Punaises de lit' },
        { id: 'ants', label: 'Fourmis' }, { id: 'fleas', label: 'Puces' },
        { id: 'pigeons', label: 'Pigeons' }, { id: 'other', label: 'Autre' }
      ]
    },
    step2: {
      title: "Quelle est l'urgence ?",
      subtitle: "Cela nous aide à planifier l'intervention",
      options: [
        { id: 'immediate', label: 'Immédiat', desc: 'Situation dangereuse', badge: 'Prioritaire' },
        { id: 'today', label: "Aujourd'hui", desc: 'Intervention souhaitée dans la journée', badge: null },
        { id: '48h', label: 'Sous 48h', desc: 'Disponible pour un rendez-vous proche', badge: null },
        { id: 'week', label: 'Cette semaine', desc: 'Planning flexible', badge: null }
      ]
    },
    step3: {
      title: 'Où devons-nous intervenir ?',
      subtitle: "Adresse de l'intervention",
      postal: 'Code postal', city: 'Commune', housing: 'Type de bien',
      types: [
        { id: 'house', label: 'Maison' }, { id: 'apartment', label: 'Appartement' },
        { id: 'business', label: 'Commerce' }, { id: 'warehouse', label: 'Entrepôt' },
        { id: 'restaurant', label: 'Horeca' }, { id: 'other', label: 'Autre' }
      ]
    },
    step4: {
      title: 'Décrivez la situation',
      subtitle: 'Plus de détails = intervention plus efficace',
      placeholder: 'Décrivez ce que vous observez : où, depuis combien de temps, ampleur du problème...',
      photos: 'Photos (facultatif)', maxPhotos: 'Max 4 photos'
    },
    step5: {
      title: 'Comment vous contacter ?',
      subtitle: 'WhatsApp est notre canal le plus rapide',
      recommended: 'Recommandé - Réponse < 15 min',
      phone: 'Téléphone', phoneNote: 'Pour confirmation SMS uniquement'
    },
    step6: {
      title: 'Dernière étape', subtitle: 'Vérifiez vos informations',
      name: 'Votre nom',
      consent: "J'accepte d'être contacté par Interventia. Mes données ne seront pas partagées.",
      submit: 'Envoyer ma demande'
    },
    success: {
      title: 'Demande enregistrée', subtitle: 'Un technicien va analyser votre situation',
      eta: 'Délai de réponse estimé', etaTime: '< 30 minutes',
      whatsapp: 'Continuer sur WhatsApp', whatsappDesc: 'Pour un suivi en temps réel',
      pricing: 'Devis gratuit et sans engagement',
      pricingDesc: 'Nos tarifs sont fixes et communiqués avant intervention'
    },
    nav: { back: 'Retour', next: 'Continuer' },
    errors: { required: 'Requis', invalidPostal: 'Code postal invalide', invalidPhone: 'Téléphone invalide' },
    loading: 'Envoi en cours...'
  },
  nl: {
    header: { title: 'Interventie aanvragen', time: 'Ongeveer 2 minuten' },
    steps: ['Ongedierte', 'Urgentie', 'Locatie', 'Situatie', 'Contact', 'Bevestiging'],
    step1: {
      title: 'Welk ongedierte moeten we behandelen?',
      subtitle: 'Selecteer de juiste categorie',
      pests: [
        { id: 'wasps', label: 'Wespen' }, { id: 'hornets', label: 'Horzels' },
        { id: 'rats', label: 'Ratten' }, { id: 'mice', label: 'Muizen' },
        { id: 'cockroaches', label: 'Kakkerlakken' }, { id: 'bedbugs', label: 'Bedwantsen' },
        { id: 'ants', label: 'Mieren' }, { id: 'fleas', label: 'Vlooien' },
        { id: 'pigeons', label: 'Duiven' }, { id: 'other', label: 'Andere' }
      ]
    },
    step2: {
      title: 'Hoe dringend is het?',
      subtitle: 'Dit helpt ons de interventie te plannen',
      options: [
        { id: 'immediate', label: 'Onmiddellijk', desc: 'Gevaarlijke situatie', badge: 'Prioritair' },
        { id: 'today', label: 'Vandaag', desc: 'Interventie gewenst vandaag', badge: null },
        { id: '48h', label: 'Binnen 48u', desc: 'Beschikbaar voor afspraak', badge: null },
        { id: 'week', label: 'Deze week', desc: 'Flexibele planning', badge: null }
      ]
    },
    step3: {
      title: 'Waar moeten we komen?',
      subtitle: 'Adres van de interventie',
      postal: 'Postcode', city: 'Gemeente', housing: 'Type pand',
      types: [
        { id: 'house', label: 'Woning' }, { id: 'apartment', label: 'Appartement' },
        { id: 'business', label: 'Kantoor' }, { id: 'warehouse', label: 'Magazijn' },
        { id: 'restaurant', label: 'Horeca' }, { id: 'other', label: 'Andere' }
      ]
    },
    step4: {
      title: 'Beschrijf de situatie',
      subtitle: 'Meer details = efficiëntere interventie',
      placeholder: 'Beschrijf wat u waarneemt: waar, hoe lang al, ernst van het probleem...',
      photos: "Foto's (optioneel)", maxPhotos: "Max 4 foto's"
    },
    step5: {
      title: 'Hoe kunnen we u bereiken?',
      subtitle: 'WhatsApp is ons snelste kanaal',
      recommended: 'Aanbevolen - Antwoord < 15 min',
      phone: 'Telefoonnummer', phoneNote: 'Enkel voor SMS-bevestiging'
    },
    step6: {
      title: 'Laatste stap', subtitle: 'Controleer uw gegevens',
      name: 'Uw naam',
      consent: 'Ik ga akkoord om gecontacteerd te worden door Interventia. Mijn gegevens worden niet gedeeld.',
      submit: 'Aanvraag verzenden'
    },
    success: {
      title: 'Aanvraag geregistreerd', subtitle: 'Een technicus gaat uw situatie analyseren',
      eta: 'Geschatte reactietijd', etaTime: '< 30 minuten',
      whatsapp: 'Verder op WhatsApp', whatsappDesc: 'Voor real-time opvolging',
      pricing: 'Gratis offerte zonder verplichting',
      pricingDesc: 'Onze tarieven zijn vast en worden meegedeeld vóór de interventie'
    },
    nav: { back: 'Terug', next: 'Verder' },
    errors: { required: 'Verplicht', invalidPostal: 'Ongeldige postcode', invalidPhone: 'Ongeldig nummer' },
    loading: 'Verzenden...'
  }
};

const PestIcon = ({ type, selected }: { type: string; selected: boolean }) => {
  const cls = `w-10 h-10 transition-all duration-300 ${selected ? 'text-white drop-shadow-md' : 'text-slate-700 group-hover:text-slate-900'}`;
  const icons: Record<string, JSX.Element> = {
    wasps: <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="14" rx="5" ry="7"/><ellipse cx="12" cy="6" rx="3" ry="2.5"/><path d="M7 14h10M7 16h10" strokeWidth="1.5"/><path d="M9 3.5c-1.5-2-3-2.5-4-2M15 3.5c1.5-2 3-2.5 4-2" strokeWidth="1.5"/><path d="M7 10l-3 2M17 10l3 2" strokeWidth="2"/></svg>,
    hornets: <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="14" rx="6" ry="8"/><ellipse cx="12" cy="5" rx="3.5" ry="3"/><path d="M6 13h12M6 15h12M6 17h12" strokeWidth="1.5"/><path d="M8.5 2c-2-1.5-3.5-1.5-4.5-.5M15.5 2c2-1.5 3.5-1.5 4.5-.5" strokeWidth="1.5"/><path d="M6 10l-4 3M18 10l4 3" strokeWidth="2"/></svg>,
    rats: <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="10" cy="14" rx="7" ry="5"/><circle cx="5" cy="12" r="3"/><path d="M3 9c-1-2-.5-4 1-5M7 9c1-2 2-3 3-2.5" strokeWidth="1.5"/><circle cx="4" cy="11.5" r="1" fill="currentColor"/><path d="M17 14q6 0 6 4" strokeWidth="2.5"/></svg>,
    mice: <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="11" cy="14" rx="6" ry="4"/><circle cx="6" cy="13" r="2.5"/><path d="M4 10.5c-.5-1.5 0-3 1.5-3.5M8 10.5c.5-1.5 1-2.5 2-2" strokeWidth="1.5"/><circle cx="5" cy="12.5" r=".8" fill="currentColor"/><path d="M17 14q5 0 5 3" strokeWidth="2.5"/></svg>,
    cockroaches: <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="15" rx="4" ry="6"/><ellipse cx="12" cy="7" rx="2.5" ry="2"/><path d="M10 3l-2-2M14 3l2-2" strokeWidth="1.5"/><path d="M8 11l-4-1M16 11l4-1" strokeWidth="1.5"/><path d="M8 15l-5 2M16 15l5 2" strokeWidth="1.5"/><path d="M9 19l-2 3M15 19l2 3" strokeWidth="1.5"/></svg>,
    bedbugs: <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="14" rx="5" ry="6"/><ellipse cx="12" cy="7" rx="2" ry="1.5"/><path d="M7 12l-3-.5M17 12l3-.5" strokeWidth="1.5"/><path d="M7 15l-4 1M17 15l4 1" strokeWidth="1.5"/><path d="M8 18l-2 2M16 18l2 2" strokeWidth="1.5"/><path d="M7 14h10M7 16h10" strokeWidth="1" opacity="0.5"/></svg>,
    ants: <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="17" r="3"/><circle cx="12" cy="11" r="2"/><circle cx="12" cy="6" r="1.5"/><path d="M10 4l-1.5-3M14 4l1.5-3" strokeWidth="1.5"/><path d="M9 10l-4-2M15 10l4-2" strokeWidth="1.5"/><path d="M9 17l-3 3M15 17l3 3" strokeWidth="1.5"/><path d="M10 14l-4 .5M14 14l4 .5" strokeWidth="1.5"/></svg>,
    fleas: <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="12" rx="3" ry="5"/><circle cx="12" cy="6" r="2"/><path d="M9 15c-2 4-1 6 .5 7M15 15c2 4 1 6-.5 7" strokeWidth="2.5"/><path d="M10 4l-1-2M14 4l1-2" strokeWidth="1.5"/></svg>,
    pigeons: <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="14" cy="14" rx="6" ry="5"/><circle cx="7" cy="10" r="3"/><path d="M5 11l-1 1" strokeWidth="1.5"/><circle cx="6" cy="9" r="1" fill="currentColor"/><path d="M20 15l3 2l-1 .5l-2-1.5" strokeWidth="1.5"/><path d="M10 18l-1 4M14 18l0 4M18 17l2 3" strokeWidth="1.5"/></svg>,
    other: <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="7"/><path d="M12 8v2M12 14v2" strokeWidth="2.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>
  };
  return icons[type] || icons.other;
};

function Progress({ step, total, lang }: { step: number; total: number; lang: 'fr' | 'nl' }) {
  const percentage = ((step + 1) / total) * 100;
  return (
    <div className="mb-10">
      {/* Minimal step indicator */}
      <div className="flex items-center justify-center gap-3 mb-6">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="relative">
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
              i < step ? 'bg-emerald-500 scale-100' : 
              i === step ? 'bg-slate-900 scale-125' : 
              'bg-slate-200 scale-100'
            }`} />
            {i === step && (
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-slate-900/30 animate-pulseRing" />
            )}
          </div>
        ))}
      </div>
      
      {/* Premium progress bar */}
      <div className="relative h-1 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full transition-all duration-700"
          style={{ width: `${percentage}%`, animation: 'shimmer 2s infinite' }}
        />
      </div>
      
      {/* Step counter */}
      <div className="flex justify-center mt-4">
        <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">
          {lang === 'fr' ? 'Étape' : 'Stap'} {step + 1} / {total}
        </span>
      </div>
    </div>
  );
}

function Step1({ data, setData, onNext, lang }: { data: OnboardingData; setData: (d: OnboardingData) => void; onNext: () => void; lang: 'fr' | 'nl' }) {
  const tr = t[lang].step1;
  const select = (id: string) => { setData({ ...data, pest_category: id }); setTimeout(onNext, 250); };
  return (
    <div className="animate-slideUpSpring">
      {/* Minimal header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">{tr.title}</h2>
        <p className="text-base sm:text-lg text-slate-500 font-medium">{tr.subtitle}</p>
      </div>
      
      {/* Premium grid - 2 columns mobile, 5 desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-5">
        {tr.pests.map((p, idx) => (
          <button 
            key={p.id} 
            onClick={() => select(p.id)}
            style={{ animationDelay: `${idx * 50}ms` }}
            className={`group relative p-6 sm:p-5 rounded-2xl border-2 transition-all duration-300 touch-feedback card-premium opacity-0 animate-fadeInUp ${
              data.pest_category === p.id 
                ? 'border-slate-900 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl shadow-slate-900/30 scale-[1.02]' 
                : 'border-slate-200 bg-white hover:border-slate-300 shadow-lg shadow-slate-200/50'}`}
          >
            {/* Icon container */}
            <div className={`w-16 h-16 sm:w-14 sm:h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              data.pest_category === p.id 
                ? 'bg-white/20 scale-110 rotate-3' 
                : 'bg-gradient-to-br from-slate-50 to-slate-100 group-hover:from-slate-100 group-hover:to-slate-200 group-hover:scale-110 group-hover:-rotate-2'}`}
            >
              <PestIcon type={p.id} selected={data.pest_category === p.id} />
            </div>
            
            {/* Label */}
            <span className={`block text-sm sm:text-xs font-bold tracking-wide transition-all duration-300 ${
              data.pest_category === p.id 
                ? 'text-white' 
                : 'text-slate-700 group-hover:text-slate-900'}`}
            >
              {p.label}
            </span>
            
            {/* Selection indicator */}
            {data.pest_category === p.id && (
              <div className="absolute -top-1.5 -right-1.5">
                <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 animate-scaleIn">
                  <Check className="w-4 h-4 text-white stroke-[3]" />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function Step2({ data, setData, onNext, onBack, lang }: { data: OnboardingData; setData: (d: OnboardingData) => void; onNext: () => void; onBack: () => void; lang: 'fr' | 'nl' }) {
  const tr = t[lang].step2; const nav = t[lang].nav;
  const select = (id: string) => { setData({ ...data, urgency: id }); setTimeout(onNext, 250); };
  
  const getUrgencyColors = (id: string, selected: boolean) => {
    if (selected) return 'border-slate-900 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl shadow-slate-900/20';
    if (id === 'immediate') return 'border-red-200 bg-gradient-to-br from-red-50 to-orange-50 hover:border-red-300 hover:shadow-xl';
    return 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xl';
  };
  
  const getIconBg = (id: string, selected: boolean) => {
    if (selected) return 'bg-white/20 text-white';
    if (id === 'immediate') return 'bg-gradient-to-br from-red-400 to-orange-500 text-white shadow-lg shadow-red-500/30';
    if (id === 'today') return 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-500/30';
    if (id === '48h') return 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-lg shadow-blue-500/30';
    return 'bg-gradient-to-br from-slate-400 to-slate-500 text-white shadow-lg shadow-slate-500/30';
  };
  
  return (
    <div className="animate-slideUpSpring">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">{tr.title}</h2>
        <p className="text-base sm:text-lg text-slate-500 font-medium">{tr.subtitle}</p>
      </div>
      
      <div className="space-y-4 max-w-lg mx-auto">
        {tr.options.map((o, idx) => (
          <button 
            key={o.id} 
            onClick={() => select(o.id)}
            style={{ animationDelay: `${idx * 80}ms` }}
            className={`group w-full p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 flex items-center gap-5 touch-feedback card-premium opacity-0 animate-fadeInUp ${getUrgencyColors(o.id, data.urgency === o.id)}`}
          >
            {/* Icon */}
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 font-black text-lg transition-all duration-300 ${getIconBg(o.id, data.urgency === o.id)} ${data.urgency === o.id ? 'scale-110 rotate-3' : 'group-hover:scale-110 group-hover:-rotate-2'}`}>
              {o.id === 'immediate' ? <AlertCircle className="w-7 h-7" /> : o.id === 'today' ? <Clock className="w-7 h-7" /> : o.id === '48h' ? '48h' : '7j'}
            </div>
            
            {/* Content */}
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-lg font-bold transition-colors ${data.urgency === o.id ? 'text-white' : 'text-slate-800'}`}>{o.label}</span>
                {o.badge && (
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full shadow-sm transition-all ${
                    data.urgency === o.id 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gradient-to-r from-amber-400 to-orange-400 text-white animate-subtleBounce'}`}
                  >
                    {o.badge}
                  </span>
                )}
              </div>
              <p className={`text-sm mt-1.5 transition-colors ${data.urgency === o.id ? 'text-slate-300' : 'text-slate-500'}`}>{o.desc}</p>
            </div>
            
            {/* Selection indicator */}
            {data.urgency === o.id && (
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 animate-scaleIn">
                <Check className="w-5 h-5 text-white stroke-[3]" />
              </div>
            )}
          </button>
        ))}
      </div>
      
      {/* Back button */}
      <div className="mt-10 flex justify-center">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 px-5 py-3 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-semibold transition-all"
        >
          <ArrowLeft className="w-5 h-5" />{nav.back}
        </button>
      </div>
    </div>
  );
}

function Step3({ data, setData, onNext, onBack, lang }: { data: OnboardingData; setData: (d: OnboardingData) => void; onNext: () => void; onBack: () => void; lang: 'fr' | 'nl' }) {
  const tr = t[lang].step3; const nav = t[lang].nav; const err = t[lang].errors;
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{postal: string; city: string}>>([]);
  
  const fetchLocation = async (postal: string) => {
    if (postal.length !== 4) return;
    setLoading(true);
    try {
      const res = await fetch(`https://api.bpost.be/services/shm/1.0/autocomplete/localities?postalCode=${postal}`);
      if (res.ok) {
        const json = await res.json();
        if (json.localities && json.localities.length > 0) {
          const city = json.localities[0].name;
          setData({ ...data, postal_code: postal, city });
          setSuggestions([]);
        }
      } else {
        const altRes = await fetch(`https://geo6.be/api/geocode/postal/${postal}`);
        if (altRes.ok) {
          const altJson = await altRes.json();
          if (altJson.results && altJson.results.length > 0) {
            const city = altJson.results[0].name;
            setData({ ...data, postal_code: postal, city });
          }
        }
      }
    } catch (e) {
      console.error('Location fetch failed:', e);
    }
    setLoading(false);
  };
  
  const handlePostalChange = (value: string) => {
    const postal = value.replace(/\D/g, '').slice(0, 4);
    setData({ ...data, postal_code: postal });
    if (postal.length === 4) {
      fetchLocation(postal);
    }
  };
  
  const validate = () => {
    if (!data.postal_code || data.postal_code.length < 4) { setError(err.invalidPostal); return; }
    if (!data.housing_type) { setError(err.required); return; }
    onNext();
  };
  return (
    <div className="animate-fadeInUp">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{tr.title}</h2>
        <p className="text-base text-slate-600">{tr.subtitle}</p>
      </div>
      <div className="max-w-lg mx-auto space-y-6">
        <div className="p-6 bg-gradient-to-br from-slate-50 to-white rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{lang === 'fr' ? 'Adresse' : 'Adres'}</h3>
              <p className="text-xs text-slate-500">{lang === 'fr' ? 'Détection automatique' : 'Automatische detectie'}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{tr.postal}</label>
              <div className="relative">
                <input type="text" value={data.postal_code} onChange={(e) => handlePostalChange(e.target.value)}
                  placeholder="1000" maxLength={4} 
                  className="w-full px-4 py-3.5 text-lg font-semibold border-2 border-slate-300 rounded-xl focus:border-slate-700 focus:ring-4 focus:ring-slate-700/10 outline-none transition-all" />
                {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />}
                {data.postal_code.length === 4 && !loading && data.city && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{tr.city}</label>
              <div className="relative">
                <input type="text" value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })}
                  placeholder="Bruxelles" 
                  className={`w-full px-4 py-3.5 text-lg border-2 rounded-xl focus:border-slate-700 focus:ring-4 focus:ring-slate-700/10 outline-none transition-all ${
                    data.city ? 'border-green-300 bg-green-50/30' : 'border-slate-300'}`} />
              </div>
              {data.city && <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />{lang === 'fr' ? 'Localisation confirmée' : 'Locatie bevestigd'}</p>}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">{tr.housing}</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {tr.types.map((tp) => (
              <button key={tp.id} onClick={() => setData({ ...data, housing_type: tp.id })}
                className={`group relative py-4 px-4 rounded-xl text-sm font-bold transition-all duration-300 border-2 ${
                  data.housing_type === tp.id 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/40 scale-105' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 hover:scale-105 hover:shadow-lg'}`}>
                {tp.label}
                {data.housing_type === tp.id && <CheckCircle2 className="absolute -top-2 -right-2 w-5 h-5 text-amber-400 bg-white rounded-full drop-shadow-lg" />}
              </button>
            ))}
          </div>
        </div>
        {error && <div className="flex items-center gap-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}
      </div>
      <div className="mt-8 flex justify-between max-w-lg mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 font-semibold transition-colors"><ArrowLeft className="w-4 h-4" />{nav.back}</button>
        <button onClick={validate} disabled={!data.postal_code || !data.housing_type}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base transition-all duration-300 shadow-xl ${
            data.postal_code && data.housing_type
              ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:from-slate-800 hover:to-slate-900 hover:scale-105 hover:shadow-2xl'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}>
          {nav.next}<ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function Step4({ data, setData, onNext, onBack, lang }: { data: OnboardingData; setData: (d: OnboardingData) => void; onNext: () => void; onBack: () => void; lang: 'fr' | 'nl' }) {
  const tr = t[lang].step4; const nav = t[lang].nav;
  const fileRef = useRef<HTMLInputElement>(null);
  const handlePhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return;
    const newFiles = Array.from(files).slice(0, 4 - data.photos.length);
    const newPhotos = [...data.photos, ...newFiles];
    const newPhotoUrls = [...data.photo_urls];
    
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          newPhotoUrls.push(ev.target.result as string);
          setData({ ...data, photo_urls: newPhotoUrls, photos: newPhotos });
        }
      };
      reader.readAsDataURL(file);
    });
  };
  const removePhoto = (i: number) => setData({ 
    ...data, 
    photo_urls: data.photo_urls.filter((_, idx) => idx !== i),
    photos: data.photos.filter((_, idx) => idx !== i)
  });
  return (
    <div className="animate-fadeInUp">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{tr.title}</h2>
        <p className="text-base text-slate-600">{tr.subtitle}</p>
      </div>
      <div className="max-w-lg mx-auto space-y-5">
        <textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })}
          placeholder={tr.placeholder} rows={5} className="w-full px-4 py-4 text-base leading-relaxed border-2 border-slate-300 rounded-xl focus:border-slate-700 focus:ring-4 focus:ring-slate-700/10 outline-none resize-none transition-all" />
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">{tr.photos}</label>
            <span className="text-xs text-slate-400">{tr.maxPhotos}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {data.photo_urls.map((url, i) => (
              <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-slate-200">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-4 h-4 bg-slate-800/80 rounded-full flex items-center justify-center text-white"><X className="w-2.5 h-2.5" /></button>
              </div>
            ))}
            {data.photo_urls.length < 4 && (
              <button onClick={() => fileRef.current?.click()} className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-slate-400">
                <Camera className="w-5 h-5" />
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handlePhoto} className="hidden" />
        </div>
      </div>
      <div className="mt-8 flex justify-between max-w-lg mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 font-semibold transition-colors"><ArrowLeft className="w-4 h-4" />{nav.back}</button>
        <button onClick={onNext} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300">{nav.next}<ArrowRight className="w-5 h-5" /></button>
      </div>
    </div>
  );
}

function Step5({ data, setData, onNext, onBack, lang }: { data: OnboardingData; setData: (d: OnboardingData) => void; onNext: () => void; onBack: () => void; lang: 'fr' | 'nl' }) {
  const tr = t[lang].step5; const nav = t[lang].nav; const err = t[lang].errors;
  const [error, setError] = useState('');
  const [phoneStatus, setPhoneStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  
  const handlePhoneChange = (value: string) => {
    // Allow typing with spaces/dashes for UX
    const cleaned = value.replace(/[^\d\s\-+]/g, '');
    setData({ ...data, phone: cleaned });
    
    // Real-time validation feedback
    const digits = cleaned.replace(/\D/g, '');
    if (digits.length >= 9) {
      const result = normalizeBelgianPhone(cleaned);
      if (result.valid) {
        setPhoneStatus('valid');
        setData({ ...data, phone: result.display, phone_normalized: result.normalized });
        setError('');
      } else {
        setPhoneStatus('invalid');
      }
    } else if (digits.length > 0) {
      setPhoneStatus('idle');
    } else {
      setPhoneStatus('idle');
    }
  };
  
  const validate = () => {
    const result = normalizeBelgianPhone(data.phone);
    if (!result.valid) {
      setError(err.invalidPhone);
      setPhoneStatus('invalid');
      return;
    }
    setData({ ...data, phone: result.display, phone_normalized: result.normalized });
    onNext();
  };
  
  return (
    <div className="animate-fadeInUp">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{tr.title}</h2>
        <p className="text-base text-slate-600">{tr.subtitle}</p>
      </div>
      <div className="max-w-lg mx-auto space-y-5">
        <button onClick={() => setData({ ...data, contact_method: 'whatsapp' })}
          className={`group w-full p-5 rounded-xl border-2 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] ${
            data.contact_method === 'whatsapp' 
              ? 'border-[#25D366] bg-gradient-to-r from-[#25D366]/10 to-[#25D366]/5 shadow-xl shadow-[#25D366]/20' 
              : 'border-slate-300 bg-white hover:border-[#25D366]/50 hover:shadow-lg'}`}>
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
            data.contact_method === 'whatsapp' 
              ? 'bg-[#25D366] text-white shadow-lg scale-110' 
              : 'bg-slate-100 text-slate-500 group-hover:bg-[#25D366]/10 group-hover:text-[#25D366]'}`}>
            <MessageCircle className="w-7 h-7" />
          </div>
          <div className="flex-1 text-left">
            <span className="font-bold text-slate-900 text-lg">WhatsApp</span>
            <span className="text-sm text-[#25D366] font-semibold block mt-0.5">{tr.recommended}</span>
          </div>
          {data.contact_method === 'whatsapp' && <CheckCircle2 className="w-6 h-6 text-[#25D366] animate-scaleIn" />}
        </button>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">{tr.phone}</label>
          <div className="relative">
            <input 
              type="tel" 
              value={data.phone} 
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="0470 12 34 56" 
              autoComplete="tel"
              aria-label={tr.phone}
              aria-invalid={phoneStatus === 'invalid'}
              className={`w-full px-4 py-3 text-base border-2 rounded-xl focus:ring-4 outline-none transition-all ${
                phoneStatus === 'valid' 
                  ? 'border-green-400 bg-green-50/30 focus:border-green-500 focus:ring-green-500/10' 
                  : phoneStatus === 'invalid'
                  ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-red-500/10'
                  : 'border-slate-300 focus:border-slate-700 focus:ring-slate-700/10'}`} 
            />
            {phoneStatus === 'valid' && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
            {phoneStatus === 'invalid' && (
              <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
            )}
          </div>
          {phoneStatus === 'valid' && (
            <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {lang === 'fr' ? 'Numéro belge valide' : 'Geldig Belgisch nummer'}
            </p>
          )}
          {phoneStatus !== 'valid' && (
            <p className="text-xs text-slate-400 mt-1">{tr.phoneNote}</p>
          )}
        </div>
        {error && <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg"><AlertCircle className="w-4 h-4" />{error}</div>}
      </div>
      <div className="mt-8 flex justify-between max-w-lg mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 font-semibold transition-colors"><ArrowLeft className="w-4 h-4" />{nav.back}</button>
        <button onClick={validate} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300">{nav.next}<ArrowRight className="w-5 h-5" /></button>
      </div>
    </div>
  );
}

function Step6({ data, setData, onSubmit, onBack, lang, loading }: { data: OnboardingData; setData: (d: OnboardingData) => void; onSubmit: () => void; onBack: () => void; lang: 'fr' | 'nl'; loading: boolean }) {
  const tr = t[lang].step6; const nav = t[lang].nav; const err = t[lang].errors;
  const [error, setError] = useState('');
  const validate = () => { if (!data.name || data.name.length < 2) { setError(err.required); return; } if (!data.consent) { setError(err.required); return; } onSubmit(); };
  return (
    <div className="animate-fadeInUp">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{tr.title}</h2>
        <p className="text-base text-slate-600">{tr.subtitle}</p>
      </div>
      <div className="max-w-lg mx-auto space-y-6">
        <div className="p-6 bg-gradient-to-br from-slate-50 to-white rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{lang === 'fr' ? 'Vos informations' : 'Uw gegevens'}</h3>
              <p className="text-xs text-slate-500">{lang === 'fr' ? 'Dernière étape' : 'Laatste stap'}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Honeypot field - hidden from humans, bots will fill it */}
            <div className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input 
                type="text" 
                id="website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={data.honeypot} 
                onChange={(e) => setData({ ...data, honeypot: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{tr.name}</label>
              <input type="text" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder={lang === 'fr' ? 'Nom complet' : 'Volledige naam'}
                autoComplete="name"
                aria-label={tr.name}
                className={`w-full px-4 py-3.5 text-lg border-2 rounded-xl focus:border-slate-700 focus:ring-4 focus:ring-slate-700/10 outline-none transition-all ${
                  data.name ? 'border-green-300 bg-green-50/30' : 'border-slate-300'}`} />
              {data.name && data.name.length >= 2 && <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />{lang === 'fr' ? 'Nom valide' : 'Naam geldig'}</p>}
            </div>
            
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input type="checkbox" checked={data.consent} onChange={(e) => setData({ ...data, consent: e.target.checked })}
                    className="w-5 h-5 rounded border-2 border-slate-300 text-slate-900 focus:ring-slate-700 focus:ring-offset-0 cursor-pointer transition-all" />
                  {data.consent && <CheckCircle2 className="absolute -top-1 -right-1 w-4 h-4 text-green-500 pointer-events-none" />}
                </div>
                <span className="text-sm text-slate-700 leading-relaxed group-hover:text-slate-900 transition-colors">{tr.consent}</span>
              </label>
            </div>
          </div>
        </div>
        
        {error && <div className="flex items-center gap-2 text-red-600 text-sm font-semibold bg-red-50 px-4 py-3 rounded-xl border border-red-200"><AlertCircle className="w-5 h-5" />{error}</div>}
        
        <button onClick={validate} disabled={loading || !data.name || !data.consent}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-xl ${
            loading 
              ? 'bg-slate-400 cursor-not-allowed' 
              : data.name && data.consent
                ? 'bg-slate-900 hover:bg-slate-800 hover:scale-[1.02] hover:shadow-2xl'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'} text-white`}>
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t[lang].loading}</>
          ) : (
            <><Check className="w-6 h-6" />{tr.submit}<ArrowRight className="w-5 h-5" /></>
          )}
        </button>
      </div>
      <div className="mt-6 flex justify-center">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 font-semibold transition-colors"><ArrowLeft className="w-4 h-4" />{nav.back}</button>
      </div>
    </div>
  );
}

function Success({ data, lang, leadId }: { data: OnboardingData; lang: 'fr' | 'nl'; leadId?: string }) {
  const tr = t[lang].success;
  
  // This component is now only shown as fallback if redirect fails
  const openWhatsApp = () => {
    const urgencyText = data.urgency === 'IMMEDIATE' 
      ? (lang === 'fr' ? 'URGENT' : 'DRINGEND')
      : data.urgency === '48H'
      ? (lang === 'fr' ? 'dans 48h' : 'binnen 48u')
      : (lang === 'fr' ? 'inspection souhaitée' : 'inspectie gewenst');
    
    const msg = lang === 'fr'
      ? `Bonjour, je viens de soumettre une demande (ID: ${leadId?.slice(0, 8)}).\n\nProblème: ${data.pest_detail}\nLocalisation: ${data.postal_code} ${data.city}\nUrgence: ${urgencyText}\n\nMerci de me recontacter rapidement.`
      : `Hallo, ik heb zojuist een aanvraag ingediend (ID: ${leadId?.slice(0, 8)}).\n\nProbleem: ${data.pest_detail}\nLocatie: ${data.postal_code} ${data.city}\nUrgentie: ${urgencyText}\n\nGraag snel contact.`;
    
    window.location.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  };
  return (
    <div className="animate-scaleIn text-center py-6">
      <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
        <Check className="w-10 h-10 text-white" strokeWidth={3} />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-2">{tr.title}</h2>
      <p className="text-base text-slate-600 mb-8">{tr.subtitle}</p>
      {leadId && (
        <div className="max-w-sm mx-auto mb-4 p-3 bg-slate-100 rounded-lg border border-slate-300">
          <p className="text-xs text-slate-500 mb-1">{lang === 'fr' ? 'Référence' : 'Referentie'}</p>
          <p className="font-mono text-sm font-bold text-slate-800">{leadId}</p>
        </div>
      )}
      <div className="max-w-sm mx-auto space-y-4 mb-8">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-sm text-slate-500 mb-1">{tr.eta}</div>
          <div className="text-2xl font-bold text-slate-800">{tr.etaTime}</div>
        </div>
        <button onClick={openWhatsApp}
          className="w-full py-4 bg-gradient-to-r from-[#25D366] to-[#20BD5A] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 shadow-xl shadow-[#25D366]/30">
          <MessageCircle className="w-6 h-6" />{tr.whatsapp}
        </button>
        <p className="text-sm text-[#25D366]">{tr.whatsappDesc}</p>
      </div>
      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 max-w-sm mx-auto">
        <div className="font-semibold text-amber-800 mb-1">{tr.pricing}</div>
        <p className="text-sm text-amber-700">{tr.pricingDesc}</p>
      </div>
    </div>
  );
}

export function Onboarding() {
  const { language, setLanguage } = useLanguage();
  const lang = language as 'fr' | 'nl';
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(() => ({
    ...initialData, 
    language,
    formStartTime: Date.now()
  }));
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string>('');
  const [leadId, setLeadId] = useState<string>('');
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const lastSubmitRef = useRef<number>(0);

  // Check for saved draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.step > 0) {
      setShowDraftBanner(true);
    }
  }, []);

  // Auto-save draft when data changes (debounced)
  useEffect(() => {
    if (step > 0 && !done) {
      const timeout = setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        saveDraft(data as any, step, language);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [data, step, language, done]);

  const restoreDraft = useCallback(() => {
    const draft = loadDraft();
    if (draft) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const savedData = draft.data as any;
      setData({ ...initialData, ...savedData, formStartTime: Date.now() });
      setStep(draft.step);
      setShowDraftBanner(false);
    }
  }, []);

  const discardDraft = useCallback(() => {
    clearDraft();
    setShowDraftBanner(false);
  }, []);

  const goHome = () => {
    if (step > 0 && !done) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      saveDraft(data as any, step, language);
    }
    window.location.hash = '';
  };

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    // Rate limit: prevent rapid resubmits (minimum 3 seconds between attempts)
    const now = Date.now();
    if (now - lastSubmitRef.current < 3000) {
      setError(lang === 'fr' ? 'Veuillez patienter...' : 'Even geduld...');
      return;
    }
    lastSubmitRef.current = now;
    setSubmitAttempts(prev => prev + 1);

    // Block after 5 rapid attempts
    if (submitAttempts >= 5) {
      setError(lang === 'fr' ? 'Trop de tentatives. Veuillez réessayer plus tard.' : 'Te veel pogingen. Probeer later opnieuw.');
      return;
    }

    // Client-side spam check
    const spamCheck = checkForSpam({
      description: data.description,
      name: data.name,
      phone: data.phone,
      startTime: data.formStartTime,
      honeypot: data.honeypot
    });

    if (spamCheck.isSpam) {
      console.warn('🚨 Spam detected:', spamCheck.reasons);
      // Silently fail for bots (don't give feedback)
      setDone(true);
      return;
    }

    console.log('🎯 SUBMIT FUNCTION CALLED');
    setLoading(true);
    setError('');
    
    try {
      const intakeData = mapOnboardingToIntake(data);
      const response = await submitIntake(intakeData);
      
      if (response.ok) {
        // Clear saved draft on successful submit
        clearDraft();
        
        const leadId = response.lead_id || '';
        setLeadId(leadId);
        
        // Instant WhatsApp redirect
        const urgencyText = data.urgency === 'immediate' 
          ? (lang === 'fr' ? 'URGENT' : 'DRINGEND')
          : data.urgency === '48h'
          ? (lang === 'fr' ? 'dans 48h' : 'binnen 48u')
          : (lang === 'fr' ? 'inspection souhaitée' : 'inspectie gewenst');
        
        const pestLabel = data.pest_category || 'nuisible';
        const msg = lang === 'fr'
          ? `Bonjour, je viens de soumettre une demande (ID: ${leadId.slice(0, 8)}).\n\nProblème: ${pestLabel}\nLocalisation: ${data.postal_code} ${data.city}\nUrgence: ${urgencyText}\n\nMerci de me recontacter rapidement.`
          : `Hallo, ik heb zojuist een aanvraag ingediend (ID: ${leadId.slice(0, 8)}).\n\nProbleem: ${pestLabel}\nLocatie: ${data.postal_code} ${data.city}\nUrgentie: ${urgencyText}\n\nGraag snel contact.`;
        
        const whatsappUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
        
        // Redirect immediately
        window.location.href = whatsappUrl;
      } else {
        throw new Error(response.error || 'Submission failed');
      }
    } catch (e) {
      console.error('Submission error:', e);
      const errorMsg = e instanceof Error ? e.message : 'Failed to submit. Please try again.';
      setError(errorMsg);
      
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-100/40 to-teal-100/40 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-white/80 to-transparent rounded-full" />
      </div>
      
      {/* Premium glassmorphism header */}
      <header className="w-full glass-premium border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={goHome}>
            <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <span className="font-black text-xl text-slate-900 tracking-tight hidden sm:block">Interventia</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={goHome}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-slate-800 hover:bg-white/60 rounded-xl transition-all text-sm font-medium"
              aria-label={lang === 'fr' ? 'Retour accueil' : 'Terug naar home'}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'fr' ? 'Accueil' : 'Home'}</span>
            </button>
            <div className="flex text-xs font-bold bg-white/60 rounded-xl p-1 shadow-sm">
              <button 
                onClick={() => setLanguage('fr')} 
                className={`px-3 py-2 rounded-lg transition-all duration-300 ${language === 'fr' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-800'}`}
              >FR</button>
              <button 
                onClick={() => setLanguage('nl')} 
                className={`px-3 py-2 rounded-lg transition-all duration-300 ${language === 'nl' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-800'}`}
              >NL</button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Draft restoration banner */}
      {showDraftBanner && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200/50 px-4 sm:px-6 py-3.5 animate-slideUpSpring relative z-40">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-amber-800">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-md shadow-amber-500/30">
                <RotateCcw className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold">
                {lang === 'fr' ? 'Demande non terminée' : 'Onafgewerkte aanvraag'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={restoreDraft}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all btn-premium"
              >
                {lang === 'fr' ? 'Reprendre' : 'Hervatten'}
              </button>
              <button 
                onClick={discardDraft}
                className="px-3 py-2 text-amber-700 text-sm font-medium hover:bg-amber-100/50 rounded-xl transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
      
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-10 relative z-10">
        <div className="w-full max-w-2xl">
          {!done ? (
            <>
              {/* Minimal header - removed, title is in steps now */}
              <Progress step={step} total={6} lang={lang} />
              
              {/* Premium card container */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/60 p-5 sm:p-10 border border-white/50 relative overflow-hidden">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-slate-50/50 pointer-events-none" />
                {step === 0 && <Step1 data={data} setData={setData} onNext={next} lang={lang} />}
                {step === 1 && <Step2 data={data} setData={setData} onNext={next} onBack={back} lang={lang} />}
                {step === 2 && <Step3 data={data} setData={setData} onNext={next} onBack={back} lang={lang} />}
                {step === 3 && <Step4 data={data} setData={setData} onNext={next} onBack={back} lang={lang} />}
                {step === 4 && <Step5 data={data} setData={setData} onNext={next} onBack={back} lang={lang} />}
                {step === 5 && <Step6 data={data} setData={setData} onSubmit={submit} onBack={back} lang={lang} loading={loading} />}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 border border-slate-100">
              <Success data={data} lang={lang} leadId={leadId} />
            </div>
          )}
          {error && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-md w-full mx-4 p-4 bg-red-600 text-white rounded-xl shadow-2xl flex items-center gap-3 animate-fadeInUp z-50">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-slate-400">
        © 2024 Interventia
      </footer>
    </div>
  );
}
