import {
  ArrowLeft,
  Barcode,
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  Hammer,
  Layers,
  MapPin,
  MessageCircle,
  Minus,
  Package,
  Paintbrush,
  Palette,
  Phone,
  Plus,
  QrCode,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
  User,
  Volume2,
  Wand2,
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
// Types & Interfaces
// ============================================================================

export type ClientBranchId = "hatalmid" | "haharash";

export interface ClientBranchInfo {
  id: ClientBranchId;
  name: string;
  shortName: string;
  warehouse: string;
  address: string;
  managerName: string;
  managerPhone: string;
  specialties: string;
}

export const CLIENT_BRANCHES: Record<ClientBranchId, ClientBranchInfo> = {
  hatalmid: {
    id: "hatalmid",
    name: "סניף התלמיד 6 (מחסן 1 - אולם תצוגה)",
    shortName: "סניף התלמיד 6",
    warehouse: "מחסן 1",
    address: "רחוב התלמיד 6, הוד השרון",
    managerName: "יואב",
    managerPhone: "050-7855865",
    specialties: "מערכות גבס, מניפות צבע וגיוון ממוחשב, שפכטלים וכלי עבודה",
  },
  haharash: {
    id: "haharash",
    name: "סניף החרש 4 (מחסן 4 - מגרש ראשי)",
    shortName: "סניף החרש 4",
    warehouse: "מחסן 4",
    address: "רחוב החרש 4, הוד השרון",
    managerName: "איציק זהבי / שמעון",
    managerPhone: "050-4482285",
    specialties: "מליטה, מלט, טיט, דבקים, אגרגטים, בלוקים ואיטום כבד",
  },
};

export interface CounterNotification {
  id: string;
  orderId?: string;
  title: string;
  body: string;
  timestamp: string;
  sender: string;
  branch: ClientBranchId;
  read: boolean;
  type: "status_update" | "question" | "ready_for_pickup";
  pickupSlipData?: DigitalPickupSlipData;
}

export interface DigitalPickupSlipData {
  orderId: string;
  timestamp: string;
  branchId: ClientBranchId;
  clientName: string;
  clientPhone: string;
  status: "ממתין לליקוט וגיוון ⏳" | "בטיפול הדלפק 🛠️" | "מוכן לאיסוף בדלפק ✅";
  items: {
    sku: string;
    name: string;
    quantity: number;
    unit: string;
    details?: string;
  }[];
  tintDetails?: {
    shadeCode: string;
    shadeName: string;
    brand: string;
    hex: string;
    machineBase: string;
    packageSize: string;
  };
  notes?: string;
}

export interface DepartmentItem {
  id: string;
  name: string;
  titleEn: string;
  icon: typeof Paintbrush;
  description: string;
  gradient: string;
  accentColor: string;
  badge: string;
  defaultBranch: ClientBranchId;
  popularItems: {
    sku: string;
    name: string;
    unit: string;
    packagingNote: string;
  }[];
  quickPrompt: string;
}

// ============================================================================
// Departments Catalog (חמש מחלקות ענקיות)
// ============================================================================

export const CLIENT_DEPARTMENTS: DepartmentItem[] = [
  {
    id: "paint",
    name: "צבעים וגיוון",
    titleEn: "Paints & Tinting",
    icon: Paintbrush,
    description: "מניפות טמבור ונירלט, גיוון ממוחשב מדויק, סופרקריל מט/משי ונירוקריל",
    gradient: "from-orange-600/30 via-amber-600/20 to-slate-900",
    accentColor: "border-orange-500/50 text-orange-400 group-hover:border-orange-400",
    badge: "מרכז גיוון בסניף התלמיד 🎨",
    defaultBranch: "hatalmid",
    popularItems: [
      {
        sku: "20018",
        name: "סופרקריל מט+ טמבור",
        unit: "פח 18 ליטר",
        packagingNote: "כיסוי ~110 מ״ר",
      },
      {
        sku: "20005",
        name: "סופרקריל משי טמבור",
        unit: "גלון 5 ליטר",
        packagingNote: "כיסוי ~30 מ״ר",
      },
      {
        sku: "21018",
        name: "נירוקריל EXTRA נירלט",
        unit: "פח 18 ליטר",
        packagingNote: "רחיץ עמיד במיוחד",
      },
      {
        sku: "30201",
        name: "בונדרול סופר טמבור",
        unit: "גלון 5 ליטר",
        packagingNote: "פריימר מקשר לקיר",
      },
    ],
    quickPrompt: "אני מעוניין בייעוץ לבחירת גוון צבע וחישוב כמויות לחדר או לדירה",
  },
  {
    id: "drywall",
    name: "גבס ובידוד",
    titleEn: "Drywall & Systems",
    icon: Layers,
    description: "לוחות גבס תקניים 1.20×2.60, פרופילים, ניצבים, מסלולים ובידוד אקוסטי",
    gradient: "from-cyan-600/30 via-blue-600/20 to-slate-900",
    accentColor: "border-cyan-500/50 text-cyan-400 group-hover:border-cyan-400",
    badge: "זמינות מיידית במחסן 1 📐",
    defaultBranch: "hatalmid",
    popularItems: [
      {
        sku: "111260",
        name: "לוח גבס לבן 1.20×2.60 מ׳",
        unit: "לוח",
        packagingNote: "3.12 מ״ר ללוח",
      },
      {
        sku: "112260",
        name: "לוח גבס ירוק (עמיד לחות)",
        unit: "לוח",
        packagingNote: "לחדרים רטובים",
      },
      {
        sku: "76206",
        name: "ברגי גבס 25 מ״מ שחורים",
        unit: "קופסה 1000 יח׳",
        packagingNote: "חובה לחיזוק",
      },
      {
        sku: "13502",
        name: "ניצב 50 מ״מ מחוזק (3 מ׳)",
        unit: "יח׳",
        packagingNote: "קונסטרוקציית גבס",
      },
    ],
    quickPrompt: "אני צריך הצעת כמויות עבור מחיצת גבס או תקרת גבס כולל קונסטרוקציה וברגים",
  },
  {
    id: "waterproof",
    name: "איטום וגגות",
    titleEn: "Waterproofing",
    icon: Waves,
    description: "מערכות סיקה טופ 107, מסטיקים פוליאוריטניים, סיקה לטקס ורשתות שריון",
    gradient: "from-blue-600/30 via-indigo-600/20 to-slate-900",
    accentColor: "border-blue-500/50 text-blue-400 group-hover:border-blue-400",
    badge: "מפרטי סיקה מקצועיים 🛡️",
    defaultBranch: "haharash",
    popularItems: [
      {
        sku: "10701",
        name: "סיקה טופ 107 (ערכה 25 ק״ג)",
        unit: "ערכה",
        packagingNote: "12.5 מ״ר בשתי שכבות",
      },
      {
        sku: "10702",
        name: "סיקה לטקס משפר הדבקה",
        unit: "גלון 5 ק״ג",
        packagingNote: "תוסף לתערובות מליטה",
      },
      {
        sku: "10705",
        name: "רשת פיברגלס שריון 160 גרם",
        unit: "גליל 50 מ״ר",
        packagingNote: "מניעת סדקים באיטום",
      },
      {
        sku: "10709",
        name: "סיקפלקס 11FC שפופרת",
        unit: "יח׳",
        packagingNote: "איטום תפרים וסדקים",
      },
    ],
    quickPrompt: "אני זקוק למפרט איטום למרפסת, חדר רחצה או קיר חיצוני כולל סיקה טופ 107",
  },
  {
    id: "mortar",
    name: "מליטה וצמנט",
    titleEn: "Mortar & Concrete",
    icon: Hammer,
    description: "מלט נשר, טיט לריצוף 181, טיח גבס MP75, בלות חול וסומסום במגרש ראשי",
    gradient: "from-emerald-600/30 via-teal-600/20 to-slate-900",
    accentColor: "border-emerald-500/50 text-emerald-400 group-hover:border-emerald-400",
    badge: "העמסה במלגזה במחסן 4 🏗️",
    defaultBranch: "haharash",
    popularItems: [
      {
        sku: "15181",
        name: "טיט לריצוף 181 (שק 25 ק״ג)",
        unit: "שק",
        packagingNote: "~5 מ״ר לשק בריצוף",
      },
      {
        sku: "14075",
        name: "טיח גבס MP75 קנאוף",
        unit: "שק 25 ק״ג",
        packagingNote: "2.5 מ״ר בעובי 10 מ״מ",
      },
      {
        sku: "12050",
        name: "מלט פורטלנד נשר (שק 50 ק״ג)",
        unit: "שק",
        packagingNote: "תקן ישראלי 1",
      },
      {
        sku: "11501",
        name: "בלת חול ים שטוף תקני",
        unit: "בלה (800 ק״ג)",
        packagingNote: "כולל פקדון בלה",
      },
    ],
    quickPrompt: "אני מעוניין בכמויות מלט, טיט לריצוף 181 או טיח גבס לפרויקט שלי",
  },
  {
    id: "tools",
    name: "כלי עבודה ופרזול",
    titleEn: "Professional Tools",
    icon: Wrench,
    description: "רולרים מקצועיים, שפכטלים נירוסטה, מאלג׳ים, מסקנטייפ UV וציוד מיגון",
    gradient: "from-amber-600/30 via-yellow-600/20 to-slate-900",
    accentColor: "border-amber-500/50 text-amber-400 group-hover:border-amber-400",
    badge: "אספקה טכנית מקיפה 🧰",
    defaultBranch: "hatalmid",
    popularItems: [
      {
        sku: "30101",
        name: "רולר מיקרופייבר 9 אינץ׳",
        unit: "יח׳",
        packagingNote: "מריחה חלקה ללא סימנים",
      },
      {
        sku: "30202",
        name: "שפכטל אמריקאי מוכן 2000",
        unit: "פח 28 ק״ג",
        packagingNote: "החלקה לרמת גימור Q4",
      },
      {
        sku: "30301",
        name: "דבק מסקנטייפ כחול UV",
        unit: "גליל",
        packagingNote: "הסרה נקייה ללא סימנים",
      },
      {
        sku: "30302",
        name: "ניילון פריסה עבה 20 מ״ר",
        unit: "גליל",
        packagingNote: "הגנה מלאה על ריצוף",
      },
    ],
    quickPrompt: "אני זקוק לכלים וציוד נלווה לצביעה, שפכטל ועבודות גבס",
  },
];

// ============================================================================
// Main ClientAppView Component
// ============================================================================

export function ClientAppView() {
  // Client branch selection
  const [selectedBranch, setSelectedBranch] = useState<ClientBranchId>("hatalmid");
  const branchInfo = CLIENT_BRANCHES[selectedBranch];

  // User Profile
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");

  useEffect(() => {
    const prof = getContractorProfile();
    if (prof.name) setClientName(prof.name);
    if (prof.phone) setClientPhone(prof.phone);
    if (prof.preferredBranch === "haharash" || prof.preferredBranch === "hatalmid") {
      setSelectedBranch(prof.preferredBranch);
    }
  }, []);

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Full Screen Chat State
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInitialDepartment, setChatInitialDepartment] = useState<string | null>(null);

  // Notifications & Sound State
  const [notifications, setNotifications] = useState<CounterNotification[]>([
    {
      id: "notif-welcome",
      title: "ברוכים הבאים לשירות הדיגיטלי של סבן!",
      body: "בחר מחלקה או התחל שיחת ייעוץ עם נועה לאיסוף מהיר בדלפק ללא המתנה.",
      timestamp: "כרגע",
      sender: "נועה דלפק",
      branch: "hatalmid",
      read: false,
      type: "status_update",
    },
  ]);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState<boolean>(false);

  // Active Pick-up Slip Modal
  const [activePickupSlip, setActivePickupSlip] = useState<DigitalPickupSlipData | null>(null);

  // Play audio chime
  const playChime = () => {
    try {
      playLocationChime("counter_ring");
    } catch {
      // Audio fallback
    }
  };

  // Add an incoming counter notification and trigger chime
  const pushCounterNotification = useCallback(
    (notif: Omit<CounterNotification, "id" | "timestamp" | "read">) => {
      const newNotif: CounterNotification = {
        ...notif,
        id: `notif-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev]);
      playChime();
      toast.success(newNotif.title, {
        description: newNotif.body,
        action: newNotif.pickupSlipData
          ? {
              label: "הצג פתקית",
              onClick: () => setActivePickupSlip(newNotif.pickupSlipData!),
            }
          : undefined,
      });
    },
    [],
  );

  // Listen to counter dispatch events or simulated counter responses
  useEffect(() => {
    const handleCounterEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ order?: { id: string; productName: string } }>;
      const order = customEvent.detail?.order;
      if (order) {
        // Simulate immediate acknowledgment from the counter
        setTimeout(() => {
          pushCounterNotification({
            orderId: order.id,
            title: `שמעון מדלפק ${branchInfo.shortName} קיבל את פנייתך 📦`,
            body: `הפנייה עבור ${order.productName} נקלטה במערכת הדלפק. אנו בודקים זמינות מלאי במחסן.`,
            sender: "שמעון (דלפק שירות)",
            branch: selectedBranch,
            type: "question",
          });
        }, 3500);

        // Simulate ready-for-pickup notice
        setTimeout(() => {
          pushCounterNotification({
            orderId: order.id,
            title: `הזמנתך #${order.id} מוכנה לאיסוף! 🎉`,
            body: `ניתן לגשת לדלפק ${branchInfo.warehouse} ב${branchInfo.shortName}. לחץ להצגת פתקית האיסוף.`,
            sender: "מערכת ליקוט סבן",
            branch: selectedBranch,
            type: "ready_for_pickup",
            pickupSlipData: {
              orderId: order.id,
              timestamp: new Date().toLocaleDateString("he-IL"),
              branchId: selectedBranch,
              clientName: clientName || "לקוח סבן",
              clientPhone: clientPhone || "050-0000000",
              status: "מוכן לאיסוף בדלפק ✅",
              items: [
                {
                  sku: "20018",
                  name: order.productName,
                  quantity: 1,
                  unit: "פח / יח׳",
                },
              ],
            },
          });
        }, 12000);
      }
    };

    window.addEventListener("saban:storage:change", handleCounterEvent);
    return () => window.removeEventListener("saban:storage:change", handleCounterEvent);
  }, [selectedBranch, branchInfo, clientName, clientPhone, pushCounterNotification]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const openDepartmentChat = (dept: DepartmentItem) => {
    setSelectedBranch(dept.defaultBranch);
    setChatInitialDepartment(dept.name);
    setIsChatOpen(true);
  };

  // Filtered departments
  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return CLIENT_DEPARTMENTS;
    const q = searchQuery.toLowerCase();
    return CLIENT_DEPARTMENTS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.popularItems.some((it) => it.name.toLowerCase().includes(q) || it.sku.includes(q)),
    );
  }, [searchQuery]);

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white"
    >
      {/* ==================================================================== */}
      {/* 1. TOP HEADER (Pure Customer Branding - No Dev Status or Sheets info) */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          {/* Logo & Company Name */}
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 shadow-lg shadow-orange-950/50">
              <span className="text-xl font-black text-slate-950">ס</span>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                ח. סבן חומרי בניין (1994) בע״מ
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                מרכז אספקה טכנית, גיוון צבע ומערכות גבס • הוד השרון
              </p>
            </div>
          </div>

          {/* Branch Switcher & Notification Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Branch Selector Pill */}
            <div className="hidden sm:flex items-center rounded-xl border border-slate-800 bg-slate-900/90 p-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedBranch("hatalmid");
                  saveContractorProfile({ preferredBranch: "hatalmid" });
                }}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-bold transition",
                  selectedBranch === "hatalmid"
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-white",
                )}
              >
                סניף התלמיד (גבס וצבע)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedBranch("haharash");
                  saveContractorProfile({ preferredBranch: "haharash" });
                }}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-bold transition",
                  selectedBranch === "haharash"
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-white",
                )}
              >
                סניף החרש (מליטה וברזל)
              </button>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsNotificationsDrawerOpen(true);
                  markAllAsRead();
                }}
                className="relative flex size-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:border-orange-500 hover:text-white transition"
                aria-label="התראות דלפק"
              >
                <Bell className="size-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-white shadow-md animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Direct AI Chat Trigger */}
            <Button
              type="button"
              onClick={() => {
                setChatInitialDepartment(null);
                setIsChatOpen(true);
              }}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-xl shadow-lg shadow-orange-950/60 gap-1.5"
            >
              <MessageCircle className="size-4" />
              <span>שיחה עם נועה AI</span>
            </Button>
          </div>
        </div>

        {/* Mobile branch indicator */}
        <div className="mt-2.5 flex sm:hidden items-center justify-between text-[11px] text-slate-400 bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
          <span className="flex items-center gap-1 font-semibold text-slate-300">
            <MapPin className="size-3 text-orange-400" />
            איסוף מ{branchInfo.shortName}
          </span>
          <button
            type="button"
            onClick={() =>
              setSelectedBranch((prev) => (prev === "hatalmid" ? "haharash" : "hatalmid"))
            }
            className="text-orange-400 font-bold underline text-[11px]"
          >
            החלף סניף
          </button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. HERO SEARCH & WELCOME BANNER                                      */}
      {/* ==================================================================== */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 space-y-6">
        {/* Welcome Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 size-64 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400">
              <Sparkles className="size-3.5" />
              <span>דלפק איסוף עצמי מהיר — Click & Collect</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              מה בונים או משפצים היום?
            </h2>

            <p className="max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              בחר מחלקה כדי לקבל ייעוץ מפרטים, לחשב כמויות מדויקות (מ״ר לשקים, לוחות או פחי צבע),
              ולשדר הזמנה ישירות למלגזנים ולסדרני הדלפק בסניפי הוד השרון.
            </p>

            {/* Price Policy Banner (Strict Price Masking) */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-3.5 flex items-start gap-3">
              <ShieldCheck className="size-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-amber-200/90 font-medium">
                <strong>מדיניות שירות ושקיפות:</strong> נציג הדלפק מ{branchInfo.shortName} ייצור
                איתך קשר מיידית לאחר השליחה לצורך חיוב מדויק ותיאום איסוף. המחיר ייקבע לפי הסדר
                הקבלן שלך או מחירון המבצעים העדכני.
              </div>
            </div>

            {/* Quick Search */}
            <div className="relative pt-2">
              <Input
                type="text"
                placeholder="חיפוש מהיר של חומר, מק״ט, לוח גבס או גוון מניפה..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 w-full rounded-2xl border-slate-700 bg-slate-950/90 pr-4 pl-10 text-sm text-white placeholder:text-slate-500 shadow-inner focus:border-orange-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute left-3 top-5 text-slate-400 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 3. GIANT DEPARTMENT BUTTONS (כפתורי מחלקות ענקיים ומעוצבים)           */}
        {/* ==================================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Store className="size-5 text-orange-400" />
              מחלקות אספקה וייעוץ מקצועי
            </h3>
            <span className="text-xs text-slate-400 font-medium">5 מחלקות ראשיות</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDepartments.map((dept) => {
              const IconComp = dept.icon;
              return (
                <div
                  key={dept.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl transition-all duration-300 hover:border-orange-500/60 hover:shadow-2xl hover:shadow-orange-950/30"
                >
                  {/* Background Gradient */}
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-40 transition-opacity duration-300 group-hover:opacity-75 pointer-events-none",
                      dept.gradient,
                    )}
                  />

                  {/* Header Content */}
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-950/90 border border-slate-800 shadow-md group-hover:scale-105 transition-transform">
                        <IconComp className={cn("size-7 transition-colors", dept.accentColor)} />
                      </div>
                      <span className="rounded-full bg-slate-950/80 px-2.5 py-1 text-[11px] font-bold text-orange-300 border border-slate-800 backdrop-blur-sm">
                        {dept.badge}
                      </span>
                    </div>

                    <div>
                      <div className="text-[11px] font-mono font-semibold text-slate-400">
                        {dept.titleEn}
                      </div>
                      <h4 className="text-xl font-black text-white leading-tight tracking-tight">
                        {dept.name}
                      </h4>
                      <p className="mt-1 text-xs text-slate-300 leading-relaxed font-normal">
                        {dept.description}
                      </p>
                    </div>

                    {/* Popular Items Chips */}
                    <div className="pt-1 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        פריטים מובילים במחלקה:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {dept.popularItems.map((item) => (
                          <div
                            key={item.sku}
                            className="rounded-lg bg-slate-950/80 px-2 py-1 text-[11px] text-slate-200 border border-slate-800 font-medium"
                          >
                            <span>{item.name}</span>
                            <span className="text-slate-400 mr-1 text-[10px]">({item.unit})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="relative z-10 pt-5 mt-auto">
                    <Button
                      type="button"
                      onClick={() => openDepartmentChat(dept)}
                      className="w-full bg-slate-950 hover:bg-orange-500 hover:text-slate-950 text-white font-bold text-xs py-2.5 rounded-xl border border-slate-800 group-hover:border-orange-500 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>כניסה לייעוץ והזמנה</span>
                      <ArrowLeft className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Sample Color Swatches Section */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="size-5 text-orange-400" />
              <h3 className="text-base font-black text-white">
                מניפת רב-מכר טמבור ונירלט לגיוון מיידי
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedBranch("hatalmid");
                setChatInitialDepartment("צבעים וגיוון");
                setIsChatOpen(true);
              }}
              className="text-xs text-orange-400 hover:underline font-bold"
            >
              פתח מניפה מלאה 🎨
            </button>
          </div>

          <p className="text-xs text-slate-400">
            בחר גוון פופולרי כדי לפתוח ישירות את מחשבון הכמויות והגיוון במכונת סניף התלמיד 6:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
            {COLOR_FAN_DECK.slice(0, 6).map((shade) => (
              <button
                key={shade.code}
                type="button"
                onClick={() => {
                  setSelectedBranch("hatalmid");
                  setChatInitialDepartment(`גוון ${shade.name} (${shade.code})`);
                  setIsChatOpen(true);
                }}
                className="group relative flex flex-col items-start overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-2 text-right transition hover:border-orange-500"
              >
                <div
                  className="h-10 w-full rounded-lg border border-white/20 shadow-sm transition-transform group-hover:scale-105"
                  style={{ backgroundColor: shade.hex }}
                />
                <div className="mt-2 w-full">
                  <div className="text-[11px] font-bold text-white truncate">{shade.name}</div>
                  <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                    <span>{shade.code}</span>
                    <span>{shade.brand}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* ==================================================================== */}
      {/* 4. FULL-SCREEN NOA CHAT ROOM (חדר צ'אט AI בגודל מלא)                  */}
      {/* ==================================================================== */}
      {isChatOpen && (
        <FullScreenNoaChatRoom
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          branchInfo={branchInfo}
          initialDepartment={chatInitialDepartment}
          clientName={clientName}
          clientPhone={clientPhone}
          onSaveProfile={(name, phone) => {
            setClientName(name);
            setClientPhone(phone);
            saveContractorProfile({ name, phone });
          }}
          onOrderSubmitted={(slipData) => {
            setActivePickupSlip(slipData);
            pushCounterNotification({
              orderId: slipData.orderId,
              title: `פניית איסוף #${slipData.orderId} נקלטה בהצלחה! ⏳`,
              body: `נציג הדלפק מ${branchInfo.shortName} ייצור איתך קשר מיידית לאחר השליחה לצורך חיוב מדויק ותיאום איסוף.`,
              sender: "נועה AI",
              branch: selectedBranch,
              type: "status_update",
              pickupSlipData: slipData,
            });
          }}
        />
      )}

      {/* ==================================================================== */}
      {/* 5. NOTIFICATIONS DRAWER (התראות דלפק וצליל שירות)                      */}
      {/* ==================================================================== */}
      {isNotificationsDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="relative w-full max-w-md h-full bg-slate-900 border-r border-slate-800 p-5 flex flex-col text-white shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="size-5 text-orange-400" />
                <h3 className="text-base font-black">הודעות ועדכוני דלפק</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={playChime}
                  title="בדיקת צליל פעמון דלפק"
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <Volume2 className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsNotificationsDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (notif.pickupSlipData) {
                      setActivePickupSlip(notif.pickupSlipData);
                      setIsNotificationsDrawerOpen(false);
                    }
                  }}
                  className={cn(
                    "rounded-2xl border p-3.5 space-y-1.5 transition text-right cursor-pointer",
                    notif.pickupSlipData
                      ? "border-orange-500/40 bg-orange-950/20 hover:border-orange-400"
                      : "border-slate-800 bg-slate-950/80",
                  )}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-bold text-orange-400 flex items-center gap-1">
                      <Store className="size-3" />
                      {notif.sender}
                    </span>
                    <span>{notif.timestamp}</span>
                  </div>

                  <h5 className="text-xs font-black text-white">{notif.title}</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">{notif.body}</p>

                  {notif.pickupSlipData && (
                    <div className="pt-1 flex items-center justify-between text-[11px] text-orange-300 font-bold">
                      <span>הצג פתקית איסוף דיגיטלית 📦</span>
                      <ArrowLeft className="size-3.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-slate-800 pt-3 text-center text-xs text-slate-400">
              התראות פעילות עבור {branchInfo.shortName}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. DIGITAL PICK-UP SLIP MODAL (פתקית איסוף דיגיטלית)                  */}
      {/* ==================================================================== */}
      {activePickupSlip && (
        <DigitalPickupSlipModal
          slip={activePickupSlip}
          onClose={() => setActivePickupSlip(null)}
          branchInfo={CLIENT_BRANCHES[activePickupSlip.branchId]}
        />
      )}
    </div>
  );
}

