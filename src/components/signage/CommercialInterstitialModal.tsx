import {
  Volume2,
  VolumeX,
  X,
  Sparkles,
  ArrowRight,
  Film,
  Building2,
  Timer,
  Play,
  RotateCcw,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  CURATED_COMMERCIAL_VIDEOS,
  DriveCommercialVideo,
  GOOGLE_DRIVE_FOLDER_NAME,
  GOOGLE_DRIVE_VIDEOS_FOLDER_ID,
} from "@/lib/driveVideos";
import { cn } from "@/lib/utils";

interface CommercialInterstitialModalProps {
  isOpen: boolean;
  onFinished: () => void;
  commercialIndex?: number;
  folderId?: string;
}

export function CommercialInterstitialModal({
  isOpen,
  onFinished,
  commercialIndex = 0,
  folderId = GOOGLE_DRIVE_VIDEOS_FOLDER_ID,
}: CommercialInterstitialModalProps) {
  const currentAd: DriveCommercialVideo =
    CURATED_COMMERCIAL_VIDEOS[commercialIndex % CURATED_COMMERCIAL_VIDEOS.length] ||
    CURATED_COMMERCIAL_VIDEOS[0]!;

  const totalDuration = currentAd.durationSec || 12;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalDuration);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [videoError, setVideoError] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const onFinishedRef = useRef(onFinished);
  useEffect(() => {
    onFinishedRef.current = onFinished;
  });

  // Reset timer on open or ad change
  useEffect(() => {
    if (!isOpen) return;
    setSecondsRemaining(totalDuration);
    setVideoError(false);

    let remaining = totalDuration;
    const interval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(interval);
        setSecondsRemaining(0);
        setTimeout(() => {
          onFinishedRef.current();
        }, 0);
      } else {
        setSecondsRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, totalDuration, commercialIndex]);

  // Attempt video playback
  useEffect(() => {
    if (!isOpen) return;
    const v = videoRef.current;
    if (!v) return;

    v.currentTime = 0;
    v.muted = isMuted;

    const playPromise = v.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        v.muted = true;
        setIsMuted((prev) => (prev ? prev : true));
        v.play().catch(() => setVideoError(true));
      });
    }
  }, [isOpen, isMuted, currentAd.streamUrl]);

  if (!isOpen) return null;

  const progressPercent = ((totalDuration - secondsRemaining) / totalDuration) * 100;

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="מעברון שידור שילוט סבן"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-[#0B1320] text-white overflow-hidden select-none animate-in fade-in zoom-in-95 duration-500 font-sans"
    >
      {/* Background Media Stage: HTML5 Video with High-End Ken Burns Fallback */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {!videoError ? (
          <video
            ref={videoRef}
            src={currentAd.streamUrl}
            poster={currentAd.posterUrl}
            playsInline
            muted={isMuted}
            onEnded={() => {
              setTimeout(() => {
                onFinishedRef.current();
              }, 0);
            }}
            onError={() => setVideoError(true)}
            className="size-full object-cover brightness-90 contrast-105"
          />
        ) : (
          <div className="relative size-full overflow-hidden">
            <img
              src={currentAd.posterUrl}
              alt={currentAd.title}
              className="size-full object-cover scale-110 animate-zoom-depth blur-xs brightness-75"
            />
            {/* Animated Grid Overlay */}
            <div className="absolute inset-0 bg-radial from-amber-500/10 via-[#0B1320]/80 to-[#0B1320]" />
          </div>
        )}

        {/* Ambient Dark Gradient Overlays for High-Contrast Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1320] via-black/40 to-black/70 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1320]/90 via-transparent to-[#0B1320]/70 pointer-events-none" />

        {/* Dynamic Scanline & Light Sweep */}
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden opacity-25">
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-amber-400/20 to-transparent animate-sweep-shine" />
        </div>
      </div>

      {/* Top Bar: Branding, Google Drive Folder Tag & Remaining Countdown */}
      <header className="relative z-20 w-full px-6 sm:px-12 py-5 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md">
        {/* Logo and Brand Title */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex size-11 sm:size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-slate-950 font-black text-xl sm:text-2xl shadow-xl shadow-amber-500/20 border border-amber-300">
            ח.ס
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-xl font-black tracking-tight text-white drop-shadow-md">
                ח. סבן חומרי בניין (1994) בע״מ
              </span>
              <span className="rounded-full bg-orange-600/90 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 shadow-sm border border-orange-400/40">
                שידור תדמית
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              מרכז לוגיסטי ואולמות תצוגה • החרש 4 & התלמיד 6 הוד השרון
            </p>
          </div>
        </div>

        {/* Drive Folder Indicator & Audio / Skip Controls */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Drive Folder Tag */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-slate-200 backdrop-blur-md">
            <Film className="size-3.5 text-amber-400" />
            <span>Google Drive: {GOOGLE_DRIVE_FOLDER_NAME}</span>
            <span className="font-mono text-[10px] text-amber-300 bg-black/40 px-1.5 py-0.5 rounded">
              {folderId.slice(0, 10)}...
            </span>
          </div>

          {/* Audio Mute/Unmute */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted((m) => !m)}
            className="rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 size-10 sm:size-12 shadow-md"
            title={isMuted ? "הפעל סאונד" : "השתק סאונד"}
            aria-label={isMuted ? "הפעל שמע" : "השתק שמע"}
          >
            {isMuted ? (
              <VolumeX className="size-5 text-slate-400" />
            ) : (
              <Volume2 className="size-5 text-amber-400" />
            )}
          </Button>

          {/* Quick Skip Button */}
          <Button
            variant="ghost"
            onClick={() => {
              setTimeout(() => {
                onFinishedRef.current();
              }, 0);
            }}
            className="rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs sm:text-sm font-black px-4 h-10 sm:h-12 gap-1.5 shadow-md active:scale-95"
          >
            <span>חזרה למוצרים</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </header>

      {/* Center Stage: Bold Headline, Animated Commercial Typography */}
      <main className="relative z-20 max-w-5xl mx-auto px-6 sm:px-12 my-auto text-right w-full space-y-4 sm:space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs sm:text-sm font-black shadow-lg backdrop-blur-md">
          <Sparkles className="size-4 text-amber-400 animate-pulse" />
          <span>{currentAd.badge}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
          {currentAd.title}
        </h1>

        <p className="text-lg sm:text-2xl text-slate-200 font-bold max-w-3xl leading-relaxed drop-shadow-md">
          {currentAd.headline}
        </p>

        {/* Feature Highlights Grid */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/50 border border-white/15 backdrop-blur-md">
            <span className="text-amber-400 font-black text-xs sm:text-sm block mb-1">
              🚚 צי משאיות מנוף
            </span>
            <p className="text-xs sm:text-sm text-slate-300">
              מרצדס מנוף הרמה לקומות + פלטה מהירה לחלוקה
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/50 border border-white/15 backdrop-blur-md">
            <span className="text-amber-400 font-black text-xs sm:text-sm block mb-1">
              🎨 גיוון צבע ממוחשב
            </span>
            <p className="text-xs sm:text-sm text-slate-300">
              אולם גבס וצבע סניף התלמיד 6 • מניפות טמבור ונירלט
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/50 border border-white/15 backdrop-blur-md">
            <span className="text-amber-400 font-black text-xs sm:text-sm block mb-1">
              ⚡ שירות Click & Collect
            </span>
            <p className="text-xs sm:text-sm text-slate-300">
              הזמנות ישירות מול נועה והכנה מיידית לליקוט
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Footer: Dynamic Countdown Timer & Return Bar */}
      <footer className="relative z-20 w-full border-t border-white/10 bg-black/60 backdrop-blur-lg px-6 sm:px-12 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
          <div className="flex items-center gap-3">
            {/* Elegant Circular Countdown Badge */}
            <div className="relative flex items-center justify-center size-12 sm:size-14 rounded-2xl bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30">
              <span className="text-xl sm:text-2xl font-mono">{secondsRemaining}</span>
            </div>
            <div>
              <p className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                <span>חוזרים לקטלוג המוצרים בעוד {secondsRemaining} שניות...</span>
              </p>
              <p className="text-xs text-slate-400 font-medium">{currentAd.callToAction}</p>
            </div>
          </div>

          {/* Full progress track */}
          <div className="w-full sm:w-80 flex flex-col gap-1">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>התקדמות שידור</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 transition-all duration-1000 ease-linear rounded-full shadow-xs"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
