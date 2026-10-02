import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/* בדיקות התראת ה-WhatsApp. fetch מזויף — בודקים מה הפונקציה מחליטה לשלוח ואיך
   היא מתנהגת בכשל, לא את Green API. השליחה האמיתית מאומתת בליד בדיקה אחרי פריסה. */

const fetchMock = vi.fn<typeof fetch>();

const lead = {
  name: "ישראל ישראלי",
  phone: "050-1234567",
  email: "lead@example.com",
  inquiryType: "הזמנת חופשה",
  arrival: "2026-10-01",
  departure: "2026-10-03",
  guests: 2,
  message: "סוד-שלא-נרשם",
  source: "contact-page",
};

/* מינימום שדות: בלי תאריכים, אורחים, הודעה ודוא״ל */
const bareLead = {
  ...lead,
  email: null,
  arrival: null,
  departure: null,
  guests: null,
  message: null,
};

/* הקונפיגורציה נקראת בטעינת המודול, ולכן כל בדיקה טוענת מודול טרי */
async function load() {
  vi.resetModules();
  return import("./whatsapp");
}

const ok = () =>
  new Response(JSON.stringify({ idMessage: "BAE5F4886AD7B1A1" }), { status: 200 });

/* גוף הבקשה שנשלח ל-Green API */
const sentBody = () =>
  JSON.parse(String(fetchMock.mock.calls[0][1]?.body)) as { chatId: string; message: string };

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(ok());
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("GREEN_API_URL", "https://api.green.example.test/");
  vi.stubEnv("GREEN_API_ID_INSTANCE", "1101000001");
  vi.stubEnv("GREEN_API_TOKEN_INSTANCE", "secret-token");
  vi.stubEnv("ALERT_WHATSAPP_CHAT_ID", "972501234567@c.us");
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("renderWhatsAppMessage", () => {
  it("ליד מלא: סוג פנייה, שם, טלפון, טווח תאריכים, אורחים וההודעה", async () => {
    const { renderWhatsAppMessage } = await load();
    expect(renderWhatsAppMessage(lead)).toBe(
      [
        "🔔 פנייה חדשה מאתר מגדל הים",
        "סוג פנייה: הזמנת חופשה",
        "שם: ישראל ישראלי",
        "טלפון: 050-1234567",
        "תאריכים: 01.10.2026 – 03.10.2026",
        "אורחים: 2",
        "",
        "סוד-שלא-נרשם",
      ].join("\n")
    );
  });

  it("שדות חסרים לא מופיעים בכלל — בלי 'null' ובלי שורות ריקות", async () => {
    const { renderWhatsAppMessage } = await load();
    const text = renderWhatsAppMessage(bareLead);
    expect(text).toBe(
      ["🔔 פנייה חדשה מאתר מגדל הים", "סוג פנייה: הזמנת חופשה", "שם: ישראל ישראלי", "טלפון: 050-1234567"].join("\n")
    );
    expect(text).not.toContain("null");
  });

  it("תאריך הגעה בלי עזיבה מוצג לבד", async () => {
    const { renderWhatsAppMessage } = await load();
    const text = renderWhatsAppMessage({ ...bareLead, arrival: "2026-12-24" });
    expect(text).toContain("תאריך הגעה: 24.12.2026");
    expect(text).not.toContain("תאריכים:");
  });

  it("guests=0 אינו 'חסר' — רק null מושמט", async () => {
    const { renderWhatsAppMessage } = await load();
    expect(renderWhatsAppMessage({ ...bareLead, guests: 0 })).toContain("אורחים: 0");
  });

  it("הודעה ארוכה נחתכת ל-300 תווים בדיוק, כולל סימן החיתוך, בלי לשבור אימוג'י", async () => {
    const { renderWhatsAppMessage } = await load();
    const long = "😀".repeat(400);
    const body = renderWhatsAppMessage({ ...bareLead, message: long }).split("\n\n")[1];
    expect(Array.from(body)).toHaveLength(300);
    expect(body.endsWith("😀…")).toBe(true);
  });

  it("הודעה של 300 תווים בדיוק לא נחתכת", async () => {
    const { renderWhatsAppMessage } = await load();
    const exact = "א".repeat(300);
    expect(renderWhatsAppMessage({ ...bareLead, message: exact }).endsWith(exact)).toBe(true);
  });
});

