import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  Layers,
  MapPin,
  MessageCircle,
  Minus,
  Navigation,
  Package,
  Paintbrush,
  Palette,
  Phone,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Store,
  User,
  Volume2,
  Waves,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  COLOR_FAN_DECK,
  ColorShade,
  calculatePaintRequirements,
  getColorShadeByCode,
  matchMachineBase,
} from "@/lib/colorFanDeck";
import { dispatchToCounter, whatsappLink } from "@/lib/counter-dispatch";
import { getContractorProfile, saveContractorProfile, saveOrderToDevice } from "@/lib/dual-storage";
import { playLocationChime } from "@/lib/location-chime";
import { cn } from "@/lib/utils";

// ============================================================================
// Geographic Anchors & Hod HaSharon Branches Data
// ============================================================================

export interface SabanStoreBranch {
  id: "haharash" | "hatalmid";
  name: string;
  shortName: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  warehouse: string;
  specialty: string;
  openingHoursWeekday: string;
  openingHoursFriday: string;
  phone: string;
  managerName: string;
}

export const SBN_BRANCHES_DATA: Record<"haharash" | "hatalmid", SabanStoreBranch> = {
  haharash: {
    id: "haharash",
    name: "סניף החרש 10 (מחסן 4 - מגרש ראשי)",
    shortName: "סניף החרש 10",
    address: "רחוב החרש 10, הוד השרון",
    city: "הוד השרון",
    lat: 32.13267073587116,
    lng: 34.898239515341515,
    warehouse: "מחסן 4 (מגרש ראשי לחומרים כבדים)",
    specialty: "מליטה, מלט נשר, טיט 181, בלוקים, ברזל, אגרגטים ואיטום כבד",
    openingHoursWeekday: "א׳–ה׳: 06:30 – 16:00",
    openingHoursFriday: "יום ו׳: 06:30 – 13:30",
    phone: "050-4482285",
    managerName: "איציק זהבי",
  },
  hatalmid: {
    id: "hatalmid",
    name: "סניף התלמיד 6 (מחסן 1 - אולם תצוגה וגיוון)",
    shortName: "סניף התלמיד 6",
    address: "רחוב התלמיד 6, הוד השרון",
    city: "הוד השרון",
    lat: 32.16308876819676,
    lng: 34.894851604939035,
    warehouse: "מחסן 1 (אולם גבס, צבע ופרזול)",
    specialty: "מערכות גבס, מניפות טמבור ונירלט, גיוון צבע ממוחשב, כלי עבודה",
    openingHoursWeekday: "א׳–ה׳: 06:30 – 18:00",
    openingHoursFriday: "יום ו׳: 06:30 – 14:00",
    phone: "050-7855865",
    managerName: "יואב",
  },
};

