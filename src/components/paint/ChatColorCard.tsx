import {
  ArrowLeft,
  Check,
  Copy,
  Layers,
  Palette,
  Sparkles,
  Calculator,
  RefreshCw,
  Info,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ColorShade, getColorShadeByCode, matchMachineBase } from "@/lib/colorFanDeck";
import { cn } from "@/lib/utils";

interface ChatColorCardProps {
  shade: ColorShade;
  onSelectShade?: (shade: ColorShade) => void;
  onConfirmAndCalculate?: (shade: ColorShade) => void;
  onChangeShade?: () => void;
  onOpenVisualizer?: (shade: ColorShade) => void;
  className?: string;
}

export function ChatColorCard({
  shade,
  onSelectShade,
  onConfirmAndCalculate,
  onChangeShade,
  onOpenVisualizer,
  className,
}: ChatColorCardProps) {
  const [copied, setCopied] = useState(false);

  // איתור הגוונים הדומים והמשלים מתוך המאגר
  const similarShades = shade.similarCodes
    .map((code) => getColorShadeByCode(code))
    .filter((s): s is ColorShade => Boolean(s));

  const complementaryShade = getColorShadeByCode(shade.complementaryCode);

  const machineBase = matchMachineBase(shade);

  const handleCopyHex = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(shade.hex);
    setCopied(true);
    toast.success(`קוד הגוון ${shade.hex} הועתק ללוח!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      dir="rtl"
      className={cn(
        "my-3 w-full max-w-md overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/95 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-orange-500/50",
        className,
      )}
    >
      {/* Visual Color Swatch Header */}
      <div
        className="relative h-28 w-full transition-all duration-300 flex items-end p-3"
        style={{
          backgroundColor: shade.hex,
          boxShadow: `inset 0 -30px 40px -10px rgba(0,0,0,0.5)`,
        }}
      >
        <div className="absolute top-2.5 right-3 flex items-center gap-2">
          <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-bold text-white shadow backdrop-blur-sm">
            {shade.brand}
          </span>
          <span className="rounded-full bg-slate-900/70 px-2.5 py-0.5 text-xs font-semibold text-orange-300 shadow backdrop-blur-sm">
            בסיס מכונה {machineBase}
          </span>
        </div>

        <div className="absolute top-2.5 left-3">
          <button
            type="button"
            onClick={handleCopyHex}
            className="flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-xs font-mono text-white transition hover:bg-black/80"
            title="העתק קוד HEX"
          >
            {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
            <span>{shade.hex}</span>
          </button>
        </div>

        {/* Title overlay on swatch */}
        <div className="z-10 text-white drop-shadow-md">
          <div className="text-xs font-mono font-bold tracking-wider text-white/90">
            {shade.code}
          </div>
          <div className="text-lg font-black leading-tight">{shade.name}</div>
        </div>
      </div>

      {/* Details & Harmony Relations Body */}
      <div className="p-3.5 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1 font-medium">
            <Palette className="size-3.5 text-orange-400" />
            משפחה: <strong className="text-white">{shade.family}</strong>
          </span>
          <span className="text-slate-400 font-mono">{shade.nameEn}</span>
        </div>

        <p className="text-xs leading-relaxed text-slate-300 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
          {shade.description}
        </p>

        {/* Finish series recommendations */}
        {shade.finishOptions && shade.finishOptions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] font-semibold text-slate-400">גימורים מומלצים:</span>
            {shade.finishOptions.map((fin) => (
              <span
                key={fin}
                className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-200 border border-slate-700"
              >
                {fin}
              </span>
            ))}
          </div>
        )}

        {/* Similar shades and Complementary Accent Wall section */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
              <Sparkles className="size-3.5 text-amber-400" />
              גוונים דומים להשוואה:
            </span>
            <span className="text-[10px] text-slate-400">לחיצה לבחירה מהירה</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {similarShades.map((sim) => (
              <button
                key={sim.code}
                type="button"
                onClick={() => onSelectShade?.(sim)}
                className="flex items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-800/80 p-1.5 text-right transition hover:border-orange-400/80 hover:bg-slate-700"
              >
                <span
                  className="size-6 shrink-0 rounded-md border border-white/20 shadow"
                  style={{ backgroundColor: sim.hex }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-white truncate">{sim.name}</div>
                  <div className="text-[10px] font-mono text-slate-400">{sim.code}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Complementary Accent Shade */}
          {complementaryShade && (
            <div className="pt-1.5 border-t border-slate-800">
              <div className="text-[11px] font-semibold text-orange-300 mb-1 flex items-center justify-between">
                <span>גוון משלים מומלץ לקיר כוח:</span>
                <span className="text-[10px] text-slate-400">Contrast Wall</span>
              </div>
              <button
                type="button"
                onClick={() => onSelectShade?.(complementaryShade)}
                className="w-full flex items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-950/20 p-1.5 text-right transition hover:border-orange-400 hover:bg-orange-900/30"
              >
                <span
                  className="size-6 shrink-0 rounded-md border border-white/30 shadow"
                  style={{ backgroundColor: complementaryShade.hex }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-white truncate">
                    {complementaryShade.name}
                  </div>
                  <div className="text-[10px] font-mono text-orange-200/70">
                    {complementaryShade.code} • {complementaryShade.family}
                  </div>
                </div>
                <ArrowLeft className="size-3.5 text-orange-400 ml-1" />
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => onConfirmAndCalculate?.(shade)}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold hover:from-orange-500 hover:to-amber-500 shadow-md shadow-orange-950/50"
          >
            <Calculator className="size-3.5 ml-1.5" />
            אישור גוון ומעבר לכמויות
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChangeShade?.()}
            className="w-full border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            <RefreshCw className="size-3.5 ml-1.5" />
            החלף גוון מהמניפה
          </Button>
        </div>

        {/* Optional Visualizer Trigger */}
        {onOpenVisualizer && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenVisualizer(shade)}
            className="w-full text-xs text-slate-400 hover:text-orange-300 hover:bg-slate-800/50"
          >
            <Layers className="size-3.5 ml-1" />
            הדמיה וירטואלית על קיר בסלון
          </Button>
        )}
      </div>
    </div>
  );
}
