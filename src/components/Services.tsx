import { Shield, Zap, Clock, Award, Target, CheckCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const icons = [Zap, Target, Shield, Award, CheckCircle, Clock];

export function Services() {
  const { t } = useLanguage();

  return (
    <section className="py-16 lg:py-20 bg-white border-t border-slate-200">
      <div className="w-full px-6 sm:px-8 lg:px-16 xl:px-24 2xl:px-32">
        <div className="max-w-[1400px] mx-auto">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-slate-400"></div>
            <span className="text-slate-600 font-semibold text-xs uppercase tracking-[0.2em]">
              {t.services.title}
            </span>
          </div>
          
          <p className="text-slate-600 text-lg mb-12 max-w-2xl">
            {t.services.subtitle}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200">
            {t.services.items.map((service, index) => {
              const Icon = icons[index];
              return (
                <div
                  key={index}
                  className="bg-stone-50 p-8 hover:bg-white transition-colors"
                >
                  <Icon className="w-6 h-6 text-slate-400 mb-4" strokeWidth={1.5} />
                  <h3 className="font-bold text-slate-900 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {service.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
