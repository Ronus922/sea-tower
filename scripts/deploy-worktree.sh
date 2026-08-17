#!/usr/bin/env bash
# פריסת Sea Tower מ-worktree מבודד לעץ הפרודקשן.
#
# הרצה מתוך ה-worktree שבו נבנה הקוד:
#   ./scripts/deploy-worktree.sh
#
# הסקריפט לא נוגע בשום פרויקט אחר על ה-VPS ולא מפעיל מחדש שום שירות אחר.
set -euo pipefail

PROD_DIR="${PROD_DIR:-/var/www/sea-tower}"
SERVICE="${SERVICE:-sea-tower.service}"
PORT="${PORT:-3005}"
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

say() { printf '%s\n' "$*"; }
die() { printf '✗ %s\n' "$*" >&2; exit 1; }

# ── preflight: הענף חייב להכיל את origin/main ──────────────────────────────
# בלי זה, ענף שנוצר לפני מיזוג אחרון נבנה בלי העבודה שמוזגה אחריו, והפריסה
# מחזירה אותה לאחור בשקט — הבנייה נקייה, האתר עולה, והשינוי פשוט נעלם.
say "→ preflight"
cd "$SRC_DIR"
git fetch origin main --quiet
if ! git merge-base --is-ancestor origin/main HEAD; then
  behind=$(git rev-list --count HEAD..origin/main)
  die "הענף לא מכיל את origin/main (חסרים $behind קומיטים) — הפריסה תחזיר עבודה לאחור. מזג או בנה מחדש מ-main."
fi
say "  ✓ הענף מכיל את origin/main ($(git rev-parse --short HEAD))"

[ -d "$PROD_DIR" ] || die "עץ הפרודקשן לא נמצא: $PROD_DIR"
[ -f .env.local ] || die "חסר .env.local ב-worktree — משתני NEXT_PUBLIC_* נצרבים בזמן בנייה"

# ── build ──────────────────────────────────────────────────────────────────
say "→ build"
rm -rf .next
npm run build

say "→ assembling standalone"
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

# ── assertions: מבנה standalone תקין לפני שנוגעים בפרודקשן ────────────────
say "→ assertions"
[ -f .next/standalone/server.js ]      || die "חסר .next/standalone/server.js — בדוק את outputFileTracingRoot"
[ -d .next/standalone/.next/static ]   || die "חסר .next/standalone/.next/static"
[ -d .next/standalone/public ]         || die "חסר .next/standalone/public"
say "  ✓ מבנה standalone תקין"

# ── atomic swap ────────────────────────────────────────────────────────────
say "→ swapping .next"
rm -rf "$PROD_DIR/.next.new"
cp -a .next "$PROD_DIR/.next.new"
[ -f "$PROD_DIR/.next.new/standalone/server.js" ] || die "ההעתקה לפרודקשן לא שלמה — לא הוחלף כלום"

rm -rf "$PROD_DIR/.next.rollback"
mv "$PROD_DIR/.next" "$PROD_DIR/.next.rollback"
mv "$PROD_DIR/.next.new" "$PROD_DIR/.next"

say "→ restarting $SERVICE"
sudo systemctl restart "$SERVICE"
sleep 4

systemctl is-active --quiet "$SERVICE" || die "השירות לא עלה — שחזור: mv .next.rollback .next && systemctl restart $SERVICE"
code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/")
[ "$code" = "200" ] || die "העמוד הראשי מחזיר HTTP $code — שחזור: mv .next.rollback .next && systemctl restart $SERVICE"

say "✓ נפרס. HTTP $code · rollback ב-$PROD_DIR/.next.rollback"
