import { useState, useRef } from 'react';
import HeroSection from './components/HeroSection';
import RecorderSection from './components/RecorderSection';
import ResultSection from './components/screens/ResultSection';
import Navbar from './components/Navbar';
import FeaturesSection from './components/FeaturesSection';
import AboutSection from './components/AboutSection';
/**
 * App – single-page scroll application.
 * Fully functional without breaking logic.
 * Clean SaaS typography and layout.
 */
function App() {
  const [resultData, setResultData] = useState<{ score: number; confidence: number; feedback: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Smooth-scroll to results section
  const scrollToResults = () => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Scroll to recorder section
  const scrollToRecorder = () => {
    document.getElementById('recorder')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Reset for a new attempt
  const handleRetry = () => {
    setResultData(null);
    setIsAnalyzing(false);
    document.getElementById('recorder')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen font-sans text-base relative">
      <Navbar />

      <HeroSection onDiveIn={scrollToRecorder} />

      <div className="divider-subtle" />

      <RecorderSection
        onAnalysisStart={() => {
          setResultData(null);
          setIsAnalyzing(true);
        }}
        onAnalysisComplete={(data) => {
          setIsAnalyzing(false);
          setResultData(data);
        }}
        onScrollToResults={scrollToResults}
      />

      <div className="divider-subtle" />

      <div ref={resultsRef}>
        <ResultSection
          data={resultData}
          isLoading={isAnalyzing}
          onRetry={handleRetry}
        />
      </div>

      <div className="divider-subtle" />
      <FeaturesSection onStartRecording={scrollToRecorder} />
      <AboutSection onStartRecording={scrollToRecorder} />

      <footer className="bg-white border-t border-slate-100">
        {/* Main grid */}
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Section 1 – Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center shrink-0">
                <span className="text-white font-black text-[11px]">PP</span>
              </div>
              <span className="font-black tracking-tight text-slate-800 text-base">PitchPerfect</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              AI-powered platform to analyze your interview introduction and improve clarity, confidence, and impact.
            </p>
          </div>

          {/* Section 2 – Product */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-slate-700 tracking-wide">Product</h4>
            <ul className="flex flex-col gap-2">
              <li>
                <a
                  href="#features"
                  onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="text-sm text-gray-500 hover:text-accent transition-colors duration-200 cursor-pointer"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="text-sm text-gray-500 hover:text-accent transition-colors duration-200 cursor-pointer"
                >
                  How it works
                </a>
              </li>
            </ul>
          </div>

          {/* Section 3 – Company */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-slate-700 tracking-wide">Company</h4>
            <ul className="flex flex-col gap-2">
              <li>
                <a
                  href="#about"
                  onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="text-sm text-gray-500 hover:text-accent transition-colors duration-200 cursor-pointer"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="mailto:akash@gmail.com"
                  className="text-sm text-gray-500 hover:text-accent transition-colors duration-200"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Section 4 – Contact */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-slate-700 tracking-wide">Contact</h4>
            <ul className="flex flex-col gap-2">
              {['akash@gmail.com', 'somanshu@gmail.com', 'shone@gmail.com'].map((email) => (
                <li key={email}>
                  <a
                    href={`mailto:${email}`}
                    className="text-sm text-gray-500 hover:text-accent transition-colors duration-200"
                  >
                    {email}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()}PitchPerfect AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-accent transition-colors duration-200"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-accent transition-colors duration-200"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
