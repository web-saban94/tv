import { Palette, Sparkles, MessageCircle, RefreshCw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { COLOR_DATABASE, getColorByCode } from "@/lib/colorsData";
import { ColorItem } from "@/types/colors";

import { ChatColorCard } from "./ChatColorCard";
import { ColorPaletteModal } from "./ColorPaletteModal";

interface ColorPickerChatInterfaceProps {
  initialColorCode?: string;
  onColorSelect?: (color: ColorItem) => void;
  screenId?: string;
}

export function ColorPickerChatInterface({
  initialColorCode = "0021P",
  onColorSelect,
  screenId,
}: ColorPickerChatInterfaceProps) {
  const [selectedColor, setSelectedColor] = useState<ColorItem>(
    () => getColorByCode(initialColorCode) || COLOR_DATABASE[0]!,
  );
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const handleSelectColor = (color: ColorItem) => {
    setSelectedColor(color);
    if (onColorSelect) {
      onColorSelect(color);
    }
  };

  return (
    <div dir="rtl" className="w-full flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Palette Trigger Bar */}
      <div className="w-full max-w-lg mb-3 flex items-center justify-between bg-card p-3 rounded-2xl border border-border shadow-xs">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
            <Palette className="size-4" />
          </div>
          <div>
            <p className="text-xs font-black text-foreground">מניפת גוונים סבן</p>
            <p className="text-[10px] text-muted-foreground">טמבור & נירלט • גיוון ממוחשב</p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => setIsPaletteOpen(true)}
          className="h-8 font-bold text-xs bg-amber-400 hover:bg-amber-500 text-slate-950 gap-1.5 shadow-xs"
        >
          <Palette className="size-3.5" />
          <span>פתח מניפת גוונים</span>
        </Button>
      </div>

      {/* The Chat Color Card */}
      <ChatColorCard
        color={selectedColor}
        onSelectColor={handleSelectColor}
        onOpenPalette={() => setIsPaletteOpen(true)}
        screenId={screenId}
      />

      {/* The Palette Drawer / Modal */}
      <ColorPaletteModal
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onSelectColor={handleSelectColor}
        selectedCode={selectedColor.code}
      />
    </div>
  );
}
