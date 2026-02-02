import { useState, useEffect } from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { trackLead } from '../lib/supabase';

const WHATSAPP = '+32466274251';
const PHONE = '+32 2 123 45 67';

export function FloatingCTA() {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero (500px)
      setIsVisible(window.scrollY > 500);
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

  const handleCall = () => {
    trackLead({
      language,
      pestType: null,
      contactMethod: 'phone'
    });
    window.location.href = `tel:${PHONE}`;
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating WhatsApp Button - Desktop */}
      <div className="fixed bottom-6 right-6 z-50 hidden sm:flex flex-col items-end gap-3">
        {/* Expanded options */}
        <div className={`flex flex-col gap-2 transition-all duration-300 ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <button
            onClick={handleCall}
            className="flex items-center gap-3 bg-white text-slate-800 pl-4 pr-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-slate-200"
          >
            <div className="bg-slate-100 p-2 rounded-full">
              <Phone className="w-4 h-4" strokeWidth={2} />
            </div>
            <span className="font-medium text-sm">{language === 'fr' ? 'Appeler' : 'Bellen'}</span>
          </button>
        </div>

        {/* Main WhatsApp button with pulse */}
        <button
          onClick={isExpanded ? handleWhatsApp : () => setIsExpanded(true)}
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
          className="group relative flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white pl-5 pr-6 py-4 rounded-full shadow-lg hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-105"
        >
          {/* Pulse ring animation */}
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20"></span>
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse opacity-10"></span>
          
          <MessageCircle className="w-6 h-6 relative z-10" strokeWidth={2} />
          <span className="font-semibold relative z-10">WhatsApp</span>
          
          {/* Arrow indicator */}
          <svg className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Mobile Sticky Bottom CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200 p-3 safe-area-pb">
        <div className="flex gap-2">
          <button
            onClick={handleWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3.5 rounded-xl font-semibold shadow-lg relative overflow-hidden"
          >
            {/* Shimmer effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></span>
            <MessageCircle className="w-5 h-5" strokeWidth={2} />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={handleCall}
            className="flex items-center justify-center gap-2 bg-slate-100 text-slate-800 px-5 py-3.5 rounded-xl font-semibold"
          >
            <Phone className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </>
  );
}
