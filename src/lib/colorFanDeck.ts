// ============================================================================
// SabanOS Color Fan Deck & Tinting Engine (טמבור & נירלט)
// ח. סבן חומרי בניין (1994) בע״מ
// ============================================================================

export type ColorBrand = "טמבור" | "נירלט";

export type ColorFamily =
  "לבנים ושמנת" | "אפורים ובטון" | "בז' ומוקה" | "פסטל ורוגע" | "ירוקים וטבע" | "נועזים ועמוקים";

export type PaintBaseType = "A" | "P" | "D" | "T";

export type PackageSize = "1L" | "5L" | "10L" | "18L";

export interface PackageOption {
  size: PackageSize;
  volumeLiters: number;
  label: string;
  sku: string;
  approxPriceNis: number;
}

export interface ColorShade {
  id: string;
  brand: ColorBrand;
  code: string;
  name: string;
  nameEn: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  family: ColorFamily;
  baseType: PaintBaseType;
  description: string;
  finishOptions: string[];
  similarCodes: string[];
  complementaryCode: string;
  isPopular?: boolean;
}

export interface PaintCalculationResult {
  areaSqMeters: number;
  layers: number;
  totalLitersNeeded: number;
  recommendedPackages: {
    size: PackageSize;
    label: string;
    quantity: number;
    volumeLiters: number;
    sku: string;
    unitPriceNis: number;
    subtotalNis: number;
  }[];
  totalEstimatedCostNis: number;
  coveragePerLiter: number;
  efficiencyRating: "מדויק" | "מומלץ עם רזרבה" | "חסכוני";
}

export interface ComplementaryProduct {
  sku: string;
  name: string;
  category: "רולרים ומברשות" | "הכנת שטח ושפכטל" | "פריימר וקישור" | "הגנה ומיסוך";
  priceNis: number;
  unit: string;
  recommendedFor: string;
}

