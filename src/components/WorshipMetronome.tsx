import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Activity } from 'lucide-react';

interface WorshipMetronomeProps {
  initialBpm?: number | string;
  compact?: boolean;
  onBpmChange?: (bpm: number) => void;
}

export const WorshipMetronome: React.FC<WorshipMetronomeProps> = ({
  initialBpm = 72,
  compact = false,
  onBpmChange
}) => {
  const [bpm, setBpm] = useState<number>(() => {
    const n = Number(initialBpm);
    return !isNaN(n) && n >= 40 && n <= 240 ? n : 72;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [beat, setBeat] = useState<number>(0);
  const [timeSignature, setTimeSignature] = useState<'4/4' | '3/4' | '6/8'>('4/4');

  // Tap tempo state
  const tapTimesRef = useRef<number[]>([]);
  const timerRef = useRef<any>(null);
  const beatRef = useRef<number>(0);

  // Sync when initialBpm changes
  useEffect(() => {
    const n = Number(initialBpm);
    if (!isNaN(n) && n >= 40 && n <= 240) {
      setBpm(n);
    }
  }, [initialBpm]);

  // Web Audio click generator
  const playClick = (isAccent: boolean) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = isAccent ? 1200 : 800;
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.04);
    } catch (_) {}
  };

  const getBeatsPerMeasure = () => {
    if (timeSignature === '3/4') return 3;
    if (timeSignature === '6/8') return 6;
    return 4;
  };

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      setBeat(0);
      beatRef.current = 0;
      return;
    }

    const intervalMs = (60 / bpm) * 1000;
    const maxBeats = getBeatsPerMeasure();

    timerRef.current = setInterval(() => {
      beatRef.current = (beatRef.current % maxBeats) + 1;
      const isAccent = beatRef.current === 1;
      setBeat(beatRef.current);
      playClick(isAccent);
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, bpm, soundEnabled, timeSignature]);

  const handleTapTempo = () => {
    const now = performance.now();
    const taps = tapTimesRef.current;

    // Filter taps older than 2.5s
    const recentTaps = taps.filter(t => now - t < 2500);
    recentTaps.push(now);
    tapTimesRef.current = recentTaps;

    if (recentTaps.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < recentTaps.length; i++) {
        intervals.push(recentTaps[i] - recentTaps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 40 && calculatedBpm <= 240) {
        setBpm(calculatedBpm);
        onBpmChange?.(calculatedBpm);
      }
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-slate-900/90 text-white px-3 py-1.5 rounded-xl border border-slate-700 shadow-sm text-xs">
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className={`p-1.5 rounded-lg flex items-center justify-center transition ${
            isPlaying ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
          }`}
          title={isPlaying ? 'Pausar Metrônomo' : 'Iniciar Metrônomo'}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>

        <div className="flex items-center gap-1">
          <span className="font-mono font-bold text-amber-400 text-sm w-9 text-center">{bpm}</span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">BPM</span>
        </div>

        {/* Visual Pulse LED */}
        <div className="flex gap-1 items-center px-1">
          {Array.from({ length: getBeatsPerMeasure() }).map((_, idx) => {
            const isCurrent = beat === idx + 1;
            return (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-75 ${
                  isCurrent
                    ? idx === 0 ? 'bg-amber-400 scale-125 shadow-sm shadow-amber-400' : 'bg-emerald-400 scale-110'
                    : 'bg-slate-700'
                }`}
              />
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleTapTempo}
          className="text-[10px] uppercase font-black bg-slate-800 hover:bg-slate-700 border border-slate-600 px-2 py-1 rounded transition text-slate-300"
          title="Clique no ritmo para calcular o BPM"
        >
          Tap
        </button>

        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="text-slate-400 hover:text-white p-1"
          title={soundEnabled ? 'Silenciar Áudio' : 'Ativar Áudio'}
        >
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-amber-400" />
          <h5 className="text-xs font-black uppercase tracking-wider text-slate-200">Metrônomo & Tap Tempo</h5>
        </div>
        <div className="flex gap-1">
          {(['4/4', '3/4', '6/8'] as const).map(sig => (
            <button
              key={sig}
              type="button"
              onClick={() => setTimeSignature(sig)}
              className={`text-[10px] px-2 py-0.5 rounded font-bold transition ${
                timeSignature === sig ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {sig}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-extrabold text-amber-400">{bpm}</span>
          <span className="text-xs font-bold text-slate-400 uppercase">BPM</span>
        </div>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: getBeatsPerMeasure() }).map((_, idx) => {
            const isCurrent = beat === idx + 1;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-75 flex items-center justify-center text-[9px] font-bold ${
                  isCurrent
                    ? idx === 0
                      ? 'bg-amber-400 text-slate-950 scale-125 shadow-md shadow-amber-400/50'
                      : 'bg-emerald-400 text-slate-950 scale-110 shadow-sm'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>
      </div>

      <input
        type="range"
        min={40}
        max={220}
        value={bpm}
        onChange={(e) => {
          const val = Number(e.target.value);
          setBpm(val);
          onBpmChange?.(val);
        }}
        className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
      />

      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex-1 py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition ${
            isPlaying ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          {isPlaying ? 'Parar' : 'Iniciar'}
        </button>

        <button
          type="button"
          onClick={handleTapTempo}
          className="flex-1 py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1 transition active:scale-95"
        >
          👆 Tap Tempo
        </button>

        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-xl border transition ${
            soundEnabled ? 'bg-indigo-950 border-indigo-700 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
          title={soundEnabled ? 'Som Ativado' : 'Som Mudo'}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>
    </div>
  );
};
