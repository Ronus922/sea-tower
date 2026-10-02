import type { LeadNotification } from "@/lib/mailer";

/* התראת WhatsApp על פנייה חדשה, בנוסף למייל — דרך Green API, לטלפון של רונן.

   אותם משתנים כמו שומר המייל (scripts/mail-watchdog.sh), מאותו קובץ env של
   systemd (/etc/sea-tower/sea-tower.env): GREEN_API_URL, GREEN_API_ID_INSTANCE,
   GREEN_API_TOKEN_INSTANCE, ALERT_WHATSAPP_CHAT_ID.

   הקונפיגורציה נקראת פעם אחת בטעינת המודול. חסרה או לא תקינה → console.error
   אחד, וכל שליחה מדלגת בשקט.

   הפונקציה לעולם לא זורקת: הפנייה כבר נשמרה ב-DB וההודעה היא התראה בלבד.
   PII (שם, טלפון, הודעה) יוצא רק בגוף ההודעה עצמה. ללוג יוצאים קוד שגיאה או
   idMessage בלבד — לעולם לא הכתובת, כי הטוקן הוא חלק מה-URL. */

const TIMEOUT_MS = 10_000;
const MESSAGE_MAX = 300;
const CHAT_ID_RE = /^\d{10,15}@c\.us$/;

export type WhatsAppResult =
  | { ok: true; idMessage: string | null }
  | { ok: false; code: string };

interface GreenConfig {
  url: string;
  chatId: string;
}

function readConfig(): GreenConfig | { code: "ENV_MISSING" | "ENV_INVALID" } {
  const base = process.env.GREEN_API_URL;
  const id = process.env.GREEN_API_ID_INSTANCE;
  const token = process.env.GREEN_API_TOKEN_INSTANCE;
  const chatId = process.env.ALERT_WHATSAPP_CHAT_ID;
  if (!base || !id || !token || !chatId) return { code: "ENV_MISSING" };
  if (!CHAT_ID_RE.test(chatId)) return { code: "ENV_INVALID" };
  return {
    url: `${base.replace(/\/+$/, "")}/waInstance${id}/sendMessage/${token}`,
    chatId,
  };
}

const config = readConfig();
if ("code" in config) {
  console.error("leads: whatsapp disabled", { code: config.code });
}

/* 2026-10-03 → 03.10.2026 */
function ilDate(iso: string): string {
  return iso.split("-").reverse().join(".");
}

export function renderWhatsAppMessage(lead: LeadNotification): string {
  const lines = [
    "🔔 פנייה חדשה מאתר מגדל הים",
    `סוג פנייה: ${lead.inquiryType}`,
    `שם: ${lead.name}`,
    `טלפון: ${lead.phone}`,
  ];
  if (lead.arrival && lead.departure) {
    lines.push(`תאריכים: ${ilDate(lead.arrival)} – ${ilDate(lead.departure)}`);
  } else if (lead.arrival) {
    lines.push(`תאריך הגעה: ${ilDate(lead.arrival)}`);
  }
  if (lead.guests !== null) lines.push(`אורחים: ${lead.guests}`);
  if (lead.message) {
    /* Array.from — חיתוך לפי תווים ולא לפי code units, כדי לא לשבור אימוג'י */
    const chars = Array.from(lead.message);
    const text =
      chars.length > MESSAGE_MAX ? `${chars.slice(0, MESSAGE_MAX - 1).join("")}…` : lead.message;
    lines.push("", text);
  }
  return lines.join("\n");
}

/* קוד בלבד. ה-message של fetch עלול להכיל את הכתובת — ולכן לא יוצא ללוג */
function errorCode(e: unknown): string {
  if (e instanceof Error && e.name === "TimeoutError") return "TIMEOUT";
  const cause = e instanceof Error ? (e.cause as { code?: unknown } | undefined) : undefined;
  if (typeof cause?.code === "string") return cause.code.slice(0, 40);
  return "unknown";
}

export async function sendLeadWhatsApp(lead: LeadNotification): Promise<WhatsAppResult> {
  if ("code" in config) return { ok: false, code: config.code };

  try {
    const res = await fetch(config.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: config.chatId, message: renderWhatsAppMessage(lead) }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      const code = `HTTP_${res.status}`;
      console.error("leads: whatsapp failed", { code });
      return { ok: false, code };
    }
    const data = (await res.json().catch(() => null)) as { idMessage?: unknown } | null;
    const idMessage = typeof data?.idMessage === "string" ? data.idMessage : null;
    console.info("leads: whatsapp sent", { idMessage });
    return { ok: true, idMessage };
  } catch (e) {
    const code = errorCode(e);
    console.error("leads: whatsapp failed", { code });
    return { ok: false, code };
  }
}