// ----------------------------------------------------------------------------
// Comprehensive Fan Deck Dataset (טמבור ונירלט הנמכרים ביותר)
// ----------------------------------------------------------------------------
export const COLOR_FAN_DECK: ColorShade[] = [
  // --- לבנים ושמנת ---
  {
    id: "tambour-0021p",
    brand: "טמבור",
    code: "0021P",
    name: "לבן שלג מודרני",
    nameEn: "Snow White Crisp",
    hex: "#F9F9F7",
    rgb: { r: 249, g: 249, b: 247 },
    family: "לבנים ושמנת",
    baseType: "P",
    description: "לבן בוהק, צלול ונקי במיוחד עם רפלקטיביות אור מקסימלית לחללים מודרניים.",
    finishOptions: ["סופרקריל מט+", "סופרקריל משי", "סופרקריל 2000"],
    similarCodes: ["0002P", "0011P"],
    complementaryCode: "1542D",
    isPopular: true,
  },
  {
    id: "tambour-0002p",
    brand: "טמבור",
    code: "0002P",
    name: "לבן פנינה עדין",
    nameEn: "Soft Pearl White",
    hex: "#FAF6EE",
    rgb: { r: 250, g: 246, b: 238 },
    family: "לבנים ושמנת",
    baseType: "P",
    description: "לבן עוטף וחמים עם נגיעת פנינה עדינה המשרה תחושת יוקרה ורוגע.",
    finishOptions: ["סופרקריל מט+", "סופרקריל משי"],
    similarCodes: ["0021P", "0178P"],
    complementaryCode: "0524T",
    isPopular: true,
  },
  {
    id: "tambour-0011p",
    brand: "טמבור",
    code: "0011P",
    name: "לבן כותנה טבעי",
    nameEn: "Natural Cotton",
    hex: "#F5F3ED",
    rgb: { r: 245, g: 243, b: 237 },
    family: "לבנים ושמנת",
    baseType: "P",
    description: "גוון כותנה רך ואורגני, מתאים במיוחד לסלונים וחללי אירוח מוארים.",
    finishOptions: ["סופרקריל מט+", "סופרקריל משי"],
    similarCodes: ["0021P", "0002P"],
    complementaryCode: "0800P",
    isPopular: true,
  },
  {
    id: "nirlat-is-0001",
    brand: "נירלט",
    code: "IS 0001",
    name: "נירו-וייט טהור",
    nameEn: "Niro White Pure",
    hex: "#FCFDFD",
    rgb: { r: 252, g: 253, b: 253 },
    family: "לבנים ושמנת",
    baseType: "P",
    description: "הלבן המנצח של נירלט — בהירות חדה עם כושר כיסוי אקסטרה ועמידות גבוהה ברחיצה.",
    finishOptions: ["נירוקריל EXTRA", "אקוורל", "נירוקריל משי"],
    similarCodes: ["IS 0023", "0021P"],
    complementaryCode: "IS 0500",
    isPopular: true,
  },
  {
    id: "nirlat-is-0023",
    brand: "נירלט",
    code: "IS 0023",
    name: "שמנת קטיפתית",
    nameEn: "Velvet Cream",
    hex: "#F8F4EA",
    rgb: { r: 248, g: 244, b: 234 },
    family: "לבנים ושמנת",
    baseType: "P",
    description: "שמנת בהירה ונעימה ללא גוון צהבהב כבד, מצוינת לחדרי הורים וחדרי שינה.",
    finishOptions: ["נירוקריל EXTRA", "אקוורל"],
    similarCodes: ["IS 0001", "0002P"],
    complementaryCode: "IS 0234",
    isPopular: true,
  },

  // --- אפורים ובטון ---
  {
    id: "tambour-1542d",
    brand: "טמבור",
    code: "1542D",
    name: "אפור גרפיט תעשייתי",
    nameEn: "Industrial Graphite",
    hex: "#434B54",
    rgb: { r: 67, g: 75, b: 84 },
    family: "אפורים ובטון",
    baseType: "D",
    description: "גוון גרפיט עמוק ודומיננטי, מושלם לקיר כוח מעוצב בסלון, חלל עבודה או משרד.",
    finishOptions: ["סופרקריל מט+", "סופרקריל משי"],
    similarCodes: ["1555D", "1530P"],
    complementaryCode: "0021P",
    isPopular: true,
  },
  {
    id: "tambour-1530p",
    brand: "טמבור",
    code: "1530P",
    name: "בטון חשוף אורבני",
    nameEn: "Urban Concrete",
    hex: "#BAC2CA",
    rgb: { r: 186, g: 194, b: 202 },
    family: "אפורים ובטון",
    baseType: "A",
    description: "אפור בטון מאוזן וקלאסי במראה ארכיטקטוני יוקרתי, משתלב נהדר עם ברזל ועץ אלון.",
    finishOptions: ["סופרקריל מט+", "סופרקריל משי"],
    similarCodes: ["1542D", "0800P"],
    complementaryCode: "0524T",
    isPopular: true,
  },
  {
    id: "tambour-0800p",
    brand: "טמבור",
    code: "0800P",
    name: "ערפל בוקר מעודן",
    nameEn: "Gentle Morning Mist",
    hex: "#D7DCDD",
    rgb: { r: 215, g: 220, b: 221 },
    family: "אפורים ובטון",
    baseType: "P",
    description: "אפור כסוף בהיר מאוד ומרחיב חללים, מעניק תחושת מרחב ושקט עיצובי.",
    finishOptions: ["סופרקריל מט+", "סופרקריל משי"],
    similarCodes: ["1530P", "0021P"],
    complementaryCode: "1542D",
    isPopular: true,
  },
  {
    id: "nirlat-is-0500",
    brand: "נירלט",
    code: "IS 0500",
    name: "אפור אבן ירושלמית",
    nameEn: "Jerusalem Stone Grey",
    hex: "#7D878D",
    rgb: { r: 125, g: 135, b: 141 },
    family: "אפורים ובטון",
    baseType: "A",
    description: "אפור אבן נטרלי בעל נוכחות מאופקת, רב-מכר בקרב אדריכלים ומעצבי פנים.",
    finishOptions: ["נירוקריל EXTRA", "אקוורל"],
    similarCodes: ["IS 0234", "1530P"],
    complementaryCode: "IS 0001",
    isPopular: true,
  },
  {
    id: "nirlat-is-0680",
    brand: "נירלט",
    code: "IS 0680",
    name: "בזלת פחם כהה",
    nameEn: "Dark Basalt Charcoal",
    hex: "#34383C",
    rgb: { r: 52, g: 56, b: 60 },
    family: "אפורים ובטון",
    baseType: "D",
    description: "פחם דרמטי ועשיר לקיר טלוויזיה, נישות נגרות מוארות או חדרי שינה יוקרתיים.",
    finishOptions: ["נירוקריל EXTRA", "אקוורל"],
    similarCodes: ["1542D", "IS 0500"],
    complementaryCode: "IS 0023",
  },

  // --- בז' ומוקה ---
  {
    id: "tambour-0524t",
    brand: "טמבור",
    code: "0524T",
    name: "מוקה קינמון חם",
    nameEn: "Warm Cinnamon Mocha",
    hex: "#9C7C5F",
    rgb: { r: 156, g: 124, b: 95 },
    family: "בז' ומוקה",
    baseType: "T",
    description: "מוקה עמוק וחם המביא אלמנט אדמתי עשיר לקירות דקורטיביים ולפינות אוכל.",
    finishOptions: ["סופרקריל מט+", "סופרקריל משי"],
    similarCodes: ["0534T", "0178P"],
    complementaryCode: "0002P",
    isPopular: true,
  },
  {
    id: "tambour-0178p",
    brand: "טמבור",
    code: "0178P",
    name: "חול מדבר זהוב",
    nameEn: "Golden Desert Sand",
    hex: "#E8DECA",
    rgb: { r: 232, g: 222, b: 202 },
    family: "בז' ומוקה",
    baseType: "P",
    description: "בז' טבעי וחמים בהשראת חולות השרון, מתאים לכל חלקי הבית לתחושה ביתית ומזמינה.",
    finishOptions: ["סופרקריל מט+", "סופרקריל משי"],
    similarCodes: ["0002P", "0524T"],
    complementaryCode: "0534T",
    isPopular: true,
  },
  {
    id: "nirlat-is-0234",
    brand: "נירלט",
    code: "IS 0234",
    name: "קפה לאטה עדין",
    nameEn: "Smooth Caffe Latte",
    hex: "#CDBFB2",
    rgb: { r: 205, g: 191, b: 178 },
    family: "בז' ומוקה",
    baseType: "A",
    description: "הגוון הקלאסי של נירלט למשפחות — מרקם חם, קל לניקוי ומסתיר לכלוך בצורה אופטימלית.",
    finishOptions: ["נירוקריל EXTRA", "אקוורל"],
    similarCodes: ["IS 0023", "0178P"],
    complementaryCode: "IS 0680",
    isPopular: true,
  },
  {
    id: "tambour-0534t",
    brand: "טמבור",
    code: "0534T",
    name: "שוקולד פרלין עמוק",
    nameEn: "Rich Praline Brown",
    hex: "#6D523C",
    rgb: { r: 109, g: 82, b: 60 },
    family: "בז' ומוקה",
    baseType: "T",
    description: "חום שוקולדי עמוק המעניק ביטחון ויוקרה לקירות גב מיטה וחדרי קולנוע ביתיים.",
    finishOptions: ["סופרקריל מט+", "סופרקריל משי"],
    similarCodes: ["0524T", "0178P"],
    complementaryCode: "0011P",
  },

  // --- ירוקים וטבע ---
  {
    id: "tambour-0420p",
    brand: "טמבור",
    code: "0420P",
    name: "מרווה גלילית מרגיעה",
    nameEn: "Galilee Sage Mist",
    hex: "#9EADA0",
    rgb: { r: 158, g: 173, b: 160 },
    family: "ירוקים וטבע",
    baseType: "A",
    description: "ירוק מרווה פסטורלי ועדין, משרה שלווה ונשימה נקייה בחדרי שינה ובפינות עבודה.",
    finishOptions: ["סופרקריל מט+", "סופרקריל משי"],
    similarCodes: ["0920T", "0800P"],
    complementaryCode: "0021P",
    isPopular: true,
  },
  {
    id: "tambour-0920t",
    brand: "טמבור",
    code: "0920T",
    name: "ירוק יער עמוק",
    nameEn: "Deep Pine Forest",
    hex: "#2F5042",
    rgb: { r: 47, g: 80, b: 66 },
    family: "ירוקים וטבע",
    baseType: "T",
    description: "ירוק עמוק בוטני יוקרתי, משתלב בצורה נפלאה עם אביזרי פליז זהובים וחיפויי עץ.",
    finishOptions: ["סופרקריל מט+", "סופרקריל משי"],
    similarCodes: ["0420P", "1542D"],
    complementaryCode: "0178P",
    isPopular: true,
  },
  {
    id: "nirlat-is-0350",
    brand: "נירלט",
    code: "IS 0350",
    name: "עלי זית ים-תיכוני",
    nameEn: "Mediterranean Olive Leaf",
    hex: "#6F7A62",
    rgb: { r: 111, g: 122, b: 98 },
    family: "ירוקים וטבע",
    baseType: "A",
    description: "ירוק זית ארץ-ישראלי מאוזן, מעניק מראה טבעי ויוקרתי לחללי כניסה וסלונים פתוחים.",
    finishOptions: ["נירוקריל EXTRA", "אקוורל"],
    similarCodes: ["0420P", "IS 0234"],
    complementaryCode: "IS 0001",
  },

  // --- פסטל ורוגע ---
  {
    id: "tambour-1100p",
    brand: "טמבור",
    code: "1100P",
    name: "תכלת שמיים פתוחים",
    nameEn: "Open Sky Powder Blue",
    hex: "#C6D9E3",
    rgb: { r: 198, g: 217, b: 227 },
    family: "פסטל ורוגע",
    baseType: "P",
    description: "תכלת פודרה רגוע וצלול, מעולה לחדרי ילדים, חדרי רחצה או פינות קריאה.",
    finishOptions: ["סופרקריל מט+", "סופרקריל משי"],
    similarCodes: ["0800P", "0021P"],
    complementaryCode: "0524T",
    isPopular: true,
  },
  {
    id: "nirlat-is-0110",
    brand: "נירלט",
    code: "IS 0110",
    name: "ורוד עתיק מלטף",
    nameEn: "Blush Antique Rose",
    hex: "#EAD6D2",
    rgb: { r: 234, g: 214, b: 210 },
    family: "פסטל ורוגע",
    baseType: "P",
    description: "ורוד מאובק ואלגנטי שאינו מתקתק מדי, מושלם לחדרי שינה נעימים וחדרי רחצה מודרניים.",
    finishOptions: ["נירוקריל EXTRA", "אקוורל"],
    similarCodes: ["IS 0023", "0178P"],
    complementaryCode: "IS 0500",
  },

  // --- נועזים ועמוקים ---
  {
    id: "tambour-1100d",
    brand: "טמבור",
    code: "1100D",
    name: "כחול אינדיגו רויאל",
    nameEn: "Royal Indigo Blue",
    hex: "#1E3048",
    rgb: { r: 30, g: 48, b: 72 },
    family: "נועזים ועמוקים",
    baseType: "D",
    description: "כחול לילה עמוק ומלכותי לקיר כוח עם נוכחות אצילית ותאורה שקועה.",
    finishOptions: ["סופרקריל מט+", "סופרקריל משי"],
    similarCodes: ["1542D", "0920T"],
    complementaryCode: "0002P",
    isPopular: true,
  },
  {
    id: "nirlat-is-0850",
    brand: "נירלט",
    code: "IS 0850",
    name: "טרה-קוטה טוסקנה",
    nameEn: "Tuscan Terracotta",
    hex: "#A3513C",
    rgb: { r: 163, g: 81, b: 60 },
    family: "נועזים ועמוקים",
    baseType: "T",
    description: "חמרה חמימה ומלאת חיים המעוררת אנרגיה טובה, מתאימה למטבחים ופינות אוכל מודרניות.",
    finishOptions: ["נירוקריל EXTRA", "אקוורל"],
    similarCodes: ["0524T", "0534T"],
    complementaryCode: "IS 0001",
  },
];

