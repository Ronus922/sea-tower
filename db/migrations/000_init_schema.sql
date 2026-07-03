-- ============================================================
--  new-project · יצירת schema מבודד לפרויקט: sea_tower
-- ============================================================
--  מחיקת הפרויקט כולו (הרסני!):  DROP SCHEMA "sea_tower" CASCADE;
--  ⚠️ צריך גם להוסיף "sea_tower" ל-PGRST_DB_SCHEMAS (Exposed Schemas).
-- ============================================================

-- 1) יצירת ה-schema
CREATE SCHEMA IF NOT EXISTS "sea_tower";

-- 2) הרשאת שימוש ל-roles של Supabase / PostgREST
GRANT USAGE ON SCHEMA "sea_tower"
  TO anon, authenticated, service_role;

-- 3) הרשאות על אובייקטים קיימים (אם מריצים שוב)
GRANT ALL ON ALL TABLES    IN SCHEMA "sea_tower" TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA "sea_tower" TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES  IN SCHEMA "sea_tower" TO anon, authenticated, service_role;

-- 4) הרשאות אוטומטיות לכל אובייקט עתידי ב-schema
ALTER DEFAULT PRIVILEGES IN SCHEMA "sea_tower"
  GRANT ALL ON TABLES    TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA "sea_tower"
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA "sea_tower"
  GRANT ALL ON ROUTINES  TO anon, authenticated, service_role;
