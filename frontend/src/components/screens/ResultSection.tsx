import ScoreCard from '../ScoreCard';
import ConfidenceMeter from '../ConfidenceMeter';
import FeedbackPanel from '../FeedbackPanel';
import FadeIn from '../FadeIn';

interface ResultSectionProps {
  data: {
    score: number;
    confidence: number;
    feedback: string;
  } | null;
  isLoading: boolean;
  onRetry: () => void;
}

/**
 * ResultSection – clean minimal dashboard wrapper with staggered reveals.
 */
export default function ResultSection({ data, isLoading, onRetry }: ResultSectionProps) {
  
  if (isLoading) {
    return (
      <section className="min-h-screen py-24 flex items-center justify-center bg-transparent w-full">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-16 h-16 flex items-center justify-center">
             <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
             <div className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin" />
          </div>
          <span className="text-xl font-black tracking-widest text-accent uppercase animate-pulse">
             Extracting Insights...
          </span>
        </div>
      </section>
    );
  }

  // If no data, render blank or hidden state
  if (!data) {
    return (
      <section id="results" className="hidden" />
    );
  }

  return (
    <section id="results" className="min-h-screen py-24 px-6 md:px-12 w-full">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-12">

        <FadeIn delay={0} yOffset={20}>
          <div className="text-center md:text-left space-y-4 mb-4">
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-800">
              Your Performance
            </h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl">
              Precision analysis of your interview introduction based on industry-standard clarity and delivery metrics.
            </p>
          </div>
        </FadeIn>

        {/* Meters (Top row) - Staggered */}
        <div className="grid md:grid-cols-2 gap-10">
          <FadeIn delay={150} yOffset={30}>
            <ScoreCard score={data.score} />
          </FadeIn>
          <FadeIn delay={300} yOffset={30}>
            <ConfidenceMeter confidence={data.confidence} />
          </FadeIn>
        </div>

        {/* Feedback (Bottom area) - Staggered */}
        <FadeIn delay={450} yOffset={30}>
          <FeedbackPanel feedback={data.feedback} />
        </FadeIn>

        {/* Retry Button - Staggered */}
        <FadeIn delay={600} yOffset={20} className="mt-8 flex justify-end">
           <button
             onClick={onRetry}
             className="btn-primary px-10 py-4 shadow-[0_10px_20px_rgba(37,99,235,0.2)] text-base font-bold tracking-tight hover:-translate-y-1 transition-all"
           >
              Try Another Attempt
           </button>
        </FadeIn>

      </div>
    </section>
  );
}