// ----------------------------------------------------------------------------
// Packaging Standards & Pricing Models (סבן חומרי בניין)
// ----------------------------------------------------------------------------
export const PAINT_PACKAGING_OPTIONS: Record<ColorBrand, PackageOption[]> = {
  טמבור: [
    {
      size: "1L",
      volumeLiters: 1,
      label: "מארז 1 ליטר (לתיקונים וקיר קטן)",
      sku: "20001",
      approxPriceNis: 55,
    },
    {
      size: "5L",
      volumeLiters: 5,
      label: "גלון 5 ליטר (לחדר סטנדרטי)",
      sku: "20005",
      approxPriceNis: 165,
    },
    {
      size: "10L",
      volumeLiters: 10,
      label: "חצי פח 10 ליטר (לדירת 2 חדרים)",
      sku: "20010",
      approxPriceNis: 295,
    },
    {
      size: "18L",
      volumeLiters: 18,
      label: "פח ענק 18 ליטר (משתלם ביותר לקבלנים)",
      sku: "20018",
      approxPriceNis: 460,
    },
  ],
  נירלט: [
    {
      size: "1L",
      volumeLiters: 1,
      label: "מארז 1 ליטר EXTRA (תיקונים)",
      sku: "21001",
      approxPriceNis: 52,
    },
    {
      size: "5L",
      volumeLiters: 5,
      label: "גלון 5 ליטר EXTRA (לחדר)",
      sku: "21005",
      approxPriceNis: 158,
    },
    {
      size: "10L",
      volumeLiters: 10,
      label: "חצי פח 10 ליטר EXTRA",
      sku: "21010",
      approxPriceNis: 285,
    },
    {
      size: "18L",
      volumeLiters: 18,
      label: "פח 18 ליטר EXTRA מרוכז",
      sku: "21018",
      approxPriceNis: 445,
    },
  ],
};

