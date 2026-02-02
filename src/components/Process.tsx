import { useLanguage } from '../LanguageContext';

export function Process() {
  const { t } = useLanguage();

  return (
    <section className="py-16 lg:py-20 bg-stone-50 border-t border-slate-200">
      <div className="w-full px-6 sm:px-8 lg:px-16 xl:px-24 2xl:px-32">
        <div className="max-w-[1400px] mx-auto">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-px bg-slate-400"></div>
            <span className="text-slate-600 font-semibold text-xs uppercase tracking-[0.2em]">
              {t.process.title}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {t.process.steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector line */}
                {index < t.process.steps.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-full w-full h-px bg-slate-300" style={{ width: 'calc(100% - 2rem)' }}></div>
                )}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
