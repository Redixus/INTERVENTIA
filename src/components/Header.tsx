import { useState, useEffect } from 'react';
import { MessageCircle, Shield } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { trackLead } from '../lib/supabase';

const WHATSAPP = '+32466274251';

export function Header() {
  const { language, setLanguage } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWhatsApp = () => {
    trackLead({
      language,
      pestType: null,
      contactMethod: 'whatsapp'
    });
    window.open(`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}`, '_blank');
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className={`transition-colors duration-300 ${
              scrolled ? 'text-slate-900' : 'text-slate-800'
            }`}>
              <Shield className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <span className={`font-bold text-lg tracking-tight transition-colors duration-300 ${
              scrolled ? 'text-slate-900' : 'text-slate-800'
            }`}>
              Interventia
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* Language toggle */}
            <div className="flex items-center text-xs font-medium">
              <button
                onClick={() => setLanguage('fr')}
                className={`px-2 py-1 transition-colors ${
                  language === 'fr'
                    ? 'text-slate-900 font-bold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                FR
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => setLanguage('nl')}
                className={`px-2 py-1 transition-colors ${
                  language === 'nl'
                    ? 'text-slate-900 font-bold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                NL
              </button>
            </div>

            {/* WhatsApp CTA */}
            <button
              onClick={handleWhatsApp}
              className="group relative flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-2.5 text-sm font-semibold transition-all duration-300 rounded-full shadow-md hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-105 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              <MessageCircle className="w-4 h-4 relative z-10" strokeWidth={2} />
              <span className="hidden sm:inline relative z-10">WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