// ----------------------------------------------------------------------------
// Complementary Paint Materials (מוצרים משלימים למקצוענים בדלפק)
// ----------------------------------------------------------------------------
export const COMPLEMENTARY_PAINT_PRODUCTS: ComplementaryProduct[] = [
  {
    sku: "30101",
    name: "רולר מיקרופייבר מקצועי 9 אינץ׳ + ידית ארגונומית",
    category: "רולרים ומברשות",
    priceNis: 38,
    unit: "יח׳",
    recommendedFor: "מריחה חלקה ללא סימנים על קירות פנים",
  },
  {
    sku: "30102",
    name: "רולר ספוג פינות וקנטים 4 אינץ׳ (מיני רולר)",
    category: "רולרים ומברשות",
    priceNis: 18,
    unit: "יח׳",
    recommendedFor: "דיוק מקסימלי סביב משקופים ופאנלים",
  },
  {
    sku: "30201",
    name: "פריימר בונדרול סופר טמבור 5 ליטר",
    category: "פריימר וקישור",
    priceNis: 135,
    unit: "גלון",
    recommendedFor: "חובה על קיר שפכטל, גבס או טיח טרי לפני צביעה",
  },
  {
    sku: "30202",
    name: "שפכטל אמריקאי מוכן לשימוש 2000 (פח 28 ק״ג)",
    category: "הכנת שטח ושפכטל",
    priceNis: 85,
    unit: "פח",
    recommendedFor: "החלקת קירות ברמה מושלמת (רמת גימור Q4)",
  },
  {
    sku: "30301",
    name: "דבק מסקנטייפ כחול מקצועי עמיד UV (רוחב 48 מ״מ)",
    category: "הגנה ומיסוך",
    priceNis: 19,
    unit: "גליל",
    recommendedFor: "מיסוך מדויק ללא קילוף צבע בעת ההסרה",
  },
  {
    sku: "30302",
    name: "ניילון פריסה עבה להגנת ריצוף ורהיטים (20 מ״ר)",
    category: "הגנה ומיסוך",
    priceNis: 24,
    unit: "גליל",
    recommendedFor: "הגנה מלאה על הריצוף מטיפות צבע",
  },
];

