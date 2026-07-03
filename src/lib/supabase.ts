import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// כל הקריאות ינותבו ל-schema הייעודי של הפרויקט: sea_tower
// supabase.from('rooms') → sea_tower.rooms (בלי prefix בקוד)
export const supabase = createClient(url, anonKey, {
  db: { schema: 'sea_tower' },
})
