import { Children, isValidElement, type CSSProperties, type ReactNode } from "react";

/* פיצול כותרת למילים בצד השרת — לכותרות hero שמעל הקיפול.

   קודם לכן MotionEngine פיצל את הכותרות האלה ב-JS אחרי ה-hydration, ועד אז
   השער ‎html.stm-js [data-ws]‎ החזיק אותן שקופות: במכשירים איטיים ה-H1 של
   העמוד נשאר נעלם שנייה-שתיים ואז "קפץ" פנימה — בדיוק הקפיצה שהמשימה
   מבקשת לחסל. כאן ה-HTML מגיע מהשרת כבר מפוצל (span.stm-w לכל מילה, עם
   אינדקס ב---wi), והאנימציה — אותם keyframes ואותו קצב 68ms למילה — יוצאת
   ב-CSS טהור בזמן ה-paint הראשון (‎.stm-ws-auto‎ ב-motion.css). זה גם משחזר
   נאמנה את הרפרנס (מצב PLUS הריץ את פיצול המילים יחד עם heroIn בזמן טעינה).

   כמו במנוע: מחרוזות מפוצלות למילים; אלמנט מקונן (למשל span עם גרדיאנט
   bg-clip:text) נשאר יחידה אחת כדי לא לשבור את המילוי; <br> עובר כמו שהוא.
   כותרות מתחת לקיפול ממשיכות בזרימת data-ws הישנה (חשיפה בגלילה). */

export function SplitWords({ children }: { children: ReactNode }) {
  const out: ReactNode[] = [];
  let wi = 0;

  const word = (node: ReactNode) => {
    out.push(
      <span key={`w${wi}`} className="stm-w" style={{ "--wi": wi } as CSSProperties}>
        {node}
      </span>
    );
    wi++;
  };

  Children.forEach(children, (child, ci) => {
    if (typeof child === "string" || typeof child === "number") {
      String(child)
        .split(/(\s+)/)
        .forEach((part) => {
          if (!part) return;
          if (!part.trim()) out.push(part);
          else word(part);
        });
    } else if (isValidElement(child) && child.type === "br") {
      out.push(<br key={`b${ci}`} />);
    } else if (child != null && child !== false) {
      word(child);
    }
  });

  return <>{out}</>;
}