describe("sendLeadWhatsApp — הבקשה", () => {
  it("POST ל-waInstance{id}/sendMessage/{token}, עם chatId בפורמט 972XXXXXXXXX@c.us ו-timeout", async () => {
    const { sendLeadWhatsApp } = await load();
    const result = await sendLeadWhatsApp(lead);

    expect(result).toEqual({ ok: true, idMessage: "BAE5F4886AD7B1A1" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    /* הלוכסן בסוף GREEN_API_URL לא מכפיל לוכסנים */
    expect(url).toBe("https://api.green.example.test/waInstance1101000001/sendMessage/secret-token");
    expect(init?.method).toBe("POST");
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    expect(sentBody().chatId).toBe("972501234567@c.us");
    expect(sentBody().chatId).toMatch(/^\d{10,15}@c\.us$/);
    expect(sentBody().message).toContain("שם: ישראל ישראלי");
  });

  it("הצלחה נרשמת כ-'leads: whatsapp sent' עם idMessage בלבד", async () => {
    const { sendLeadWhatsApp } = await load();
    await sendLeadWhatsApp(lead);
    expect(console.info).toHaveBeenCalledWith("leads: whatsapp sent", { idMessage: "BAE5F4886AD7B1A1" });
  });
});

describe("sendLeadWhatsApp — כשל לא זורק", () => {
  it("HTTP 401 → {ok:false, code:'HTTP_401'} ושורת 'leads: whatsapp failed'", async () => {
    fetchMock.mockResolvedValue(new Response("Unauthorized", { status: 401 }));
    const { sendLeadWhatsApp } = await load();

    await expect(sendLeadWhatsApp(lead)).resolves.toEqual({ ok: false, code: "HTTP_401" });
    expect(console.error).toHaveBeenCalledWith("leads: whatsapp failed", { code: "HTTP_401" });
  });

  it("שגיאת רשת → קוד ה-cause", async () => {
    fetchMock.mockRejectedValue(
      new TypeError("fetch failed", { cause: Object.assign(new Error("x"), { code: "ECONNREFUSED" }) })
    );
    const { sendLeadWhatsApp } = await load();

    await expect(sendLeadWhatsApp(lead)).resolves.toEqual({ ok: false, code: "ECONNREFUSED" });
  });

  it("timeout → TIMEOUT", async () => {
    fetchMock.mockRejectedValue(new DOMException("The operation was aborted due to timeout", "TimeoutError"));
    const { sendLeadWhatsApp } = await load();

    await expect(sendLeadWhatsApp(lead)).resolves.toEqual({ ok: false, code: "TIMEOUT" });
  });

  it("גוף תשובה שאינו JSON — עדיין הצלחה, idMessage=null", async () => {
    fetchMock.mockResolvedValue(new Response("not json", { status: 200 }));
    const { sendLeadWhatsApp } = await load();

    await expect(sendLeadWhatsApp(lead)).resolves.toEqual({ ok: true, idMessage: null });
  });

  it("שום PII, טוקן או כתובת בלוג — לא בהצלחה ולא בכשל", async () => {
    const { sendLeadWhatsApp } = await load();
    await sendLeadWhatsApp(lead);
    fetchMock.mockRejectedValue(new TypeError("fetch failed https://api.green.example.test/secret-token"));
    await sendLeadWhatsApp(lead);

    const logged = JSON.stringify([
      vi.mocked(console.info).mock.calls,
      vi.mocked(console.error).mock.calls,
    ]);
    for (const s of [lead.name, lead.phone, lead.message, "secret-token", "green.example.test", "972501234567"]) {
      expect(logged).not.toContain(s);
    }
  });
});

describe("sendLeadWhatsApp — קונפיגורציה", () => {
  it.each(["GREEN_API_URL", "GREEN_API_ID_INSTANCE", "GREEN_API_TOKEN_INSTANCE", "ALERT_WHATSAPP_CHAT_ID"])(
    "בלי %s: console.error אחד בטעינה, ודילוג שקט בכל שליחה",
    async (name) => {
      vi.stubEnv(name, "");
      const { sendLeadWhatsApp } = await load();
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith("leads: whatsapp disabled", { code: "ENV_MISSING" });

      await expect(sendLeadWhatsApp(lead)).resolves.toEqual({ ok: false, code: "ENV_MISSING" });
      await sendLeadWhatsApp(lead);
      expect(fetchMock).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledTimes(1);
    }
  );

  it.each(["0501234567", "972501234567", "972501234567@g.us", "+972501234567@c.us"])(
    "chatId לא תקין (%s) → ENV_INVALID, בלי שליחה",
    async (chatId) => {
      vi.stubEnv("ALERT_WHATSAPP_CHAT_ID", chatId);
      const { sendLeadWhatsApp } = await load();

      await expect(sendLeadWhatsApp(lead)).resolves.toEqual({ ok: false, code: "ENV_INVALID" });
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it("קונפיגורציה תקינה לא מדפיסה שגיאה בטעינה", async () => {
    await load();
    expect(console.error).not.toHaveBeenCalled();
  });
});
