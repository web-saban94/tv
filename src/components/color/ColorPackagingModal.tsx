import {
  Check,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Minus,
  Package,
  Plus,
  Send,
  Sparkles,
  Store,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { dispatchToCounter, whatsappLink } from "@/lib/counter-dispatch";
import { dispatchDualPersistence } from "@/lib/dual-storage";
import { playLocationChime } from "@/lib/location-chime";
import { cn } from "@/lib/utils";
import { ColorItem } from "@/types/colors";

interface ColorPackagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  color: ColorItem;
  screenId?: string;
}

type PackageOption = {
  id: string;
  label: string;
  sizeLabel: string;
  liters: number;
  coverageM2: string;
  typicalUse: string;
  estimatedPrice: number;
};

const PACKAGING_OPTIONS: PackageOption[] = [
  {
    id: "pail-18",
    label: "פח גדול",
    sizeLabel: "18 ליטר",
    liters: 18,
    coverageM2: "כ-180 מ״ר (2 שכבות)",
    typicalUse: "דירה שלמה או חלל סלון ומסדרונות גדול",
    estimatedPrice: 389,
  },
  {
    id: "gallon-5",
    label: "גלון סטנדרטי",
    sizeLabel: "5 ליטר",
    liters: 5,
    coverageM2: "כ-50 מ״ר (2 שכבות)",
    typicalUse: "חדר שינה ממוצע או קיר כוח רחב",
    estimatedPrice: 159,
  },
  {
    id: "quart-1",
    label: "רבע גלון",
    sizeLabel: "1 ליטר",
    liters: 1,
    coverageM2: "כ-10 מ״ר (2 שכבות)",
    typicalUse: "קיר מוקד קטן, תיקונים או דוגמה בחלל",
    estimatedPrice: 52,
  },
];

