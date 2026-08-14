import type { MetadataRoute } from "next";
import { BUSINESS } from "@/lib/business";

/* Web App Manifest — הופך את האתר לניתן-להתקנה במובייל (PWA).
   ללא service worker בכוונה: אין קאשינג של זמינות/הזמנות/תשלומים,
   וההתקנה בדפדפנים המודרניים אינה דורשת אחד. */

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: BUSINESS.name,
    short_name: BUSINESS.name,
    description:
      "מלון דירות בוטיק בבניין אלמוג על חוף הכרמל בחיפה — דירות וסוויטות מאובזרות ברמה מלונאית, 50 מטר מקו המים.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    dir: "rtl",
    lang: "he",
    background_color: "#faf8f3",
    theme_color: "#0e2540",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
