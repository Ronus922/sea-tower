import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/* בדיקות ה-mailer. nodemailer מזויף — בודקים מה הפונקציה מחליטה לשלוח ואיך היא
   מתנהגת בכשל, לא את Gmail. השליחה האמיתית מאומתת ידנית מהשרת לפני פריסה. */

const { sendMail, createTransport } = vi.hoisted(() => {
  const sendMail = vi.fn();
  return { sendMail, createTransport: vi.fn(() => ({ sendMail })) };
});

vi.mock("nodemailer", () => ({ default: { createTransport } }));

const lead = {
  name: "ישראל ישראלי",
  phone: "050-1234567",
  email: "lead@example.com",
  inquiryType: "שאלה כללית",
  arrival: "2026-10-01",
  departure: "2026-10-03",
  guests: 2,
  message: "סוד-שלא-נרשם",
  source: "contact-page",
};

/* ה-transport נשמר ברמת המודול, ולכן כל בדיקה טוענת מודול טרי */
async function load() {
  vi.resetModules();
  return import("./mailer");
}

beforeEach(() => {
  createTransport.mockClear();
  sendMail.mockReset();
  sendMail.mockResolvedValue({ messageId: "<abc@test>" });
  vi.stubEnv("GMAIL_USER", "sender@example.com");
  vi.stubEnv("GMAIL_APP_PASSWORD", "app-password");
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("sendLeadNotification — חיבור", () => {
  it("מתחברת ל-smtp.gmail.com:465 עם TLS ועם GMAIL_USER / GMAIL_APP_PASSWORD", async () => {
    const { sendLeadNotification } = await load();
    await sendLeadNotification(lead);

    expect(createTransport).toHaveBeenCalledTimes(1);
    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: "sender@example.com", pass: "app-password" },
      })
    );
  });

  it("transport אחד לכל התהליך — שתי שליחות, בנייה אחת", async () => {
    const { sendLeadNotification } = await load();
    await sendLeadNotification(lead);
    await sendLeadNotification({ ...lead, name: "שנייה" });

    expect(createTransport).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledTimes(2);
  });
});

describe("sendLeadNotification — המעטפה", () => {
  it("from הוא GMAIL_USER בדיוק, היעד קבוע, ו-replyTo הוא דוא״ל הפונה", async () => {
    const { sendLeadNotification, LEAD_NOTIFY_TO } = await load();
    const result = await sendLeadNotification(lead);

    expect(result).toEqual({ ok: true, messageId: "<abc@test>" });
    expect(LEAD_NOTIFY_TO).toBe("r@bios.co.il");
    /* ההצלחה מתועדת עם messageId בלבד — בלי פרטי הפונה */
    const logged = JSON.stringify(vi.mocked(console.info).mock.calls);
    expect(logged).toContain("<abc@test>");
    for (const pii of [lead.name, lead.phone, lead.email, lead.message]) {
      expect(logged).not.toContain(pii);
    }
    const mail = sendMail.mock.calls[0][0];
    expect(mail.from).toBe("sender@example.com");
    expect(mail.to).toBe("r@bios.co.il");
    expect(mail.replyTo).toBe("lead@example.com");
    expect(mail.subject).toContain("שאלה כללית");
    for (const field of [lead.name, lead.phone, lead.email, lead.message, "2026-10-01", "2026-10-03"]) {
      expect(mail.text).toContain(field);
    }
  });

  it("בלי דוא״ל של הפונה — אין replyTo", async () => {
    const { sendLeadNotification } = await load();
    await sendLeadNotification({ ...lead, email: null });

    expect(sendMail.mock.calls[0][0].replyTo).toBeUndefined();
  });
});

describe("sendLeadNotification — כשלים", () => {
  it("בלי GMAIL_USER / GMAIL_APP_PASSWORD: לא נוצר transport, הלוג מכיל קוד בלבד", async () => {
    vi.stubEnv("GMAIL_APP_PASSWORD", "");
    const { sendLeadNotification } = await load();
    const result = await sendLeadNotification(lead);

    expect(result).toEqual({ ok: false, code: "ENV_MISSING" });
    expect(createTransport).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledTimes(1);
    const logged = JSON.stringify(vi.mocked(console.error).mock.calls);
    expect(logged).toContain("ENV_MISSING");
    for (const pii of [lead.name, lead.phone, lead.email, lead.message]) {
      expect(logged).not.toContain(pii);
    }
  });

  const eauth = () =>
    Object.assign(new Error("Invalid login: lead@example.com 535 BadCredentials"), {
      code: "EAUTH",
      responseCode: 535,
    });

  /* ה-backoff האמיתי הוא שניות — מריצים אותו על טיימרים מזויפים */
  async function sendWithFakeTimers(fn: () => Promise<unknown>) {
    vi.useFakeTimers();
    try {
      const pending = fn();
      await vi.runAllTimersAsync();
      return await pending;
    } finally {
      vi.useRealTimers();
    }
  }

  it("דחייה חולפת של Gmail: הניסיון השני מצליח, בלי שורת שגיאה בלוג", async () => {
    sendMail.mockRejectedValueOnce(eauth()).mockResolvedValueOnce({ messageId: "<retry@test>" });
    const { sendLeadNotification } = await load();
    const result = await sendWithFakeTimers(() => sendLeadNotification(lead));

    expect(result).toEqual({ ok: true, messageId: "<retry@test>" });
    expect(sendMail).toHaveBeenCalledTimes(2);
    expect(console.error).not.toHaveBeenCalled();
    expect(JSON.stringify(vi.mocked(console.info).mock.calls)).toContain('"attempts":2');
  });

  it("כשל SMTP עקבי: 4 ניסיונות, לא זורקת, קוד השגיאה בלבד בלוג — בלי PII ובלי הודעת השרת", async () => {
    sendMail.mockRejectedValue(eauth());
    const { sendLeadNotification } = await load();
    const result = await sendWithFakeTimers(() => sendLeadNotification(lead));

    expect(result).toEqual({ ok: false, code: "EAUTH" });
    expect(sendMail).toHaveBeenCalledTimes(4);
    expect(console.error).toHaveBeenCalledTimes(1);
    const logged = JSON.stringify(vi.mocked(console.error).mock.calls);
    expect(logged).toContain("EAUTH");
    expect(logged).toContain('"attempts":4');
    expect(logged).not.toContain("Invalid login");
    for (const pii of [lead.name, lead.phone, lead.email, lead.message]) {
      expect(logged).not.toContain(pii);
    }
  });

  it("שגיאה בלי code מדווחת כ-unknown", async () => {
    sendMail.mockRejectedValue(new Error("socket hang up"));
    const { sendLeadNotification } = await load();
    const result = await sendWithFakeTimers(() => sendLeadNotification(lead));

    expect(result).toEqual({ ok: false, code: "unknown" });
  });
});
