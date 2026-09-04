import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/* בדיקות ה-mailer. nodemailer מזויף — בודקים מה הפונקציה מחליטה לשלוח ואיך היא
   מתנהגת בכשל, לא את Google. השליחה האמיתית מאומתת ידנית מהשרת לפני פריסה. */

const { sendMail, createTransport } = vi.hoisted(() => {
  const sendMail = vi.fn();
  const createTransport = vi.fn<(opts: Record<string, unknown>) => { sendMail: typeof sendMail }>(
    () => ({ sendMail })
  );
  return { sendMail, createTransport };
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

const transportOptions = () => createTransport.mock.calls[0][0];

beforeEach(() => {
  createTransport.mockClear();
  sendMail.mockReset();
  sendMail.mockResolvedValue({ messageId: "<abc@test>" });
  /* ברירת המחדל בבדיקות = הקונפיגורציה של הייצור: relay בלי סיסמה */
  vi.stubEnv("SMTP_HOST", "smtp-relay.example.test");
  vi.stubEnv("SMTP_PORT", "587");
  vi.stubEnv("SMTP_SECURE", "false");
  vi.stubEnv("GMAIL_USER", "sender@example.com");
  vi.stubEnv("GMAIL_APP_PASSWORD", "");
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("sendLeadNotification — קונפיגורציית החיבור", () => {
  it("relay: SMTP_HOST/PORT/SECURE מה-env, STARTTLS חובה, ובלי auth כשאין GMAIL_APP_PASSWORD", async () => {
    const { sendLeadNotification } = await load();
    await sendLeadNotification(lead);

    expect(createTransport).toHaveBeenCalledTimes(1);
    expect(transportOptions()).toMatchObject({
      host: "smtp-relay.example.test",
      port: 587,
      secure: false,
      requireTLS: true,
    });
    expect(transportOptions()).not.toHaveProperty("auth");
  });

  it("עם GMAIL_APP_PASSWORD — מתחברים עם אימות של GMAIL_USER", async () => {
    vi.stubEnv("GMAIL_APP_PASSWORD", "app-password");
    const { sendLeadNotification } = await load();
    await sendLeadNotification(lead);

    expect(transportOptions()).toMatchObject({
      auth: { user: "sender@example.com", pass: "app-password" },
    });
  });

  it("SMTP_SECURE=true — TLS מלא, בלי requireTLS", async () => {
    vi.stubEnv("SMTP_PORT", "465");
    vi.stubEnv("SMTP_SECURE", "true");
    const { sendLeadNotification } = await load();
    await sendLeadNotification(lead);

    expect(transportOptions()).toMatchObject({ port: 465, secure: true });
    expect(transportOptions()).not.toHaveProperty("requireTLS");
  });

  it("SMTP_PORT ריק — ברירת מחדל 587", async () => {
    vi.stubEnv("SMTP_PORT", "");
    const { sendLeadNotification } = await load();
    await sendLeadNotification(lead);

    expect(transportOptions()).toMatchObject({ port: 587 });
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
  it("from הוא GMAIL_USER בדיוק, היעד קבוע, replyTo הוא דוא״ל הפונה, והלוג עם messageId בלבד", async () => {
    const { sendLeadNotification, LEAD_NOTIFY_TO } = await load();
    const result = await sendLeadNotification(lead);

    expect(result).toEqual({ ok: true, messageId: "<abc@test>" });
    expect(LEAD_NOTIFY_TO).toBe("r@bios.co.il");
    const mail = sendMail.mock.calls[0][0];
    expect(mail.from).toBe("sender@example.com");
    expect(mail.to).toBe("r@bios.co.il");
    expect(mail.replyTo).toBe("lead@example.com");
    expect(mail.subject).toContain("שאלה כללית");
    for (const field of [lead.name, lead.phone, lead.email, lead.message, "2026-10-01", "2026-10-03"]) {
      expect(mail.text).toContain(field);
    }
    /* ההצלחה מתועדת עם messageId בלבד — בלי פרטי הפונה */
    const logged = JSON.stringify(vi.mocked(console.info).mock.calls);
    expect(logged).toContain("<abc@test>");
    for (const pii of [lead.name, lead.phone, lead.email, lead.message]) {
      expect(logged).not.toContain(pii);
    }
  });

  it("בלי דוא״ל של הפונה — אין replyTo", async () => {
    const { sendLeadNotification } = await load();
    await sendLeadNotification({ ...lead, email: null });

    expect(sendMail.mock.calls[0][0].replyTo).toBeUndefined();
  });
});

describe("sendLeadNotification — קונפיגורציה חסרה או שגויה", () => {
  it.each([
    ["SMTP_HOST", "ENV_MISSING"],
    ["GMAIL_USER", "ENV_MISSING"],
  ])("בלי %s: לא נוצר transport, הלוג מכיל את הקוד %s בלבד", async (key, code) => {
    vi.stubEnv(key, "");
    const { sendLeadNotification } = await load();
    const result = await sendLeadNotification(lead);

    expect(result).toEqual({ ok: false, code });
    expect(createTransport).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledTimes(1);
    const logged = JSON.stringify(vi.mocked(console.error).mock.calls);
    expect(logged).toContain(code);
    for (const pii of [lead.name, lead.phone, lead.email, lead.message]) {
      expect(logged).not.toContain(pii);
    }
  });

  it("SMTP_PORT לא מספרי — ENV_INVALID, בלי transport", async () => {
    vi.stubEnv("SMTP_PORT", "five-eight-seven");
    const { sendLeadNotification } = await load();

    await expect(sendLeadNotification(lead)).resolves.toEqual({ ok: false, code: "ENV_INVALID" });
    expect(createTransport).not.toHaveBeenCalled();
  });
});

describe("sendLeadNotification — כשלים בשליחה", () => {
  const relayReject = () =>
    Object.assign(new Error("550-5.7.1 Invalid credentials for relay [2001:db8::1] lead@example.com"), {
      code: "EENVELOPE",
      responseCode: 550,
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

  it("דחייה חולפת: הניסיון השני מצליח, בלי שורת שגיאה בלוג", async () => {
    sendMail.mockRejectedValueOnce(relayReject()).mockResolvedValueOnce({ messageId: "<retry@test>" });
    const { sendLeadNotification } = await load();
    const result = await sendWithFakeTimers(() => sendLeadNotification(lead));

    expect(result).toEqual({ ok: true, messageId: "<retry@test>" });
    expect(sendMail).toHaveBeenCalledTimes(2);
    expect(console.error).not.toHaveBeenCalled();
    expect(JSON.stringify(vi.mocked(console.info).mock.calls)).toContain('"attempts":2');
  });

  it("כשל עקבי: 4 ניסיונות, לא זורקת, קוד השגיאה בלבד בלוג — בלי PII ובלי הודעת השרת", async () => {
    sendMail.mockRejectedValue(relayReject());
    const { sendLeadNotification } = await load();
    const result = await sendWithFakeTimers(() => sendLeadNotification(lead));

    expect(result).toEqual({ ok: false, code: "EENVELOPE" });
    expect(sendMail).toHaveBeenCalledTimes(4);
    expect(console.error).toHaveBeenCalledTimes(1);
    const logged = JSON.stringify(vi.mocked(console.error).mock.calls);
    expect(logged).toContain("EENVELOPE");
    expect(logged).toContain('"attempts":4');
    expect(logged).not.toContain("Invalid credentials");
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
