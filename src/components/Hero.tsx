import { MessageCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { trackLead } from '../lib/supabase';

const WHATSAPP = '+32466274251';

export function Hero() {
  const { language } = useLanguage();

  const handleWhatsApp = () => {
    trackLead({
      language,
      pestType: null,
      contactMethod: 'whatsapp'
    });
    window.open(`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}`, '_blank');
  };

  const handleOnboarding = () => {
    trackLead({
      language,
      pestType: null,
      contactMethod: 'form'
    });
    // Navigate to onboarding flow
    window.location.href = '#onboarding';
  };

  return (
    <section className="relative bg-[#FAFAF8] overflow-hidden">
      {/* Blueprint dot grid background */}
      <div className="absolute inset-0 opacity-[0.05]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="heroGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="#475569"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroGrid)" />
        </svg>
      </div>

      {/* Hero content */}
      <div className="relative w-full min-h-[90vh] flex items-center pt-20 pb-16">
        <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left column - Content */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-6 order-2 lg:order-1">
              {/* Certification badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200/80 px-4 py-2 w-fit rounded-full shadow-sm animate-fadeInUp">
                <div className="relative">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" strokeWidth={2} />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                </div>
                <span className="text-xs font-semibold text-amber-700 tracking-wide uppercase">
                  {language === 'fr' ? 'Experts certifiés' : 'Gecertificeerde experts'}
                </span>
              </div>

              <h1 className="text-slate-900 leading-[1.08] font-bold tracking-tight animate-fadeInUp stagger-1" style={{
                fontSize: 'clamp(2.25rem, 5vw, 3.5rem)'
              }}>
                {language === 'fr' 
                  ? <>Intervention antiparasitaire <span className="gradient-text">rapide</span> et professionnelle</>
                  : <>Snelle en <span className="gradient-text">professionele</span> ongediertebestrijding</>}
              </h1>

              <p className="text-slate-600 text-lg leading-relaxed max-w-lg animate-fadeInUp stagger-2">
                {language === 'fr' 
                  ? 'Élimination urgente et discrète des nuisibles partout en Belgique. Réponse garantie sous 24-48h.'
                  : 'Dringende en discrete verwijdering van ongedierte in heel België. Reactie gegarandeerd binnen 24-48u.'}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  onClick={handleWhatsApp}
                  className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 bg-[length:200%_100%] hover:bg-right text-white px-8 py-4 font-semibold transition-all duration-500 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 rounded-2xl hover:scale-[1.03] animate-glow overflow-hidden"
                >
                  {/* Shimmer effect */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                  <MessageCircle className="w-5 h-5 relative z-10" strokeWidth={2} />
                  <span className="relative z-10">WhatsApp</span>
                  <ArrowRight className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" strokeWidth={2} />
                </button>
                
                <button
                  onClick={handleOnboarding}
                  className="group inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-emerald-300 px-8 py-4 font-semibold transition-all duration-300 rounded-2xl hover:scale-[1.02] hover:shadow-lg"
                >
                  <span>{language === 'fr' ? 'Demander une intervention' : 'Interventie aanvragen'}</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {/* Social proof micro-text */}
              <div className="flex items-center gap-2 pt-4 opacity-70">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-white"></div>
                  <div className="w-6 h-6 rounded-full bg-amber-100 border-2 border-white"></div>
                  <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white"></div>
                </div>
                <span className="text-xs text-slate-500">
                  {language === 'fr' ? '+500 interventions ce mois' : '+500 interventies deze maand'}
                </span>
              </div>
            </div>

            {/* Center - Shield illustration with ring geometry */}
            <div className="lg:col-span-5 lg:col-start-6 flex items-center justify-center order-1 lg:order-2">
              <div className="relative w-full max-w-[480px]">
                {/* Concentric rings behind shield */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="250" cy="250" r="240" fill="none" stroke="#cbd5e1" strokeWidth="1" opacity="0.3" />
                  <circle cx="250" cy="250" r="200" fill="none" stroke="#cbd5e1" strokeWidth="1" opacity="0.4" />
                  <circle cx="250" cy="250" r="160" fill="none" stroke="#059669" strokeWidth="1" opacity="0.2" />
                  {/* Technical tick marks */}
                  <line x1="250" y1="5" x2="250" y2="25" stroke="#cbd5e1" strokeWidth="1" opacity="0.4" />
                  <line x1="495" y1="250" x2="475" y2="250" stroke="#cbd5e1" strokeWidth="1" opacity="0.4" />
                  <line x1="250" y1="495" x2="250" y2="475" stroke="#cbd5e1" strokeWidth="1" opacity="0.4" />
                  <line x1="5" y1="250" x2="25" y2="250" stroke="#cbd5e1" strokeWidth="1" opacity="0.4" />
                </svg>
                
                {/* Shield illustration */}
                <img 
                  src="/src/assets/shields/hero-shield.svg" 
                  alt="Interventia" 
                  className="relative z-10 w-full h-auto"
                />
              </div>
            </div>

            {/* Right column - Trust badges */}
            <div className="lg:col-span-2 flex flex-row lg:flex-col justify-center gap-4 order-3">
              <div className="flex items-center gap-3 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 shadow-sm hover:shadow-md p-3 rounded-lg transition-all duration-200 hover:scale-105">
                <div className="bg-white p-2.5 rounded-lg shadow-inner">
                  <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="hidden sm:block">
                  <div className="font-bold text-slate-900 text-sm">24-48h</div>
                  <div className="text-xs text-emerald-700">{language === 'fr' ? 'Intervention' : 'Interventie'}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 shadow-sm hover:shadow-md p-3 rounded-lg transition-all duration-200 hover:scale-105">
                <div className="bg-white p-2.5 rounded-lg shadow-inner">
                  <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="hidden sm:block">
                  <div className="font-bold text-slate-900 text-sm">{language === 'fr' ? 'Certifiés' : 'Gecertificeerd'}</div>
                  <div className="text-xs text-amber-700">{language === 'fr' ? 'Experts' : 'Experts'}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 shadow-sm hover:shadow-md p-3 rounded-lg transition-all duration-200 hover:scale-105">
                <div className="bg-white p-2.5 rounded-lg shadow-inner">
                  <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M3 10h18" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="7" cy="15" r="1" fill="currentColor"/>
                  </svg>
                </div>
                <div className="hidden sm:block">
                  <div className="font-bold text-slate-900 text-sm">{language === 'fr' ? 'Prix fixe' : 'Vaste prijs'}</div>
                  <div className="text-xs text-blue-700">Transparent</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200 shadow-sm hover:shadow-md p-3 rounded-lg transition-all duration-200 hover:scale-105">
                <div className="bg-white p-2.5 rounded-lg shadow-inner">
                  <svg className="w-5 h-5 text-teal-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L4.5 7.5v9L12 22l7.5-5.5v-9L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div className="hidden sm:block">
                  <div className="font-bold text-slate-900 text-sm">Belgique</div>
                  <div className="text-xs text-teal-700">{language === 'fr' ? 'Couverture' : 'Dekking'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shield arc divider */}
      <div className="relative w-full h-16">
        <svg className="w-full h-full" viewBox="0 0 1440 64" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,32 Q720,64 1440,32 L1440,64 L0,64 Z" fill="#F5F3EF" />
          <path d="M0,32 Q720,64 1440,32" fill="none" stroke="#cbd5e1" strokeWidth="1" opacity="0.5" />
        </svg>
      </div>
    </section>
  );
}