// ----------------------------------------------------------------------------
// Core Calculation Functions
// ----------------------------------------------------------------------------

/**
 * מחשב כמות צבע נדרשת לפי שטח מ"ר בשתי שכבות, וממליץ על שילוב מארזים אופטימלי וחסכוני
 * @param areaSqMeters שטח הקירות הכולל לצביעה במ"ר
 * @param layers מספר שכבות (ברירת מחדל: 2 שכבות)
 * @param coveragePerLiter כושר כיסוי לליטר (ברירת מחדל: 12 מ"ר לליטר בשכבה אחת)
 * @param brand מותג מועדף ("טמבור" או "נירלט")
 */
export function calculatePaintRequirements(
  areaSqMeters: number,
  layers: number = 2,
  coveragePerLiter: number = 12,
  brand: ColorBrand = "טמבור",
): PaintCalculationResult {
  const safeArea = Math.max(1, areaSqMeters);
  const safeLayers = Math.max(1, layers);
  // סך הכל ליטרים נטו הנדרשים לכיסוי
  const totalLitersExact = (safeArea * safeLayers) / coveragePerLiter;
  // תוספת בטיחות של 10% עבור פחת, קנטים ובליעה
  const litersWithSafety = totalLitersExact * 1.1;

  const packages = PAINT_PACKAGING_OPTIONS[brand];
  let remainingLiters = litersWithSafety;

  const recommendedPackages: PaintCalculationResult["recommendedPackages"] = [];

  // אלגוריתם חמדני חכם לבחירת אריזות משתלמת
  // 18L
  if (remainingLiters >= 14) {
    const count18 = Math.floor(remainingLiters / 18);
    const rem = remainingLiters % 18;
    const p18 = packages.find((p) => p.size === "18L")!;
    if (count18 > 0) {
      recommendedPackages.push({
        size: "18L",
        label: p18.label,
        quantity: count18,
        volumeLiters: count18 * 18,
        sku: p18.sku,
        unitPriceNis: p18.approxPriceNis,
        subtotalNis: count18 * p18.approxPriceNis,
      });
      remainingLiters = rem;
    }
  }

  // 10L
  if (remainingLiters >= 7.5) {
    const p10 = packages.find((p) => p.size === "10L")!;
    recommendedPackages.push({
      size: "10L",
      label: p10.label,
      quantity: 1,
      volumeLiters: 10,
      sku: p10.sku,
      unitPriceNis: p10.approxPriceNis,
      subtotalNis: p10.approxPriceNis,
    });
    remainingLiters = Math.max(0, remainingLiters - 10);
  }

  // 5L
  if (remainingLiters >= 3) {
    const count5 = Math.ceil(remainingLiters / 5);
    const p5 = packages.find((p) => p.size === "5L")!;
    recommendedPackages.push({
      size: "5L",
      label: p5.label,
      quantity: count5,
      volumeLiters: count5 * 5,
      sku: p5.sku,
      unitPriceNis: p5.approxPriceNis,
      subtotalNis: count5 * p5.approxPriceNis,
    });
    remainingLiters = 0;
  }

  // 1L
  if (remainingLiters > 0) {
    const count1 = Math.ceil(remainingLiters);
    const p1 = packages.find((p) => p.size === "1L")!;
    recommendedPackages.push({
      size: "1L",
      label: p1.label,
      quantity: count1,
      volumeLiters: count1,
      sku: p1.sku,
      unitPriceNis: p1.approxPriceNis,
      subtotalNis: count1 * p1.approxPriceNis,
    });
  }

  // חישוב עלות כוללת
  const totalEstimatedCostNis = recommendedPackages.reduce((acc, p) => acc + p.subtotalNis, 0);

  return {
    areaSqMeters: safeArea,
    layers: safeLayers,
    totalLitersNeeded: Math.round(litersWithSafety * 10) / 10,
    recommendedPackages,
    totalEstimatedCostNis,
    coveragePerLiter,
    efficiencyRating: litersWithSafety > 25 ? "חסכוני" : "מומלץ עם רזרבה",
  };
}

