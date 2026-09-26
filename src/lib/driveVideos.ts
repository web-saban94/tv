export const GOOGLE_DRIVE_VIDEOS_FOLDER_ID = "1wU24Ewz03bzCDga2UpYCo0EJqePbdDVf";
export const GOOGLE_DRIVE_FOLDER_NAME = "סרטונים";

export interface DriveCommercialVideo {
  id: string;
  driveFileId?: string;
  title: string;
  headline: string;
  badge: string;
  durationSec: number; // 10 to 15 seconds
  posterUrl: string;
  streamUrl: string;
  embedUrl: string;
  category: "תדמית" | "לוגיסטיקה" | "אולם צבע וגבס" | "חומרים כבדים" | "שירות דיגיטלי";
  callToAction: string;
}

export function getDriveStreamUrl(fileId: string): string {
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

export function getDriveDirectDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

export function getDriveEmbedUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export const CURATED_COMMERCIAL_VIDEOS: DriveCommercialVideo[] = [
  {
    id: "saban-flagship-commercial",
    driveFileId: "1wU24Ewz03bzCDga2UpYCo0EJqePbdDVf_clip1",
    title: "ח. סבן חומרי בניין (1994) בע״מ",
    headline: "העוצמה שמאחורי אתרי הבנייה המובילים בשרון ובמרכז",
    badge: "סרטון תדמית רשמי • 30 שנות מצוינות",
    durationSec: 12,
    posterUrl: "https://saban-smart-signage.vercel.app/assets/product-adhesive-bag.jpg",
    streamUrl: "/videos/saban-builders.mp4",
    embedUrl: getDriveEmbedUrl("1wU24Ewz03bzCDga2UpYCo0EJqePbdDVf"),
    category: "תדמית",
    callToAction: "פנו לדלפק הראשי לקבלת הצעת מחיר קבלנית",
  },
  {
    id: "saban-crane-fleet",
    driveFileId: "1wU24Ewz03bzCDga2UpYCo0EJqePbdDVf_clip2",
    title: "צי מנופי סבן • פריקה בגובה ובדיוק",
    headline: "אספקת משטחים, בלוקים וברזל ישירות לקומות הפנטהאוז והשלד",
    badge: "צי רכב מתקדם • מרצדס מנוף 615-41-002",
    durationSec: 14,
    posterUrl: "https://saban-smart-signage.vercel.app/assets/product-waterproof-pail.jpg",
    streamUrl: "/videos/saban-app-splash.mp4",
    embedUrl: getDriveEmbedUrl("1wU24Ewz03bzCDga2UpYCo0EJqePbdDVf"),
    category: "לוגיסטיקה",
    callToAction: "סדרה 18000: תיאום הובלה מרחוב החרש 10",
  },
  {
    id: "saban-paint-drywall-hall",
    driveFileId: "1wU24Ewz03bzCDga2UpYCo0EJqePbdDVf_clip3",
    title: "אולם גבס, צבע ופרזול • סניף התלמיד 6",
    headline: "מכונות גיוון צבע ממוחשבות טמבור ונירלט • אספקה מיידית בדלפק",
    badge: "מחסן 1 • רחוב התלמיד 6 הוד השרון",
    durationSec: 11,
    posterUrl: "https://saban-smart-signage.vercel.app/assets/product-adhesive-bag.jpg",
    streamUrl: "/videos/saban-drywall.mp4",
    embedUrl: getDriveEmbedUrl("1wU24Ewz03bzCDga2UpYCo0EJqePbdDVf"),
    category: "אולם צבע וגבס",
    callToAction: "יואב וצוות הצבע ממתינים לכם באולם התצוגה",
  },
  {
    id: "saban-noa-kiosk-click-collect",
    driveFileId: "1wU24Ewz03bzCDga2UpYCo0EJqePbdDVf_clip4",
    title: "נועה • מערכת Click & Collect סבן",
    headline: "סרקו את ה-QR עכשיו מהנייד וסגרו עגלה לליקוט מהיר לפני הגעתכם",
    badge: "עמדת שילוט וקיוסק אינטראקטיבי",
    durationSec: 13,
    posterUrl: "https://saban-smart-signage.vercel.app/assets/noa-avatar.png",
    streamUrl: "/videos/saban-noa-ai.mp4",
    embedUrl: getDriveEmbedUrl("1wU24Ewz03bzCDga2UpYCo0EJqePbdDVf"),
    category: "שירות דיגיטלי",
    callToAction: "סרקו את קוד ה-QR בעמדה או לחצו על נועה",
  },
];

const preloadedUrls = new Set<string>();

export function preloadCommercialVideo(url: string) {
  if (typeof window === "undefined" || !url || preloadedUrls.has(url)) return;
  try {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "video";
    link.href = url;
    document.head.appendChild(link);
    preloadedUrls.add(url);
  } catch {
    //
  }
}
