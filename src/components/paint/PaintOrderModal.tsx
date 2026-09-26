import {
  Calculator,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Minus,
  Package,
  Plus,
  Printer,
  Send,
  Sparkles,
  Store,
  User,
  Phone,
  X,
  ShieldCheck,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ColorShade,
  PackageSize,
  PAINT_PACKAGING_OPTIONS,
  calculatePaintRequirements,
  matchMachineBase,
  COMPLEMENTARY_PAINT_PRODUCTS,
} from "@/lib/colorFanDeck";
import { dispatchToCounter } from "@/lib/counter-dispatch";
import { saveOrderToDevice, getContractorProfile, saveContractorProfile } from "@/lib/dual-storage";
import { cn } from "@/lib/utils";
import { PrintableDispatchTicket, TintDispatchTicketData } from "./PrintableDispatchTicket";

export interface PaintOrderModalProps {
  shade: ColorShade;
  isOpen: boolean;
  onClose: () => void;
  onOrderDispatched?: (ticketData: TintDispatchTicketData) => void;
}

export function PaintOrderModal({
  shade,
  isOpen,
  onClose,
  onOrderDispatched,
}: PaintOrderModalProps) {
  // Existing contractor profile
  const savedProfile = useMemo(() => getContractorProfile(), []);

  // Form states
  const [areaM2, setAreaM2] = useState<number>(35);
  const [roomType, setRoomType] = useState<"indoor" | "wet" | "exterior">("indoor");
  const [selectedFinish, setSelectedFinish] = useState<string>(
    shade.finishOptions[0] || (shade.brand === "טמבור" ? "סופרקריל מט+" : "נירוקריל EXTRA"),
  );
  const [branch, setBranch] = useState<"hatalmid" | "haharash">(
    savedProfile.preferredBranch || "hatalmid",
  );
  const [clientName, setClientName] = useState(savedProfile.name || "");
  const [clientPhone, setClientPhone] = useState(savedProfile.phone || "");
  const [clientType, setClientType] = useState<"קבלן רשום" | "לקוח פרטי" | "חברת בניה">(
    "קבלן רשום",
  );
  const [selectedAddons, setSelectedAddons] = useState<string[]>(["30101", "30301"]); // רולר + מסקנטייפ

  // Modal screen: 'form' | 'ticket'
  const [activeStep, setActiveStep] = useState<"form" | "ticket">("form");
  const [createdTicket, setCreatedTicket] = useState<TintDispatchTicketData | null>(null);

  // Smart calculation
  const coverageRate = roomType === "wet" ? 10 : roomType === "exterior" ? 8 : 12;
  const calcResult = useMemo(
    () => calculatePaintRequirements(areaM2, 2, coverageRate, shade.brand),
    [areaM2, coverageRate, shade.brand],
  );

  const machineBase = matchMachineBase(shade);

  if (!isOpen) return null;

  // Toggle addons
  const toggleAddon = (sku: string) => {
    setSelectedAddons((prev) =>
      prev.includes(sku) ? prev.filter((id) => id !== sku) : [...prev, sku],
    );
  };

  const chosenAddons = COMPLEMENTARY_PAINT_PRODUCTS.filter((p) => selectedAddons.includes(p.sku));

  const addonsTotalCost = chosenAddons.reduce((acc, p) => acc + p.priceNis, 0);
  const finalTotalNis = calcResult.totalEstimatedCostNis + addonsTotalCost;

  // Primary package for the main line item
  const primaryPackage = calcResult.recommendedPackages[0] || {
    size: "5L",
    label: "גלון 5 ליטר",
    sku: "20005",
    quantity: 1,
  };

  // Submit & Dispatch Order (Multi-Tab Injection & Offline-First Persistence)
  const handleConfirmOrder = () => {
    if (!clientName.trim()) {
      toast.error("נא להזין שם לקוח / קבלן");
      return;
    }
    if (!clientPhone.trim() || clientPhone.replace(/\D/g, "").length < 7) {
      toast.error("נא להזין מספר טלפון תקין");
      return;
    }

    // Save profile for future fast checkouts
    saveContractorProfile({
      name: clientName,
      phone: clientPhone,
      preferredBranch: branch,
    });

    const now = new Date();
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const formattedTimestamp = now.toLocaleString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const branchLabel =
      branch === "hatalmid"
        ? "סניף התלמיד 6 (מחסן 1 - אולם תצוגה וגיוון)"
        : "סניף החרש 4 (מחסן 4 - מגרש ראשי)";

    const warehouseCode = branch === "hatalmid" ? "מחסן 1" : "מחסן 4";

    const fullProductName = `${selectedFinish} (${shade.brand}) - גוון ${shade.name} [${shade.code}]`;

    // Notes for contractor / warehouse picker
    const pickerNotes = `גוון: ${shade.name} | קוד מניפה: ${shade.code} | HEX: ${shade.hex} | בסיס גיוון: בסיס ${machineBase}. שטח: ${areaM2} מ"ר בשתי שכבות. מארזים: ${calcResult.recommendedPackages.map((p) => `${p.quantity} × ${p.size}`).join(", ")}. נלווים: ${chosenAddons.map((a) => a.name).join(", ") || "ללא"}.`;

    // Structure A: Local Counter Dispatch Queue
    dispatchToCounter({
      sku: primaryPackage.sku,
      productName: fullProductName,
      quantity: primaryPackage.quantity,
      unitLabel: primaryPackage.size === "18L" || primaryPackage.size === "10L" ? "פח" : "גלון",
      estimatedCost: finalTotalNis,
      note: pickerNotes,
      source: "נועה AI - ייעוץ צבע ואיסוף",
      screenId: "צ'אט שילוט",
    });

    // Structure B: Dual Offline Storage Device Persistence
    saveOrderToDevice({
      id: orderId,
      sku: primaryPackage.sku,
      productName: fullProductName,
      unitLabel: primaryPackage.size === "18L" || primaryPackage.size === "10L" ? "פח" : "גלון",
      quantity: primaryPackage.quantity,
      unitPrice: Math.round(finalTotalNis / Math.max(1, primaryPackage.quantity)),
      estimatedCost: finalTotalNis,
      areaM2: areaM2,
      warehouse: warehouseCode,
      branchName: branchLabel,
      source: "נועה AI - גיוון צבע",
      screenId: "צ'אט שילוט",
      note: pickerNotes,
      createdAt: Date.now(),
      clientPhone: clientPhone,
      clientName: clientName,
      storedLocally: true,
      syncedToSheet: false,
    });

    // Prepare Printable Ticket Data
    const ticketData: TintDispatchTicketData = {
      orderId,
      timestamp: formattedTimestamp,
      clientName,
      clientPhone,
      clientType,
      branch: branchLabel,
      productSku: primaryPackage.sku,
      productName: fullProductName,
      packageSize: primaryPackage.size,
      quantity: primaryPackage.quantity,
      shade,
      machineBase,
      areaM2,
      estimatedCostNis: finalTotalNis,
      complementaryProducts: chosenAddons.map((a) => ({
        name: a.name,
        sku: a.sku,
        quantity: 1,
      })),
      notes: pickerNotes,
    };

    setCreatedTicket(ticketData);
    setActiveStep("ticket");
    onOrderDispatched?.(ticketData);

    toast.success(`ההזמנה ${orderId} נשלחה בהצלחה לסדרן הדלפק! 🚀`);
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl text-slate-100">
        {/* If Ticket is active, show the Printable Dispatch Ticket */}
        {activeStep === "ticket" && createdTicket ? (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-6 text-emerald-400" />
                <div>
                  <h3 className="text-lg font-black text-white">ההזמנה שודרה לדלפק בהצלחה!</h3>
                  <p className="text-xs text-slate-400">
                    כרטיס הגיוון והאיסוף מוכן להדפסה ישירה ולליקוט
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                <X className="size-4" />
              </Button>
            </div>

            <PrintableDispatchTicket data={createdTicket} onClose={onClose} />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveStep("form")}
                className="border-slate-700 text-slate-300"
              >
                חזרה לעריכת פרטים
              </Button>
              <Button
                type="button"
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                סיום וסגירה
              </Button>
            </div>
          </div>
        ) : (
          /* FORM STEP */
          <div className="p-5 sm:p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="size-10 rounded-xl border border-white/20 shadow-md shrink-0"
                  style={{ backgroundColor: shade.hex }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-white">
                      חישוב כמויות וגיוון: {shade.name}
                    </h2>
                    <span className="rounded bg-orange-500/20 px-2 py-0.5 text-xs font-mono font-bold text-orange-400 border border-orange-500/30">
                      {shade.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    {shade.brand} • משפחת {shade.family} • בסיס מכונה {machineBase}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Room & Area Calculator */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Room type selection */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  1. ייעוד החלל וסוג הקיר:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRoomType("indoor")}
                    className={cn(
                      "rounded-xl py-2 px-1 text-xs font-bold transition border",
                      roomType === "indoor"
                        ? "border-orange-500 bg-orange-500/20 text-orange-200"
                        : "border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800",
                    )}
                  >
                    קירות פנים
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoomType("wet")}
                    className={cn(
                      "rounded-xl py-2 px-1 text-xs font-bold transition border",
                      roomType === "wet"
                        ? "border-cyan-500 bg-cyan-500/20 text-cyan-200"
                        : "border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800",
                    )}
                  >
                    חדר רטוב 💧
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoomType("exterior")}
                    className={cn(
                      "rounded-xl py-2 px-1 text-xs font-bold transition border",
                      roomType === "exterior"
                        ? "border-amber-500 bg-amber-500/20 text-amber-200"
                        : "border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800",
                    )}
                  >
                    קיר חיצוני ☀️
                  </button>
                </div>

                {/* Finish series */}
                <div className="pt-2">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    סדרת צבע וגימור:
                  </label>
                  <select
                    value={selectedFinish}
                    onChange={(e) => setSelectedFinish(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-orange-500 focus:outline-none"
                  >
                    {shade.finishOptions.map((fin) => (
                      <option key={fin} value={fin}>
                        {fin} ({shade.brand})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Area square meters selector */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    2. שטח קירות משוער (מ״ר):
                  </label>
                  <span className="font-mono text-sm font-black text-orange-400">{areaM2} מ״ר</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAreaM2((prev) => Math.max(5, prev - 5))}
                    className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-200 hover:bg-slate-700"
                  >
                    <Minus className="size-4" />
                  </button>
                  <input
                    type="range"
                    min="5"
                    max="200"
                    step="5"
                    value={areaM2}
                    onChange={(e) => setAreaM2(Number(e.target.value))}
                    className="h-2 w-full accent-orange-500 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setAreaM2((prev) => prev + 5)}
                    className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-200 hover:bg-slate-700"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>חדר בודד (~25 מ״ר)</span>
                  <span>סלון (~45 מ״ר)</span>
                  <span>דירה (~100 מ״ר)</span>
                </div>
              </div>
            </div>

            {/* Smart Calculation Result Card */}
            <div className="rounded-2xl border border-orange-500/40 bg-gradient-to-br from-orange-950/30 to-slate-950 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-orange-300 flex items-center gap-1.5">
                  <Calculator className="size-4" />
                  תוצאת חישוב מומלצת (2 שכבות מלאות + פחת):
                </span>
                <span className="rounded bg-orange-500/20 px-2 py-0.5 text-xs font-bold text-orange-300 border border-orange-500/30">
                  {calcResult.totalLitersNeeded} ליטר נדרשים
                </span>
              </div>

              {/* Recommended packages breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {calcResult.recommendedPackages.map((pkg, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="size-4 text-amber-400" />
                      <div>
                        <div className="text-xs font-bold text-white">{pkg.label}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          מק״ט {pkg.sku} • {pkg.unitPriceNis} ₪ ליח׳
                        </div>
                      </div>
                    </div>
                    <span className="rounded bg-slate-800 px-2 py-1 text-xs font-black text-orange-400 border border-slate-700">
                      × {pkg.quantity} יח׳
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Complementary Products Checklist */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                  <Sparkles className="size-3.5 text-amber-400" />
                  ציוד משלים מומלץ לליקוט בדלפק:
                </span>
                <span className="text-[10px] text-slate-400">מונע חזרה נוספת לחנות</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COMPLEMENTARY_PAINT_PRODUCTS.slice(0, 4).map((addon) => {
                  const isChecked = selectedAddons.includes(addon.sku);
                  return (
                    <button
                      key={addon.sku}
                      type="button"
                      onClick={() => toggleAddon(addon.sku)}
                      className={cn(
                        "flex items-center justify-between rounded-xl border p-2 text-right transition",
                        isChecked
                          ? "border-emerald-500/60 bg-emerald-950/20 text-emerald-200"
                          : "border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800",
                      )}
                    >
                      <div className="min-w-0 pr-1">
                        <div className="text-[11px] font-bold text-white truncate">
                          {addon.name}
                        </div>
                        <div className="text-[10px] text-slate-400">{addon.recommendedFor}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold font-mono text-slate-300">
                          +{addon.priceNis} ₪
                        </span>
                        <div
                          className={cn(
                            "size-4 rounded flex items-center justify-center border",
                            isChecked
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-600 bg-slate-800",
                          )}
                        >
                          {isChecked && <CheckCircle2 className="size-3" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Branch & Client Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Branch Selector */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <MapPin className="size-3.5 text-orange-400" />
                  סניף איסוף מבוקש (Click & Collect):
                </label>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setBranch("hatalmid")}
                    className={cn(
                      "w-full rounded-lg border p-2 text-right text-xs transition",
                      branch === "hatalmid"
                        ? "border-orange-500 bg-orange-500/10 text-white font-bold"
                        : "border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>סניף התלמיד 6 (מחסן 1)</span>
                      <span className="text-[10px] text-orange-400">מרכז הגיוון המרכזי 🎨</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBranch("haharash")}
                    className={cn(
                      "w-full rounded-lg border p-2 text-right text-xs transition",
                      branch === "haharash"
                        ? "border-orange-500 bg-orange-500/10 text-white font-bold"
                        : "border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>סניף החרש 4 (מחסן 4)</span>
                      <span className="text-[10px] text-slate-400">חומרי מליטה וברזל</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Client Info */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <User className="size-3.5 text-orange-400" />
                  פרטי הלקוח לאיסוף:
                </label>

                <div className="space-y-1.5">
                  <Input
                    placeholder="שם מלא / שם קבלן *"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="h-8 text-xs bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                  />
                  <Input
                    placeholder="מספר טלפון סלולרי *"
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="h-8 text-xs bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                  />
                  <div className="flex gap-1.5 pt-1">
                    {(["קבלן רשום", "לקוח פרטי", "חברת בניה"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setClientType(type)}
                        className={cn(
                          "flex-1 rounded px-1.5 py-1 text-[10px] font-bold border",
                          clientType === type
                            ? "bg-slate-800 border-orange-500 text-orange-300"
                            : "bg-slate-900 border-slate-800 text-slate-500",
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Total and Dispatch Button */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <div>
                <div className="text-xs text-slate-400">סה״כ לתשלום בדלפק:</div>
                <div className="text-2xl font-black text-white">
                  {finalTotalNis.toLocaleString("he-IL")} ₪
                  <span className="text-xs font-normal text-slate-400 mr-1.5">(כולל מע״מ 18%)</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="text-slate-400 hover:text-white"
                >
                  ביטול
                </Button>

                <Button
                  type="button"
                  onClick={handleConfirmOrder}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black px-6 py-2.5 rounded-xl shadow-lg shadow-orange-950/60"
                >
                  <Send className="size-4 ml-1.5" />
                  אישור והדפסת כרטיס איסוף
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
