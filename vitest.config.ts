import { configDefaults, defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/* בדיקות רכיבי React (‎.test.tsx בכל מקום) ובדיקות date-range-picker — ב-jsdom */
const DOM_TESTS = ["src/**/*.test.tsx", "src/components/**/*.test.ts"];

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
  /* שני פרויקטים: הבדיקות הקיימות רצות ב-node כמו קודם; בדיקות רכיבי React
     (date-range-picker, מסקיל datePicker) רצות ב-jsdom עם Testing Library */
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          exclude: [...configDefaults.exclude, ...DOM_TESTS],
        },
      },
      {
        extends: true,
        test: {
          name: "dom",
          environment: "jsdom",
          include: DOM_TESTS,
          setupFiles: ["./src/test/setup-dom.ts"],
          css: false,
        },
      },
    ],
  },
});
