import { ColorBrand, ColorFamily, ColorItem } from "@/types/colors";

export const COLOR_FAMILIES: ColorFamily[] = [
  "לבנים ושמנת",
  "אפורים ובטון",
  "בז' ומוקה",
  "ירוקים וטבע",
  "פסטל ורוגע",
  "נועזים ועמוקים",
];

export const COLOR_BRANDS: ColorBrand[] = ["טמבור", "נירלט"];

export const COLOR_DATABASE: ColorItem[] = [
  {
    id: "tambour-0021p",
    code: "0021P",
    name: "פנינה (לבן שבור)",
    brand: "טמבור",
    hex: "#F0ECE1",
    rgb: "rgb(240, 236, 225)",
    family: "לבנים ושמנת",
    finishRecommended: ["סופרקריל מט+", "סופרקריל משי"],
    similarCodes: ["0011P", "0020P"],
    complementaryCode: "0524T",
    description: "הגוון הפופולרי ביותר בישראל. לבן חם ומזמין המעניק אור טבעי לחלל ללא בוהק מנוכר.",
    popularityRank: 1,
    coverageM2PerLiter: 11,
  },
  {
    id: "tambour-0524t",
    code: "0524T",
    name: "אפור בטון עדין",
    brand: "טמבור",
    hex: "#D6D5D0",
    rgb: "rgb(214, 213, 208)",
    family: "אפורים ובטון",
    finishRecommended: ["סופרקריל מט+", "סופרקריל משי"],
    similarCodes: ["0523T", "0525T"],
    complementaryCode: "0021P",
    description: "אפור מודרני בהיר עם תת-גוון ניטרלי, מתאים לקירות מרכזיים בסלון ובחללים פתוחים.",
    popularityRank: 2,
    coverageM2PerLiter: 10.5,
  },
  {
    id: "tambour-0011p",
    code: "0011P",
    name: "לבן בוהק נקי",
    brand: "טמבור",
    hex: "#F8F8F6",
    rgb: "rgb(248, 248, 246)",
    family: "לבנים ושמנת",
    finishRecommended: ["סופרקריל מט+"],
    similarCodes: ["0021P", "0001P"],
    complementaryCode: "1542D",
    description:
      "לבן כמעט אבסולוטי עם נגיעה מזערית של חמימות, אידיאלי לתקרות ולתחושת מרחב מקסימלית.",
    popularityRank: 3,
    coverageM2PerLiter: 11.5,
  },
  {
    id: "tambour-0184p",
    code: "0184P",
    name: "קשמיר חם",
    brand: "טמבור",
    hex: "#E6DEC8",
    rgb: "rgb(230, 222, 200)",
    family: "בז' ומוקה",
    finishRecommended: ["סופרקריל מט+", "סופרקריל משי"],
    similarCodes: ["0183P", "0185T"],
    complementaryCode: "0545D",
    description: "גוון בז' אלגנטי המשרה רוגע וחמימות, מתאים במיוחד לחדרי שינה ופינות אוכל.",
    popularityRank: 4,
    coverageM2PerLiter: 10.5,
  },
  {
    id: "tambour-1542d",
    code: "1542D",
    name: "גרפיט עמוק (קיר כוח)",
    brand: "טמבור",
    hex: "#3A3D40",
    rgb: "rgb(58, 61, 64)",
    family: "נועזים ועמוקים",
    finishRecommended: ["סופרקריל משי"],
    similarCodes: ["1541D", "1543D"],
    complementaryCode: "0021P",
    description: "אפור-גרפיט עמוק ויוקרתי. אידיאלי לקיר טלוויזיה, גב מיטה או נישות מעוצבות.",
    popularityRank: 5,
    coverageM2PerLiter: 9.5,
  },
  {
    id: "nirlat-is-0234",
    code: "IS 0234",
    name: "גרייג' אורבני",
    brand: "נירלט",
    hex: "#DDD6CC",
    rgb: "rgb(221, 214, 204)",
    family: "בז' ומוקה",
    finishRecommended: ["נירוקריל EXTRA", "אקוורל"],
    similarCodes: ["IS 0233", "IS 0235"],
    complementaryCode: "IS 0500",
    description: "שילוב מאוזן בין אפור לבז'. מתאים לריצוף בהיר ומעניק מראה מודרני מתוחכם.",
    popularityRank: 6,
    coverageM2PerLiter: 11,
  },
  {
    id: "nirlat-is-0001",
    code: "IS 0001",
    name: "לבן שלג צח",
    brand: "נירלט",
    hex: "#FAF9F6",
    rgb: "rgb(250, 249, 246)",
    family: "לבנים ושמנת",
    finishRecommended: ["נירוקריל EXTRA"],
    similarCodes: ["IS 0002", "IS 0003"],
    complementaryCode: "IS 0850",
    description: "לבן נקי וטהור עם החזר אור גבוה, מומלץ לחללים קטנים המבקשים תחושת פתיחות.",
    popularityRank: 7,
    coverageM2PerLiter: 12,
  },
  {
    id: "nirlat-is-0023",
    code: "IS 0023",
    name: "שמנת מעודנת",
    brand: "נירלט",
    hex: "#F4EFEA",
    rgb: "rgb(244, 239, 234)",
    family: "לבנים ושמנת",
    finishRecommended: ["נירוקריל EXTRA", "נירוקריל למטבח ולאמבט"],
    similarCodes: ["IS 0022", "IS 0024"],
    complementaryCode: "IS 0420",
    description: "גוון שמנת חם ורך שאינו מצהיב, מעניק רקע נעים ומחמיא לרהיטי עץ.",
    popularityRank: 8,
    coverageM2PerLiter: 11,
  },
  {
    id: "nirlat-is-0500",
    code: "IS 0500",
    name: "אפור עשן מודרני",
    brand: "נירלט",
    hex: "#A8A9A4",
    rgb: "rgb(168, 169, 164)",
    family: "אפורים ובטון",
    finishRecommended: ["נירוקריל EXTRA"],
    similarCodes: ["IS 0499", "IS 0501"],
    complementaryCode: "IS 0001",
    description: "אפור בעל נוכחות מרשימה לקירות מוקד, שילוב מושלם עם מתכת שחורה ותאורה חמה.",
    popularityRank: 9,
    coverageM2PerLiter: 10,
  },
  {
    id: "nirlat-is-0850",
    code: "IS 0850",
    name: "ירוק מרווה מעושן",
    brand: "נירלט",
    hex: "#A7B3A5",
    rgb: "rgb(167, 179, 165)",
    family: "ירוקים וטבע",
    finishRecommended: ["נירוקריל EXTRA", "אקוורל"],
    similarCodes: ["IS 0849", "IS 0851"],
    complementaryCode: "IS 0234",
    description: "ירוק טבעי עדין המשרה שלווה וחיבור לטבע. נפוץ מאוד בחדרי שינה ובפינות עבודה.",
    popularityRank: 10,
    coverageM2PerLiter: 10,
  },
  // Companion & Similar shades to ensure every relation links to a valid color card
  {
    id: "tambour-0020p",
    code: "0020P",
    name: "לבן שנהב רך",
    brand: "טמבור",
    hex: "#EEEAE0",
    rgb: "rgb(238, 234, 224)",
    family: "לבנים ושמנת",
    finishRecommended: ["סופרקריל מט+", "סופרקריל משי"],
    similarCodes: ["0021P", "0011P"],
    complementaryCode: "0524T",
    description: "שנהב מעודן המעניק מראה קלאסי ומואר, מתאים לכל חללי הבית.",
    coverageM2PerLiter: 11,
  },
  {
    id: "tambour-0001p",
    code: "0001P",
    name: "לבן שלג מוחלט",
    brand: "טמבור",
    hex: "#FCFDFE",
    rgb: "rgb(252, 253, 254)",
    family: "לבנים ושמנת",
    finishRecommended: ["סופרקריל מט+"],
    similarCodes: ["0011P", "0021P"],
    complementaryCode: "1542D",
    description: "הלבן הבוהק ביותר של טמבור. החזרת אור מרבית ותחושת גובה.",
    coverageM2PerLiter: 11.5,
  },
  {
    id: "tambour-0523t",
    code: "0523T",
    name: "אפור משי קל",
    brand: "טמבור",
    hex: "#E2E1DC",
    rgb: "rgb(226, 225, 220)",
    family: "אפורים ובטון",
    finishRecommended: ["סופרקריל מט+", "סופרקריל משי"],
    similarCodes: ["0524T", "0525T"],
    complementaryCode: "0021P",
    description: "אפור כמעט לבן, מספק ניגוד עדין לפנלים ולמשקופים לבנים.",
    coverageM2PerLiter: 11,
  },
  {
    id: "tambour-0525t",
    code: "0525T",
    name: "בטון תעשייתי",
    brand: "טמבור",
    hex: "#C5C4BF",
    rgb: "rgb(197, 196, 191)",
    family: "אפורים ובטון",
    finishRecommended: ["סופרקריל מט+"],
    similarCodes: ["0524T", "0523T"],
    complementaryCode: "0184P",
    description: "אפור בטון בעל נוכחות, מצוין למראה תעשייתי (Loft) וקירות דקורטיביים.",
    coverageM2PerLiter: 10,
  },
  {
    id: "tambour-0183p",
    code: "0183P",
    name: "חול מדבר בהיר",
    brand: "טמבור",
    hex: "#ECE5D5",
    rgb: "rgb(236, 229, 213)",
    family: "בז' ומוקה",
    finishRecommended: ["סופרקריל מט+"],
    similarCodes: ["0184P", "0185T"],
    complementaryCode: "0545D",
    description: "בז' טבעי המזכיר דיונות חול מדבריות, נותן עטיפה חמימה לחדרי אירוח.",
    coverageM2PerLiter: 10.5,
  },
  {
    id: "tambour-0185t",
    code: "0185T",
    name: "מוקה לאטה",
    brand: "טמבור",
    hex: "#DCD1B8",
    rgb: "rgb(220, 209, 184)",
    family: "בז' ומוקה",
    finishRecommended: ["סופרקריל מט+", "סופרקריל משי"],
    similarCodes: ["0184P", "0183P"],
    complementaryCode: "1542D",
    description: "גוון מוקה רך ומפנק, משתלב נפלא עם פרקט עץ ואלומיניום שחור.",
    coverageM2PerLiter: 10,
  },
  {
    id: "tambour-0545d",
    code: "0545D",
    name: "ברונזה ארצית",
    brand: "טמבור",
    hex: "#4A443E",
    rgb: "rgb(74, 68, 62)",
    family: "נועזים ועמוקים",
    finishRecommended: ["סופרקריל משי"],
    similarCodes: ["1542D", "1541D"],
    complementaryCode: "0184P",
    description: "חום-ברונזה עמוק ועשיר. מושלם כקיר כוח המקרין יוקרה וביטחון.",
    coverageM2PerLiter: 9.5,
  },
  {
    id: "tambour-1541d",
    code: "1541D",
    name: "פחם מעודן",
    brand: "טמבור",
    hex: "#52565A",
    rgb: "rgb(82, 86, 90)",
    family: "נועזים ועמוקים",
    finishRecommended: ["סופרקריל מט+", "סופרקריל משי"],
    similarCodes: ["1542D", "1543D"],
    complementaryCode: "0011P",
    description: "פחם כהה אך פחות קונטרסטי מגרפיט. מתאים לקיר עבודה או טלוויזיה.",
    coverageM2PerLiter: 10,
  },
  {
    id: "tambour-1543d",
    code: "1543D",
    name: "בזלת לילית",
    brand: "טמבור",
    hex: "#282A2C",
    rgb: "rgb(40, 42, 44)",
    family: "נועזים ועמוקים",
    finishRecommended: ["סופרקריל משי"],
    similarCodes: ["1542D", "1541D"],
    complementaryCode: "0021P",
    description: "שחור-בזלת עמוק ודרמטי ביותר, לחללים מעוצבים בסגנון מינימליסטי.",
    coverageM2PerLiter: 9,
  },
  {
    id: "nirlat-is-0233",
    code: "IS 0233",
    name: "פשתן אורגני",
    brand: "נירלט",
    hex: "#E6E1D8",
    rgb: "rgb(230, 225, 216)",
    family: "בז' ומוקה",
    finishRecommended: ["נירוקריל EXTRA"],
    similarCodes: ["IS 0234", "IS 0235"],
    complementaryCode: "IS 0500",
    description: "גוון פשתן בהיר ורך המעניק מגע טבעי וחיוני לכל קיר.",
    coverageM2PerLiter: 11,
  },
  {
    id: "nirlat-is-0235",
    code: "IS 0235",
    name: "אבן ירושלמית רכה",
    brand: "נירלט",
    hex: "#D2C9BD",
    rgb: "rgb(210, 201, 189)",
    family: "בז' ומוקה",
    finishRecommended: ["נירוקריל EXTRA", "אקוורל"],
    similarCodes: ["IS 0234", "IS 0233"],
    complementaryCode: "IS 0850",
    description: "מזכיר את חמימות האבן הטבעית, מתאים במיוחד לפרוזדורים וסלונים מוארים.",
    coverageM2PerLiter: 10.5,
  },
  {
    id: "nirlat-is-0002",
    code: "IS 0002",
    name: "לבן קרח שקוף",
    brand: "נירלט",
    hex: "#F5F4F0",
    rgb: "rgb(245, 244, 240)",
    family: "לבנים ושמנת",
    finishRecommended: ["נירוקריל EXTRA"],
    similarCodes: ["IS 0001", "IS 0003"],
    complementaryCode: "IS 0850",
    description: "לבן מודרני וקריר המשתלב מצוין עם רהיטים בסגנון סקנדינבי.",
    coverageM2PerLiter: 11.5,
  },
  {
    id: "nirlat-is-0003",
    code: "IS 0003",
    name: "לבן אבן עדין",
    brand: "נירלט",
    hex: "#EDECE8",
    rgb: "rgb(237, 236, 232)",
    family: "לבנים ושמנת",
    finishRecommended: ["נירוקריל EXTRA"],
    similarCodes: ["IS 0001", "IS 0002"],
    complementaryCode: "IS 0500",
    description: "לבן שקט ומאופק, אידיאלי למבואות כניסה ולפינות מנוחה.",
    coverageM2PerLiter: 11,
  },
  {
    id: "nirlat-is-0022",
    code: "IS 0022",
    name: "קרם פטיסייר",
    brand: "נירלט",
    hex: "#FAF6F2",
    rgb: "rgb(250, 246, 242)",
    family: "לבנים ושמנת",
    finishRecommended: ["נירוקריל EXTRA"],
    similarCodes: ["IS 0023", "IS 0024"],
    complementaryCode: "IS 0420",
    description: "שמנת בהירה מאוד עם נגיעה קלה של וניל, מחממת ללא תחושת צהבהבות.",
    coverageM2PerLiter: 11.5,
  },
  {
    id: "nirlat-is-0024",
    code: "IS 0024",
    name: "משי שמנתי",
    brand: "נירלט",
    hex: "#EFE8E1",
    rgb: "rgb(239, 232, 225)",
    family: "לבנים ושמנת",
    finishRecommended: ["נירוקריל EXTRA", "נירוקריל למטבח ולאמבט"],
    similarCodes: ["IS 0023", "IS 0022"],
    complementaryCode: "IS 0420",
    description: "גוון שמנת מלא ועמוק, משרה תחושת יוקרה נינוחה.",
    coverageM2PerLiter: 10.5,
  },
  {
    id: "nirlat-is-0420",
    code: "IS 0420",
    name: "קוקוס קלוי",
    brand: "נירלט",
    hex: "#C8B89E",
    rgb: "rgb(200, 184, 158)",
    family: "בז' ומוקה",
    finishRecommended: ["נירוקריל EXTRA"],
    similarCodes: ["IS 0234", "IS 0235"],
    complementaryCode: "IS 0023",
    description: "חום בהיר חמים ומעורר תיאבון, מושלם לפינות אוכל ומטבחים מודרניים.",
    coverageM2PerLiter: 10,
  },
  {
    id: "nirlat-is-0499",
    code: "IS 0499",
    name: "ערפל בוקר",
    brand: "נירלט",
    hex: "#BABBA5",
    rgb: "rgb(186, 187, 165)",
    family: "אפורים ובטון",
    finishRecommended: ["נירוקריל EXTRA"],
    similarCodes: ["IS 0500", "IS 0501"],
    complementaryCode: "IS 0001",
    description: "אפור עם נגיעת ירקרקות מעודנת ביותר, מחבר בין בטון לצומח.",
    coverageM2PerLiter: 10.5,
  },
  {
    id: "nirlat-is-0501",
    code: "IS 0501",
    name: "פלדה מחוסמת",
    brand: "נירלט",
    hex: "#969792",
    rgb: "rgb(150, 151, 146)",
    family: "אפורים ובטון",
    finishRecommended: ["נירוקריל EXTRA"],
    similarCodes: ["IS 0500", "IS 0499"],
    complementaryCode: "IS 0001",
    description: "אפור מודגש ואורבני, מתאים לחדרי עבודה ולבתים בעלי אופי הייטקיסטי.",
    coverageM2PerLiter: 10,
  },
  {
    id: "nirlat-is-0849",
    code: "IS 0849",
    name: "מרווה בהירה",
    brand: "נירלט",
    hex: "#B9C4B7",
    rgb: "rgb(185, 196, 183)",
    family: "ירוקים וטבע",
    finishRecommended: ["נירוקריל EXTRA", "אקוורל"],
    similarCodes: ["IS 0850", "IS 0851"],
    complementaryCode: "IS 0234",
    description: "ירוק פסטלי בהיר ומרגיע, אידיאלי לקירות חדר תינוקות או קליניקה.",
    coverageM2PerLiter: 10.5,
  },
  {
    id: "nirlat-is-0851",
    code: "IS 0851",
    name: "יער מחטני עמוק",
    brand: "נירלט",
    hex: "#94A192",
    rgb: "rgb(148, 161, 146)",
    family: "ירוקים וטבע",
    finishRecommended: ["נירוקריל EXTRA"],
    similarCodes: ["IS 0850", "IS 0849"],
    complementaryCode: "IS 0234",
    description: "ירוק טבעי עמוק ומחבק, יוצר פינה אינטימית ומעוררת השראה.",
    coverageM2PerLiter: 10,
  },
];

