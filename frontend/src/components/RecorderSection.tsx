import { useState, useRef, useEffect } from 'react';
import FadeIn from './FadeIn';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface RecorderSectionProps {
  onAnalysisStart: () => void;
  onAnalysisComplete: (data: any) => void;
  onScrollToResults: () => void;
}

/**
 * RecorderSection – professional recording UI with Mic toggle logic.
 */
export default function RecorderSection({
  onAnalysisStart,
  onAnalysisComplete,
  onScrollToResults,
}: RecorderSectionProps) {
  const [status, setStatus] = useState<'idle' | 'recording' | 'analyzing'>('idle');
  const [transcript, setTranscript] = useState('');
  const [time, setTime] = useState(0);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Recording timer
  useEffect(() => {
    if (status === 'recording') {
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const startRecording = async () => {
    setError('');
    setTranscript('');
    setTime(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start();

      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const rec = new SR();
        rec.continuous = true;
        rec.interimResults = true;
        rec.onresult = (event: any) => {
          let txt = '';
          for (let i = 0; i < event.results.length; i++) {
            txt += event.results[i][0].transcript;
          }
          setTranscript(txt);
        };
        rec.start();
        recognitionRef.current = rec;
      } else {
        setTranscript('Live transcription unavailable in this browser – audio is still recording.');
      }

      setStatus('recording');
    } catch (err) {
      setError('Microphone access denied. Please allow microphone and try again.');
    }
  };

  const stopAndAnalyze = async () => {
    setStatus('analyzing');
    onAnalysisStart();
    onScrollToResults();

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { }
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = async () => {
        const stream = (mediaRecorderRef.current as any)?.stream as MediaStream | undefined;
        stream?.getTracks().forEach((t) => t.stop());
        await runAnalysis(chunksRef.current);
      };
      mediaRecorderRef.current.stop();
    } else {
      await runAnalysis([]);
    }
  };

  const runAnalysis = async (chunks: BlobPart[]) => {
    try {
      let result: any = null;

      if (chunks.length > 0) {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const fd = new FormData();
        fd.append('audio', blob, 'interview.webm');
        const res = await fetch('http://127.0.0.1:5000/student/evaluate', {
          method: 'POST',
          body: fd,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const payload = json?.data ?? json;

        const rawScore = payload?.scores?.overall_score ?? 6;
        const score = Math.round(rawScore <= 10 ? rawScore * 10 : rawScore);

        const confMap: Record<string, number> = { low: 30, medium: 60, high: 90 };
        const confRaw = (payload?.scores?.confidence ?? 'medium') as string;
        const confidence = confMap[confRaw.toLowerCase()] ?? 60;

        const fb = payload?.feedback;
        let feedbackStr = '';
        if (fb && typeof fb === 'object' && !Array.isArray(fb)) {
          feedbackStr = [
            ...(fb.positives ?? []).map((s: string) => `✔ ${s}`),
            ...(fb.improvements ?? []).map((s: string) => `✦ ${s}`),
          ].join('\n');
        } else if (Array.isArray(fb)) {
          feedbackStr = fb.map((s: string) => `✦ ${s}`).join('\n');
        } else if (typeof fb === 'string') {
          feedbackStr = fb;
        }
        result = { score, confidence, feedback: feedbackStr };
      } else {
        throw new Error('No audio captured.');
      }

      onAnalysisComplete(result);
    } catch (err: any) {
      console.error('[Analysis error]', err);
      onAnalysisComplete({
        score: 40,
        confidence: 30,
        feedback: 'Backend could not be reached. Make sure the server is running on port 5000.',
      });
    } finally {
      setStatus('idle');
    }
  };

  return (
    <section
      id="recorder"
      className="min-h-screen flex flex-col items-center justify-center py-24 px-6 md:px-12"
    >
      <FadeIn duration={600} yOffset={30}>
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-800">
            RECORDING STUDIO
          </h2>
          <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">
            Introduce yourself just like you would in a real interview. We'll capture your transcript in real-time.
          </p>
        </div>
      </FadeIn>

      <div className="w-full max-w-4xl flex flex-col gap-10">

        <FadeIn delay={200}>
          <div className="relative group w-full">
            {/* Soft decorative light behind card */}
            <div className={`absolute -inset-4 bg-accent opacity-[0.03] blur-3xl rounded-[40px] transition duration-1000 ${status === 'recording' ? 'animate-pulse opacity-[0.08]' : ''}`} />

            <div className="relative saas-card p-10 md:p-14 flex flex-col gap-10 bg-white z-10 rounded-[32px] border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] focus-within:shadow-[0_20px_50px_rgba(37,99,235,0.06)] transition-all">

              <div className="flex items-center justify-between pb-8 border-b border-slate-100">
                <div className={`flex items-center gap-3 px-4 py-2 rounded-full border shadow-sm transition-all duration-300 ${status === 'recording' ? 'bg-red-50 border-red-200 text-error' :
                    status === 'analyzing' ? 'bg-orange-50 border-orange-200 text-orange-600' :
                      'bg-slate-50 border-slate-200 text-slate-500 font-semibold'
                  }`}>
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${status === 'recording' ? 'bg-error animate-pulse' :
                        status === 'analyzing' ? 'bg-orange-500 animate-spin border-2 border-t-transparent' :
                          'bg-slate-300'
                      }`}
                  />
                  <span className="text-[12px] font-black tracking-widest uppercase">
                    {status === 'recording' ? 'LIVE RECORDING' :
                      status === 'analyzing' ? 'ANALYZING VOICE' :
                        'SYSTEM STANDBY'}
                  </span>
                </div>

                <div className={`font-mono text-3xl font-black tracking-tighter tabular-nums px-4 py-1.5 rounded-xl border border-transparent shadow-inner ${status === 'recording' ? 'bg-slate-50 border-slate-100 text-slate-800' : 'text-slate-300'}`}>
                  {formatTime(time)}
                </div>
              </div>

              <div className="relative w-full rounded-2xl bg-[#f8fafc] border border-slate-200 shadow-inner overflow-hidden focus-within:ring-4 focus-within:ring-accent/5 focus-within:border-accent/20 transition-all">
                <button
                  aria-label="recorder text area shadow"
                  className="absolute inset-0 w-full h-full pointer-events-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]"
                />
                <textarea
                  className="w-full h-64 md:h-80 p-10 text-xl leading-relaxed bg-transparent border-none appearance-none focus:outline-none resize-none text-slate-700 font-semibold placeholder:text-slate-300 selection:bg-accent/10"
                  readOnly
                  value={transcript}
                  placeholder="Start speaking, and we'll visualize your transcript right here..."
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-error text-sm font-semibold rounded-xl text-center animate-shake">
                  {error}
                </div>
              )}
            </div>
          </div>
        </FadeIn>

        {/* Action Controls Section */}
        <FadeIn delay={400} className="flex flex-col items-center gap-8 py-6">
          <div className="relative">
            {/* Circular Microphone Toggle with pulse when recording */}
            <button
              onClick={status === 'idle' ? startRecording : status === 'recording' ? stopAndAnalyze : undefined}
              disabled={status === 'analyzing'}
              className={`group relative w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-500 transform active:scale-90 z-20 ${status === 'idle'
                  ? 'bg-white border-2 border-slate-200 text-slate-400 hover:text-accent hover:border-accent/40 shadow-[0_10px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 animate-soft-pulse'
                  : status === 'recording'
                    ? 'bg-white text-error border-2 border-error shadow-[0_0_0_10px_rgba(239,68,68,0.1)]'
                    : 'bg-slate-50 text-slate-300 border-2 border-slate-200 scale-95 cursor-wait'
                }`}
            >
              <div className={`flex items-center justify-center w-24 h-24 rounded-full transition-all duration-500 overflow-hidden ${status === 'recording' ? 'bg-red-50 animate-recording-ring' : 'bg-slate-50 group-hover:bg-blue-50'}`}>
                {status === 'recording' ? (
                  <div className="w-8 h-8 bg-error rounded-md" />
                ) : status === 'analyzing' ? (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-accent">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                )}
              </div>
            </button>
          </div>

          <div className="text-center">
            {status === 'idle' && (
              <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
                Tap to record
              </p>
            )}
            {status === 'recording' && (
              <p className="text-sm font-black uppercase tracking-[0.2em] text-error animate-pulse">
                Click to stop & analyze
              </p>
            )}
            {status === 'analyzing' && (
              <p className="text-sm font-black uppercase tracking-[0.2em] text-accent animate-pulse">
                Analyzing Insights...
              </p>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
