import {
  Printer,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  Package,
  Sparkles,
  Barcode,
  Share2,
  Copy,
  X,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ColorShade, PaintBaseType } from "@/lib/colorFanDeck";
import { whatsappLink } from "@/lib/counter-dispatch";
import { cn } from "@/lib/utils";

export interface TintDispatchTicketData {
  orderId: string;
  timestamp: string;
  clientName: string;
  clientPhone: string;
  clientType: "קבלן רשום" | "לקוח פרטי" | "חברת בניה";
  branch: "סניף התלמיד 6 (מחסן 1 - אולם תצוגה וגיוון)" | "סניף החרש 4 (מחסן 4 - מגרש ראשי)";
  productSku: string;
  productName: string;
  packageSize: string;
  quantity: number;
  shade: ColorShade;
  machineBase: PaintBaseType;
  areaM2?: number;
  estimatedCostNis: number;
  complementaryProducts?: {
    name: string;
    sku: string;
    quantity: number;
  }[];
  notes?: string;
}

interface PrintableDispatchTicketProps {
  data: TintDispatchTicketData;
  onClose?: () => void;
  className?: string;
}

export function PrintableDispatchTicket({
  data,
  onClose,
  className,
}: PrintableDispatchTicketProps) {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCopyDetails = () => {
    const text = `📦 כרטיס גיוון ואיסוף - סבן חומרי בניין
הזמנה: ${data.orderId}
לקוח: ${data.clientName} (${data.clientPhone}) - ${data.clientType}
סניף: ${data.branch}
מוצר: ${data.productName}
מארז: ${data.packageSize} × ${data.quantity} יח׳
גוון: ${data.shade.name} | קוד: ${data.shade.code} (${data.shade.brand})
בסיס גיוון במכונה: ${data.machineBase}
עלות משוערת: ${data.estimatedCostNis} ₪`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("פרטי ההזמנה הועתקו ללוח!");
    setTimeout(() => setCopied(false), 2000);
  };

  // קישור ישיר לוואטסאפ של מנהל הסניף
  const branchManagerPhone = data.branch.includes("התלמיד")
    ? "972507855865" // יואב - התלמיד
    : "972504482285"; // איציק - החרש

  const branchManagerName = data.branch.includes("התלמיד") ? "יואב (התלמיד)" : "איציק (החרש)";

  const whatsappMessage = `שלום ${branchManagerName}, התקבלה הזמנת גיוון ואיסוף עצמי חדשה:
#${data.orderId}
לקוח: ${data.clientName} (${data.clientPhone})
גוון: ${data.shade.name} (${data.shade.code}) - בסיס מכונה ${data.machineBase}
מוצר: ${data.productName} (${data.packageSize} × ${data.quantity})
סה"כ: ${data.estimatedCostNis} ₪`;

  return (
    <div
      dir="rtl"
      className={cn(
        "relative mx-auto w-full max-w-lg rounded-2xl border border-slate-700 bg-white text-slate-900 shadow-2xl overflow-hidden",
        className,
      )}
    >
      {/* Action Header - Hidden when printing */}
      <div className="print:hidden flex items-center justify-between border-b border-slate-200 bg-slate-900 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <Printer className="size-5 text-orange-400" />
          <span className="font-bold text-sm">כרטיס גיוון ואיסוף דלפק (מוכן להדפסה)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            onClick={handlePrint}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-8 px-3 text-xs gap-1"
          >
            <Printer className="size-3.5" />
            הדפס כרטיס (Print)
          </Button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* TICKET BODY - Optimized for Thermal Receipt 80mm & Standard A4 */}
      <div className="p-6 font-sans space-y-4 print:p-2 print:space-y-2">
        {/* Company Header */}
        <div className="border-b-2 border-dashed border-slate-300 pb-3 text-center">
          <div className="text-xl font-black tracking-tight text-slate-900">
            ח. סבן חומרי בניין (1994) בע״מ
          </div>
          <div className="text-xs text-slate-600 font-medium">
            ח.פ 512001678 • מרכז גיוון ממוחשב ואספקה טכנית
          </div>
          <div className="mt-1 inline-block rounded bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-900 border border-orange-200">
            כרטיס גיוון וליקוט מהיר — Click & Collect
          </div>
        </div>

        {/* Order Identifier & Barcode simulation */}
        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200 print:bg-white">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">מספר הזמנה</div>
            <div className="text-xl font-mono font-black text-slate-900 tracking-wider">
              {data.orderId}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Clock className="size-3" />
              {data.timestamp}
            </div>
          </div>
          <div className="text-left font-mono">
            <Barcode className="size-12 text-slate-800" />
            <span className="text-[10px] tracking-widest text-slate-600 block">
              *{data.orderId}*
            </span>
          </div>
        </div>

        {/* Client & Branch Information */}
        <div className="grid grid-cols-2 gap-2 text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 print:bg-white">
          <div>
            <span className="text-slate-500 font-medium block">פרטי לקוח:</span>
            <div className="font-bold text-slate-900">{data.clientName}</div>
            <div className="text-slate-700 font-mono flex items-center gap-1 mt-0.5">
              <Phone className="size-3 text-slate-400" />
              {data.clientPhone}
            </div>
            <span className="inline-block mt-1 text-[10px] font-bold bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">
              {data.clientType}
            </span>
          </div>

          <div>
            <span className="text-slate-500 font-medium block">סניף איסוף:</span>
            <div className="font-bold text-slate-900 flex items-start gap-1">
              <MapPin className="size-3.5 text-orange-600 shrink-0 mt-0.5" />
              <span>{data.branch}</span>
            </div>
            <div className="mt-1 text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              סטטוס: ממתין לליקוט וגיוון ⏳
            </div>
          </div>
        </div>

        {/* TINT SPECIFICATION - HIGH CONTRAST */}
        <div className="border-2 border-slate-900 rounded-xl p-3.5 space-y-2.5 bg-amber-50/30 print:border-black">
          <div className="flex items-center justify-between border-b border-slate-300 pb-2">
            <span className="font-black text-sm text-slate-900 flex items-center gap-1.5">
              <Sparkles className="size-4 text-orange-600" />
              מפרט גיוון מכונה (Tint Formulation)
            </span>
            <span className="text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded font-mono">
              מק״ט: {data.productSku}
            </span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 flex-1">
              <div className="text-xs text-slate-500 font-medium">מוצר בסיס:</div>
              <div className="text-sm font-black text-slate-900">{data.productName}</div>
              <div className="text-xs font-semibold text-slate-700">
                מארז: <strong className="text-black">{data.packageSize}</strong> • כמות:{" "}
                <strong className="text-black">{data.quantity} יח׳</strong>
              </div>
            </div>

            {/* Visual Color Swatch */}
            <div className="text-center shrink-0">
              <div
                className="size-12 rounded-lg border-2 border-slate-900 shadow-sm mx-auto"
                style={{ backgroundColor: data.shade.hex }}
              />
              <span className="text-[10px] font-mono text-slate-600 mt-0.5 block">
                {data.shade.hex}
              </span>
            </div>
          </div>

          {/* Critical Tint Machine Rules Box */}
          <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-lg border border-slate-300 text-center">
            <div>
              <div className="text-[10px] font-bold text-slate-500">קוד גוון מניפה</div>
              <div className="text-base font-black font-mono text-slate-900">{data.shade.code}</div>
              <div className="text-[10px] text-slate-600">{data.shade.brand}</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-500">שם הגוון</div>
              <div className="text-xs font-black text-slate-900 leading-tight mt-1">
                {data.shade.name}
              </div>
              <div className="text-[10px] text-slate-500">{data.shade.family}</div>
            </div>

            <div className="bg-orange-50 rounded border border-orange-300 p-1">
              <div className="text-[10px] font-black text-orange-900">בסיס מכונה</div>
              <div className="text-xl font-black text-orange-600 font-mono">
                בסיס {data.machineBase}
              </div>
              <div className="text-[9px] text-orange-800">
                {data.machineBase === "P" || data.machineBase === "A"
                  ? "גוון בהיר"
                  : "גוון כהה/עמוק"}
              </div>
            </div>
          </div>
        </div>

        {/* Complementary Products List */}
        {data.complementaryProducts && data.complementaryProducts.length > 0 && (
          <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 print:bg-white">
            <div className="text-xs font-bold text-slate-800 mb-1.5">ציוד משלים נלווה לליקוט:</div>
            <ul className="text-xs space-y-1 text-slate-700">
              {data.complementaryProducts.map((prod, idx) => (
                <li key={idx} className="flex items-center justify-between">
                  <span>• {prod.name}</span>
                  <span className="font-mono text-slate-500 text-[11px]">
                    (מק״ט {prod.sku}) × {prod.quantity}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Total Cost & Notes */}
        <div className="flex items-center justify-between border-t-2 border-slate-300 pt-2 text-sm">
          <div>
            <div className="text-[11px] font-bold text-slate-500">סה״כ לתשלום בדלפק:</div>
            <div className="text-lg font-black text-slate-900">
              {data.estimatedCostNis.toLocaleString("he-IL")} ₪
              <span className="text-xs font-normal text-slate-500 mr-1">(כולל מע״מ 18%)</span>
            </div>
          </div>
          <div className="text-left">
            <span className="text-[10px] text-slate-500 block">מקור הזמנה:</span>
            <span className="text-xs font-bold text-slate-800">נועה AI — עמדת שילוט וצבע</span>
          </div>
        </div>

        {/* Signatures for Counter / Picker */}
        <div className="border-t border-dashed border-slate-300 pt-3 grid grid-cols-2 gap-4 text-[11px] text-slate-500">
          <div>
            <span>חתימת גיוון ומלקט: ________________</span>
          </div>
          <div className="text-left">
            <span>חתימת לקוח / מאשר: ________________</span>
          </div>
        </div>
      </div>

      {/* Footer Utility Actions - Hidden when printing */}
      <div className="print:hidden border-t border-slate-200 bg-slate-50 p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyDetails}
            className="text-xs h-8"
          >
            {copied ? (
              <CheckCircle2 className="size-3.5 text-emerald-600 ml-1" />
            ) : (
              <Copy className="size-3.5 ml-1" />
            )}
            {copied ? "הועתק!" : "העתק סיכום"}
          </Button>

          <a
            href={whatsappLink(whatsappMessage, branchManagerPhone)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
          >
            <MessageCircle className="size-3.5" />
            עדכן את {branchManagerName} בוואטסאפ
          </a>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={handlePrint}
          className="bg-slate-900 text-white hover:bg-black font-bold text-xs h-8"
        >
          <Printer className="size-3.5 ml-1" />
          הדפסה מיידית
        </Button>
      </div>
    </div>
  );
}
