// ============================================================================
// File: src/routes/qr.tsx
// Route: /qr or /client — Customer Dedicated Mobile App (Clean Light UI)
// Deployed at: https://tv-tawny-kappa.vercel.app/qr
// ============================================================================

import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  CheckCircle2,
  Clock,
  Download,
  Droplet,
  Hammer,
  Layers,
  MapPin,
  MessageSquare,
  Paintbrush,
  Phone,
  Send,
  Sparkles,
  Store,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { usePwaInstallPrompt } from "@/hooks/usePwaInstallPrompt";
import {
  initOneSignal,
  listenToCounterNotifications,
  playChimeSound,
} from "@/lib/oneSignalService";

interface Item {
  sku: string;
  name: string;
  detail: string;
  qty: number;
}

const BRANCHES = {
  harash: "סניף החרש 10 (מחסן 4 - מרכז לוגיסטי)",
  talmid: "סניף התלמיד 6 (מחסן 1 - גבס וצבע)",
};

export const Route = createFileRoute("/qr")({
  component: QrCustomerApp,
});

export default function QrCustomerApp() {
  const { isInstallable, installPwa } = usePwaInstallPrompt();
  const [activeSection, setActiveSection] = useState<"chat" | "catalog">("chat");
  const [branch, setBranch] = useState<string>(BRANCHES.harash);

  // פרטי לקוח והזמנה
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [cartItems, setCartItems] = useState<Item[]>([
    {
      sku: "9889488",
      name: "סופרקריל מט טמבור 10 ליטר",
      detail: "גוון 0524T אפור בטון עדין",
      qty: 1,
    },
  ]);
  const [orderSent, setOrderSent] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [showSlip, setShowSlip] = useState(false);

  // הודעות שיחת פינג-פונג עם נועה AI
  const [messages, setMessages] = useState<
    Array<{ sender: "noa" | "user"; text: string; chips?: string[] }>
  >([
    {
      sender: "noa",
      text: "שלום וברוך הבא לח. סבן! 🏗️ סרקת את הקוד בסניף ונכנסת לעמדת השירות האישית שלך. באיזה חומר או גוון אוכל לעזור לך עכשיו?",
      chips: [
        "🎨 גיוון צבע לסלון",
        "🧱 גבס ולוחות ירוקים",
        "💧 חומרי איטום לגג",
        "📍 שעות פתיחה של הסניף",
      ],
    },
  ]);
  const [inputText, setInputText] = useState("");

  // אתחול OneSignal והאזנה להתראות דו-כיווניות מהדלפק
  useEffect(() => {
    initOneSignal();

    const unsubscribe = listenToCounterNotifications((notif) => {
      playChimeSound();
      toast.info(`הודעה מהדלפק: ${notif.message}`);
      try {
        if (typeof window !== "undefined" && typeof window.alert === "function") {
          window.alert(`הודעה מהדלפק:\n${notif.message}`);
        }
      } catch {
        // Fallback for sandboxed iframes
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInputText("");

    setTimeout(() => {
      let reply = "קיבלתי את בקשתך. איזה גודל או כמות נדרשת לך?";
      let chips: string[] = ["פח 18 ליטר", "גלון 5 ליטר", "חצי פח 10 ליטר"];

      if (text.includes("שעות") || text.includes("סניף")) {
        reply = `סניף החרש 10 פתוח בימים א׳–ה׳ בין 06:30 ל-16:30, ובימי שישי עד 12:30. ניתן להזמין כעת לאיסוף מהיר בדלפק!`;
        chips = ["סניף החרש 10", "סניף התלמיד 6"];
      } else if (text.includes("צבע") || text.includes("גיוון")) {
        reply =
          "איזה גוון תרצה שנכין במכונה? ניתן לציין קוד טמבור או נירלט (כמו 0021P או IS 0234).";
        chips = ["0021P פנינה", "0524T אפור בטון", "IS 0234 גרייג׳"];
      }

      setMessages((prev) => [...prev, { sender: "noa", text: reply, chips }]);
    }, 600);
  };

  const handleOrderSubmit = () => {
    if (!customerName || !customerPhone) {
      toast.error("נא להזין שם וטלפון כדי שנציג הדלפק ייצור איתך קשר.");
      try {
        if (typeof window !== "undefined" && typeof window.alert === "function") {
          window.alert("נא להזין שם וטלפון כדי שנציג הדלפק ייצור איתך קשר.");
        }
      } catch {
        // Fallback
      }
      return;
    }
    const newId = `SAB-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(newId);
    setOrderSent(true);
    setShowSlip(true);
    playChimeSound();
    toast.success(`ההזמנה שוגרה לדלפק בהצלחה! (${newId})`);
  };

  return (
    <div
      dir="rtl"
      className="h-[100dvh] max-w-lg mx-auto bg-slate-50 text-slate-900 flex flex-col font-sans select-none overflow-hidden"
    >
      {/* 1. באנר עליון נקי ללא רכיבי פיתוח */}
      <header className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-xs">
            ס
          </div>
          <div>
            <h1 className="text-xs font-black text-slate-900">ח. סבן חומרי בניין (1994)</h1>
            <p className="text-[10px] text-amber-600 font-bold">איסוף עצמי מהדלפק • נועה AI</p>
          </div>
        </div>

        {/* כפתור התקנת PWA למכשיר */}
        {isInstallable && (
          <button
            type="button"
            onClick={installPwa}
            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-xl shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" /> התקן אפליקציה
          </button>
        )}
      </header>

      {/* 2. בחירת סניף ומתג תצוגה עליון */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium truncate">
          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="bg-transparent font-bold text-slate-900 focus:outline-none"
          >
            <option value={BRANCHES.harash}>{BRANCHES.harash}</option>
            <option value={BRANCHES.talmid}>{BRANCHES.talmid}</option>
          </select>
        </div>

        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveSection("chat")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeSection === "chat" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
            }`}
          >
            חדר צ׳אט
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("catalog")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeSection === "catalog" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
            }`}
          >
            שילוט ומחלקות
          </button>
        </div>
      </div>

      {/* 3. אזור התוכן המרכזי בגודל מלא (ללא Popup) */}
      <main className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
        {activeSection === "chat" ? (
          <div className="flex-1 flex flex-col justify-between space-y-3">
            {/* שרשור הודעות */}
            <div className="space-y-3 overflow-y-auto pr-1">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === "user" ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      m.sender === "user"
                        ? "bg-amber-500 text-slate-950 font-bold rounded-tr-none"
                        : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* כפתורי פינג-פונג מהירים */}
                  {m.chips && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5 max-w-[90%]">
                      {m.chips.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => handleSend(chip)}
                          className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-2xs active:scale-95 transition"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* כרטיסיית הזמנה מהירה ומדיניות הסתרת מחירים */}
            {cartItems.length > 0 && (
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2 shrink-0">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>פריטים להכנה באיסוף עצמי:</span>
                  <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    דלפק {branch.split(" ")[1] || branch}
                  </span>
                </div>

                {cartItems.map((it) => (
                  <div
                    key={it.sku}
                    className="text-xs bg-slate-50 p-2 rounded-xl border border-slate-100 flex justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{it.name}</div>
                      <div className="text-[10px] text-slate-500">{it.detail}</div>
                    </div>
                    <span className="font-bold text-amber-700 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                      כמות: {it.qty}
                    </span>
                  </div>
                ))}

                {/* באנר הסתרת מחירים והסבר שירותי */}
                <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl text-[11px] text-blue-950 leading-relaxed">
                  נציג הדלפק מ<strong>{branch}</strong> ייצור איתך קשר מיידית לאחר השליחה לצורך חיוב
                  מדויק ותיאום איסוף.
                </div>

                {!orderSent ? (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="שם מלא לאיסוף"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="p-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                      <input
                        type="tel"
                        placeholder="מספר נייד לעדכון"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="p-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleOrderSubmit}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" /> שגר הזמנה מוכנה לדלפק
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSlip(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl shadow-xs transition"
                  >
                    הצג פתקית איסוף פעילה ({orderId})
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          /* תצוגת שילוט ומחלקות מותאמת מובייל */
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-800">בחר מחלקה לבירור והזמנה:</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  title: "צבעים וגיוון",
                  icon: Paintbrush,
                  bg: "bg-amber-50 border-amber-200 text-amber-900",
                },
                {
                  title: "גבס ובידוד",
                  icon: Layers,
                  bg: "bg-blue-50 border-blue-200 text-blue-900",
                },
                {
                  title: "חומרי איטום",
                  icon: Droplet,
                  bg: "bg-cyan-50 border-cyan-200 text-cyan-900",
                },
                {
                  title: "מליטה וטיח",
                  icon: Hammer,
                  bg: "bg-emerald-50 border-emerald-200 text-emerald-900",
                },
              ].map((c, i) => {
                const Icon = c.icon;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setActiveSection("chat");
                      handleSend(`אני מעוניין במוצרים ממחלקת ${c.title}`);
                    }}
                    className={`p-3.5 rounded-2xl border text-right transition-transform active:scale-95 flex flex-col justify-between h-24 ${c.bg}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-bold text-xs">{c.title}</span>
                  </button>
                );
              })}
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2 mt-4">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-amber-600" /> פרטי הגעה מהירה לסניף
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                סניף החרש 10 פועל כמרכז לוגיסטי ראשי עם מסלול איסוף מהיר לקבלנים ופרטיים.
              </p>
              <a
                href="https://waze.com/ul?ll=32.1326707,34.8982395&navigate=yes"
                target="_blank"
                rel="noreferrer"
                className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-xl shadow-xs transition"
              >
                פתח ניווט Waze לסניף החרש 10
              </a>
            </div>
          </div>
        )}
      </main>

      {/* 4. שורת קלט תחתונה קבועה */}
      <footer className="bg-white border-t border-slate-200 p-2.5 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="שאל את נועה על מוצר, גוון או כמויות..."
            className="flex-1 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none"
          />
          <button
            type="submit"
            aria-label="שלח הודעה"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 p-2 rounded-xl font-bold transition-all shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </footer>

      {/* 5. פתקית איסוף דיגיטלית (Digital Slip) */}
      {showSlip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-xs w-full p-5 shadow-2xl relative text-right border border-slate-200 animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setShowSlip(false)}
              className="absolute top-3 left-3 text-slate-400 hover:text-slate-800 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pb-2.5 border-b-2 border-dashed border-slate-200">
              <h3 className="font-black text-sm text-slate-900">ח. סבן חומרי בניין (1994)</h3>
              <p className="text-[10px] text-slate-500">פתקית איסוף עצמי מהדלפק</p>
              <div className="mt-1.5 inline-block bg-slate-100 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border border-slate-200">
                {orderId || "SAB-889413"}
              </div>
            </div>

            <div className="py-2.5 border-b border-slate-100 text-[11px] space-y-1">
              <div>
                <strong>סניף:</strong> {branch}
              </div>
              <div>
                <strong>לקוח:</strong> {customerName || "ראמי מסארוה"} (
                {customerPhone || "050-8860896"})
              </div>
            </div>

            <div className="py-2.5 border-b border-slate-100 text-[11px] space-y-1">
              <span className="font-bold text-slate-400 text-[10px] block">רשימת פריטים:</span>
              {cartItems.map((it) => (
                <div
                  key={it.sku}
                  className="flex justify-between bg-slate-50 p-1.5 rounded-lg border border-slate-100"
                >
                  <span>
                    {it.name} ({it.detail})
                  </span>
                  <strong>×{it.qty}</strong>
                </div>
              ))}
            </div>

            <div className="pt-2.5 text-center">
              <p className="text-[10px] text-slate-600">
                נציג הדלפק ייצור איתך קשר מיידית לאחר השליחה לחיוב ותיאום.
              </p>
              <button
                type="button"
                onClick={() => setShowSlip(false)}
                className="mt-2.5 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl transition"
              >
                סגור פתקית
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
