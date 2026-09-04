import nodemailer, { type Transporter } from "nodemailer";

/* התראת מייל על פנייה חדשה מטופס צור קשר.

   אותה שיטה שמשמשת את pms ואת ה-fallback של guesthub על השרת: nodemailer מול
   smtp.gmail.com בפורט 465 (TLS מלא) עם App Password. ההרשאות מגיעות מ-
   GMAIL_USER / GMAIL_APP_PASSWORD בקובץ ה-env של systemd
   (/etc/sea-tower/sea-tower.env) — ה-standalone לא טוען .env.local בזמן ריצה.

   הפונקציה לעולם לא זורקת: הפנייה כבר נשמרה ב-DB והמייל הוא התראה בלבד.
   ללוג יוצא קוד השגיאה בלבד — בלי שם, טלפון, דוא״ל או תוכן ההודעה. */

export const LEAD_NOTIFY_TO = "r@bios.co.il";

const SMTP = { host: "smtp.gmail.com", port: 465, secure: true } as const;

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

/* transport אחד לכל התהליך — כמו ב-pms. נבנה בקריאה הראשונה שיש לה הרשאות */
let transporter: Transporter | null = null;

function getTransporter(user: string, pass: string): Transporter {
  transporter ??= nodemailer.createTransport({
    ...SMTP,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transporter;
}

/* nodemailer מצמיד code (EAUTH, ECONNECTION, ETIMEDOUT, EENVELOPE...). ה-message
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
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.error("leads: mail skipped", { code: "ENV_MISSING" });
    return { ok: false, code: "ENV_MISSING" };
  }

  try {
    const info = await getTransporter(user, pass).sendMail({
      /* from = GMAIL_USER בדיוק. Gmail ממילא דורס from שאינו החשבון המאומת */
      from: user,
      to: LEAD_NOTIFY_TO,
      replyTo: lead.email ?? undefined,
      subject: `פנייה חדשה מאתר מגדל הים: ${lead.inquiryType} · ${lead.name}`,
      text: renderText(lead),
    });
    /* messageId הוא מזהה שנוצר בשליחה — לא PII. זו הראיה בלוג שמייל יצא */
    const messageId = info.messageId ?? null;
    console.info("leads: mail sent", { messageId });
    return { ok: true, messageId };
  } catch (e) {
    const code = errorCode(e);
    console.error("leads: mail failed", { code });
    return { ok: false, code };
  }
}
