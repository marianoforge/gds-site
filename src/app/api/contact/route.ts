import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { tryConsumeContactSlot } from "@/lib/contact-rate-limit";
import { appendContactRow } from "@/lib/google-sheets-contact";

const bodySchema = z.object({
  nombre: z.string().trim().min(1).max(120),
  apellido: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  whatsapp: z.string().trim().max(40).optional().default(""),
  mensaje: z.string().trim().min(1).max(5000),
});

export async function POST(request: Request) {
  const rate = await tryConsumeContactSlot(request);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Demasiados envíos. Probá más tarde." },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSec) },
      },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL_TO?.trim();
  const from = process.env.RESEND_FROM?.trim() || "Contacto web <onboarding@resend.dev>";

  if (!apiKey || !to) {
    return NextResponse.json({ error: "Contacto no configurado" }, { status: 503 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { nombre, apellido, email, whatsapp, mensaje } = parsed.data;
  const subject = `Web: ${nombre} ${apellido}`;
  const html = `
    <p><strong>Nombre:</strong> ${escapeHtml(nombre)} ${escapeHtml(apellido)}</p>
    <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
    <p><strong>WhatsApp:</strong> ${whatsapp ? escapeHtml(whatsapp) : "—"}</p>
    <p><strong>Mensaje:</strong></p>
    <p>${escapeHtml(mensaje).replace(/\n/g, "<br/>")}</p>
  `;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject,
      html,
    });
    if (error) {
      console.error("[contact]", error.message);
      return NextResponse.json({ error: "No se pudo enviar el mensaje" }, { status: 502 });
    }
    try {
      await appendContactRow({ nombre, apellido, email, whatsapp, mensaje });
    } catch (sheetErr) {
      console.error(
        "[contact] sheets",
        sheetErr instanceof Error ? sheetErr.message : sheetErr,
      );
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[contact]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "No se pudo enviar el mensaje" }, { status: 502 });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
