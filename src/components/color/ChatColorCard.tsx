import {
  ArrowLeft,
  Camera,
  Check,
  Copy,
  Layers,
  Palette,
  Sparkles,
  Store,
  RefreshCw,
  Info,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  getColorByCode,
  getComplementaryColor,
  getSimilarColors,
  isLightColor,
} from "@/lib/colorsData";
import { playLocationChime } from "@/lib/location-chime";
import { cn } from "@/lib/utils";
import { ColorItem } from "@/types/colors";

import { ColorPackagingModal } from "./ColorPackagingModal";
import { WallVisualizerModal } from "./WallVisualizerModal";

interface ChatColorCardProps {
  color: ColorItem;
  onSelectColor?: (color: ColorItem) => void;
  onOpenPalette?: () => void;
  screenId?: string;
  className?: string;
}

export function ChatColorCard({
  color,
  onSelectColor,
  onOpenPalette,
  screenId,
  className,
}: ChatColorCardProps) {
  const [copied, setCopied] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [showPackaging, setShowPackaging] = useState(false);

  const light = isLightColor(color.hex);
  const isTambour = color.brand === "טמבור";

  const similarShades = getSimilarColors(color);
  const complementaryShade = getComplementaryColor(color);

  const handleCopyHex = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
    toast.success(`קוד HEX ${color.hex} הועתק ללוח!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwitchColor = (newColor: ColorItem) => {
    playLocationChime("slide");
    if (onSelectColor) {
      onSelectColor(newColor);
    }
  };

  return (
    <>
      <div
        dir="rtl"
        className={cn(
          "w-full max-w-lg rounded-3xl overflow-hidden border-2 border-slate-200/90 dark:border-slate-800 bg-card text-card-foreground shadow-lg transition-all duration-300 hover:shadow-xl my-2 text-right",
          className,
        )}
      >
        {/* Generous Authentic HEX Swatch Block */}
        <div
          className="relative w-full h-44 sm:h-52 p-4 flex flex-col justify-between transition-colors duration-500 select-none shadow-inner"
          style={{ backgroundColor: color.hex }}
        >
          {/* Subtle Plaster Grain & Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/35 pointer-events-none" />

          {/* Top Bar on Swatch */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-black shadow-md border border-white/20",
                  isTambour ? "bg-red-600 text-white" : "bg-blue-600 text-white",
                )}
              >
                {color.brand}
              </span>
              <span
                className={cn(
                  "px-2 py-1 rounded-lg text-[11px] font-bold shadow-sm backdrop-blur-md",
                  light
                    ? "bg-black/15 text-slate-900 border border-black/10"
                    : "bg-white/20 text-white border border-white/20",
                )}
              >
                {color.family}
              </span>
            </div>

            {/* Quick Copy HEX */}
            <button
              type="button"
              onClick={handleCopyHex}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-mono font-black flex items-center gap-1.5 shadow-md backdrop-blur-md transition-all active:scale-95",
                light
                  ? "bg-black/20 text-slate-950 hover:bg-black/30 border border-black/20"
                  : "bg-white/25 text-white hover:bg-white/35 border border-white/30",
              )}
              title="העתק קוד HEX"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              <span>{color.hex.toUpperCase()}</span>
            </button>
          </div>

          {/* Bottom on Swatch - Bold Name and Manufacturer Code */}
          <div className="relative z-10">
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  "text-2xl sm:text-3xl font-black tracking-tight drop-shadow-sm",
                  light ? "text-slate-950" : "text-white",
                )}
              >
                {color.name}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={cn(
                  "font-mono text-sm sm:text-base font-black px-2 py-0.5 rounded-md",
                  light
                    ? "bg-black/10 text-slate-900 border border-black/10"
                    : "bg-white/20 text-white border border-white/20",
                )}
              >
                קוד: {color.code}
              </span>
              {color.rgb && (
                <span
                  className={cn(
                    "text-[11px] font-mono",
                    light ? "text-slate-700" : "text-white/80",
                  )}
                >
                  {color.rgb}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 bg-card">
          {/* Atmosphere & Description */}
          <div className="rounded-2xl bg-muted/40 p-3.5 border border-border/80 text-xs leading-relaxed">
            <p className="text-foreground/90 font-medium">{color.description}</p>
            {color.finishRecommended && color.finishRecommended.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-border/60 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="font-bold text-foreground">סדרות וגימור מומלץ:</span>
                {color.finishRecommended.map((f) => (
                  <span
                    key={f}
                    className="rounded-md bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-500/20 px-2 py-0.5 font-bold text-[10px]"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Similar Shades Bar (סרגל גוונים דומים) */}
          {similarShades.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Palette className="size-3.5 text-amber-500" />
                  <span>גוונים דומים באותו תת-טון:</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">לחץ להחלפה</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {similarShades.map((sim) => {
                  const simLight = isLightColor(sim.hex);
                  return (
                    <button
                      key={sim.id}
                      type="button"
                      onClick={() => handleSwitchColor(sim)}
                      className="group flex items-center gap-2.5 p-2 rounded-xl border border-border bg-muted/20 hover:bg-muted/60 hover:border-amber-400 transition-all text-right active:scale-[0.98]"
                    >
                      {/* Swatch chip */}
                      <div
                        className="size-9 rounded-lg shadow-xs border border-black/10 shrink-0 group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: sim.hex }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground truncate group-hover:text-amber-600 dark:group-hover:text-amber-400">
                          {sim.name}
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground">
                          {sim.code} • {sim.hex}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Accent Wall Complementary Shade (גוון משלים לקיר כוח) */}
          {complementaryShade && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-amber-500" />
                  <span>גוון משלים מומלץ לקיר כוח (Accent Wall):</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  שילוב הרמוני
                </span>
              </div>

              <div
                onClick={() => handleSwitchColor(complementaryShade)}
                className="group relative flex items-center justify-between p-3 rounded-2xl border-2 border-border/80 bg-gradient-to-l from-muted/40 via-card to-card hover:border-amber-400 cursor-pointer transition-all active:scale-[0.99] shadow-xs"
              >
                {/* Visual dual swatch comparison */}
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3 rtl:space-x-reverse items-center shrink-0">
                    <div
                      className="size-10 rounded-xl shadow-md border-2 border-background z-10"
                      style={{ backgroundColor: color.hex }}
                      title={`קיר ראשי: ${color.name}`}
                    />
                    <div
                      className="size-10 rounded-xl shadow-md border-2 border-background group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: complementaryShade.hex }}
                      title={`קיר כוח: ${complementaryShade.name}`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400">
                        {complementaryShade.name}
                      </span>
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {complementaryShade.code}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">
                      ניגוד מעוצב לקיר טלוויזיה, גב מיטה או פינת אוכל
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs font-bold gap-1 text-amber-600 dark:text-amber-400 group-hover:bg-amber-400/20"
                >
                  <span>בחר גוון זה</span>
                  <ArrowLeft className="size-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="pt-2 border-t border-border space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {/* 📸 הדמיה על קיר החדר */}
              <Button
                type="button"
                onClick={() => setShowVisualizer(true)}
                className="h-11 font-black text-xs bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 shadow-md gap-1.5 rounded-xl active:scale-95 transition-all"
              >
                <Camera className="size-4 text-amber-400" />
                <span>📸 הדמיה על קיר החדר</span>
              </Button>

              {/* 🛒 בחירת מארז ואיסוף בסניף */}
              <Button
                type="button"
                onClick={() => setShowPackaging(true)}
                className="h-11 font-black text-xs bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-md gap-1.5 rounded-xl active:scale-95 transition-all"
              >
                <Store className="size-4" />
                <span>🛒 מארז ואיסוף בסניף</span>
              </Button>
            </div>

            {/* 🎨 החלפת גוון */}
            {onOpenPalette && (
              <Button
                type="button"
                variant="outline"
                onClick={onOpenPalette}
                className="w-full h-9 font-bold text-xs gap-1.5 rounded-xl border-border/80 hover:bg-accent text-foreground/80 active:scale-95 transition-all"
              >
                <Palette className="size-3.5 text-amber-500" />
                <span>🎨 החלפת גוון מהמניפה המלאה</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Wall Visualizer Modal */}
      <WallVisualizerModal
        isOpen={showVisualizer}
        onClose={() => setShowVisualizer(false)}
        color={color}
        onOpenPackaging={() => setShowPackaging(true)}
      />

      {/* Packaging & Branch Pickup Modal */}
      <ColorPackagingModal
        isOpen={showPackaging}
        onClose={() => setShowPackaging(false)}
        color={color}
        screenId={screenId}
      />
    </>
  );
}
