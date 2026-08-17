/**
 * מפת ההפניות מהאתר הישן (וורדפרס, `www.sea-tower.co.il`) אל האתר החדש.
 *
 * מקור האמת: `docs/legacy-urls.md` — אינוונטר sitemap שנאסף 2026-08-16, 83 כתובות
 * ייחודיות. שתיים מהן (`/?jet-theme-core=`) הן query על השורש ומכוסות ממילא, ושתיים
 * (`/` ו-`/faq/`) מצביעות על עצמן באתר החדש — נותרו 79 כללים.
 *
 * `from` נשמר בצורה המפוענחת והקריאה, בלי סלאש נגרר. `next.config.ts` גוזר ממנו את
 * ארבע הצורות שגוגל והדפדפנים שולחים בפועל (מקודד/גלוי × עם/בלי סלאש נגרר).
 */
export type LegacyRedirect = {
  /** הנתיב באתר הישן — מפוענח, בלי סלאש נגרר */
  readonly from: string;
  /** היעד באתר החדש */
  readonly to: string;
};

/**
 * ממיר נתיב לצורת percent-encoding באותיות קטנות — הצורה שאליה Next מנרמל כל בקשה
 * נכנסת לפני התאמת `redirects()`. התאמה על הצורה הזו תופסת גם URL מקודד באותיות
 * גדולות (`%D7`) וגם URL שהגיע עם תווי יוניקוד גלויים.
 */
export const toLowercaseEncodedPath = (path: string): string =>
  encodeURI(path).replace(/%[0-9A-F]{2}/g, (octet) => octet.toLowerCase());