/**
 * התאמת בסיס מכונת גיוון אוטומטית לפי מאפייני הגוון (בסיס A/P לגוונים בהירים, D/T לכהים ונועזים)
 */
export function matchMachineBase(shade: ColorShade | string): PaintBaseType {
  let targetShade: ColorShade | undefined;
  if (typeof shade === "string") {
    targetShade = getColorShadeByCode(shade);
  } else {
    targetShade = shade;
  }

  if (targetShade) {
    return targetShade.baseType;
  }

  // אם נמסר קוד כללי, מזהים לפי סיומת או מאפייני הקידומת
  const normalized = (typeof shade === "string" ? shade : "").trim().toUpperCase();
  if (normalized.endsWith("T")) return "T";
  if (normalized.endsWith("D")) return "D";
  if (normalized.endsWith("A")) return "A";
  if (normalized.endsWith("P")) return "P";

  return "P"; // ברירת מחדל בטוחה ללבנים ובהירים
}

/**
 * שליפת מוצרים משלימים ייעודיים להזמנת צבע
 */
export function getComplementaryPaintProducts(
  brand: ColorBrand = "טמבור",
  baseProduct?: string,
): ComplementaryProduct[] {
  // החזרת רשימת הציוד הנלווה המקצועי
  return COMPLEMENTARY_PAINT_PRODUCTS.filter((prod) => {
    if (baseProduct && baseProduct.includes("שפכטל") && prod.category === "הכנת שטח ושפכטל") {
      return true;
    }
    return true;
  });
}

