import { useEffect, useState, useMemo } from "react";

export interface ScreenDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  aspectRatioLabel: string;
  isUltraWide: boolean; // 21:9 or wider (ratio >= 2.1)
  is16x9: boolean; // standard landscape (1.7 - 1.85)
  is4K: boolean; // 3840x2160+
  is8K: boolean; // 7680x4320+
  scaleFactor: number; // 1.0 at 1920x1080 baseline
  orientation: "landscape" | "portrait";
  isTouch: boolean;
  viewportClass: string;
}

export function useScreenDimensions(): ScreenDimensions {
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: typeof window !== "undefined" ? window.innerWidth : 1920,
    height: typeof window !== "undefined" ? window.innerHeight : 1080,
  });

  const [isTouch, setIsTouch] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsTouch(
      "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        (window.matchMedia && window.matchMedia("(pointer: coarse)").matches),
    );

    let rafId: number;
    const handleResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      });
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return useMemo(() => {
    const { width, height } = dimensions;
    const aspectRatio = height > 0 ? width / height : 1.777;
    const orientation: "landscape" | "portrait" = width >= height ? "landscape" : "portrait";
    const isUltraWide = aspectRatio >= 2.1;
    const is16x9 = aspectRatio >= 1.7 && aspectRatio < 2.1;
    const is4K = width >= 3800 || height >= 2100;
    const is8K = width >= 7600 || height >= 4200;

    // Scale factor calibrated for ultra-large displays (3m-5m viewing distance)
    const scaleFactor = Math.max(0.85, Math.min(2.4, width / 1920));

    let aspectRatioLabel = "16:9 מסך רחב";
    if (isUltraWide) aspectRatioLabel = "21:9 אולטרה-רחב";
    else if (aspectRatio < 1) aspectRatioLabel = "פורטרט / קיוסק אנכי";
    else if (aspectRatio < 1.4) aspectRatioLabel = "4:3 סטנדרטי";
    else if (aspectRatio >= 1.5 && aspectRatio < 1.7) aspectRatioLabel = "16:10 תצוגת מחשב";

    let viewportClass = "viewport-standard";
    if (isUltraWide) viewportClass = "viewport-ultrawide";
    else if (is4K) viewportClass = "viewport-4k";
    else if (orientation === "portrait") viewportClass = "viewport-portrait";

    return {
      width,
      height,
      aspectRatio,
      aspectRatioLabel,
      isUltraWide,
      is16x9,
      is4K,
      is8K,
      scaleFactor,
      orientation,
      isTouch,
      viewportClass,
    };
  }, [dimensions, isTouch]);
}