export const LEGACY_REDIRECTS: readonly LegacyRedirect[] = [
  { from: "/הצהרת-נגישות", to: "/" },
  { from: "/מדיניות-עוגיות", to: "/terms" },
  { from: "/airbnb", to: "/articles" },
  { from: "/גן-החיות-הלימודי-בחיפה", to: "/articles" },
  { from: "/פתרונות-אירוח-לעסקים", to: "/solutions" },
  { from: "/סוויטות-מול-הים", to: "/rooms" },
  { from: "/השכרת-דירה-לטווח-קצר-ארוך", to: "/solutions" },
  { from: "/חוקי-הבית", to: "/house-rules" },
  { from: "/ניהול-דירות-להשכרה", to: "/solutions" },
  { from: "/דירות-מגדל-הים", to: "/rooms" },
  { from: "/משפץ-דירה-מגורים-זמניים", to: "/articles/renovation-temporary-housing" },
  { from: "/מאמרים", to: "/articles" },
  { from: "/הזמן-עכשיו", to: "/booking" },
  { from: "/השכרת-דירה-לטווח-קצר", to: "/solutions" },
  { from: "/נופש-בחיפה-מגדל-הים", to: "/solutions" },
  { from: "/שינוי-ביטול-הזמנה", to: "/terms" },
  { from: "/תקנון", to: "/terms" },
  { from: "/מגדל-הים-דירות-נופש-וסוויטות-בחיפה", to: "/about" },
  { from: "/רילוקיישן", to: "/solutions" },
  { from: "/סאבלט-בחיפה-מגורים-זמניים", to: "/solutions" },
  { from: "/צור-קשר", to: "/contact" },
  { from: "/עיגול", to: "/" },
  { from: "/עיגול-מצטייר", to: "/" },
  { from: "/עיגול-מצטייר-2", to: "/" },
  { from: "/חיפה-כובשת-את-מפת-התיירות-הארצית", to: "/articles/haifa-tourism-record" },
  { from: "/סוויטת-משפחה-מרפסת-לים", to: "/rooms" },
  { from: "/דירות-מגדל-הים-בנין-אלמוג-חיפה", to: "/articles/almog-building-apartments" },
  { from: "/מלון-דירות-נופש-מגדל-הים-בניין-אלמוג", to: "/articles/sea-tower-aparthotel" },
  { from: "/חניה-בבניין-אלמוג", to: "/faq" },
  { from: "/חדרים-רומנטיים-לשעות", to: "/rooms" },
  { from: "/דירות-נופש", to: "/articles/perfect-seaside-vacation" },
  { from: "/השכרת-דירות-לטווח-קצר", to: "/articles/your-home-in-haifa" },
  { from: "/תכנון-חופשה-עם-דירות-נופש-בצפון", to: "/articles/vacation-planning-north" },
  { from: "/חופשה-מושלמת-בדירות-נופש-על-הים", to: "/articles/perfect-seaside-vacation" },
  { from: "/חופשה-מושלמת-בדירות-נופש-על-הים-2", to: "/articles/perfect-seaside-vacation" },
  { from: "/מלון-דירות-לתקופות-קצרות", to: "/articles/aparthotel-short-periods" },
  { from: "/חדרים-להשכרה-טווח-קצר", to: "/articles/short-term-holiday-rentals" },
  { from: "/השכרת-דירה-לטווח-קצר-לעסקים", to: "/articles/business-short-term-apartment" },
  { from: "/דן-קרטינג-בקניון-חיפה", to: "/articles/dan-karting-haifa" },
  { from: "/מנזר-סטלה-מאריס", to: "/articles/stella-maris-monastery" },
  { from: "/רכבל-חיפה-העלייה-השניה", to: "/articles/haifa-cable-car" },
  { from: "/לאכול-מול-הגלים", to: "/articles/dining-carmel-beach" },
  { from: "/דירות-airbnb-לעבודה", to: "/articles/airbnb-apartments-for-work" },
  { from: "/מרכז-קונגרסים-בינלאומי-חיפה", to: "/articles/haifa-congress-center" },
  { from: "/השכרת-דירות-לטווח-ארוך", to: "/articles/long-term-rental" },
  { from: "/השכרת-דירות-מרוהטות-לטווח-קצר", to: "/articles/short-term-furnished-rental" },
  { from: "/התארגנות-כלה", to: "/articles/bridal-suite" },
  { from: "/איזור-מגדל-הים-הגנים-הבהאים", to: "/articles/bahai-gardens-haifa" },
  { from: "/השכרת-דירות-מרוהטות-בחיפה", to: "/articles/furnished-apartments-haifa" },
  { from: "/property", to: "/rooms" },
  { from: "/property/סוויטה-מרוהטת-עם-מרפסת-פנורמית", to: "/rooms" },
  { from: "/property/קורנר-פמילי-עם-חלון-לים", to: "/rooms" },
  { from: "/property/פורסט-בלו-ל-4-אנשים-עם-נוף-לים", to: "/rooms" },
  { from: "/property/פרימיום-דלוקס-ל-4-אנשים-עם-חלון-לים", to: "/rooms" },
  { from: "/property/פרמיום-קוואדרופל-עם-נוף-לים", to: "/rooms" },
  { from: "/property/קלאסיק-קוואדרופל-עם-נוף-לים", to: "/rooms" },
  { from: "/property/סוויטת-משפחה-מרפסת-לים", to: "/rooms" },
  { from: "/property/סטודיו-דלוקס-עם-נוף-צדדי-לים", to: "/rooms" },
  { from: "/property/דירת-פרימיום-מפוארת-מגדל-הים", to: "/rooms" },
  { from: "/property/לאקצרי-סוויט-קווין-עם-גקוזי", to: "/rooms" },
  { from: "/property/דלוקס-קינג-עם-נוף-לים", to: "/rooms" },
  { from: "/property/דירת-סטודיו-וחצי-עם-חלון-לים", to: "/rooms" },
  { from: "/property/קורנר-פמילי-ל-6-אנשים-עם-חלון-לים", to: "/rooms" },
  { from: "/property/סוויטת-רויאל-קינג-משפחתית-עם-נוף-לים", to: "/rooms" },
  { from: "/roomsnumber/דירות-עם-מרפסת", to: "/rooms" },
  { from: "/roomsnumber/סוויטה", to: "/rooms" },
  { from: "/roomsnumber/סטודיו", to: "/rooms" },
  { from: "/roomsnumber/שלושה-חדשים", to: "/rooms" },
  { from: "/roomsnumber/שני-חדרים", to: "/rooms" },
  { from: "/service/מיני-בר", to: "/rooms" },
  { from: "/service/מכונת-כביסה", to: "/rooms" },
  { from: "/service/מקלחון", to: "/rooms" },
  { from: "/service/מקרר-גדול", to: "/rooms" },
  { from: "/category/בסביבה", to: "/articles" },
  { from: "/category/מגדל-הים-בניין-אלמוג-דירות-להשכרה-לטוו", to: "/articles" },
  { from: "/category/שני-חדרי-שינה-וסלון", to: "/rooms" },
  { from: "/author/de646f9bb8cf4378", to: "/articles" },
  { from: "/e-floating-buttons/אלמנטור-floating-button-3725", to: "/" },
  { from: "/elementskit-content/dynamic-content-widget-6848123-8edac14", to: "/" },
];
