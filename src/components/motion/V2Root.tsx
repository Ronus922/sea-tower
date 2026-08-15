"use client";

/* מעטפת /v2 — כאן יתחברו שלושת אלמנטי התנועה (GSAP) בקומיטים הבאים.
   בשלב ה-scaffold: מעטפת סטטית בלבד, בלי JS של אנימציה — כל התוכן גלוי */
export function V2Root({ children }: { children: React.ReactNode }) {
  return (
    <div className="v2-root" dir="rtl">
      {children}
    </div>
  );
}
