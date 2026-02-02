import { MessageCircle, ArrowRight, Clock, CheckCircle2, MapPin, Euro, Phone, Shield, Award } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { trackLead } from '../lib/supabase';

const WHATSAPP = '+32466274251';
const PHONE = '+32 2 123 45 67';

// ============================================
// TRUST STRIP - Below Hero
// ============================================
export function TrustStrip() {
  const { language } = useLanguage();
  
  const items = [
    { icon: Clock, label: language === 'fr' ? 'Intervention 24-48h' : 'Interventie 24-48u', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: CheckCircle2, label: language === 'fr' ? 'Experts certifiés' : 'Gecertificeerde experts', color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: Euro, label: language === 'fr' ? 'Prix fixe transparent' : 'Transparante vaste prijs', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: MapPin, label: language === 'fr' ? 'Toute la Belgique' : 'Heel België', color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  return (
    <section className="relative bg-gradient-to-r from-slate-50 via-white to-slate-50 py-5 border-y border-slate-100">
      <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-wrap justify-center gap-4 lg:gap-8">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-100 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-default">
              <div className={`${item.bg} p-1.5 rounded-full`}>
                <item.icon className={`w-4 h-4 ${item.color}`} strokeWidth={2} />
              </div>
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// CATEGORIES - Shield containers
// ============================================
export function Categories() {
  const { language } = useLanguage();

  const categories = [
    { 
      fr: { name: 'Rongeurs', sub: 'Rats, souris, mulots' },
      nl: { name: 'Knaagdieren', sub: 'Ratten, muizen' },
      image: '/src/assets/shields/rongeurs.svg'
    },
    { 
      fr: { name: 'Insectes rampants', sub: 'Cafards, punaises, fourmis' },
      nl: { name: 'Kruipende insecten', sub: 'Kakkerlakken, bedwantsen' },
      image: '/src/assets/shields/insectes-rampants.svg'
    },
    { 
      fr: { name: 'Insectes volants', sub: 'Guêpes, frelons, mouches' },
      nl: { name: 'Vliegende insecten', sub: 'Wespen, horzels, vliegen' },
      image: '/src/assets/shields/insectes-volants.svg'
    },
    { 
      fr: { name: 'Autres nuisibles', sub: 'Pigeons, taupes, etc.' },
      nl: { name: 'Andere ongedierte', sub: 'Duiven, mollen, enz.' },
      image: '/src/assets/shields/autres-nuisibles.svg'
    },
  ];

  return (
    <section className="relative bg-[#F5F3EF] py-20 overflow-hidden">
      {/* Arc pattern background */}
      <div className="absolute inset-0 opacity-[0.04]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="arcPattern" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 40 0 Q 40 40 80 40" fill="none" stroke="#475569" strokeWidth="0.5" />
              <path d="M 0 40 Q 40 40 40 80" fill="none" stroke="#475569" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#arcPattern)" />
        </svg>
      </div>

      <div className="relative w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section title */}
        <div className="text-center mb-16">
          <h2 className="text-slate-900 font-bold tracking-tight mb-4" style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)'
          }}>
            {language === 'fr' ? 'Nos catégories d\'intervention' : 'Onze interventiecategorieën'}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            {language === 'fr' 
              ? 'Sélectionnez le type de nuisible pour une intervention ciblée et efficace.'
              : 'Selecteer het type ongedierte voor een gerichte en effectieve interventie.'}
          </p>
        </div>

        {/* Shield grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {categories.map((cat, i) => (
            <button 
              key={i} 
              className="flex flex-col items-center group cursor-pointer"
              onClick={() => window.location.href = '#onboarding'}
            >
              {/* Shield container */}
              <div className="relative w-full max-w-[280px] transition-transform duration-300 group-hover:scale-110">
                <div className="absolute inset-0 bg-emerald-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <img 
                  src={cat.image} 
                  alt={language === 'fr' ? cat.fr.name : cat.nl.name}
                  className="relative z-10 w-full h-auto drop-shadow-lg"
                />
              </div>
              
              {/* Title below shield */}
              <div className="text-center mt-5">
                <h3 className="font-semibold text-slate-900 text-base mb-1 group-hover:text-emerald-700 transition-colors">
                  {language === 'fr' ? cat.fr.name : cat.nl.name}
                </h3>
                <p className="text-sm text-slate-500">
                  {language === 'fr' ? cat.fr.sub : cat.nl.sub}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom arc divider */}
      <div className="absolute bottom-0 left-0 right-0 h-12">
        <svg className="w-full h-full" viewBox="0 0 1440 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,24 Q720,48 1440,24 L1440,48 L0,48 Z" fill="#FAFAF8" />
        </svg>
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
// FINAL CTA - Dark emphasis section
// ============================================
export function FinalCTA() {
  const { language } = useLanguage();

  const handleWhatsApp = () => {
    trackLead({
      language,
      pestType: null,
      contactMethod: 'whatsapp'
    });
    window.open(`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}`, '_blank');
  };

  const handleCall = () => {
    trackLead({
      language,
      pestType: null,
      contactMethod: 'phone'
    });
    window.location.href = `tel:${PHONE}`;
  };

  return (
    <section className="relative bg-slate-800 py-20 overflow-hidden">
      {/* Blueprint grid overlay */}
      <div className="absolute inset-0 opacity-[0.08]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="ctaGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="#94a3b8"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ctaGrid)" />
        </svg>
      </div>

      {/* Shield watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
        <Shield className="w-[600px] h-[600px] text-white" strokeWidth={0.5} />
      </div>

      <div className="relative w-full max-w-[800px] mx-auto px-6 sm:px-8 lg:px-12 text-center">
        <h2 className="text-white font-bold tracking-tight mb-4" style={{
          fontSize: 'clamp(1.75rem, 3vw, 2.5rem)'
        }}>
          {language === 'fr' ? 'Besoin d\'une intervention ?' : 'Een interventie nodig?'}
        </h2>
        
        <p className="text-slate-300 mb-10 text-lg">
          {language === 'fr' 
            ? 'Contactez-nous maintenant pour une réponse rapide et professionnelle.'
            : 'Contacteer ons nu voor een snelle en professionele reactie.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleWhatsApp}
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 bg-[length:200%_100%] hover:bg-right text-white px-12 py-5 font-bold transition-all duration-500 text-lg shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-400/50 rounded-2xl hover:scale-[1.03] overflow-hidden"
          >
            {/* Animated glow ring */}
            <span className="absolute inset-0 rounded-2xl animate-pulse bg-emerald-400/20"></span>
            {/* Shimmer */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
            <MessageCircle className="w-6 h-6 relative z-10" strokeWidth={2} />
            <span className="relative z-10">WhatsApp</span>
            <ArrowRight className="w-6 h-6 relative z-10 transition-transform group-hover:translate-x-2" strokeWidth={2} />
          </button>
          
          <button
            onClick={handleCall}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-slate-300 hover:text-white px-6 py-4 font-medium transition-all duration-200 rounded-xl hover:scale-105"
          >
            <Phone className="w-5 h-5" strokeWidth={2} />
            <span>{language === 'fr' ? 'Appeler' : 'Bellen'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
