import { useState, useRef } from 'react';
import HeroSection from './components/HeroSection';
import RecorderSection from './components/RecorderSection';
import ResultSection from './components/screens/ResultSection';
import FadeIn from './components/FadeIn';

/**
 * App – single-page scroll application.
 * Fully functional without breaking logic.
 * Clean SaaS typography and layout.
 */
function App() {
  const [resultData, setResultData]   = useState<{ score: number; confidence: number; feedback: string } | null>(null);
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
    <div className="min-h-screen font-sans text-base">
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
    </div>
  );
}

export default App;
