import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/* אליאס ‎@/‎ כמו ב-tsconfig, כדי שהבדיקות יוכלו לייבא עמודים ונתונים
   באותם נתיבים שהאפליקציה משתמשת בהם */
export default defineConfig({
  /* faq-data.tsx מחזיק את התשובות כ-JSX; automatic runtime חוסך ייבוא React
     בקבצי הנתונים, בדיוק כמו בבנייה של Next */
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
