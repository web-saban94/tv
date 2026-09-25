export type ColorBrand = "טמבור" | "נירלט";

export type ColorFamily =
  "לבנים ושמנת" | "אפורים ובטון" | "בז' ומוקה" | "פסטל ורוגע" | "ירוקים וטבע" | "נועזים ועמוקים";

export interface ColorItem {
  id: string;
  code: string;
  name: string;
  brand: ColorBrand;
  hex: string;
  rgb?: string;
  family: ColorFamily;
  finishRecommended: string[];
  similarCodes: string[];
  complementaryCode: string;
  description: string;
  popularityRank?: number;
  coverageM2PerLiter?: number;
}

export interface ColorSelectionState {
  color: ColorItem;
  timestamp: number;
}
