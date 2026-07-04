-- ============================================================
--  001 · טבלת לידים (טופס צור קשר)
--  אבטחה: RLS פעיל בלי policies ל-anon/authenticated —
--  ה-schema מעניק ALL כברירת מחדל (000_init), לכן גם REVOKE מפורש.
--  גישה אך ורק דרך service_role בצד השרת (/api/leads).
-- ============================================================

CREATE TABLE IF NOT EXISTS sea_tower.leads (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at     timestamptz NOT NULL DEFAULT now(),
  name           text NOT NULL,
  phone          text NOT NULL,
  email          text,
  inquiry_type   text NOT NULL,
  arrival_date   date,
  departure_date date,
  guests         smallint,
  message        text,
  source         text NOT NULL DEFAULT 'contact-page',
  ip             text,
  user_agent     text
);

ALTER TABLE sea_tower.leads ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE sea_tower.leads FROM anon, authenticated;