// Haversine Distance Formula (Returns meters)
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} מטרים`;
  }
  return `${(meters / 1000).toFixed(1)} ק״מ`;
}

// ============================================================================
// Types for Assistant Messages & Interactive Ping-Pong
// ============================================================================

export interface QuickActionChip {
  id: string;
  label: string;
  icon?: string;
  actionValue: string;
  variant?: "primary" | "secondary" | "branch";
}

export interface ChatMessage {
  id: string;
  sender: "assistant" | "user";
  text: string;
  timestamp: string;
  chips?: QuickActionChip[];
  // Rich Custom Content
  onboardingSteps?: boolean;
  branchCard?: SabanStoreBranch;
  paintWidget?: {
    shade: ColorShade;
    areaM2: number;
    machineBase: string;
    packages: { label: string; count: number }[];
  };
  orderConfirmation?: {
    orderId: string;
    branchName: string;
    itemSummary: string;
    clientName: string;
    clientPhone: string;
  };
}

export interface LightChatAssistantProps {
  className?: string;
  onClose?: () => void;
  initialDepartment?: string;
}

// ============================================================================
// Component Implementation
// ============================================================================

export function LightChatAssistant({
  className,
  onClose,
  initialDepartment,
}: LightChatAssistantProps) {
  // GPS State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "requesting" | "granted" | "denied"
  >("idle");
  const [detectedBranch, setDetectedBranch] = useState<SabanStoreBranch | null>(null);
  const [distanceToHaharash, setDistanceToHaharash] = useState<number | null>(null);
  const [distanceToHatalmid, setDistanceToHatalmid] = useState<number | null>(null);

  // User details
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");

  useEffect(() => {
    const profile = getContractorProfile();
    if (profile.name) setClientName(profile.name);
    if (profile.phone) setClientPhone(profile.phone);
  }, []);

  // Selected calculation state
  const [calcAreaM2, setCalcAreaM2] = useState<number>(35);
  const [selectedShadeCode, setSelectedShadeCode] = useState<string>("0021P");

  const currentShade = useMemo(
    () => getColorShadeByCode(selectedShadeCode) || COLOR_FAN_DECK[0],
    [selectedShadeCode],
  );

  const paintCalc = useMemo(
    () => calculatePaintRequirements(calcAreaM2, 2, 12, currentShade.brand),
    [calcAreaM2, currentShade],
  );

  // Sound Chime Trigger
  const triggerSound = useCallback(() => {
    try {
      playLocationChime("counter_ring");
    } catch {
      // Audio fallback
    }
  }, []);

  // Request GPS Geolocation
  const requestLocation = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setLocationStatus("denied");
      return;
    }

    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setLocationStatus("granted");

        const distHaharash = calculateDistanceMeters(
          coords.lat,
          coords.lng,
          SBN_BRANCHES_DATA.haharash.lat,
          SBN_BRANCHES_DATA.haharash.lng,
        );
        const distHatalmid = calculateDistanceMeters(
          coords.lat,
          coords.lng,
          SBN_BRANCHES_DATA.hatalmid.lat,
          SBN_BRANCHES_DATA.hatalmid.lng,
        );

        setDistanceToHaharash(distHaharash);
        setDistanceToHatalmid(distHatalmid);

        // Geofencing Check: within 250 meters of either branch?
        if (distHaharash <= 250) {
          setDetectedBranch(SBN_BRANCHES_DATA.haharash);
          triggerSound();
          toast.success("זיהינו שאתה נמצא בסניף החרש 10! נציג הדלפק ישמח לשרת אותך במקום.");
        } else if (distHatalmid <= 250) {
          setDetectedBranch(SBN_BRANCHES_DATA.hatalmid);
          triggerSound();
          toast.success("זיהינו שאתה נמצא בסניף התלמיד 6! נציג הדלפק ישמח לשרת אותך במקום.");
        }
      },
      (err) => {
        console.warn("Geolocation permission error or timeout:", err);
        setLocationStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, [triggerSound]);

  // Request location automatically on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Messages Thread State
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "msg-welcome-onboarding",
      sender: "assistant",
      text: "שלום וברוך הבא לצ'אט השירות החכם של ח. סבן חומרי בניין (1994) בע״מ!",
      timestamp: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
      onboardingSteps: true,
      chips: [
        {
          id: "chip-paint",
          label: "צבעים וגיוון ממוחשב 🎨",
          actionValue: "אני מעוניין בייעוץ גיוון צבע וחישוב כמויות",
          variant: "primary",
        },
        {
          id: "chip-drywall",
          label: "גבס, פרופילים ובידוד 📐",
          actionValue: "אני צריך לוחות גבס ופרופילים",
          variant: "secondary",
        },
        {
          id: "chip-waterproof",
          label: "איטום סיקה טופ 107 💧",
          actionValue: "ייעוץ למפרט איטום עם סיקה 107",
          variant: "secondary",
        },
        {
          id: "chip-mortar",
          label: "מליטה, מלט וטיט 181 🧱",
          actionValue: "כמויות מלט, טיט לריצוף וחומרי מליטה",
          variant: "secondary",
        },
        {
          id: "chip-branches",
          label: "שעות פתיחה ומיקום סניפים 📍",
          actionValue: "מה שעות הפעילות והמיקום של סניפי הוד השרון?",
          variant: "branch",
        },
      ],
    },
  ]);

  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Ping-Pong Response Logic
  const handleProcessUserAction = useCallback(
    (actionText: string) => {
      const now = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });

      // Append user's action
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: actionText,
        timestamp: now,
      };

      setMessages((prev) => [...prev, userMsg]);

      // Generate Ping-Pong response
      setTimeout(() => {
        const lower = actionText.toLowerCase();

        // 1. Branch Location Inquiry
        if (
          lower.includes("שעות") ||
          lower.includes("מיקום") ||
          lower.includes("סניפ") ||
          lower.includes("איפה") ||
          lower.includes("כתובת")
        ) {
          setMessages((prev) => [
            ...prev,
            {
              id: `asst-${Date.now()}-1`,
              sender: "assistant",
              text: "ח. סבן מפעילה שני סניפים מרכזיים בהוד השרון. הנה המידע המלא, כולל ניווט ישיר ב-Waze ושעות פתיחה:",
              timestamp: new Date().toLocaleTimeString("he-IL", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              branchCard: SBN_BRANCHES_DATA.hatalmid,
              chips: [
                {
                  id: "c-haharash-info",
                  label: "הצג גם את סניף החרש 10 📍",
                  actionValue: "מידע על סניף החרש 10 הוד השרון",
                  variant: "branch",
                },
                {
                  id: "c-to-paint",
                  label: "מעבר לייעוץ גיוון צבע 🎨",
                  actionValue: "אני מעוניין בייעוץ גיוון צבע וחישוב כמויות",
                  variant: "primary",
                },
              ],
            },
          ]);
        } else if (lower.includes("החרש 10") || lower.includes("מחסן 4")) {
          setMessages((prev) => [
            ...prev,
            {
              id: `asst-${Date.now()}-2`,
              sender: "assistant",
              text: "הנה פרטי סניף החרש 10 — המגרש הראשי לחומרי מליטה, ברזל ואיטום כבד:",
              timestamp: new Date().toLocaleTimeString("he-IL", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              branchCard: SBN_BRANCHES_DATA.haharash,
              chips: [
                {
                  id: "c-order-mortar",
                  label: "הזמנת מלט וטיט לאיסוף בחרש 10 🏗️",
                  actionValue: "כמויות מלט, טיט לריצוף וחומרי מליטה",
                  variant: "primary",
                },
                {
                  id: "c-back-talmid",
                  label: "סניף התלמיד 6 (גבס וצבע) 🎨",
                  actionValue: "מידע על סניף התלמיד 6",
                  variant: "secondary",
                },
              ],
            },
          ]);
        }
        // 2. Paint & Tinting Flow
        else if (
          lower.includes("צבע") ||
          lower.includes("גוון") ||
          lower.includes("סופרקריל") ||
          lower.includes("טמבור") ||
          lower.includes("נירלט")
        ) {
          setMessages((prev) => [
            ...prev,
            {
              id: `asst-${Date.now()}-3`,
              sender: "assistant",
              text: `הכנתי עבורך חישוב כמויות והתאמת גוון במכונת הגיוון של סניף התלמיד 6. שטח ברירת המחדל הינו ${calcAreaM2} מ״ר עבור גוון ${currentShade.name} (${currentShade.code}):`,
              timestamp: new Date().toLocaleTimeString("he-IL", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              paintWidget: {
                shade: currentShade,
                areaM2: calcAreaM2,
                machineBase: matchMachineBase(currentShade),
                packages: paintCalc.recommendedPackages.map((p) => ({
                  label: p.label,
                  count: p.quantity,
                })),
              },
              chips: [
                {
                  id: "c-confirm-tint",
                  label: "אישור ושיגור הזמנת גיוון לדלפק 🚀",
                  actionValue: "אישור הזמנת הגיוון לאיסוף עצמי",
                  variant: "primary",
                },
                {
                  id: "c-change-area-50",
                  label: "הגדל שטח ל-50 מ״ר (סלון גדול)",
                  actionValue: "חישוב צבע עבור 50 מ״ר",
                  variant: "secondary",
                },
                {
                  id: "c-change-shade-0524t",
                  label: "החלף לגוון מוקה קינמון (0524T) ☕",
                  actionValue: "בחירת גוון 0524T",
                  variant: "secondary",
                },
              ],
            },
          ]);
        }
        // 3. Confirming Pickup Order Flow
        else if (lower.includes("אישור") || lower.includes("שיגור") || lower.includes("הזמנ")) {
          const ordId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
          const assignedBranch = lower.includes("חרש") ? "סניף החרש 10" : "סניף התלמיד 6";

          // Save to device storage
          dispatchToCounter({
            sku: paintCalc.recommendedPackages[0]?.sku || "20018",
            productName: `סופרקריל (${currentShade.brand}) - גוון ${currentShade.name} [${currentShade.code}]`,
            quantity: paintCalc.recommendedPackages[0]?.quantity || 1,
            unitLabel: "פח",
            estimatedCost: 0,
            note: `הזמנת צ'אט בהיר. שטח ${calcAreaM2} מ״ר, בסיס מכונה ${matchMachineBase(currentShade)}. לקוח: ${clientName || "קבלן"} (${clientPhone || "050-0000000"})`,
            source: "LightChatAssistant",
          });

          triggerSound();

          setMessages((prev) => [
            ...prev,
            {
              id: `asst-${Date.now()}-4`,
              sender: "assistant",
              text: `ההזמנה שוגרה ישירות למסך המלקט בדלפק ${assignedBranch}! נציג הדלפק ייצור איתך קשר מיידית לצורך חיוב מדויק ותיאום איסוף.`,
              timestamp: new Date().toLocaleTimeString("he-IL", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              orderConfirmation: {
                orderId: ordId,
                branchName: assignedBranch,
                itemSummary: `סופרקריל (${currentShade.brand}) גוון ${currentShade.name} (${currentShade.code}) - ${paintCalc.recommendedPackages[0]?.quantity || 1} יח׳`,
                clientName: clientName || "לקוח סבן",
                clientPhone: clientPhone || "050-0000000",
              },
              chips: [
                {
                  id: "c-nav-waze",
                  label: "נווט לסניף לאיסוף ב-Waze 🚗",
                  actionValue: "נווט לסניף ב-Waze",
                  variant: "branch",
                },
                {
                  id: "c-new-inquiry",
                  label: "הוסף פריטים נוספים (גבס/איטום) ➕",
                  actionValue: "אני צריך לוחות גבס ופרופילים",
                  variant: "secondary",
                },
              ],
            },
          ]);
        }
        // 4. Drywall & Systems Flow
        else if (lower.includes("גבס") || lower.includes("לוח")) {
          setMessages((prev) => [
            ...prev,
            {
              id: `asst-${Date.now()}-5`,
              sender: "assistant",
              text: "בסניף התלמיד 6 אנו מחזיקים מלאי מלא של מערכות גבס Knauf ותקניות: לוחות לבן 1.20×2.60 מ׳ (3.12 מ״ר ללוח), לוחות ירוקים לחדרים רטובים, ברגי גבס 25 מ״מ שחורים ומסלולים/ניצבים 50 מ״מ.",
              timestamp: new Date().toLocaleTimeString("he-IL", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              chips: [
                {
                  id: "c-dw-calc",
                  label: "חשב כמות לוחות לקיר 30 מ״ר (10 לוחות)",
                  actionValue: "אני צריך 10 לוחות גבס וברגים",
                  variant: "primary",
                },
                {
                  id: "c-dw-branch",
                  label: "מיקום סניף התלמיד 6 לאיסוף גבס 📍",
                  actionValue: "מידע על סניף התלמיד 6",
                  variant: "branch",
                },
              ],
            },
          ]);
        }
        // 5. Default General Response
        else {
          setMessages((prev) => [
            ...prev,
            {
              id: `asst-${Date.now()}-6`,
              sender: "assistant",
              text: `רשמתי לפניי את פנייתך לגבי "${actionText}". כיצד תרצה להתקדם?`,
              timestamp: new Date().toLocaleTimeString("he-IL", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              chips: [
                {
                  id: "c-to-calc",
                  label: "חישוב צבע וגיוון 🎨",
                  actionValue: "אני מעוניין בייעוץ גיוון צבע וחישוב כמויות",
                  variant: "primary",
                },
                {
                  id: "c-to-map",
                  label: "שעות פתיחה ומיקום סניפים 📍",
                  actionValue: "מה שעות הפעילות והמיקום של סניפי הוד השרון?",
                  variant: "branch",
                },
              ],
            },
          ]);
        }
      }, 550);
    },
    [calcAreaM2, currentShade, paintCalc, clientName, clientPhone, triggerSound],
  );

  // Form submit for free typing
  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const text = inputVal;
    setInputVal("");
    handleProcessUserAction(text);
  };

  return (
    <div
      dir="rtl"
      className={cn(
        "flex flex-col h-full w-full max-w-4xl mx-auto bg-white text-slate-900 border border-slate-200 rounded-3xl shadow-xl overflow-hidden font-sans selection:bg-orange-100 selection:text-orange-900",
        className,
      )}
    >
      {/* ================================================================== */}
      {/* 1. TOP HEADER (Clean White & Amber Accents)                         */}
      {/* ================================================================== */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white/95 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black shadow-md shadow-orange-500/20">
            <Sparkles className="size-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                נועה AI — עוזרת השירות והדלפק
              </h2>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                פעילה • סבן (1994)
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              הוד השרון • סניף החרש 10 & סניף התלמיד 6
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Geolocation Status Indicator Button */}
          <button
            type="button"
            onClick={requestLocation}
            title="עדכן מיקום GPS לזיהוי סניף קרוב"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border",
              detectedBranch
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : locationStatus === "granted"
                  ? "bg-slate-100 text-slate-700 border-slate-200"
                  : "bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100",
            )}
          >
            <MapPin className="size-3.5 text-orange-500" />
            <span className="hidden sm:inline">
              {detectedBranch
                ? `בסניף ${detectedBranch.shortName}`
                : locationStatus === "granted"
                  ? "GPS פעיל"
                  : "זהה מיקום"}
            </span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="סגור צ'אט"
            >
              <X className="size-5" />
            </button>
          )}
        </div>
      </header>

      {/* ================================================================== */}
      {/* 2. GEOFENCING BANNER (Scenario A: Customer is at branch < 250m)      */}
      {/* ================================================================== */}
      {detectedBranch && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-3 flex items-center justify-between text-xs text-emerald-950 font-medium animate-in fade-in shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs shrink-0 shadow-xs">
              ✓
            </span>
            <div>
              <strong>זיהינו שאתה נמצא כעת ב{detectedBranch.name}!</strong>
              <div className="text-[11px] text-emerald-800 mt-0.5">
                נציג הדלפק ({detectedBranch.managerName}) ישמח לשרת אותך במקום.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleProcessUserAction(`אני נמצא כעת ב${detectedBranch.name}`)}
            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 text-xs shrink-0 shadow-xs"
          >
            קרא לנציג
          </button>
        </div>
      )}

      {/* ================================================================== */}
      {/* 3. CHAT MESSAGES STREAM (Ping-Pong Flow)                             */}
      {/* ================================================================== */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/70">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col max-w-2xl leading-relaxed text-xs sm:text-sm",
              msg.sender === "user" ? "mr-auto items-end" : "ml-auto items-start",
            )}
          >
            {/* Timestamp & Label */}
            <div className="text-[11px] text-slate-400 font-medium mb-1 px-1">
              {msg.sender === "assistant" ? "נועה AI • סבן חומרי בניין" : "אתה"} • {msg.timestamp}
            </div>

            {/* Message Bubble */}
            <div
              className={cn(
                "rounded-3xl p-4 sm:p-5 shadow-sm space-y-3",
                msg.sender === "user"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-tr-none shadow-orange-500/10"
                  : "bg-white text-slate-800 border border-slate-200/90 rounded-tl-none shadow-slate-200/60",
              )}
            >
              <div className="text-xs sm:text-sm font-normal leading-relaxed">{msg.text}</div>

              {/* ------------------------------------------------------------ */}
              {/* ONBOARDING 3-STEP GUIDE (Step 1 -> 2 -> 3)                   */}
              {/* ------------------------------------------------------------ */}
              {msg.onboardingSteps && (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/90 p-3.5 space-y-3">
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Compass className="size-4 text-orange-500" />
                    <span>מדריך קצר לשימוש בעמדה הדיגיטלית (3 צעדים פשוטים):</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-xs font-black text-orange-600">
                        <span className="flex size-5 items-center justify-center rounded-full bg-orange-100 text-[11px]">
                          1
                        </span>
                        <span>בחירת מחלקה</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        בחר צבעים, גבס, איטום סיקה 107, מליטה או כלי עבודה.
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-600">
                        <span className="flex size-5 items-center justify-center rounded-full bg-amber-100 text-[11px]">
                          2
                        </span>
                        <span>חישוב כמויות</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        התאמת מ״ר לגודל מארז (1L–18L) ובסיס מכונה A/P/D/T.
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600">
                        <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-[11px]">
                          3
                        </span>
                        <span>שיגור לדלפק</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        ההזמנה מועברת למלקט בסניף לאיסוף מהיר ללא תור.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------ */}
              {/* BRANCH RICH CARD (Scenario B: Remote Customer & Waze Button) */}
              {/* ------------------------------------------------------------ */}
              {msg.branchCard && (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-amber-50/40 p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Store className="size-4 text-orange-600" />
                        <h4 className="text-sm font-black text-slate-900">{msg.branchCard.name}</h4>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        {msg.branchCard.address}
                      </p>
                    </div>

                    {userLocation && (
                      <span className="rounded-full bg-orange-100 text-orange-800 px-2.5 py-0.5 text-xs font-bold border border-orange-200">
                        מרחק ממך:{" "}
                        {msg.branchCard.id === "haharash"
                          ? formatDistance(distanceToHaharash || 0)
                          : formatDistance(distanceToHatalmid || 0)}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Clock className="size-3.5 text-orange-500" />
                      <span>שעות פעילות הסניף:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600 pr-5">
                      <div>• {msg.branchCard.openingHoursWeekday}</div>
                      <div>• {msg.branchCard.openingHoursFriday}</div>
                    </div>
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 pr-5">
                      תחום התמחות: <strong>{msg.branchCard.specialty}</strong>
                    </div>
                  </div>

                  {/* Navigation Actions (Waze Live Navigation + Google Maps) */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <a
                      href={`https://waze.com/ul?ll=${msg.branchCard.lat},${msg.branchCard.lng}&navigate=yes`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs px-3.5 py-2 shadow-xs transition"
                    >
                      <Navigation className="size-3.5" />
                      <span>ניווט ב-Waze</span>
                    </a>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${msg.branchCard.lat},${msg.branchCard.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs px-3.5 py-2 shadow-2xs transition"
                    >
                      <ExternalLink className="size-3.5 text-slate-500" />
                      <span>Google Maps</span>
                    </a>

                    <a
                      href={`tel:${msg.branchCard.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs px-3.5 py-2 shadow-2xs transition"
                    >
                      <Phone className="size-3.5 text-orange-500" />
                      <span>חייג לדלפק ({msg.branchCard.managerName})</span>
                    </a>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------ */}
              {/* PAINT INTERACTIVE WIDGET                                     */}
              {/* ------------------------------------------------------------ */}
              {msg.paintWidget && (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Palette className="size-4 text-orange-500" />
                      מפרט גיוון ממוחשב: {msg.paintWidget.shade.name}
                    </span>
                    <span className="rounded bg-orange-100 text-orange-900 px-2 py-0.5 text-[11px] font-bold">
                      בסיס מכונה {msg.paintWidget.machineBase}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className="size-10 rounded-xl border border-slate-300 shadow-sm shrink-0"
                      style={{ backgroundColor: msg.paintWidget.shade.hex }}
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {msg.paintWidget.shade.brand} • קוד {msg.paintWidget.shade.code}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        כיסוי מחושב עבור {msg.paintWidget.areaM2} מ״ר (2 שכבות מלאות)
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-2 text-xs text-slate-700">
                    מארזים מומלצים:{" "}
                    <strong>
                      {msg.paintWidget.packages.map((p) => `${p.count} × ${p.label}`).join(", ")}
                    </strong>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------ */}
              {/* ORDER DISPATCH CONFIRMATION CARD                             */}
              {/* ------------------------------------------------------------ */}
              {msg.orderConfirmation && (
                <div className="mt-3 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/50 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-black text-emerald-900 text-xs">
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      הזמנה שוגרה לדלפק בהצלחה!
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-800">
                      #{msg.orderConfirmation.orderId}
                    </span>
                  </div>

                  <div className="text-xs text-emerald-950 space-y-1">
                    <div>
                      סניף איסוף: <strong>{msg.orderConfirmation.branchName}</strong>
                    </div>
                    <div>
                      פריט: <strong>{msg.orderConfirmation.itemSummary}</strong>
                    </div>
                  </div>

                  {/* Strict Price Masking Notice */}
                  <div className="rounded-xl bg-white border border-emerald-200 p-2.5 text-[11px] text-slate-700 leading-relaxed">
                    ℹ️ <strong>שיטת חיוב:</strong> נציג הדלפק מ{msg.orderConfirmation.branchName}{" "}
                    ייצור איתך קשר מיידית לאחר השליחה לצורך חיוב מדויק ותיאום איסוף.
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Chips (Ping-Pong Buttons) */}
            {msg.chips && msg.chips.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-full">
                {msg.chips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => handleProcessUserAction(chip.actionValue)}
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 border active:scale-95",
                      chip.variant === "primary"
                        ? "bg-orange-500 text-white border-orange-600 hover:bg-orange-600"
                        : chip.variant === "branch"
                          ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                          : "bg-white text-slate-800 border-slate-300 hover:bg-slate-100 hover:border-slate-400",
                    )}
                  >
                    <span>{chip.label}</span>
                    <ArrowLeft className="size-3 opacity-60" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ================================================================== */}
      {/* 4. CHAT INPUT BAR                                                  */}
      {/* ================================================================== */}
      <footer className="p-3 sm:p-4 border-t border-slate-200 bg-white shrink-0">
        <form onSubmit={handleSubmitText} className="flex items-center gap-2 max-w-4xl mx-auto">
          <Input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="כתוב לנועה: שאל על שעות פעילות, גוון, או כמויות לפרויקט..."
            className="h-11 flex-1 rounded-2xl border-slate-300 bg-slate-50 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:bg-white shadow-inner"
          />
          <Button
            type="submit"
            disabled={!inputVal.trim()}
            className="h-11 px-5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shrink-0 shadow-md shadow-orange-500/20"
          >
            <Send className="size-4 ml-1" />
            <span>שלח</span>
          </Button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-400 max-w-4xl mx-auto pt-2 px-1">
          <span>ח. סבן הוד השרון: סניף החרש 10 | סניף התלמיד 6</span>
          <span className="text-orange-600 font-bold">מענה מהיר בלחיצה על כפתורי הפעולה</span>
        </div>
      </footer>
    </div>
  );
}
