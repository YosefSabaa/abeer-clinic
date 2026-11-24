import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

// مقارنة آمنة بين قيمتين
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }

  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return timingSafeEqual(bufferA, bufferB);
}

// 1) Meta تستخدم GET للتحقق من الـ Webhook
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (
    mode === "subscribe" &&
    verifyToken &&
    token &&
    challenge !== null &&
    safeEqual(token, verifyToken)
  ) {
    return new Response(challenge, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  return new Response("Webhook verification failed", {
    status: 403,
  });
}

// 2) Meta تستخدم POST لإرسال أحداث واتساب
export async function POST(request) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;

  if (!appSecret) {
    console.error("Missing WHATSAPP_APP_SECRET");

    return Response.json(
      { error: "Webhook is not configured" },
      { status: 500 }
    );
  }

  // يجب قراءة النص الخام قبل تحويله إلى JSON
  const rawBody = await request.text();

  const signature = request.headers.get("x-hub-signature-256");

  if (!signature || !signature.startsWith("sha256=")) {
    return Response.json(
      { error: "Missing or invalid signature" },
      { status: 401 }
    );
  }

  // التحقق من توقيع Meta
  const expectedSignature =
    "sha256=" +
    createHmac("sha256", appSecret)
      .update(rawBody, "utf8")
      .digest("hex");

  if (!safeEqual(signature, expectedSignature)) {
    console.warn("WhatsApp webhook: signature verification failed");

    return Response.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  // تحويل البيانات إلى JSON بعد التحقق من التوقيع
  let payload;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  // تسجيل معلومات عامة فقط، دون تسجيل محتوى رسائل المرضى
  console.info("WhatsApp webhook received:", {
    object: payload.object,
    entries: Array.isArray(payload.entry) ? payload.entry.length : 0,
  });

  return Response.json({ received: true }, { status: 200 });
}