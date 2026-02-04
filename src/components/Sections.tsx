import { MessageCircle, ArrowRight, Clock, CheckCircle2, MapPin, Euro, Award } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { trackLead } from '../lib/supabase';

// Import shield images as ES modules (required for Vite production builds)
import rongeursImg from '../assets/shields/rongeurs.svg';
import insectesRampantsImg from '../assets/shields/insectes-rampants.svg';
import insectesVolantsImg from '../assets/shields/insectes-volants.svg';
import autresNuisiblesImg from '../assets/shields/autres-nuisibles.svg';

const WHATSAPP = '+32466274251';

// ============================================
// TRUST STRIP - Below Hero
// ============================================
export function TrustStrip() {
  const { language } = useLanguage();
  
  const items = [
    { icon: Clock, label: language === 'fr' ? 'Intervention 24-48h' : 'Interventie 24-48u', value: '24h', gradient: 'from-emerald-500 to-teal-500' },
    { icon: CheckCircle2, label: language === 'fr' ? 'Experts certifiés' : 'Gecertificeerde experts', value: '100%', gradient: 'from-amber-500 to-orange-500' },
    { icon: Euro, label: language === 'fr' ? 'Prix fixe' : 'Vaste prijs', value: '€', gradient: 'from-blue-500 to-indigo-500' },
    { icon: MapPin, label: language === 'fr' ? 'Toute la Belgique' : 'Heel België', value: 'BE', gradient: 'from-purple-500 to-pink-500' },
  ];

  return (
    <section className="relative bg-[#FAFAF8] py-12 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-transparent" />
      
      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {items.map((item, i) => (
            <div 
              key={i} 
              className="group relative bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-default overflow-hidden"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Gradient accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient}`} />
              
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <item.icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.value}</div>
                  <div className="text-sm font-semibold text-slate-800">{item.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// CATEGORIES - Premium card grid
// ============================================
export function Categories() {
  const { language } = useLanguage();

  const categories = [
    { 
      fr: { name: 'Rongeurs', sub: 'Rats, souris, mulots' },
      nl: { name: 'Knaagdieren', sub: 'Ratten, muizen' },
      image: rongeursImg,
      gradient: 'from-amber-500 to-orange-600',
      emoji: '🐀'
    },
    { 
      fr: { name: 'Insectes rampants', sub: 'Cafards, punaises, fourmis' },
      nl: { name: 'Kruipende insecten', sub: 'Kakkerlakken, bedwantsen' },
      image: insectesRampantsImg,
      gradient: 'from-red-500 to-rose-600',
      emoji: '🪳'
    },
    { 
      fr: { name: 'Insectes volants', sub: 'Guêpes, frelons, mouches' },
      nl: { name: 'Vliegende insecten', sub: 'Wespen, horzels, vliegen' },
      image: insectesVolantsImg,
      gradient: 'from-yellow-500 to-amber-600',
      emoji: '🐝'
    },
    { 
      fr: { name: 'Autres nuisibles', sub: 'Pigeons, taupes, etc.' },
      nl: { name: 'Andere ongedierte', sub: 'Duiven, mollen, enz.' },
      image: autresNuisiblesImg,
      gradient: 'from-slate-500 to-slate-700',
      emoji: '🐦'
    },
  ];

  return (
    <section className="relative bg-gradient-to-b from-[#FAFAF8] to-white py-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-full mb-4">
            {language === 'fr' ? 'NOS SPÉCIALITÉS' : 'ONZE SPECIALITEITEN'}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4">
            {language === 'fr' ? 'Quel nuisible ?' : 'Welk ongedierte?'}
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Cliquez sur votre problème pour une intervention ciblée'
              : 'Klik op uw probleem voor een gerichte interventie'}
          </p>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat, i) => (
            <button 
              key={i}
              onClick={() => window.location.href = '#onboarding'}
              className="group relative bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:scale-105 transition-all duration-500 overflow-hidden touch-feedback"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Image */}
              <div className="relative z-10 mb-4">
                <img 
                  src={cat.image} 
                  alt={language === 'fr' ? cat.fr.name : cat.nl.name}
                  className="w-full h-auto max-h-32 object-contain transition-transform duration-500 group-hover:scale-110 group-hover:drop-shadow-2xl"
                />
              </div>
              
              {/* Content */}
              <div className="relative z-10 text-center">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-white transition-colors duration-300 mb-1">
                  {language === 'fr' ? cat.fr.name : cat.nl.name}
                </h3>
                <p className="text-sm text-slate-500 group-hover:text-white/80 transition-colors duration-300">
                  {language === 'fr' ? cat.fr.sub : cat.nl.sub}
                </p>
              </div>
              
              {/* Arrow indicator */}
              <div className="absolute bottom-4 right-4 w-10 h-10 bg-slate-100 group-hover:bg-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-white" />
              </div>
            </button>
          ))}
        </div>
        
        {/* CTA below */}
        <div className="text-center mt-12">
          <button
            onClick={() => window.location.href = '#onboarding'}
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 hover:scale-105 transition-all duration-300 shadow-xl shadow-slate-900/20"
          >
            <span>{language === 'fr' ? 'Autre problème ?' : 'Ander probleem?'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

// ============================================
// SERVICES GRID
// ============================================
export function Services() {
  const { language } = useLanguage();

  const services = [
    { 
      icon: () => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M11 8v6M8 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      fr: { title: 'Diagnostic rapide', desc: 'Identification précise du problème' },
      nl: { title: 'Snelle diagnose', desc: 'Nauwkeurige identificatie van het probleem' }
    },
    { 
      icon: () => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      fr: { title: 'Traitement ciblé', desc: 'Solutions adaptées à chaque situation' },
      nl: { title: 'Gerichte behandeling', desc: 'Oplossingen aangepast aan elke situatie' }
    },
    { 
      icon: () => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      fr: { title: 'Prévention durable', desc: 'Protection à long terme garantie' },
      nl: { title: 'Duurzame preventie', desc: 'Langdurige bescherming gegarandeerd' }
    },
    { 
      icon: () => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      fr: { title: 'Urgences 7j/7', desc: 'Disponibilité permanente' },
      nl: { title: 'Noodgevallen 7/7', desc: 'Permanente beschikbaarheid' }
    },
    { 
      icon: () => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M3 9h18M9 3v18" stroke="currentColor" strokeWidth="2"/>
          <circle cx="15" cy="15" r="2" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ),
      fr: { title: 'Contrats entreprise', desc: 'Solutions sur mesure pour pros' },
      nl: { title: 'Bedrijfscontracten', desc: 'Op maat gemaakte oplossingen' }
    },
    { 
      icon: () => (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      fr: { title: 'Conseils experts', desc: 'Accompagnement personnalisé' },
      nl: { title: 'Deskundig advies', desc: 'Persoonlijke begeleiding' }
    },
  ];

  return (
    <section className="relative bg-[#FAFAF8] py-20">
      {/* Blueprint grid background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="servicesGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="#475569"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#servicesGrid)" />
        </svg>
      </div>

      <div className="relative w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section title */}
        <div className="text-center mb-16">
          <h2 className="text-slate-900 font-bold tracking-tight mb-4" style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)'
          }}>
            {language === 'fr' ? 'Nos services' : 'Onze diensten'}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Une gamme complète de services pour répondre à tous vos besoins.'
              : 'Een compleet gamma diensten om aan al uw behoeften te voldoen.'}
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <div 
              key={i} 
              className="bg-white border border-slate-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300 group rounded-xl hover:scale-[1.02]"
            >
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 group-hover:from-emerald-50 group-hover:to-emerald-100/50 p-3 transition-all duration-300 rounded-xl shadow-inner">
                  <div className="w-6 h-6 text-slate-600 group-hover:text-emerald-600 transition-colors duration-300">
                    <service.icon />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {language === 'fr' ? service.fr.title : service.nl.title}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {language === 'fr' ? service.fr.desc : service.nl.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// HOW IT WORKS - Timeline
// ============================================
export function HowItWorks() {
  const { language } = useLanguage();

  const steps = [
    { 
      num: 1,
      fr: { title: 'Contactez-nous', desc: 'Via WhatsApp ou formulaire' },
      nl: { title: 'Contacteer ons', desc: 'Via WhatsApp of formulier' }
    },
    { 
      num: 2,
      fr: { title: 'Décrivez le problème', desc: 'Photos et détails' },
      nl: { title: 'Beschrijf het probleem', desc: 'Foto\'s en details' }
    },
    { 
      num: 3,
      fr: { title: 'Recevez un devis', desc: 'Prix fixe transparent' },
      nl: { title: 'Ontvang een offerte', desc: 'Transparante vaste prijs' }
    },
    { 
      num: 4,
      fr: { title: 'Intervention rapide', desc: 'Sous 24-48 heures' },
      nl: { title: 'Snelle interventie', desc: 'Binnen 24-48 uur' }
    },
  ];

  return (
    <section className="relative bg-[#F5F3EF] py-20">
      <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section title */}
        <div className="text-center mb-16">
          <h2 className="text-slate-900 font-bold tracking-tight mb-4" style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)'
          }}>
            {language === 'fr' ? 'Comment ça fonctionne' : 'Hoe het werkt'}
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connection line - desktop */}
          <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-slate-200">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/50 via-emerald-500/30 to-emerald-500/50"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                {/* Number circle */}
                <div className="relative z-10 w-16 h-16 bg-white border-2 border-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110">
                  <span className="text-xl font-bold text-emerald-600">{step.num}</span>
                </div>
                
                {/* Content */}
                <h3 className="font-semibold text-slate-900 mb-2">
                  {language === 'fr' ? step.fr.title : step.nl.title}
                </h3>
                <p className="text-sm text-slate-500">
                  {language === 'fr' ? step.fr.desc : step.nl.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// WHY INTERVENTIA
// ============================================
export function WhyInterventia() {
  const { language } = useLanguage();

  const handleWhatsApp = () => {
    trackLead({
      language,
      pestType: null,
      contactMethod: 'whatsapp'
    });
    window.open(`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}`, '_blank');
  };

  const points = [
    { fr: 'Intervention directe, sans intermédiaire', nl: 'Directe interventie, zonder tussenpersoon' },
    { fr: 'Experts certifiés et expérimentés', nl: 'Gecertificeerde en ervaren experts' },
    { fr: 'Prix transparents, sans surprise', nl: 'Transparante prijzen, zonder verrassingen' },
    { fr: 'Garantie résultats sur nos interventions', nl: 'Resultaatgarantie op onze interventies' },
    { fr: 'Service client réactif 7j/7', nl: 'Reactieve klantenservice 7/7' },
  ];

  return (
    <section className="relative bg-[#FAFAF8] py-20 overflow-hidden">
      <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div className="space-y-8">
            <h2 className="text-slate-900 font-bold tracking-tight" style={{
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)'
            }}>
              {language === 'fr' ? 'Pourquoi choisir Interventia ?' : 'Waarom kiezen voor Interventia?'}
            </h2>

            <div className="space-y-4">
              {points.map((point, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="bg-emerald-100 p-1 rounded-full mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                  </div>
                  <span className="text-slate-700">
                    {language === 'fr' ? point.fr : point.nl}
                  </span>
                </div>
              ))}
            </div>

            <button
            onClick={handleWhatsApp}
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 bg-[length:200%_100%] hover:bg-right text-white px-8 py-4 font-semibold transition-all duration-500 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 rounded-2xl hover:scale-[1.03] overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
            <MessageCircle className="w-5 h-5 relative z-10" strokeWidth={2} />
            <span className="relative z-10">WhatsApp</span>
            <ArrowRight className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" strokeWidth={2} />
          </button>
          </div>

          {/* Right - Shield with badges */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-[400px]">
              {/* Background rings */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                <circle cx="200" cy="200" r="180" fill="none" stroke="#cbd5e1" strokeWidth="1" opacity="0.3" />
                <circle cx="200" cy="200" r="140" fill="none" stroke="#059669" strokeWidth="1" opacity="0.15" />
              </svg>
              
              {/* Central shield */}
              <div className="relative z-10 p-8">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center justify-center mb-6">
                    <div className="bg-emerald-50 p-4 rounded-full shadow-inner">
                      <Award className="w-12 h-12 text-emerald-600" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-2xl text-slate-900 mb-2">
                      {language === 'fr' ? 'Certifié' : 'Gecertificeerd'}
                    </div>
                    <div className="text-slate-500 text-sm">
                      {language === 'fr' ? 'Agrément officiel Belgique' : 'Officiële Belgische goedkeuring'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// FINAL CTA - Premium dark section
// ============================================
export function FinalCTA() {
  const { language } = useLanguage();

  const handleWhatsApp = () => {
    trackLead({ language, pestType: null, contactMethod: 'whatsapp' });
    window.open(`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}`, '_blank');
  };

  const handleOnboarding = () => {
    trackLead({ language, pestType: null, contactMethod: 'form' });
    window.location.href = '#onboarding';
  };

  return (
    <section className="relative bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-24 overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 border border-emerald-300 rounded-full mb-8 shadow-lg">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-emerald-700">
            {language === 'fr' ? 'Réponse garantie < 30 min' : 'Reactie gegarandeerd < 30 min'}
          </span>
        </div>
        
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-6">
          {language === 'fr' ? (
            <>Prêt à <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">résoudre</span> votre problème ?</>
          ) : (
            <>Klaar om uw probleem <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">op te lossen</span>?</>
          )}
        </h2>
        
        <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          {language === 'fr' 
            ? 'Intervention rapide et discrète. Experts certifiés. Prix transparent.'
            : 'Snelle en discrete interventie. Gecertificeerde experts. Transparante prijs.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleWhatsApp}
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-10 py-5 text-lg font-bold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/40 btn-premium"
          >
            <MessageCircle className="w-6 h-6" strokeWidth={2.5} />
            <span>WhatsApp</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
          
          <button
            onClick={handleOnboarding}
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-slate-900 border-2 border-slate-200 px-10 py-5 text-lg font-bold rounded-2xl transition-all duration-300 hover:bg-slate-50 hover:border-emerald-300 hover:scale-105 shadow-xl"
          >
            <span>{language === 'fr' ? 'Demande gratuite' : 'Gratis aanvraag'}</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
