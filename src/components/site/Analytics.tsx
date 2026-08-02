import Script from "next/script";
import { GTM_ID, analyticsEnabled } from "@/lib/analytics";

/* טוען את מכל ה-GTM — ורק אותו. GA4/Ads/Meta מוגדרים בתוך המכל ולא כאן,
   כדי שלא ייטענו שני מקורות מדידה במקביל.

   בלי NEXT_PUBLIC_GTM_ID תקף הקומפוננטה מחזירה null: לא נרנדר סקריפט שבור
   ולא נוצר dataLayer. זו המצב כרגע — ראו .env.example.

   Consent Mode v2 מאותחל ל-denied לפני טעינת המכל, כך שגם ברגע שיתווסף
   מזהה לא ייורה תג פרסום/אנליטיקה לפני הסכמה. הסרת ה-denied היא תפקידו של
   מנגנון הסכמה (CMP) שעדיין לא קיים באתר. */

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
gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});`,
        }}
      />
      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
    </>
  );
}
