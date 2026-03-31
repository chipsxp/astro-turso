import type { APIRoute } from "astro";

// --- In-memory rate limiter: 5 contact submissions per IP per 60 minutes ---
const contactAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 60 * 1000;

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = contactAttempts.get(ip);
  if (!entry || now > entry.resetAt) return false;
  return entry.count >= MAX_ATTEMPTS;
}

function recordAttempt(ip: string): void {
  const now = Date.now();
  const entry = contactAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    contactAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const POST: APIRoute = async ({ request }) => {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return json({ error: "Too many submissions. Try again in 1 hour." }, 429);
  }

  recordAttempt(ip);

  let payload: Record<string, unknown>;

  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim();
  const message = String(payload.message ?? "").trim();
  const website = String(payload.website ?? "").trim();

  if (website) {
    return json({ ok: true }, 200);
  }

  if (!name || !email || !message) {
    return json({ error: "name, email, and message are required" }, 400);
  }

  if (name.length > 100) {
    return json({ error: "Name is too long" }, 400);
  }

  if (!isValidEmail(email)) {
    return json({ error: "Please provide a valid email address" }, 400);
  }

  if (message.length < 10) {
    return json({ error: "Message must be at least 10 characters" }, 400);
  }

  if (message.length > 5000) {
    return json({ error: "Message is too long" }, 400);
  }

  const resendApiKey = import.meta.env.RESEND_API_KEY;
  const toEmail =
    import.meta.env.CONTACT_TO_EMAIL ?? "support@happyfeelingprints.com";
  const fromEmail =
    import.meta.env.CONTACT_FROM_EMAIL ?? "support@happyfeelingprints.com";

  if (!resendApiKey) {
    return json(
      {
        error:
          "Email service is not configured yet. Please contact support@happyfeelingprints.com directly.",
      },
      503,
    );
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: `New Contact Form Message from ${name}`,
        text: [
          "New message from Contact Us form",
          "",
          `Name: ${name}`,
          `Email: ${email}`,
          "",
          "Message:",
          message,
        ].join("\n"),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return json(
        { error: "Unable to send message right now", detail: errorText },
        502,
      );
    }

    return json({ ok: true }, 200);
  } catch {
    return json({ error: "Unable to send message right now" }, 502);
  }
};
