import { useState, useEffect } from 'react';
import { LanguageProvider } from './LanguageContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TrustStrip, Categories, Services, HowItWorks, WhyInterventia, FinalCTA } from './components/Sections';
import { Footer } from './components/Footer';
import { FloatingCTA } from './components/FloatingCTA';
import { Onboarding } from './components/Onboarding';

function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const isOnboarding = currentRoute === '#onboarding';

  return (
    <LanguageProvider>
      {isOnboarding ? (
        <Onboarding />
      ) : (
        <div className="min-h-screen bg-[#FAFAF8]">
          <Header />
          <main>
            <Hero />
            <TrustStrip />
            <Categories />
            <Services />
            <HowItWorks />
            <WhyInterventia />
            <FinalCTA />
          </main>
          <Footer />
          <FloatingCTA />
        </div>
      )}
    </LanguageProvider>
  );
}

export default App;