/**
 * מציאת גוון לפי קוד יצרן (מדויק או ללא רווחים / Case Insensitive)
 */
export function getColorByCode(code: string): ColorItem | undefined {
  if (!code) return undefined;
  const clean = code.trim().toLowerCase().replace(/\s+/g, "");
  return COLOR_DATABASE.find(
    (c) =>
      c.code.toLowerCase().replace(/\s+/g, "") === clean ||
      c.id.toLowerCase().replace(/\s+/g, "") === clean,
  );
}

/**
 * שליפת רשימת גוונים דומים
 */
export function getSimilarColors(color: ColorItem): ColorItem[] {
  const result: ColorItem[] = [];
  for (const scode of color.similarCodes) {
    const found = getColorByCode(scode);
    if (found) {
      result.push(found);
    }
  }
  // אם לא נמצאו לפי הקוד, ניקח מאותה משפחה
  if (result.length === 0) {
    return COLOR_DATABASE.filter((c) => c.family === color.family && c.id !== color.id).slice(0, 2);
  }
  return result;
}

/**
 * שליפת גוון משלים מומלץ לקיר כוח
 */
export function getComplementaryColor(color: ColorItem): ColorItem | undefined {
  if (color.complementaryCode) {
    const found = getColorByCode(color.complementaryCode);
    if (found) return found;
  }
  // ברירת מחדל: גוון נועז או פנינה מנוגדת
  return color.family === "נועזים ועמוקים"
    ? getColorByCode("0021P")
    : getColorByCode("1542D") || COLOR_DATABASE.find((c) => c.family === "נועזים ועמוקים");
}

