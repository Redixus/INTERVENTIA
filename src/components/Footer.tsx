import { useLanguage } from '../LanguageContext';

export function Footer() {
  const { language, setLanguage, t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#FAFAF8]">
      {/* Technical blueprint line divider */}
      <div className="relative w-full h-12">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#cbd5e1" strokeWidth="1" opacity="0.5" />
          <line x1="20%" y1="40%" x2="20%" y2="60%" stroke="#cbd5e1" strokeWidth="1" opacity="0.4" />
          <line x1="50%" y1="35%" x2="50%" y2="65%" stroke="#cbd5e1" strokeWidth="1" opacity="0.5" />
          <line x1="80%" y1="40%" x2="80%" y2="60%" stroke="#cbd5e1" strokeWidth="1" opacity="0.4" />
          <circle cx="50%" cy="50%" r="3" fill="#475569" opacity="0.4" />
        </svg>
      </div>

      {/* Compact footer content */}
      <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-4">
            <span className="font-bold text-slate-900 tracking-tight text-sm">Interventia</span>
            <span className="text-xs text-slate-500">
              © {currentYear} {t.footer.rights}
            </span>
          </div>

          {/* Links & Language */}
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
              {language === 'fr' ? 'Mentions légales' : 'Juridische informatie'}
            </a>
            <a href="#" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
              {language === 'fr' ? 'Confidentialité' : 'Privacy'}
            </a>
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setLanguage('fr')}
                className={`px-2 py-1 transition-colors ${language === 'fr' ? 'text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
              >
                FR
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => setLanguage('nl')}
                className={`px-2 py-1 transition-colors ${language === 'nl' ? 'text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
              >
                NL
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
