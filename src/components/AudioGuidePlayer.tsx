import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, RotateCw, X, Mic2 } from 'lucide-react';
import { Artwork } from '../data/jaxData';

interface AudioGuidePlayerProps {
  artwork: Artwork;
  isArabic: boolean;
  onClose: () => void;
}

export const AudioGuidePlayer: React.FC<AudioGuidePlayerProps> = ({
  artwork,
  isArabic,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progressSeconds, setProgressSeconds] = useState<number>(0);
  const totalSeconds = artwork.audioDurationSeconds;
  const timerRef = useRef<number | null>(null);

  // Real SpeechSynthesis
  useEffect(() => {
    let utterance: SpeechSynthesisUtterance | null = null;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = isArabic ? artwork.audioNarrationAr : artwork.audioNarrationEn;
      utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = isArabic ? 'ar-SA' : 'en-US';
      utterance.rate = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const targetVoice = voices.find((v) =>
        isArabic ? v.lang.startsWith('ar') : v.lang.startsWith('en')
      );
      if (targetVoice) utterance.voice = targetVoice;

      utterance.onend = () => setIsPlaying(false);

      if (isPlaying) {
        window.speechSynthesis.speak(utterance);
      }
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [artwork.id, isArabic]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isPlaying) {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      } else {
        window.speechSynthesis.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setProgressSeconds((prev) => {
          if (prev >= totalSeconds) {
            setIsPlaying(false);
            return totalSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, totalSeconds]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const rewind15 = () => setProgressSeconds((prev) => Math.max(0, prev - 15));
  const forward15 = () => setProgressSeconds((prev) => Math.min(totalSeconds, prev + 15));

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 max-w-xl mx-auto">
      <div className="bg-[#0b0e17]/95 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl p-5 shadow-2xl text-stone-100">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Mic2 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400">
              {isArabic ? 'المرشد الصوتي القيّمي · حي جاكس' : 'Curatorial Audio Guide · JAX'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Artwork Info */}
        <div className="mt-3">
          <h3 className="text-lg font-bold text-white">
            {isArabic ? artwork.titleAr : artwork.titleEn}
          </h3>
          <p className="text-xs text-stone-400">
            {isArabic ? artwork.artistAr : artwork.artistEn} · {artwork.hangarCode}
          </p>
        </div>

        {/* Animated Waveform Visualizer in Ice Cyan */}
        <div className="flex items-center justify-center gap-1.5 h-12 my-4 px-2">
          {Array.from({ length: 32 }).map((_, i) => {
            const ratio = i / 32;
            const isPassed = ratio <= progressSeconds / totalSeconds;
            const height = isPlaying
              ? Math.max(12, Math.sin(i * 0.8 + progressSeconds * 3) * 36 + 20)
              : 8;

            return (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isPassed ? 'bg-cyan-400 shadow-[0_0_6px_#00F0FF]' : 'bg-stone-800'
                }`}
                style={{ height: `${height}px` }}
              />
            );
          })}
        </div>

        {/* Progress Bar & Timing */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={totalSeconds}
            value={progressSeconds}
            onChange={(e) => setProgressSeconds(Number(e.target.value))}
            className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[11px] text-stone-400 font-mono">
            <span>{formatTime(progressSeconds)}</span>
            <span>{formatTime(totalSeconds)}</span>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <button
            onClick={rewind15}
            className="p-2 rounded-full hover:bg-white/10 text-stone-300 transition"
            title="Rewind 15s"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-cyan-400 hover:bg-cyan-300 text-stone-950 flex items-center justify-center shadow-lg shadow-cyan-400/20 transition active:scale-95"
          >
            {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 translate-x-0.5" />}
          </button>

          <button
            onClick={forward15}
            className="p-2 rounded-full hover:bg-white/10 text-stone-300 transition"
            title="Forward 15s"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        {/* Transcript Box */}
        <div className="mt-4 p-3 rounded-xl bg-black/50 border border-white/5 max-h-28 overflow-y-auto text-xs leading-relaxed text-stone-300">
          <p className="font-semibold text-cyan-300 mb-1">
            {isArabic ? 'النص الصوتي المسموع:' : 'Spoken Narration:'}
          </p>
          <p>{isArabic ? artwork.audioNarrationAr : artwork.audioNarrationEn}</p>
        </div>
      </div>
    </div>
  );
};
