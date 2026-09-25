import {
  Camera,
  Check,
  Eye,
  Maximize2,
  Minimize2,
  Palette,
  RotateCcw,
  Sparkles,
  Sun,
  Upload,
  X,
  Store,
} from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { isLightColor } from "@/lib/colorsData";
import { cn } from "@/lib/utils";
import { ColorItem } from "@/types/colors";

interface WallVisualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  color: ColorItem;
  onOpenPackaging: () => void;
}

type RoomPreset = {
  id: string;
  name: string;
  subtitle: string;
  wallArea: string; // CSS clip-path or coordinate polygon for the wall
  furnitureSvg: React.ReactNode;
};

export function WallVisualizerModal({
  isOpen,
  onClose,
  color,
  onOpenPackaging,
}: WallVisualizerModalProps) {
  const [selectedRoom, setSelectedRoom] = useState<string>("living");
  const [lightTemp, setLightTemp] = useState<"warm" | "neutral" | "day">("neutral");
  const [showOriginal, setShowOriginal] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUserPhoto(url);
      toast.success("תמונת החדר הועלתה בהצלחה!", {
        description: "הדמיית הגוון הוחלה על התמונה.",
      });
    }
  };

  const lightFilter =
    lightTemp === "warm"
      ? "sepia(0.2) saturate(1.15) hue-rotate(-10deg)"
      : lightTemp === "day"
        ? "brightness(1.05) contrast(1.05) hue-rotate(5deg)"
        : "none";

  const lightOverlayColor =
    lightTemp === "warm"
      ? "rgba(255, 200, 100, 0.15)"
      : lightTemp === "day"
        ? "rgba(180, 220, 255, 0.12)"
        : "rgba(255, 255, 255, 0.05)";

  const lightName =
    lightTemp === "warm"
      ? "תאורה חמה (3000K)"
      : lightTemp === "day"
        ? "אור יום (5000K)"
        : "תאורה טבעית (4000K)";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="הדמיית גוון על קיר החדר"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        dir="rtl"
        className="relative flex flex-col w-full max-w-4xl max-h-[92vh] bg-card text-card-foreground rounded-3xl shadow-2xl border-2 border-border overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-2xl bg-amber-400 text-slate-950 shadow-md">
              <Camera className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  הדמיה מציאותית על קיר
                </h2>
                <span
                  className="rounded-full text-[10px] font-bold px-2 py-0.5 border"
                  style={{
                    backgroundColor: color.hex,
                    color: isLightColor(color.hex) ? "#020617" : "#ffffff",
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                >
                  {color.name} ({color.code})
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                התרשמות מאור טבעי, שילוב ריהוט וטמפרטורת תאורה
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full text-slate-300 hover:text-white hover:bg-white/10"
            aria-label="סגור חלון הדמיה"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Toolbar */}
        <div className="p-3 sm:p-4 border-b border-border bg-muted/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Room Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-bold text-muted-foreground ml-1">חלל:</span>
            {[
              { id: "living", name: "סלון מרכזי" },
              { id: "bedroom", name: "חדר שינה" },
              { id: "dining", name: "פינת אוכל" },
            ].map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => {
                  setSelectedRoom(room.id);
                  setUserPhoto(null);
                }}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-lg transition-all border",
                  selectedRoom === room.id && !userPhoto
                    ? "bg-amber-400 text-slate-950 border-amber-500 shadow-xs"
                    : "bg-background text-foreground/80 hover:bg-accent border-border/70",
                )}
              >
                {room.name}
              </button>
            ))}
          </div>

          {/* Lighting Selector */}
          <div className="flex items-center gap-1.5">
            <Sun className="size-3.5 text-amber-500" />
            <span className="text-[11px] font-bold text-muted-foreground">תאורה:</span>
            {[
              { id: "warm", label: "חמה 3000K" },
              { id: "neutral", label: "טבעית 4000K" },
              { id: "day", label: "אור יום 5000K" },
            ].map((light) => (
              <button
                key={light.id}
                type="button"
                onClick={() => setLightTemp(light.id as "warm" | "neutral" | "day")}
                className={cn(
                  "px-2.5 py-1 text-xs font-bold rounded-lg transition-all border",
                  lightTemp === light.id
                    ? "bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 border-transparent shadow-xs"
                    : "bg-background text-foreground/80 hover:bg-accent border-border/70",
                )}
              >
                {light.label}
              </button>
            ))}
          </div>

          {/* Upload own photo */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs h-8 gap-1.5 font-bold"
            >
              <Upload className="size-3.5" />
              <span>העלאת תמונת חדר</span>
            </Button>

            {userPhoto && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUserPhoto(null)}
                className="text-xs h-8 text-destructive hover:bg-destructive/10"
              >
                איפוס להדמיית ברירת מחדל
              </Button>
            )}
          </div>
        </div>

        {/* Visualizer Canvas Area */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center p-4 sm:p-6 min-h-[340px]">
          {/* Main Stage */}
          <div
            className="relative w-full max-w-2xl aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl border border-white/10 select-none"
            style={{ filter: lightFilter }}
          >
            {userPhoto ? (
              // Custom User Photo with Color Overlay Blend
              <div className="relative size-full">
                <img src={userPhoto} alt="תמונת חדר הלקוח" className="size-full object-cover" />
                {!showOriginal && (
                  <div
                    className="absolute inset-0 mix-blend-multiply opacity-85 transition-opacity duration-300"
                    style={{ backgroundColor: color.hex }}
                  />
                )}
              </div>
            ) : (
              // Vector Architectural Room Model
              <div className="relative size-full bg-slate-900">
                {/* Simulated Wall with Chosen Color */}
                <div
                  className="absolute inset-0 transition-colors duration-500"
                  style={{
                    backgroundColor: showOriginal ? "#e2e8f0" : color.hex,
                  }}
                >
                  {/* Subtle Wall Plaster Texture & Shadow Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35 pointer-events-none" />
                  <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/30 pointer-events-none" />

                  {/* Ceiling Line */}
                  <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-white/20 to-transparent" />
                </div>

                {/* Flooring */}
                <div className="absolute bottom-0 inset-x-0 h-[28%] bg-gradient-to-t from-stone-800 to-stone-700 shadow-inner">
                  {/* Wood floor planks pattern */}
                  <div
                    className="size-full opacity-20"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(90deg, #000 0, #000 1px, transparent 1px, transparent 40px)",
                    }}
                  />
                  {/* Baseboard Moulding (פנל רצפה) */}
                  <div className="absolute top-0 inset-x-0 h-3 bg-white/90 shadow-md border-b border-black/20" />
                </div>

                {/* Architectural Decor & Furniture SVG based on Room Preset */}
                <svg
                  viewBox="0 0 800 500"
                  className="absolute inset-0 size-full pointer-events-none"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="12" stdDeviation="16" floodOpacity="0.4" />
                    </filter>
                  </defs>

                  {selectedRoom === "living" && (
                    <>
                      {/* Large Modern Wall Art / Frame */}
                      <rect
                        x="240"
                        y="60"
                        width="320"
                        height="180"
                        rx="8"
                        fill="#1e293b"
                        stroke="#ffffff"
                        strokeWidth="8"
                        filter="url(#soft-shadow)"
                      />
                      <rect x="252" y="72" width="296" height="156" rx="4" fill="#f8fafc" />
                      {/* Geometric Poster Art */}
                      <circle cx="350" cy="150" r="45" fill="#f59e0b" opacity="0.8" />
                      <rect
                        x="370"
                        y="100"
                        width="70"
                        height="90"
                        rx="8"
                        fill="#0284c7"
                        opacity="0.8"
                      />

                      {/* Floor Lamp (שמאל) */}
                      <line x1="120" y1="400" x2="120" y2="140" stroke="#0f172a" strokeWidth="4" />
                      <path
                        d="M 80 140 L 160 140 L 140 90 L 100 90 Z"
                        fill="#f8fafc"
                        stroke="#0f172a"
                        strokeWidth="3"
                        filter="url(#soft-shadow)"
                      />
                      {/* Warm Lamp Glow */}
                      <circle cx="120" cy="115" r="30" fill="#fef08a" opacity="0.3" />

                      {/* Modern Sofa (מרכז-תחתון) */}
                      <g filter="url(#soft-shadow)">
                        {/* Sofa Backrest */}
                        <rect x="180" y="270" width="440" height="90" rx="16" fill="#334155" />
                        {/* Seat Cushions */}
                        <rect x="190" y="320" width="135" height="55" rx="10" fill="#475569" />
                        <rect x="332" y="320" width="135" height="55" rx="10" fill="#475569" />
                        <rect x="475" y="320" width="135" height="55" rx="10" fill="#475569" />
                        {/* Armrests */}
                        <rect x="160" y="300" width="30" height="75" rx="8" fill="#1e293b" />
                        <rect x="610" y="300" width="30" height="75" rx="8" fill="#1e293b" />
                        {/* Throw Pillows */}
                        <rect
                          x="200"
                          y="290"
                          width="45"
                          height="45"
                          rx="8"
                          fill="#f59e0b"
                          transform="rotate(-10 200 290)"
                        />
                        <rect
                          x="555"
                          y="290"
                          width="45"
                          height="45"
                          rx="8"
                          fill="#0284c7"
                          transform="rotate(12 555 290)"
                        />
                      </g>

                      {/* Indoor Plant (ימין) */}
                      <g filter="url(#soft-shadow)">
                        <polygon points="680,390 720,390 710,430 690,430" fill="#d97706" />
                        <path
                          d="M 700 390 Q 660 330 640 310"
                          stroke="#15803d"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 700 390 Q 720 310 740 280"
                          stroke="#16a34a"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 700 390 Q 750 340 760 320"
                          stroke="#22c55e"
                          strokeWidth="7"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </g>
                    </>
                  )}

                  {selectedRoom === "bedroom" && (
                    <>
                      {/* Headboard Wall Panel */}
                      <rect
                        x="180"
                        y="180"
                        width="440"
                        height="180"
                        rx="12"
                        fill="#1e293b"
                        filter="url(#soft-shadow)"
                      />
                      {/* Bed Frame & Linens */}
                      <rect
                        x="200"
                        y="270"
                        width="400"
                        height="130"
                        rx="12"
                        fill="#f8fafc"
                        filter="url(#soft-shadow)"
                      />
                      {/* Pillows */}
                      <rect x="230" y="240" width="80" height="40" rx="8" fill="#e2e8f0" />
                      <rect x="330" y="240" width="80" height="40" rx="8" fill="#e2e8f0" />
                      <rect x="430" y="240" width="80" height="40" rx="8" fill="#e2e8f0" />
                      {/* Nightstand & Lamp left */}
                      <rect x="110" y="320" width="60" height="70" rx="6" fill="#78350f" />
                      <line x1="140" y1="320" x2="140" y2="280" stroke="#000" strokeWidth="3" />
                      <path d="M 125 280 L 155 280 L 148 260 L 132 260 Z" fill="#fef08a" />
                      {/* Nightstand & Lamp right */}
                      <rect x="630" y="320" width="60" height="70" rx="6" fill="#78350f" />
                      <line x1="660" y1="320" x2="660" y2="280" stroke="#000" strokeWidth="3" />
                      <path d="M 645 280 L 675 280 L 668 260 L 652 260 Z" fill="#fef08a" />
                    </>
                  )}

                  {selectedRoom === "dining" && (
                    <>
                      {/* Hanging Pendant Lights */}
                      <line x1="330" y1="0" x2="330" y2="160" stroke="#000" strokeWidth="2" />
                      <ellipse cx="330" cy="165" rx="35" ry="20" fill="#0f172a" />
                      <line x1="470" y1="0" x2="470" y2="160" stroke="#000" strokeWidth="2" />
                      <ellipse cx="470" cy="165" rx="35" ry="20" fill="#0f172a" />
                      {/* Dining Table */}
                      <rect
                        x="200"
                        y="300"
                        width="400"
                        height="30"
                        rx="6"
                        fill="#b45309"
                        filter="url(#soft-shadow)"
                      />
                      <line x1="240" y1="330" x2="240" y2="420" stroke="#78350f" strokeWidth="10" />
                      <line x1="560" y1="330" x2="560" y2="420" stroke="#78350f" strokeWidth="10" />
                      {/* Chairs */}
                      <rect x="250" y="270" width="60" height="80" rx="6" fill="#334155" />
                      <rect x="490" y="270" width="60" height="80" rx="6" fill="#334155" />
                    </>
                  )}
                </svg>

                {/* Ambient Lighting Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none transition-colors duration-300"
                  style={{ backgroundColor: lightOverlayColor }}
                />
              </div>
            )}

            {/* Badges Overlay */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-md flex items-center gap-1.5">
                <span
                  className="size-3 rounded-full border border-white"
                  style={{ backgroundColor: color.hex }}
                />
                <span>{color.name}</span>
                <span className="font-mono text-amber-400">({color.code})</span>
              </span>
            </div>

            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-md">
                {lightName}
              </span>
            </div>

            {/* Before / After toggle button */}
            <div className="absolute bottom-3 right-3">
              <button
                type="button"
                onMouseDown={() => setShowOriginal(true)}
                onMouseUp={() => setShowOriginal(false)}
                onTouchStart={() => setShowOriginal(true)}
                onTouchEnd={() => setShowOriginal(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 shadow-lg hover:bg-amber-300 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Eye className="size-3.5" />
                <span>החזק כדי להשוות מול לבן מקורי</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="size-4 text-amber-500" />
            <span>
              מתאים ליישום עם:{" "}
              <strong className="text-foreground">{color.finishRecommended.join(", ")}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-bold flex-1 sm:flex-none"
            >
              חזרה לצ&apos;אט
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onClose();
                onOpenPackaging();
              }}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs gap-1.5 shadow-md flex-1 sm:flex-none"
            >
              <Store className="size-4" />
              <span>בחירת מארז ואיסוף בסניף 🛒</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