/**
 * איתור גוון לפי קוד יצרן (למשל "0021P" או "IS 0234")
 */
export function getColorShadeByCode(code: string): ColorShade | undefined {
  if (!code) return undefined;
  const clean = code.trim().toLowerCase().replace(/\s+/g, "");
  return COLOR_FAN_DECK.find((item) => {
    const itemCodeClean = item.code.toLowerCase().replace(/\s+/g, "");
    return itemCodeClean === clean;
  });
}

/**
 * חיפוש גוונים לפי טקסט (קוד, שם בעברית או באנגלית, או משפחה)
 */
export function searchColorShades(query: string, brand?: ColorBrand): ColorShade[] {
  const cleanQuery = query.trim().toLowerCase();
  return COLOR_FAN_DECK.filter((shade) => {
    if (brand && shade.brand !== brand) return false;
    if (!cleanQuery) return true;

    return (
      shade.code.toLowerCase().includes(cleanQuery) ||
      shade.name.toLowerCase().includes(cleanQuery) ||
      shade.nameEn.toLowerCase().includes(cleanQuery) ||
      shade.family.toLowerCase().includes(cleanQuery) ||
      shade.hex.toLowerCase().includes(cleanQuery)
    );
  });
}

/**
 * שליפת כל הגוונים המשתייכים למשפחה מסוימת
 */
export function getColorShadesByFamily(family: ColorFamily): ColorShade[] {
  return COLOR_FAN_DECK.filter((s) => s.family === family);
}
