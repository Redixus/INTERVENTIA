import { CheckCircle, Shield, Clock, Award, MapPin, Lock } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const icons = [MapPin, Award, Shield, Clock, CheckCircle, Lock];

export function Trust() {
  const { t } = useLanguage();

  return (
    <section className="py-16 lg:py-20 bg-white border-t border-slate-200">
      <div className="w-full px-6 sm:px-8 lg:px-16 xl:px-24 2xl:px-32">
        <div className="max-w-[1400px] mx-auto">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-px bg-slate-400"></div>
            <span className="text-slate-600 font-semibold text-xs uppercase tracking-[0.2em]">
              {t.trust.title}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.trust.points.map((point, index) => {
              const Icon = icons[index];
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-5 border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <Icon className="w-5 h-5 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                  <p className="font-medium text-sm text-slate-900">{point}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