// ============================================================================
// Sub-Component: Full-Screen Noa Chat Room (חדר צ'אט AI בגודל מלא)
// ============================================================================

interface FullScreenNoaChatRoomProps {
  isOpen: boolean;
  onClose: () => void;
  branchInfo: ClientBranchInfo;
  initialDepartment: string | null;
  clientName: string;
  clientPhone: string;
  onSaveProfile: (name: string, phone: string) => void;
  onOrderSubmitted: (slipData: DigitalPickupSlipData) => void;
}

interface ChatMessage {
  id: string;
  sender: "noa" | "client";
  text: string;
  timestamp: string;
  paintRecommendation?: {
    shade: ColorShade;
    areaM2: number;
    layers: number;
    packages: { label: string; count: number }[];
    machineBase: string;
  };
  itemSummary?: {
    name: string;
    sku: string;
    quantity: number;
    unit: string;
  }[];
}

function FullScreenNoaChatRoom({
  isOpen,
  onClose,
  branchInfo,
  initialDepartment,
  clientName,
  clientPhone,
  onSaveProfile,
  onOrderSubmitted,
}: FullScreenNoaChatRoomProps) {
  // Input state
  const [inputText, setInputText] = useState("");
  const [nameInput, setNameInput] = useState(clientName);
  const [phoneInput, setPhoneInput] = useState(clientPhone);

  // Paint Calculation Interactive State inside Chat
  const [activeAreaM2, setActiveAreaM2] = useState<number>(30);
  const [selectedShadeCode, setSelectedShadeCode] = useState<string>("0021P");

  const activeShade = useMemo(
    () => getColorShadeByCode(selectedShadeCode) || COLOR_FAN_DECK[0],
    [selectedShadeCode],
  );

  const calcResult = useMemo(
    () => calculatePaintRequirements(activeAreaM2, 2, 12, activeShade.brand),
    [activeAreaM2, activeShade],
  );

  // Chat message thread
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const welcome = initialDepartment
      ? `שלום! הגעת לייעוץ המקצועי עבור מחלקת "${initialDepartment}". אני נועה, מומחית החומרים של סבן ב${branchInfo.shortName}. כמה מ״ר או איזה ציוד נדרש לפרויקט שלך?`
      : `שלום! אני נועה, יועצת המפרטים וההזמנות של ח. סבן חומרי בניין. במה אוכל לעזור לך היום? אני יכולה להתאים עבורך גוון במניפת טמבור או נירלט, לחשב כמויות גבס או איטום סיקה, ולהכין איסוף עצמי מהיר.`;

    return [
      {
        id: "msg-1",
        sender: "noa",
        text: welcome,
        timestamp: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
      },
    ];
  });

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  // Handle Client Query Submission
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userText = inputText;
    const nowTime = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });

    // Append user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "client",
      text: userText,
      timestamp: nowTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    // Generate smart guidance response
    setTimeout(() => {
      let replyText = "";
      let paintRec = undefined;
      const lower = userText.toLowerCase();

      if (
        lower.includes("צבע") ||
        lower.includes("גוון") ||
        lower.includes("קיר") ||
        lower.includes("סופרקריל")
      ) {
        replyText = `המלצה מעולה! התאמתי עבורך את גוון ${activeShade.name} (קוד ${activeShade.code}) מסדרת ${activeShade.brand}. עבור שטח של ${activeAreaM2} מ״ר בשתי שכבות, אנו ממליצים על בסיס מכונה ${matchMachineBase(activeShade)}. תוכל לאשר כעת את הכמויות לאיסוף מהדלפק.`;
        paintRec = {
          shade: activeShade,
          areaM2: activeAreaM2,
          layers: 2,
          packages: calcResult.recommendedPackages.map((p) => ({
            label: p.label,
            count: p.quantity,
          })),
          machineBase: matchMachineBase(activeShade),
        };
      } else if (lower.includes("גבס") || lower.includes("לוח")) {
        replyText = `עבור עבודות גבס בסניף התלמיד 6: כל לוח גבס סטנדרטי מכסה 3.12 מ״ר (1.20×2.60 מ׳). זכור להוסיף ברגי גבס 25 מ״מ שחורים (מק״ט 76206) ומסלולים/ניצבים תואמים.`;
      } else if (lower.includes("סיקה") || lower.includes("איטום") || lower.includes("107")) {
        replyText = `עבור איטום מרפסת או חדר רטוב עם סיקה טופ 107 (מק״ט 10701): כל ערכה של 25 ק״ג מספיקה לכ-12.5 מ״ר בשתי שכבות צולבות. מומלץ לשלב רשת פיברגלס שריון בין השכבות.`;
      } else {
        replyText = `קיבלתי את בקשתך! הפריטים נרשמו. האם ברצונך להכין את ההזמנה לאיסוף עצמי ב${branchInfo.shortName}?`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-noa-${Date.now()}`,
          sender: "noa",
          text: replyText,
          timestamp: new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }),
          paintRecommendation: paintRec,
        },
      ]);
    }, 800);
  };

  // Submit pickup order to counter
  const handleFinalOrderSubmit = () => {
    if (!nameInput.trim()) {
      toast.error("נא להזין שם לקוח / קבלן");
      return;
    }
    if (!phoneInput.trim() || phoneInput.replace(/\D/g, "").length < 7) {
      toast.error("נא להזין מספר טלפון סלולרי תקין ליצירת קשר");
      return;
    }

    onSaveProfile(nameInput, phoneInput);

    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowFormatted = new Date().toLocaleString("he-IL");

    const slipData: DigitalPickupSlipData = {
      orderId,
      timestamp: nowFormatted,
      branchId: branchInfo.id,
      clientName: nameInput,
      clientPhone: phoneInput,
      status: "ממתין לליקוט וגיוון ⏳",
      items: [
        {
          sku: calcResult.recommendedPackages[0]?.sku || "20018",
          name: `סופרקריל (${activeShade.brand}) - גוון ${activeShade.name} [${activeShade.code}]`,
          quantity: calcResult.recommendedPackages[0]?.quantity || 1,
          unit: "פח / גלון",
          details: `בסיס מכונה: בסיס ${matchMachineBase(activeShade)}, שטח: ${activeAreaM2} מ״ר`,
        },
      ],
      tintDetails: {
        shadeCode: activeShade.code,
        shadeName: activeShade.name,
        brand: activeShade.brand,
        hex: activeShade.hex,
        machineBase: matchMachineBase(activeShade),
        packageSize: calcResult.recommendedPackages[0]?.size || "18L",
      },
      notes: `הזמנת לקוח מהאפליקציה. סניף: ${branchInfo.name}.`,
    };

    // Dispatch to local counter queue (zero price displayed)
    dispatchToCounter({
      sku: calcResult.recommendedPackages[0]?.sku || "20018",
      productName: `סופרקריל - גוון ${activeShade.name} (${activeShade.code})`,
      quantity: calcResult.recommendedPackages[0]?.quantity || 1,
      unitLabel: "פח",
      estimatedCost: 0, // Hidden price policy
      note: `גוון ${activeShade.code}, בסיס ${matchMachineBase(activeShade)}. לקוח: ${nameInput} (${phoneInput}). טלפון לחיוב מדויק.`,
      source: "אפליקציית לקוח סבן",
    });

    saveOrderToDevice({
      id: orderId,
      sku: calcResult.recommendedPackages[0]?.sku || "20018",
      productName: `סופרקריל - גוון ${activeShade.name} (${activeShade.code})`,
      unitLabel: "פח",
      quantity: 1,
      unitPrice: 0,
      estimatedCost: 0,
      areaM2: activeAreaM2,
      warehouse: branchInfo.warehouse,
      branchName: branchInfo.name,
      source: "אפליקציית לקוח",
      createdAt: Date.now(),
      clientName: nameInput,
      clientPhone: phoneInput,
      storedLocally: true,
      syncedToSheet: false,
    });

    onOrderSubmitted(slipData);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="חדר ייעוץ אישי עם נועה AI"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white animate-in fade-in"
    >
      {/* Chat Room Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-slate-950 font-black shadow-md">
              <Wand2 className="size-5" />
            </div>
            <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-1.5">
              נועה AI — יועצת הדלפק והמפרטים
            </h3>
            <p className="text-xs text-slate-400">
              מחוברת לסניף: <strong className="text-orange-400">{branchInfo.name}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          aria-label="סגור חדר צ'אט"
        >
          <X className="size-6" />
        </button>
      </div>

      {/* Main Chat Layout: Chat Messages + Live Tool Sidepanel */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col max-w-xl text-xs sm:text-sm leading-relaxed",
                msg.sender === "client" ? "mr-auto items-end" : "ml-auto items-start",
              )}
            >
              <div className="text-[10px] text-slate-500 font-mono mb-1">
                {msg.sender === "noa" ? "נועה (יועצת סבן)" : "אתה"} • {msg.timestamp}
              </div>

              <div
                className={cn(
                  "rounded-2xl p-4 shadow-md",
                  msg.sender === "client"
                    ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white font-medium rounded-tr-none"
                    : "bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none",
                )}
              >
                {msg.text}

                {/* Inline Paint Calculator Card */}
                {msg.paintRecommendation && (
                  <div className="mt-3 rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="font-bold text-orange-400">
                        סיכום כמויות: {msg.paintRecommendation.shade.name}
                      </span>
                      <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                        בסיס מכונה {msg.paintRecommendation.machineBase}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className="size-6 rounded-md border border-white/20"
                        style={{ backgroundColor: msg.paintRecommendation.shade.hex }}
                      />
                      <span className="text-slate-300">
                        קוד {msg.paintRecommendation.shade.code} (
                        {msg.paintRecommendation.shade.brand})
                      </span>
                    </div>

                    <div className="text-slate-400">
                      המלצת מארזים:{" "}
                      {msg.paintRecommendation.packages
                        .map((p) => `${p.count} × ${p.label}`)
                        .join(", ")}
                    </div>

                    {/* Strict Price Policy Notice */}
                    <div className="rounded-lg bg-amber-950/40 border border-amber-500/30 p-2 text-[11px] text-amber-200">
                      ℹ️ נציג הדלפק מ{branchInfo.shortName} ייצור איתך קשר מיידית לאחר השליחה לצורך
                      חיוב מדויק ותיאום איסוף.
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Live Quantity & Shade Assistant Sidebar */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-r border-slate-800 bg-slate-900/80 p-4 space-y-4 shrink-0 overflow-y-auto">
          <div className="flex items-center gap-2 text-xs font-black text-white border-b border-slate-800 pb-2">
            <Palette className="size-4 text-orange-400" />
            <span>מחשבון כמויות וגוון מהיר</span>
          </div>

          {/* Area Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">שטח קיר מבוקש:</span>
              <span className="font-mono font-black text-orange-400">{activeAreaM2} מ״ר</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveAreaM2((p) => Math.max(5, p - 5))}
                className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 hover:bg-slate-700"
              >
                <Minus className="size-3.5" />
              </button>
              <input
                type="range"
                min="5"
                max="150"
                step="5"
                value={activeAreaM2}
                onChange={(e) => setActiveAreaM2(Number(e.target.value))}
                className="h-1.5 w-full accent-orange-500 bg-slate-800 rounded-lg cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setActiveAreaM2((p) => p + 5)}
                className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 hover:bg-slate-700"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Shade Selector */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 block">בחר גוון מבוקש:</span>
            <select
              value={selectedShadeCode}
              onChange={(e) => setSelectedShadeCode(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
            >
              {COLOR_FAN_DECK.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code}) - {s.brand}
                </option>
              ))}
            </select>
          </div>

          {/* Recommended Packaging (Zero Price Display) */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1 text-xs">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              מארז מומלץ (2 שכבות):
            </span>
            <div className="font-bold text-white">
              {calcResult.recommendedPackages[0]?.label || "פח 18 ליטר"}
            </div>
            <div className="text-[11px] text-orange-400">
              כמות: {calcResult.recommendedPackages[0]?.quantity || 1} יח׳ • בסיס מכונה:{" "}
              {matchMachineBase(activeShade)}
            </div>
          </div>

          {/* Customer Contact for Pickup */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2">
            <span className="text-xs font-bold text-white block">פרטי איסוף לתיאום:</span>
            <Input
              placeholder="שם מלא / קבלן *"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="h-8 text-xs bg-slate-900 border-slate-700 text-white"
            />
            <Input
              placeholder="טלפון סלולרי *"
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="h-8 text-xs bg-slate-900 border-slate-700 text-white"
            />
          </div>

          {/* Strict Price Masking Notice in Sidebar */}
          <p className="text-[10px] text-amber-300 leading-snug bg-amber-950/30 p-2 rounded-lg border border-amber-500/20">
            נציג הדלפק מ{branchInfo.shortName} ייצור איתך קשר מיידית לאחר השליחה לצורך חיוב מדויק
            ותיאום איסוף.
          </p>

          {/* Dispatch Button */}
          <Button
            type="button"
            onClick={handleFinalOrderSubmit}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs py-2.5 rounded-xl shadow-lg"
          >
            <Send className="size-3.5 ml-1.5" />
            שלח הזמנה לאיסוף מהדלפק 🚀
          </Button>
        </div>
      </div>

      {/* Chat Input Bar */}
      <div className="border-t border-slate-800 bg-slate-900 p-3 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="mx-auto flex max-w-4xl items-center gap-2"
        >
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="כתוב לנועה: שאל על חומר, כמות מ״ר, מפרט איטום או גוון מניפה..."
            className="h-11 flex-1 rounded-2xl border-slate-700 bg-slate-950 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-orange-500"
          />
          <Button
            type="submit"
            disabled={!inputText.trim()}
            className="h-11 px-5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shrink-0"
          >
            <Send className="size-4 ml-1" />
            <span>שלח</span>
          </Button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-Component: Digital Pick-up Slip Modal (פתקית איסוף דיגיטלית)
// ============================================================================

interface DigitalPickupSlipModalProps {
  slip: DigitalPickupSlipData;
  onClose: () => void;
  branchInfo: ClientBranchInfo;
}

function DigitalPickupSlipModal({ slip, onClose, branchInfo }: DigitalPickupSlipModalProps) {
  const whatsappMsg = `שלום ${branchInfo.managerName} מדלפק ${branchInfo.shortName}, אני פונה לגבי הזמנת איסוף עצמי מספר #${slip.orderId} על שם ${slip.clientName}. אשמח לתאם איסוף וחיוב.`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="פתקית איסוף דיגיטלית"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
    >
      <div
        dir="rtl"
        className="relative w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 text-white shadow-2xl overflow-hidden"
      >
        {/* Slip Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-orange-500 text-slate-950 font-black">
              <Package className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">פתקית איסוף דיגיטלית</h3>
              <p className="text-xs text-slate-400">ח. סבן חומרי בניין (1994) בע״מ</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Slip Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto font-sans">
          {/* Order ID & Barcode */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">קוד הזמנה לאיסוף</div>
              <div className="text-2xl font-mono font-black text-orange-400 tracking-wider">
                {slip.orderId}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Clock className="size-3" />
                {slip.timestamp}
              </div>
            </div>

            <div className="text-left font-mono">
              <Barcode className="size-12 text-slate-300" />
              <span className="text-[10px] text-slate-500 block">*{slip.orderId}*</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between rounded-xl bg-slate-800/80 px-3.5 py-2 border border-slate-700">
            <span className="text-xs font-semibold text-slate-300">סטטוס פנייה:</span>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              {slip.status}
            </span>
          </div>

          {/* Pickup Branch & Warehouse Details */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">סניף מיועד לאיסוף:</span>
              <strong className="text-white flex items-center gap-1">
                <MapPin className="size-3.5 text-orange-400" />
                {branchInfo.name}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">עמדת דלפק / מחסן:</span>
              <strong className="text-orange-300">{branchInfo.warehouse}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">כתובת:</span>
              <span className="text-slate-300">{branchInfo.address}</span>
            </div>
          </div>

          {/* Items List */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
            <span className="text-xs font-bold text-slate-200 block">פריטים לליקוט:</span>
            <div className="space-y-1.5">
              {slip.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg bg-slate-900 p-2 text-xs border border-slate-800"
                >
                  <div>
                    <div className="font-bold text-white">{item.name}</div>
                    {item.details && (
                      <div className="text-[10px] text-slate-400">{item.details}</div>
                    )}
                  </div>
                  <span className="font-bold text-orange-400 mr-2 shrink-0">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tint Formulation (if paint) */}
          {slip.tintDetails && (
            <div className="rounded-xl border border-orange-500/30 bg-orange-950/20 p-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-orange-300">מפרט גיוון מכונה:</span>
                <span className="rounded bg-orange-500/30 px-2 py-0.5 text-[10px] font-mono text-orange-200">
                  {slip.tintDetails.brand}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-200">
                <span>
                  גוון: <strong>{slip.tintDetails.shadeName}</strong> ({slip.tintDetails.shadeCode})
                </span>
                <span className="font-bold text-orange-400">
                  בסיס {slip.tintDetails.machineBase}
                </span>
              </div>
            </div>
          )}

          {/* Price Masking Policy - High Contrast Reminder */}
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 to-slate-950 p-3.5 text-xs text-amber-200 leading-relaxed">
            <div className="font-bold text-amber-300 mb-0.5">תיאום חיוב מול הדלפק:</div>
            נציג הדלפק מ{branchInfo.shortName} ייצור איתך קשר מיידית לאחר השליחה לצורך חיוב מדויק
            ותיאום איסוף.
          </div>
        </div>

        {/* Action Footer: WhatsApp & Call Counter Rep */}
        <div className="border-t border-slate-800 bg-slate-950 p-4 flex flex-wrap items-center justify-between gap-2">
          <a
            href={whatsappLink(whatsappMsg, branchInfo.managerPhone.replace(/\D/g, ""))}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow transition"
          >
            <MessageCircle className="size-4" />
            <span>וואטסאפ ל{branchInfo.managerName}</span>
          </a>

          <a
            href={`tel:${branchInfo.managerPhone}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 transition"
          >
            <Phone className="size-4 text-orange-400" />
            <span>חיוג לדלפק ({branchInfo.managerPhone})</span>
          </a>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white"
          >
            סגירה
          </Button>
        </div>
      </div>
    </div>
  );
}
