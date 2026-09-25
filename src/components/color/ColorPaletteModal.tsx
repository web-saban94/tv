import { Check, Filter, Palette, Search, Sparkles, X, Layers, Info } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  COLOR_BRANDS,
  COLOR_DATABASE,
  COLOR_FAMILIES,
  filterColors,
  isLightColor,
} from "@/lib/colorsData";
import { cn } from "@/lib/utils";
import { ColorBrand, ColorFamily, ColorItem } from "@/types/colors";

interface ColorPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectColor: (color: ColorItem) => void;
  selectedCode?: string;
}

export function ColorPaletteModal({
  isOpen,
  onClose,
  onSelectColor,
  selectedCode,
}: ColorPaletteModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("הכל");
  const [selectedFamily, setSelectedFamily] = useState<string>("כל המשפחות");

  const filteredColors = useMemo(() => {
    return filterColors(searchQuery, selectedBrand, selectedFamily);
  }, [searchQuery, selectedBrand, selectedFamily]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="מניפת גוונים דיגיטלית"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        dir="rtl"
        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] bg-card text-card-foreground rounded-3xl shadow-2xl border-2 border-border overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-2xl bg-amber-400 text-slate-950 shadow-md">
              <Palette className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  מניפת גוונים דיגיטלית
                </h2>
                <span className="rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2 py-0.5">
                  טמבור & נירלט
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                גיוון ממוחשב מדויק בסניפי סבן הוד השרון (התלמיד 6 / החרש 4)
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full text-slate-300 hover:text-white hover:bg-white/10"
            aria-label="סגור חלון מניפה"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Filters & Search toolbar */}
        <div className="p-4 border-b border-border bg-muted/40 space-y-3 shrink-0">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש מהיר לפי קוד (כגון 0021P, IS 0234) או שם גוון (פנינה, מרווה, בטון)..."
              className="pr-10 pl-9 h-11 text-sm rounded-xl bg-background border-border/80 shadow-xs focus-visible:ring-amber-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="נקה חיפוש"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-semibold p-1"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Brands */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-[11px] font-bold text-muted-foreground ml-1 shrink-0">
                מותג:
              </span>
              {["הכל", ...COLOR_BRANDS].map((brand) => {
                const active = selectedBrand === brand;
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => setSelectedBrand(brand)}
                    className={cn(
                      "px-3 py-1 text-xs font-bold rounded-lg transition-all shrink-0 border",
                      active
                        ? brand === "טמבור"
                          ? "bg-red-600 text-white border-red-700 shadow-xs"
                          : brand === "נירלט"
                            ? "bg-blue-600 text-white border-blue-700 shadow-xs"
                            : "bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 border-transparent shadow-xs"
                        : "bg-background text-foreground/80 hover:bg-accent border-border/70",
                    )}
                  >
                    {brand}
                  </button>
                );
              })}
            </div>

            {/* Families */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-[11px] font-bold text-muted-foreground ml-1 shrink-0">
                משפחה:
              </span>
              <button
                type="button"
                onClick={() => setSelectedFamily("כל המשפחות")}
                className={cn(
                  "px-2.5 py-1 text-xs font-bold rounded-lg transition-all shrink-0 border",
                  selectedFamily === "כל המשפחות"
                    ? "bg-amber-400 text-slate-950 border-amber-500 shadow-xs"
                    : "bg-background text-foreground/80 hover:bg-accent border-border/70",
                )}
              >
                הכל
              </button>
              {COLOR_FAMILIES.map((family) => {
                const active = selectedFamily === family;
                return (
                  <button
                    key={family}
                    type="button"
                    onClick={() => setSelectedFamily(family)}
                    className={cn(
                      "px-2.5 py-1 text-xs font-bold rounded-lg transition-all shrink-0 border",
                      active
                        ? "bg-amber-400 text-slate-950 border-amber-500 shadow-xs"
                        : "bg-background text-foreground/80 hover:bg-accent border-border/70",
                    )}
                  >
                    {family}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Color Grid Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 scrollbar-thin">
          <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
            <span className="font-semibold">
              נמצאו <strong className="text-foreground">{filteredColors.length}</strong> גוונים
              מתאימים
            </span>
            <span className="text-[11px]">לחץ על גוון כדי להציגו בצ&apos;אט עם נועה</span>
          </div>

          {filteredColors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground space-y-3">
              <div className="size-14 rounded-full bg-muted flex items-center justify-center">
                <Palette className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-bold text-foreground">לא נמצאו גוונים התואמים לחיפוש</p>
              <p className="text-xs max-w-xs">
                נסה לחפש קוד אחר או לאפס את הסינונים. במחסן 1 סבן ניתן לגוון כל קוד מכל מניפה.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedBrand("הכל");
                  setSelectedFamily("כל המשפחות");
                }}
                className="mt-2 text-xs"
              >
                איפוס סינונים
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredColors.map((item) => {
                const isSelected = selectedCode === item.code || selectedCode === item.id;
                const light = isLightColor(item.hex);
                const isTambour = item.brand === "טמבור";

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectColor(item);
                      onClose();
                    }}
                    className={cn(
                      "group relative flex flex-col text-right rounded-2xl overflow-hidden border-2 transition-all duration-200 bg-card hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-[0.98]",
                      isSelected
                        ? "border-amber-500 shadow-md ring-2 ring-amber-400/50"
                        : "border-border hover:border-slate-400 dark:hover:border-slate-600",
                    )}
                  >
                    {/* Generous Authentic HEX Swatch */}
                    <div
                      className="relative w-full h-28 sm:h-32 transition-transform duration-300 group-hover:scale-[1.02] flex flex-col justify-between p-2.5"
                      style={{ backgroundColor: item.hex }}
                    >
                      {/* Brand Pill Badge */}
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md text-[10px] font-black shadow-xs",
                            isTambour ? "bg-red-600 text-white" : "bg-blue-600 text-white",
                          )}
                        >
                          {item.brand}
                        </span>

                        {isSelected && (
                          <span className="size-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                            <Check className="size-3.5 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      {/* HEX Label on Swatch */}
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded font-mono text-[10px] font-bold shadow-xs backdrop-blur-xs",
                            light
                              ? "bg-black/20 text-slate-900 border border-black/10"
                              : "bg-white/20 text-white border border-white/20",
                          )}
                        >
                          {item.hex.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-2.5 flex flex-col gap-1 bg-card">
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-mono text-xs font-black text-foreground tracking-tight">
                          {item.code}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold truncate max-w-[80px]">
                          {item.family}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1 leading-snug">
                        {item.finishRecommended.join(", ")}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="p-3 border-t border-border bg-muted/30 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground shrink-0">
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-amber-500" />
            <span className="font-semibold text-foreground">מכונות גיוון צבע ממוחשבות:</span>
            <span>אספקה מהירה תוך דקות באולם התלמיד 6</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs font-bold">
            סגור מניפה
          </Button>
        </div>
      </div>
    </div>
  );
}
