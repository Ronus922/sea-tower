import Script from "next/script";
import { GTM_ID, analyticsEnabled } from "@/lib/analytics";

/* טוען את מכל ה-GTM — ורק אותו. GA4/Ads/Meta מוגדרים בתוך המכל ולא כאן,
   כדי שלא ייטענו שני מקורות מדידה במקביל.

   בלי NEXT_PUBLIC_GTM_ID תקף הקומפוננטה מחזירה null: לא נרנדר סקריפט שבור
   ולא נוצר dataLayer — ראו .env.example.

   Consent Mode v2 מאותחל ל-granted בכל ארבע הקטגוריות. זו החלטה מודעת של
   בעל העסק (19.9.2026) לאתר שקהל היעד שלו ישראלי, ולא ברירת מחדל שנפלה
   בטעות. אין באתר מנגנון הסכמה (CMP), ולכן אין גם wait_for_update: המתנה
   לעדכון הסכמה שלעולם לא יגיע רק מעכבת כל תג ב-500ms.

   אם תתווסף תנועה משמעותית מהאיחוד האירופי — נדרש CMP, וארבעת הערכים כאן
   חוזרים ל-denied. זו הנקודה היחידה בקוד שצריך לשנות בשביל זה. */

export function Analytics() {
  if (!analyticsEnabled) return null;

  return (
    <>
      {/* סקריפט inline רגיל ולא next/script: ב-App Router אין beforeInteractive
          מחוץ ל-_document, וברירות ההסכמה חייבות להיכתב ל-dataLayer לפני שה-GTM
          נטען — אחרת התגים ירוצו רגע אחד ללא מצב הסכמה */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'granted',analytics_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'});`,
        }}
      />
      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
      {/* מסלול הגיבוי של GTM לגולשים ללא JavaScript. הקומפוננטה מרונדרת
          בראש <body> ב-app/layout.tsx (אחרי מרקר ה-Suspense הפנימי של Next
          בלבד), ולכן ה-iframe יושב היכן שגוגל מבקשת.
          title — כי iframe בלי שם נכשל בבדיקת נגישות. */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}
