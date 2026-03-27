import DeviceMock from './DeviceMock';
import FadeIn from './FadeIn';

interface HeroSectionProps {
  onDiveIn: () => void;
}

/**
 * HeroSection – full-screen landing panel.
 * Clean, Professional SaaS Design with animations.
 */
export default function HeroSection({ onDiveIn }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Dynamic Background Light Layer */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] -mr-96 -mt-96 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-24 grid lg:grid-cols-2 gap-16 items-center">

        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col gap-10">
          
          <FadeIn delay={0} yOffset={20}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 self-start py-1.5 px-3 rounded-full bg-white border border-slate-200 shadow-sm">
               <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
               <span className="text-[11px] font-black tracking-[0.1em] text-slate-500 uppercase">
                 Introlytics v2.0
               </span>
            </div>
          </FadeIn>

          {/* Headline */}
          <div className="space-y-6">
            <FadeIn delay={150} yOffset={20}>
              <h1 className="text-5xl md:text-7xl font-black leading-[1.1] text-slate-800 tracking-tighter">
                Master your <br className="hidden md:block"/>
                <span className="text-accent">First Impression</span>
              </h1>
            </FadeIn>
            <FadeIn delay={300} yOffset={20}>
              <p className="text-xl text-slate-500 max-w-xl leading-relaxed font-medium">
                Record your interview introduction. Our AI engine analyzes your
                speech for clarity, confidence, and impact — giving you a
                precision-grade performance report instantly.
              </p>
            </FadeIn>
          </div>

          {/* Spec strip */}
          <FadeIn delay={450} yOffset={20}>
            <div className="flex gap-8 border-l-4 border-accent pl-8 py-2">
              {[
                { val: 'Real-time', label: 'Transcription' },
                { val: '0–100',    label: 'Score Range'   },
                { val: 'AI-Grade', label: 'Feedback'      },
              ].map(({ val, label }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="text-lg font-black text-slate-800 tracking-tight">{val}</span>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* CTA buttons */}
          <FadeIn delay={600} yOffset={20} className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={onDiveIn}
              className="btn-primary px-10 py-4 text-base font-bold shadow-[0_10px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.3)] hover:-translate-y-1 transition-all"
              id="hero-start-btn"
            >
              Start Analysis
            </button>

             <button
              onClick={() => {
                document.getElementById('recorder')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-secondary px-10 py-4 text-base font-bold shadow-sm hover:-translate-y-1 transition-all"
              id="hero-demo-btn"
            >
              Watch Video
            </button>
          </FadeIn>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <FadeIn delay={400} yOffset={40} className="flex items-center justify-center lg:justify-end w-full lg:w-auto h-full mt-10 lg:mt-0">
          <DeviceMock />
        </FadeIn>
      </div>
    </section>
  );
}
