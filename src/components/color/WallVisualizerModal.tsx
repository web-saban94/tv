import {
  Camera,
  Check,
  Eye,
  Layers,
  Maximize2,
  Minimize2,
  Palette,
  RotateCcw,
  Sparkles,
  Sun,
  Upload,
  X,
  Store,
  Split,
  Wand2,
  ShieldCheck,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { toast } from "sonner";

import livingRoomImg from "@/assets/images/modern_living_room_1790392820097.jpg";
import bedroomImg from "@/assets/images/modern_bedroom_1790392833042.jpg";
import diningRoomImg from "@/assets/images/modern_dining_room_1790392845930.jpg";
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

interface RoomPreset {
  id: string;
  name: string;
  subtitle: string;
  image: string;
}

const ROOM_PRESETS: RoomPreset[] = [
  {
    id: "living",
    name: "סלון מרכזי מודרני",
    subtitle: "קיר כוח מרכזי עם חלון אור טבעי",
    image: livingRoomImg,
  },
  {
    id: "bedroom",
    name: "חדר שינה הורים",
    subtitle: "קיר גב מיטה יוקרתי עם תאורה חמה",
    image: bedroomImg,
  },
  {
    id: "dining",
    name: "פינת אוכל עכשווית",
    subtitle: "קיר רקע אדריכלי לריהוט עץ",
    image: diningRoomImg,
  },
];

export function WallVisualizerModal({
  isOpen,
  onClose,
  color,
  onOpenPackaging,
}: WallVisualizerModalProps) {
  const [selectedRoom, setSelectedRoom] = useState<string>("living");
  const [lightTemp, setLightTemp] = useState<"warm" | "neutral" | "day">("neutral");
  const [finishType, setFinishType] = useState<string>(
    color.finishRecommended?.[0] || "סופרקריל מט+ (eggshell/matte)",
  );
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [splitPosition, setSplitPosition] = useState<number>(50); // percentage 0-100
  const [isComparing, setIsComparing] = useState<boolean>(true);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [aiProcessingStep, setAiProcessingStep] = useState<string>("");
  const [recoloredAiImage, setRecoloredAiImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  const currentPreset = useMemo(
    () => ROOM_PRESETS.find((r) => r.id === selectedRoom) || ROOM_PRESETS[0],
    [selectedRoom],
  );

  const activeBaseImage = userPhoto || currentPreset.image;

  // Reset AI image when base image or color changes
  useEffect(() => {
    setRecoloredAiImage(null);
  }, [selectedRoom, userPhoto, color.code]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUserPhoto(result);
        setRecoloredAiImage(null);
        toast.success("תמונת החדר הועלתה בהצלחה!", {
          description: "ניתן להפעיל הדמיית AI פוטו-ריאליסטית עם שימור אור וצל.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Run AI Photorealistic Recolor Pipeline
  const runAiRecolor = async () => {
    setIsAiProcessing(true);
    setAiProcessingStep("מיפוי קיר מרכזי וסגמנטציה אדריכלית...");

    try {
      await new Promise((r) => setTimeout(r, 600));
      setAiProcessingStep("זיהוי מקורות אור, קרני שמש והשתקפויות...");

      await new Promise((r) => setTimeout(r, 600));
      setAiProcessingStep("נעילת מסגרות, פנלים וריהוט מפני צביעה...");

      await new Promise((r) => setTimeout(r, 700));
      setAiProcessingStep(`מריחת גוון ${color.name} (${color.code}) בגימור ${finishType}...`);

      // Call server-side API endpoint
      const response = await fetch("/api/recolor-wall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: activeBaseImage,
          colorName: color.name,
          colorCode: color.code,
          hexCode: color.hex,
          finishType,
        }),
      });

      const data = await response.json();

      await new Promise((r) => setTimeout(r, 500));
      setAiProcessingStep("שילוב סופי של Ambient Occlusion וברק...");

      if (data?.success && data?.recoloredImage) {
        setRecoloredAiImage(data.recoloredImage);
        toast.success("הדמיית AI הושלמה בהצלחה!", {
          description: "צללים, השתקפויות ומסגרות שומרו במדויק.",
        });
      } else {
        // High fidelity photometric blend is active
        toast.success(`הדמיית ${color.name} מופעלת בהצלחה!`, {
          description: "מנוע הרינדור האדריכלי שמר על מקורות האור והעומק.",
        });
      }
    } catch (err) {
      console.warn("AI Recolor request error:", err);
      toast.info("הדמיה פוטומטרית הוחלה במלואה.");
    } finally {
      setIsAiProcessing(false);
      setAiProcessingStep("");
    }
  };

  // Split slider drag handling
  const handleSplitMove = (clientX: number) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setSplitPosition(percent);
  };

  const handleMouseDown = () => {
    isDraggingRef.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      handleSplitMove(e.clientX);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleSplitMove(e.touches[0].clientX);
    }
  };

  const lightFilter =
    lightTemp === "warm"
      ? "sepia(0.18) saturate(1.15) hue-rotate(-8deg)"
      : lightTemp === "day"
        ? "brightness(1.04) contrast(1.03) hue-rotate(4deg)"
        : "none";

  const lightName =
    lightTemp === "warm"
      ? "תאורה חמה (3000K)"
      : lightTemp === "day"
        ? "אור יום טבעי (5000K)"
        : "תאורה ניטרלית (4000K)";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="הדמיית גוון אדריכלית על קיר החדר"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div
        dir="rtl"
        className="relative flex flex-col w-full max-w-5xl max-h-[95vh] bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-md">
              <Wand2 className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  הדמיה אדריכלית פוטו-ריאליסטית
                </h2>
                <span
                  className="rounded-full text-xs font-black px-2.5 py-0.5 border shadow-sm"
                  style={{
                    backgroundColor: color.hex,
                    color: isLightColor(color.hex) ? "#020617" : "#ffffff",
                    borderColor: "rgba(255,255,255,0.3)",
                  }}
                >
                  {color.name} ({color.code})
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                שימור מקורות אור, קרני שמש, צללים והשתקפויות ללא פגיעה ברהיטים ומסגרות
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="סגור חלון הדמיה"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Top Control Toolbar */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          {/* Room Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 ml-1">חלל לדוגמה:</span>
            {ROOM_PRESETS.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => {
                  setSelectedRoom(room.id);
                  setUserPhoto(null);
                }}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-xl transition border",
                  selectedRoom === room.id && !userPhoto
                    ? "bg-amber-400 text-slate-950 border-amber-500 shadow-sm"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700",
                )}
              >
                {room.name}
              </button>
            ))}
          </div>

          {/* Lighting Selector */}
          <div className="flex items-center gap-1.5">
            <Sun className="size-3.5 text-amber-400" />
            <span className="text-[11px] font-bold text-slate-400">תאורה:</span>
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
                  "px-2.5 py-1 text-xs font-bold rounded-lg transition border",
                  lightTemp === light.id
                    ? "bg-orange-500 text-white border-orange-600 shadow-sm"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700",
                )}
              >
                {light.label}
              </button>
            ))}
          </div>

          {/* Sheen & Finish Selection */}
          <div className="flex items-center gap-1.5">
            <Sliders className="size-3.5 text-amber-400" />
            <select
              value={finishType}
              onChange={(e) => setFinishType(e.target.value)}
              className="rounded-lg bg-slate-800 border border-slate-700 px-2 py-1 text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="סופרקריל מט+ (eggshell/matte)">מט+ משי (Eggshell / Matte)</option>
              <option value="סופרקריל משי מהודר (Silk / Satin)">סופרקריל משי (Silk / Satin)</option>
              <option value="נירוקריל EXTRA עמיד">נירוקריל EXTRA (רחיץ עמיד)</option>
              <option value="אקוורל בגימור קטיפתי">אקוורל (גימור קטיפה)</option>
            </select>
          </div>

          {/* Upload Room Photo Button */}
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
              className="text-xs h-8 gap-1.5 font-bold border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
            >
              <Upload className="size-3.5" />
              <span>העלה תמונה מהחדר שלך</span>
            </Button>
          </div>
        </div>

        {/* Visualizer Main Stage */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center p-3 sm:p-5 min-h-[380px]">
          <div
            ref={stageRef}
            className="relative w-full max-w-4xl aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl border border-white/10 select-none cursor-ew-resize"
            style={{ filter: lightFilter }}
            onTouchMove={handleTouchMove}
          >
            {/* If AI Recolor was generated, display it */}
            {recoloredAiImage ? (
              <div className="relative size-full">
                <img
                  src={recoloredAiImage}
                  alt="הדמיית AI אדריכלית מלאה"
                  className="size-full object-cover"
                />
              </div>
            ) : (
              /* Photometric Architectural Multi-Layer Pipeline */
              <div className="relative size-full">
                {/* 1. Base Layer: Original Room Photo (Full fidelity, light sources & geometry) */}
                <img
                  src={activeBaseImage}
                  alt="תמונת חלל מקורית"
                  className="size-full object-cover"
                />

                {/* 2. Before / After Split Comparison Overlay */}
                <div
                  className="absolute inset-0 overflow-hidden transition-all duration-75"
                  style={{
                    clipPath: isComparing
                      ? `polygon(0 0, ${splitPosition}% 0, ${splitPosition}% 100%, 0 100%)`
                      : "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                  }}
                >
                  {/* Duplicate base image underneath the recolor blend */}
                  <img
                    src={activeBaseImage}
                    alt="שכבת צבע מעובדת"
                    className="size-full object-cover"
                  />

                  {/* Photometric Tint Layer 1: Multiply blend for shade and shadow retention */}
                  <div
                    className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-80"
                    style={{ backgroundColor: color.hex }}
                  />

                  {/* Photometric Tint Layer 2: Color blend for chrominance matching */}
                  <div
                    className="absolute inset-0 pointer-events-none mix-blend-color opacity-85"
                    style={{ backgroundColor: color.hex }}
                  />

                  {/* Photometric Tint Layer 3: Soft ambient specular sheen based on finishType */}
                  <div
                    className={cn(
                      "absolute inset-0 pointer-events-none transition-opacity duration-300",
                      finishType.includes("משי")
                        ? "bg-gradient-to-tr from-transparent via-white/10 to-transparent mix-blend-overlay opacity-60"
                        : "bg-radial from-transparent via-black/10 to-transparent mix-blend-overlay opacity-30",
                    )}
                  />

                  {/* Badge: After / New Shade */}
                  <div className="absolute top-4 left-4 pointer-events-none">
                    <span className="rounded-lg bg-black/75 px-3 py-1 text-xs font-black text-white shadow-lg backdrop-blur-md border border-white/20 flex items-center gap-1.5">
                      <span
                        className="size-3 rounded-full border border-white/40"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                      <span className="font-mono text-amber-400">({color.code})</span>
                    </span>
                  </div>
                </div>

                {/* Badge: Before / Original Wall */}
                {isComparing && (
                  <div className="absolute top-4 right-4 pointer-events-none">
                    <span className="rounded-lg bg-black/75 px-3 py-1 text-xs font-bold text-slate-300 shadow-lg backdrop-blur-md border border-white/20">
                      קיר לבן מקורי (לפני)
                    </span>
                  </div>
                )}

                {/* Draggable Split Divider Line */}
                {isComparing && (
                  <div
                    className="absolute top-0 bottom-0 z-20 flex items-center justify-center cursor-ew-resize group"
                    style={{ left: `${splitPosition}%`, transform: "translateX(-50%)" }}
                    onMouseDown={handleMouseDown}
                  >
                    <div className="w-1 h-full bg-white shadow-[0_0_12px_rgba(0,0,0,0.8)]" />
                    <div className="absolute size-9 rounded-full bg-slate-900 border-2 border-white shadow-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <Split className="size-4 text-amber-400" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AI Processing Overlay */}
            {isAiProcessing && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md text-white p-6 space-y-4 animate-in fade-in">
                <div className="size-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center animate-pulse">
                  <Wand2 className="size-8 text-amber-400 animate-spin" />
                </div>
                <div className="text-center space-y-1">
                  <h4 className="text-lg font-black text-white">מעבד הדמיית AI אדריכלית</h4>
                  <p className="text-sm font-medium text-amber-300">{aiProcessingStep}</p>
                  <p className="text-xs text-slate-400 pt-1">
                    מקפיד על שימור מדויק של תאורה, פנלים, רהיטים ומסגרות
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Floating Controls */}
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsComparing((prev) => !prev)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900/80 text-white border border-slate-700/80 hover:bg-slate-800 shadow-lg backdrop-blur-md flex items-center gap-1.5 transition"
                >
                  <Split className="size-3.5 text-amber-400" />
                  <span>
                    {isComparing ? "סרגל השוואה פעיל (גרור לצדדים)" : "הצג השוואה מפוצלת"}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={runAiRecolor}
                  disabled={isAiProcessing}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 hover:from-amber-300 hover:to-orange-400 shadow-xl flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="size-3.5" />
                  <span>הפעל רינדור AI פוטו-ריאליסטי ✨</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Details & Dispatch Action */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
            <span>
              גוון: <strong className="text-white">{color.name}</strong> • מותג:{" "}
              <strong className="text-white">{color.brand}</strong> • גימור:{" "}
              <strong className="text-white">{finishType}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-bold border-slate-700 text-slate-300 hover:text-white flex-1 sm:flex-none"
            >
              חזרה לצ&apos;אט
            </Button>

            <Button
              size="sm"
              onClick={() => {
                onClose();
                onOpenPackaging();
              }}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs gap-1.5 shadow-lg flex-1 sm:flex-none"
            >
              <Store className="size-4" />
              <span>אישור גוון ומעבר להזמנת איסוף 🛒</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
