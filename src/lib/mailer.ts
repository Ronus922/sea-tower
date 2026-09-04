import nodemailer, { type Transporter } from "nodemailer";

/* התראת מייל על פנייה חדשה מטופס צור קשר.

   השרת, הפורט והאבטחה מגיעים מ-SMTP_HOST / SMTP_PORT / SMTP_SECURE. בייצור זה
   ה-SMTP Relay של Google Workspace (smtp-relay.gmail.com, 587, STARTTLS),
   שמאשר את כתובות ה-IP של השרת בלי סיסמה. כש-GMAIL_APP_PASSWORD מוגדר
   מתחברים עם אימות (למשל smtp.gmail.com, 465), אחרת בלי. GMAIL_USER הוא
   ה-from בכל מקרה.

   הרקע למעבר: Google דחה כניסה עם סיסמת אפליקציה מכתובת ה-IPv6 של השרת
   (535) וקיבל אותה מ-IPv4, ו-Node בוחר משפחת כתובות לכל חיבור — ומכאן כשלים
   לסירוגין. ה-relay מאשר את שתי הכתובות. ה-retry נשאר כרשת ביטחון.

   הקונפיגורציה יושבת בקובץ ה-env של systemd (/etc/sea-tower/sea-tower.env) —
   ה-standalone לא טוען .env.local בזמן ריצה.

   הפונקציה לעולם לא זורקת: הפנייה כבר נשמרה ב-DB והמייל הוא התראה בלבד.
   ללוג יוצא קוד השגיאה בלבד — בלי שם, טלפון, דוא״ל או תוכן ההודעה. */

export const LEAD_NOTIFY_TO = "r@bios.co.il";

const MAX_ATTEMPTS = 4;
const BACKOFF_MS = [500, 1000, 2000];

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export interface LeadNotification {
  name: string;
  phone: string;
  email: string | null;
  inquiryType: string;
  arrival: string | null;
  departure: string | null;
  guests: number | null;
  message: string | null;
  source: string;
}

export type SendResult =
  | { ok: true; messageId: string | null }
  | { ok: false; code: string };

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  /* null = בלי אימות (relay שמאשר לפי IP) */
  pass: string | null;
}

/* קונפיגורציה חסרה או לא תקינה חוזרת כקוד, לא כחריגה. SMTP_PORT ריק = 587 */
function readConfig(): SmtpConfig | { code: "ENV_MISSING" | "ENV_INVALID" } {
  const host = process.env.SMTP_HOST;
  const user = process.env.GMAIL_USER;
  if (!host || !user) return { code: "ENV_MISSING" };

  const port = Number(process.env.SMTP_PORT || "587");
  if (!Number.isInteger(port) || port < 1 || port > 65535) return { code: "ENV_INVALID" };

  return {
    host,
    port,
    secure: process.env.SMTP_SECURE === "true",
    user,
    pass: process.env.GMAIL_APP_PASSWORD || null,
  };
}

/* transport אחד לכל התהליך. נבנה בקריאה הראשונה שיש לה קונפיגורציה */
let transporter: Transporter | null = null;

function getTransporter(cfg: SmtpConfig): Transporter {
  transporter ??= nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    /* בלי TLS מלא — STARTTLS חובה. לעולם לא שליחה בטקסט פתוח */
    ...(cfg.secure ? {} : { requireTLS: true }),
    ...(cfg.pass ? { auth: { user: cfg.user, pass: cfg.pass } } : {}),
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transporter;
}

/* nodemailer מצמיד code (EAUTH, EENVELOPE, ECONNECTION, ETIMEDOUT...). ה-message
   עלול להכיל כתובות — ולכן לא יוצא ללוג */
function errorCode(e: unknown): string {
  if (e && typeof e === "object" && "code" in e && typeof e.code === "string") {
    return e.code.slice(0, 40);
  }
  return "unknown";
}

function renderText(lead: LeadNotification): string {
  const lines = [
    `שם: ${lead.name}`,
    `טלפון: ${lead.phone}`,
    `דוא״ל: ${lead.email ?? "לא צוין"}`,
    `סוג פנייה: ${lead.inquiryType}`,
  ];
  if (lead.arrival) lines.push(`תאריך הגעה: ${lead.arrival}`);
  if (lead.departure) lines.push(`תאריך עזיבה: ${lead.departure}`);
  if (lead.guests !== null) lines.push(`מספר אורחים: ${lead.guests}`);
  lines.push("", lead.message ? `הודעה:\n${lead.message}` : "הודעה: לא צוינה");
  lines.push("", `מקור: ${lead.source}`);
  return lines.join("\n");
}

export async function sendLeadNotification(lead: LeadNotification): Promise<SendResult> {
  const cfg = readConfig();
  if ("code" in cfg) {
    console.error("leads: mail skipped", { code: cfg.code });
    return { ok: false, code: cfg.code };
  }

  const transporter = getTransporter(cfg);
  const mail = {
    /* from = GMAIL_USER בדיוק — הכתובת המאושרת ב-relay */
    from: cfg.user,
    to: LEAD_NOTIFY_TO,
    replyTo: lead.email ?? undefined,
    subject: `פנייה חדשה מאתר מגדל הים: ${lead.inquiryType} · ${lead.name}`,
    text: renderText(lead),
  };

  let code = "unknown";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const info = await transporter.sendMail(mail);
      /* messageId הוא מזהה שנוצר בשליחה — לא PII. זו הראיה בלוג שמייל יצא */
      const messageId = info.messageId ?? null;
      console.info("leads: mail sent", { messageId, attempts: attempt });
      return { ok: true, messageId };
    } catch (e) {
      code = errorCode(e);
      if (attempt < MAX_ATTEMPTS) await sleep(BACKOFF_MS[attempt - 1]);
    }
  }
  console.error("leads: mail failed", { code, attempts: MAX_ATTEMPTS });
  return { ok: false, code };
}
