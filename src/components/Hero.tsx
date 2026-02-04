import { MessageCircle, ArrowRight, CheckCircle2, Shield, Sparkles, Zap } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { trackLead } from '../lib/supabase';

const WHATSAPP = '+32466274251';

export function Hero() {
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
    <section className="relative min-h-screen bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full min-h-screen flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Left content */}
            <div className="flex-1 text-center lg:text-left space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xl border border-emerald-200 rounded-full shadow-lg animate-slideUpSpring">
                <div className="relative">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </div>
                <span className="text-sm font-semibold text-slate-800">
                  {language === 'fr' ? 'Experts certifiés • Belgique' : 'Gecertificeerde experts • België'}
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight animate-slideUpSpring" style={{ animationDelay: '0.1s' }}>
                {language === 'fr' ? (
                  <>Élimination <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 animate-gradientShift">express</span><br/>des nuisibles</>
                ) : (
                  <><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 animate-gradientShift">Snelle</span> verwijdering<br/>van ongedierte</>
                )}
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-slideUpSpring" style={{ animationDelay: '0.2s' }}>
                {language === 'fr' 
                  ? 'Intervention rapide et discrète partout en Belgique. Réponse garantie sous 30 minutes.'
                  : 'Snelle en discrete interventie in heel België. Reactie gegarandeerd binnen 30 minuten.'}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slideUpSpring" style={{ animationDelay: '0.3s' }}>
                <button
                  onClick={handleWhatsApp}
                  className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-5 text-lg font-bold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/40 btn-premium"
                >
                  <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <MessageCircle className="w-6 h-6 relative z-10" strokeWidth={2.5} />
                  <span className="relative z-10">WhatsApp</span>
                  <ArrowRight className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" />
                </button>
                
                <button
                  onClick={handleOnboarding}
                  className="group inline-flex items-center justify-center gap-3 bg-white text-slate-900 border-2 border-slate-200 px-8 py-5 text-lg font-bold rounded-2xl transition-all duration-300 hover:bg-slate-50 hover:border-emerald-300 hover:scale-105 shadow-xl"
                >
                  <span>{language === 'fr' ? 'Demande gratuite' : 'Gratis aanvraag'}</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 animate-slideUpSpring" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-medium text-slate-700">{language === 'fr' ? 'Réponse < 30min' : 'Reactie < 30min'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">{language === 'fr' ? 'Prix fixe' : 'Vaste prijs'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">{language === 'fr' ? 'Garantie résultat' : 'Resultaatgarantie'}</span>
                </div>
              </div>
            </div>

            {/* Right - Visual element */}
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-full max-w-md">
                {/* Glowing rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-80 h-80 border border-emerald-200 rounded-full animate-pulse" />
                  <div className="absolute w-64 h-64 border border-emerald-300 rounded-full" style={{ animation: 'pulse 3s ease-in-out infinite 0.5s' }} />
                  <div className="absolute w-48 h-48 border border-emerald-400 rounded-full" style={{ animation: 'pulse 3s ease-in-out infinite 1s' }} />
                </div>
                
                {/* Central shield */}
                <div className="relative z-10 flex items-center justify-center animate-float">
                  <div className="w-40 h-40 sm:w-52 sm:h-52 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-2xl shadow-emerald-500/40 flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <Shield className="w-20 h-20 sm:w-28 sm:h-28 text-white" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-4 shadow-xl animate-float" style={{ animationDelay: '0.5s' }}>
                  <div className="text-3xl font-black text-slate-900">24h</div>
                  <div className="text-xs text-slate-600">{language === 'fr' ? 'Intervention' : 'Interventie'}</div>
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-white/90 backdrop-blur-xl border border-emerald-200 rounded-2xl p-4 shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                  <div className="text-3xl font-black text-emerald-600">500+</div>
                  <div className="text-xs text-slate-600">{language === 'fr' ? 'Ce mois' : 'Deze maand'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120V60C240 20 480 0 720 20C960 40 1200 80 1440 60V120H0Z" fill="#FAFAF8" />
          <path d="M0 60C240 20 480 0 720 20C960 40 1200 80 1440 60" stroke="#10b981" strokeWidth="2" opacity="0.2" fill="none" />
        </svg>
      </div>
    </section>
  );
}