/**
 * סינון גוונים לפי טקסט חיפוש, מותג ומשפחה
 */
export function filterColors(
  searchQuery: string,
  brandFilter: string,
  familyFilter: string,
): ColorItem[] {
  const query = searchQuery.trim().toLowerCase();
  return COLOR_DATABASE.filter((c) => {
    // Brand filter
    if (brandFilter && brandFilter !== "הכל" && c.brand !== brandFilter) {
      return false;
    }
    // Family filter
    if (familyFilter && familyFilter !== "כל המשפחות" && c.family !== familyFilter) {
      return false;
    }
    // Search query
    if (query) {
      const matchCode = c.code.toLowerCase().includes(query);
      const matchName = c.name.toLowerCase().includes(query);
      const matchDesc = c.description.toLowerCase().includes(query);
      const matchHex = c.hex.toLowerCase().includes(query);
      const matchBrand = c.brand.toLowerCase().includes(query);
      return matchCode || matchName || matchDesc || matchHex || matchBrand;
    }
    return true;
  });
}

/**
 * בדיקה האם צבע הוא בהיר או כהה לקביעת ניגודיות טקסט
 */
export function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16) || 0;
  const g = parseInt(c.substring(2, 4), 16) || 0;
  const b = parseInt(c.substring(4, 6), 16) || 0;
  // Perceived brightness formula
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 165;
}
