-- ============================================================
--  002 · סימון לידים חשודים במקום למחוק אותם
--
--  עד כה ה-honeypot ב-/api/leads החזיר {ok:true} בלי insert ובלי לוג:
--  פנייה שנחשדה נמחקה בשקט והפונה ראה "נשלח בהצלחה". אומת בפרודקשן —
--  פנייה אמיתית ב-19/08/2026 20:08 קיבלה 200 ולא הגיעה לטבלה, כי Chrome
--  מילא אוטומטית את שדה ה-honeypot ‏(name="company", label "חברה").
--
--  מכאן כל פנייה נשמרת, וה-honeypot רק מסמן. סינון הוא החלטת קריאה
--  (is_spam = false), לא החלטת כתיבה — פנייה שסומנה בטעות ניתנת לשחזור.
--
--  ברירת המחדל false, ולכן חמש השורות הקיימות נשארות כפי שהן ומסומנות
--  כלגיטימיות.
-- ============================================================

ALTER TABLE sea_tower.leads
  ADD COLUMN IF NOT EXISTS is_spam boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN sea_tower.leads.is_spam IS
  'סומן ע"י ה-honeypot בשרת. הפנייה נשמרת בכל מקרה; הסינון בקריאה בלבד.';

-- שליפת הלידים הלגיטימיים היא השאילתה החוזרת היחידה על הטבלה
CREATE INDEX IF NOT EXISTS leads_not_spam_created_at_idx
  ON sea_tower.leads (created_at DESC)
  WHERE is_spam = false;
