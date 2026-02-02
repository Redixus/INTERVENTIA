import { LanguageProvider } from './LanguageContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TrustStrip, Categories, Services, HowItWorks, WhyInterventia, FinalCTA } from './components/Sections';
import { Footer } from './components/Footer';
import { FloatingCTA } from './components/FloatingCTA';

function App() {
  return (
    <LanguageProvider>
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
    </LanguageProvider>
  );
}

export default App;