export function ColorPackagingModal({
  isOpen,
  onClose,
  color,
  screenId,
}: ColorPackagingModalProps) {
  const [selectedPackId, setSelectedPackId] = useState<string>("pail-18");
  const [selectedFinish, setSelectedFinish] = useState<string>(
    color.finishRecommended[0] || "סופרקריל מט+",
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedBranch, setSelectedBranch] = useState<"talmid" | "harash">("talmid");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentPack =
    PACKAGING_OPTIONS.find((p) => p.id === selectedPackId) || PACKAGING_OPTIONS[0]!;
  const totalPrice = currentPack.estimatedPrice * quantity;

  const branchLabel =
    selectedBranch === "talmid"
      ? "סניף התלמיד 6 (אולם גבס, צבע ופרזול — מחסן 1)"
      : "סניף החרש 4 (מחסן 4 - מגרש ראשי)";

  const branchContactName = selectedBranch === "talmid" ? "יואב" : "איציק זהבי";
  const branchContactPhone = selectedBranch === "talmid" ? "972507855865" : "972504482285";

  const handleDispatch = async () => {
    setIsSubmitting(true);
    try {
      const orderSku = `PAINT-${color.brand === "טמבור" ? "TAM" : "NIR"}-${color.code.replace(/\s+/g, "")}-${currentPack.liters}L`;
      const orderName = `צבע מגוון: ${color.name} (${color.code}) — ${currentPack.label} ${currentPack.sizeLabel} [${selectedFinish}]`;

      // 1. Dispatch to POS counter queue
      dispatchToCounter({
        sku: orderSku,
        productName: orderName,
        quantity,
        unitLabel: currentPack.label,
        estimatedCost: totalPrice,
        note: `איסוף עצמי צבע מגוון: ${customerName || "לקוח דלפק"} | ${branchLabel} | HEX: ${color.hex}`,
        source: "color_studio_pos",
        ...(screenId ? { screenId } : {}),
      });

      // 2. Dual persistence
      await dispatchDualPersistence({
        sku: orderSku,
        productName: orderName,
        quantity,
        unitLabel: currentPack.label,
        unitPrice: currentPack.estimatedPrice,
        estimatedCost: totalPrice,
        warehouse:
          selectedBranch === "talmid"
            ? "סניף התלמיד (מחסן 1 - גבס וצבע)"
            : "סניף החרש (מחסן 4 - ראשי)",
        branchName: selectedBranch === "talmid" ? "סניף התלמיד 6" : "סניף החרש 4",
        note: `הזמנת גיוון צבע ממוחשב: ${customerName || "אורח"} (${customerPhone || "לא צוין"}) | גוון: ${color.name} (${color.code}) | גמר: ${selectedFinish}`,
        source: "מניפת צבע דיגיטלית סבן (PWA)",
        screenId: screenId || "pwa_color_picker",
      });

      // Play audio chime
      playLocationChime("dispatch");

      toast.success("הזמנת הגיוון שודרה בהצלחה לדלפק המכירות! 🎨", {
        description: `המארז יגוון ויוכן לליקוט ב${branchLabel}`,
      });

      onClose();
    } catch (err) {
      toast.error("חלה שגיאה בשידור ההזמנה, נסה שנית");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsappText = (): string => {
    return `שלום ${branchContactName} (מוקד צבע סבן),
אני מעוניין באיסוף עצמי של צבע מגוון:
🎨 *גוון:* ${color.name} (קוד ${color.code} / ${color.brand})
🏷️ *HEX:* ${color.hex} | משפחה: ${color.family}
📦 *מארז:* ${currentPack.label} (${currentPack.sizeLabel})
✨ *גימור:* ${selectedFinish}
🔢 *כמות:* ${quantity} ${currentPack.label}
🏢 *סניף איסוף מבוקש:* ${branchLabel}
👤 *שם לקוח:* ${customerName || "הזמנה מעמדת השילוט"}
${customerPhone ? `📞 *טלפון:* ${customerPhone}` : ""}
💰 *עלות משוערת:* כ-${totalPrice.toLocaleString()} ₪ (כולל מע״מ)`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="בחירת מארז צבע ואיסוף בסניף"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        dir="rtl"
        className="relative flex flex-col w-full max-w-xl max-h-[92vh] bg-card text-card-foreground rounded-3xl shadow-2xl border-2 border-border overflow-hidden"
      >
        {/* Header with Swatch preview */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-slate-900 to-slate-800 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center size-11 rounded-2xl shadow-md border-2 border-white/30"
              style={{ backgroundColor: color.hex }}
            >
              <Package className="size-5 text-white drop-shadow-md" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  בחירת מארז ואיסוף עצמי
                </h2>
                <span className="rounded-md bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5">
                  Click & Collect
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                גיוון הגוון <strong>{color.name}</strong> ({color.code}) בסניפי סבן
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full text-slate-300 hover:text-white hover:bg-white/10"
            aria-label="סגור חלון מארז"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin">
          {/* Packaging Size Options */}
          <div>
            <label className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
              <Package className="size-3.5 text-amber-500" />
              <span>בחר גודל מארז:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PACKAGING_OPTIONS.map((pack) => {
                const active = selectedPackId === pack.id;
                return (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => setSelectedPackId(pack.id)}
                    className={cn(
                      "flex flex-col text-right p-3 rounded-2xl border-2 transition-all active:scale-[0.98]",
                      active
                        ? "border-amber-500 bg-amber-500/10 shadow-sm ring-1 ring-amber-400"
                        : "border-border bg-card hover:border-slate-400 dark:hover:border-slate-600",
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-sm text-foreground">{pack.label}</span>
                      <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                        {pack.sizeLabel}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-foreground/80 mb-0.5">
                      {pack.coverageM2}
                    </span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">
                      {pack.typicalUse}
                    </span>
                    <div className="mt-2 pt-1 border-t border-border/60 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">מחיר משוער:</span>
                      <span className="text-xs font-black text-foreground">
                        ~{pack.estimatedPrice} ₪
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Finish & Series Selection */}
          <div>
            <label className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-amber-500" />
              <span>גימור וסדרת צבע מומלצת:</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                ...color.finishRecommended,
                ...(color.brand === "טמבור"
                  ? ["סופרקריל משי", "סופרקריל מט+"]
                  : ["נירוקריל EXTRA", "אקוורל"]),
              ]
                .filter((v, i, a) => a.indexOf(v) === i)
                .map((finish) => (
                  <button
                    key={finish}
                    type="button"
                    onClick={() => setSelectedFinish(finish)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5",
                      selectedFinish === finish
                        ? "bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 border-transparent shadow-xs"
                        : "bg-background text-foreground/80 hover:bg-accent border-border",
                    )}
                  >
                    {selectedFinish === finish && <Check className="size-3 stroke-[3]" />}
                    <span>{finish}</span>
                  </button>
                ))}
            </div>
          </div>

          {/* Branch Picker */}
          <div>
            <label className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
              <Store className="size-3.5 text-amber-500" />
              <span>בחר סניף איסוף מהיר (הוד השרון):</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedBranch("talmid")}
                className={cn(
                  "p-3 rounded-2xl border-2 text-right transition-all flex flex-col gap-1 relative",
                  selectedBranch === "talmid"
                    ? "border-amber-500 bg-amber-500/10 shadow-xs"
                    : "border-border bg-card hover:bg-accent/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-foreground">סניף התלמיד 6</span>
                  <span className="rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 border border-emerald-500/30">
                    ⭐ מומלץ לצבע
                  </span>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  אולם גבס, צבע ופרזול (מחסן 1) — מכונות גיוון מהירות
                </span>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold mt-1">
                  איש קשר: יואב (050-7855865)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedBranch("harash")}
                className={cn(
                  "p-3 rounded-2xl border-2 text-right transition-all flex flex-col gap-1",
                  selectedBranch === "harash"
                    ? "border-amber-500 bg-amber-500/10 shadow-xs"
                    : "border-border bg-card hover:bg-accent/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-foreground">סניף החרש 4</span>
                  <span className="text-[10px] text-muted-foreground">מחסן 4</span>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  מגרש ראשי לחומרי בניין כבדים
                </span>
                <span className="text-[10px] text-muted-foreground font-bold mt-1">
                  איש קשר: איציק זהבי (050-4482285)
                </span>
              </button>
            </div>
          </div>

          {/* Quantity and Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
            {/* Quantity */}
            <div className="flex items-center justify-between bg-muted/40 p-2.5 rounded-2xl border border-border">
              <span className="text-xs font-bold text-foreground">כמות מארזים:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="size-7 rounded-lg"
                  aria-label="הפחת כמות"
                >
                  <Minus className="size-3" />
                </Button>
                <span className="font-mono font-bold text-sm min-w-[20px] text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="size-7 rounded-lg"
                  aria-label="הוסף כמות"
                >
                  <Plus className="size-3" />
                </Button>
              </div>
            </div>

            {/* Total Price preview */}
            <div className="flex items-center justify-between bg-amber-500/10 p-2.5 rounded-2xl border border-amber-500/30">
              <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                סה״כ משוער לתשלום:
              </span>
              <span className="font-mono font-black text-base text-amber-700 dark:text-amber-300">
                ~{totalPrice.toLocaleString()} ₪
              </span>
            </div>
          </div>

          {/* Optional Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="שם הלקוח / קבלן (לא חובה)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="h-9 px-3 rounded-xl border border-border bg-background text-xs"
            />
            <input
              type="tel"
              placeholder="מספר טלפון לזיהוי בדלפק"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="h-9 px-3 rounded-xl border border-border bg-background text-xs font-mono"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <Button
            size="sm"
            onClick={handleDispatch}
            disabled={isSubmitting}
            className="w-full sm:flex-1 h-10 font-black text-xs bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-md gap-2"
          >
            <Send className="size-4" />
            <span>שדר הזמנה לדלפק המכירות 🚀</span>
          </Button>

          <Button
            size="sm"
            variant="secondary"
            className="w-full sm:w-auto h-10 font-bold text-xs gap-1.5"
            asChild
          >
            <a
              href={`https://wa.me/${branchContactPhone}?text=${encodeURIComponent(getWhatsappText())}`}
              target="_blank"
              rel="noreferrer"
            >
              <span>שליחה בוואטסאפ ל{branchContactName} 📲</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
