import { Phone, MessageCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { trackLead } from '../lib/supabase';

const PHONE = '+32 2 123 45 67';
const WHATSAPP = '+32466274251';

export function FinalCTA() {
  const { language } = useLanguage();

  const handleCall = () => {
    trackLead({
      language,
      pestType: null,
      contactMethod: 'phone'
    });
    window.location.href = `tel:${PHONE}`;
  };

  const handleWhatsApp = () => {
    trackLead({
      language,
      pestType: null,
      contactMethod: 'whatsapp'
    });
    window.open(`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}`, '_blank');
  };

  return (
    <section className="py-16 lg:py-20 bg-slate-900 border-t border-slate-800">
      <div className="w-full px-6 sm:px-8 lg:px-16 xl:px-24 2xl:px-32">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="font-black text-white mb-2 text-2xl lg:text-3xl tracking-tight">
                {language === 'fr' ? 'Besoin d\'une intervention ?' : 'Interventie nodig?'}
              </h2>
              <p className="text-slate-400">
                {language === 'fr' 
                  ? 'Contactez-nous maintenant pour une réponse rapide.'
                  : 'Neem nu contact op voor een snelle reactie.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-3 bg-green-700 hover:bg-green-800 text-white px-8 py-4 font-bold tracking-wide transition-all"
              >
                <MessageCircle className="w-5 h-5" strokeWidth={2} />
                <span>WHATSAPP</span>
              </button>
              <button
                onClick={handleCall}
                className="flex items-center justify-center gap-2 text-slate-400 hover:text-white px-6 py-4 font-medium transition-colors"
              >
                <Phone className="w-4 h-4" strokeWidth={2} />
                <span>{PHONE}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
