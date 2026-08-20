import { beforeEach, describe, expect, it, vi } from "vitest";

/* בדיקות הראוט של הלידים.

   הרקע: עד לתיקון הזה ה-honeypot החזיר {ok:true} בלי insert ובלי לוג, ופנייה
   אמיתית נמחקה בשקט ברגע שהדפדפן מילא את השדה הנסתר אוטומטית. הבדיקות כאן
   נועלות את ההתנהגות החדשה — פנייה חשודה **נשמרת** ומסומנת — כדי שאף רפקטור
   עתידי לא יחזיר מסלול שמאבד פניות.

   ה-insert מזויף: אנחנו בודקים מה הראוט מחליט לכתוב, לא את Supabase. */

const inserts: Array<Record<string, unknown>> = [];
let insertError: { message: string } | null = null;

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({
      insert: (row: Record<string, unknown>) => {
        inserts.push(row);
        return Promise.resolve({ error: insertError });
      },
    }),
  }),
}));

const { POST } = await import("./route");

/* ה-headers היחידים שהראוט קורא הם x-forwarded-for ו-user-agent */
function request(body: Record<string, unknown>, ip = "203.0.113.9") {
  return {
    json: async () => body,
    headers: {
      get: (k: string) =>
        k.toLowerCase() === "x-forwarded-for"
          ? ip
          : k.toLowerCase() === "user-agent"
            ? "vitest"
            : null,
    },
  } as unknown as Parameters<typeof POST>[0];
}

/* פנייה תקינה. ה-IP משתנה בין הבדיקות כדי לא להיתקל ב-rate limit
   וב-dedupe, שהם in-memory ומשותפים למודול לאורך כל הקובץ */
let seq = 0;
function validBody(extra: Record<string, unknown> = {}) {
  seq += 1;
  return {
    name: "ישראל ישראלי",
    phone: "050-1234567",
    email: "lead@example.com",
    inquiryType: "שאלה כללית",
    message: `בדיקה ${seq}`,
    privacy: true,
    ...extra,
  };
}

beforeEach(() => {
  inserts.length = 0;
  insertError = null;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://db.example.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";
  vi.restoreAllMocks();
});

describe("POST /api/leads — שמירה תקינה", () => {
  it("שומרת פנייה רגילה עם is_spam=false ומחזירה ok", async () => {
    const res = await POST(request(validBody(), "203.0.113.1"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });

    expect(inserts).toHaveLength(1);
    expect(inserts[0]).toMatchObject({
      name: "ישראל ישראלי",
      phone: "050-1234567",
      email: "lead@example.com",
      inquiry_type: "שאלה כללית",
      is_spam: false,
      source: "contact-page",
    });
  });

  it("מבדילה בין הטופס המלא לכרטיס המהיר בעמוד הבית", async () => {
    await POST(request(validBody({ variant: "compact" }), "203.0.113.2"));
    expect(inserts[0].source).toBe("home-compact");

    inserts.length = 0;
    await POST(request(validBody({ variant: "full" }), "203.0.113.3"));
    expect(inserts[0].source).toBe("contact-page");

    /* ערך לא מוכר לא נכתב לטבלה כפי שהוא */
    inserts.length = 0;
    await POST(request(validBody({ variant: "../../etc" }), "203.0.113.4"));
    expect(inserts[0].source).toBe("contact-page");
  });

  it("פנייה שנכשלת ב-insert מחזירה 500 ולא מתחזה להצלחה", async () => {
    insertError = { message: "boom" };
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await POST(request(validBody(), "203.0.113.5"));
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toMatchObject({ ok: false });
  });
});

describe("POST /api/leads — honeypot", () => {
  it("שומרת את הפנייה עם is_spam=true במקום להשליך אותה", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const res = await POST(
      request(validBody({ ref_token: "Acme Ltd" }), "203.0.113.6")
    );

    /* הרגרסיה שהתיקון הזה קיים בשבילה: פעם היה כאן 0 שורות */
    expect(inserts).toHaveLength(1);
    expect(inserts[0].is_spam).toBe(true);
    /* שאר השדות נשמרים במלואם — כדי שאפשר יהיה לשחזר סימון שגוי */
    expect(inserts[0]).toMatchObject({
      name: "ישראל ישראלי",
      phone: "050-1234567",
      inquiry_type: "שאלה כללית",
    });
    expect(res.status).toBe(200);
    expect(warn).toHaveBeenCalled();
  });

  it("הלוג של ה-honeypot מכיל IP בלבד — בלי שם, טלפון או תוכן ההודעה", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const body = validBody({ ref_token: "bot", message: "סוד-שלא-נרשם" });
    await POST(request(body, "203.0.113.7"));

    const logged = JSON.stringify(warn.mock.calls);
    expect(logged).toContain("203.0.113.7");
    for (const pii of [body.name, body.phone, body.email, body.message]) {
      expect(logged).not.toContain(pii as string);
    }
  });

  it("פנייה שסומנה כספאם לא מפעילה שליחת מייל", async () => {
    /* אין עדיין mailer בפרויקט; הבדיקה נועלת את הכלל מראש, כדי שהוספת
       ההתראה בשלב הבא לא תשלח מייל על ספאם. אם ייווצר src/lib/mailer.ts
       והראוט יקרא לו — הבדיקה תיכשל אלא אם הקריאה מותנית ב-is_spam=false */
    const sent: unknown[] = [];
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.doMock("@/lib/mailer", () => ({
      sendLeadNotification: (...a: unknown[]) => {
        sent.push(a);
        return Promise.resolve();
      },
    }));

    await POST(request(validBody({ ref_token: "bot" }), "203.0.113.8"));

    expect(inserts[0].is_spam).toBe(true);
    expect(sent).toHaveLength(0);
  });
});

describe("POST /api/leads — אין מסלול שקט", () => {
  it("ענף הכפילויות מתעד את הפנייה השנייה עם IP בלבד", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const body = validBody();

    const first = await POST(request(body, "203.0.113.20"));
    await expect(first.json()).resolves.toEqual({ ok: true });
    expect(inserts).toHaveLength(1);

    const second = await POST(request(body, "203.0.113.20"));
    await expect(second.json()).resolves.toEqual({ ok: true, duplicate: true });
    /* לא נוספה שורה — אבל כן נוספה שורת לוג */
    expect(inserts).toHaveLength(1);

    const logged = JSON.stringify(info.mock.calls);
    expect(logged).toContain("203.0.113.20");
    expect(logged).not.toContain(body.name);
    expect(logged).not.toContain(body.phone);
    expect(logged).not.toContain(body.message);
  });
});
