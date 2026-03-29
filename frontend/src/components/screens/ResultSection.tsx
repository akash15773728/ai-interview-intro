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

  // If no data, render placeholder state
  if (!data) {
    return (
      <section id="results" className="min-h-[60vh] py-24 px-6 md:px-12 w-full flex items-center justify-center">
        <div className="w-full max-w-6xl mx-auto border-2 border-dashed border-slate-200 rounded-[32px] p-12 md:p-20 flex flex-col items-center text-center gap-8 bg-white/40">
           <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M12 20h.01"/><path d="M12 16h.01"/><path d="M12 12h.01"/><path d="M12 8h.01"/><path d="M12 4h.01"/>
             </svg>
           </div>
           <div className="space-y-3">
             <h2 className="text-3xl font-black text-slate-400 tracking-tight">Performance Report</h2>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Record your introduction to see analysis</p>
           </div>
           <div className="grid grid-cols-2 gap-8 w-full max-w-md opacity-40 grayscale">
              <div className="p-6 rounded-2xl bg-white border border-slate-100 flex flex-col gap-1 items-center">
                <span className="text-xs font-black text-slate-400 uppercase">Score</span>
                <span className="text-4xl font-black text-slate-300">--</span>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-100 flex flex-col gap-1 items-center">
                <span className="text-xs font-black text-slate-400 uppercase">Confidence</span>
                <span className="text-4xl font-black text-slate-300">--</span>
              </div>
           </div>
        </div>
      </section>
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
