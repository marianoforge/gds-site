"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { partnerLinks } from "@/lib/partner-links";

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function RealtorTrackProMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 56" className={className} aria-hidden>
      <circle cx="28" cy="14" r="7" fill="currentColor" opacity="0.95" />
      <circle cx="14" cy="38" r="7" fill="currentColor" opacity="0.85" />
      <circle cx="42" cy="38" r="7" fill="currentColor" opacity="0.85" />
      <circle cx="28" cy="38" r="7" fill="currentColor" opacity="0.75" />
      <path
        d="M28 21v10M21 32l7-7 7 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.9"
      />
    </svg>
  );
}

export default function PartnerAlliancesSection() {
  const { ultra, realtorTrackPro } = partnerLinks;

  return (
    <section className="border-border/80 bg-background border-t py-20">
      <div className="container mx-auto max-w-5xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="text-accent mb-3 text-sm font-semibold tracking-[0.15em] uppercase">
            Red y alianzas
          </p>
          <h2 className="text-foreground text-3xl font-bold md:text-4xl">
            También{" "}
            <span className="font-serif font-normal italic text-primary">
              impulsamos
            </span>{" "}
            estos proyectos
          </h2>
        </motion.div>

        <div className="flex flex-col gap-8">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="shadow-card border-border/60 grid gap-10 rounded-2xl border bg-[hsl(214_32%_94%)] p-8 md:grid-cols-[minmax(0,220px)_1fr] md:items-center md:gap-12 md:p-10"
          >
            <div className="flex justify-center md:justify-start">
              <h3 className="sr-only">ULTRA Real Estate</h3>
              <div className="text-center md:text-left">
                <p className="text-[#0f3d7a] text-3xl font-black tracking-tight">
                  ULTRA
                </p>
                <p className="text-[#1e5cb3] text-lg font-semibold leading-tight">
                  Real Estate
                </p>
                <p className="text-[#64748b] mt-1 text-[10px] font-semibold tracking-[0.2em] uppercase">
                  Giralt | De Simone
                </p>
              </div>
            </div>
            <div className="min-w-0 space-y-5">
              <p className="text-foreground/90 text-sm leading-relaxed md:text-base">
                En <strong>Paraguay</strong> lideramos{" "}
                <a
                  href={ultra.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1e5cb3] font-semibold underline-offset-2 hover:underline"
                >
                  ULTRA® Real Estate
                </a>{" "}
                junto a <strong>Jorge Giralt</strong>: equipo profesional y
                asesoramiento de alto nivel en cada operación. Los CEOs de ULTRA
                Real Estate® combinan trayectoria en el mercado y foco en
                resultados.
              </p>
              <a
                href={ultra.site}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0f2f5c] text-primary-foreground hover:bg-[#0a2448] block w-full rounded-xl px-5 py-3.5 text-center text-sm font-semibold tracking-wide transition-colors sm:inline-block sm:w-auto"
              >
                Visita nuestra inmobiliaria online
              </a>
              <ul className="flex flex-col gap-2.5">
                {[
                  { href: ultra.instagramGustavo, label: "Gustavo De Simone" },
                  { href: ultra.instagramBrand, label: "ULTRA Real Estate" },
                  { href: ultra.instagramJorge, label: "Jorge Giralt" },
                ].map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1e5cb3] hover:text-[#0f3d7a] inline-flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                      <InstagramGlyph className="h-4 w-4 shrink-0" />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="shadow-card border-border/60 grid gap-10 rounded-2xl border bg-[hsl(186_40%_92%)] p-8 md:grid-cols-[minmax(0,200px)_1fr] md:items-center md:gap-12 md:p-10"
          >
            <div className="flex flex-col items-center justify-center gap-2 text-[hsl(180_50%_28%)] md:items-start">
              <h3 className="sr-only">Realtor Track Pro</h3>
              <RealtorTrackProMark className="h-14 w-14" />
              <p className="text-center text-lg font-medium tracking-tight lowercase md:text-left">
                <span className="font-semibold">realtor</span>{" "}
                <span className="opacity-90">trackpro</span>
              </p>
            </div>
            <div className="min-w-0 space-y-5">
              <p className="text-foreground/90 text-sm leading-relaxed md:text-base">
                ¿Conocés los números de tu negocio y tu rentabilidad real?{" "}
                <strong>Realtor Track Pro</strong> es la herramienta pensada
                para asesores, team leaders y brokers que quieren dejar atrás
                planillas y errores en los cálculos.
              </p>
              <a
                href={realtorTrackPro.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-xl bg-[hsl(180_55%_38%)] px-5 py-3.5 text-center text-sm font-semibold tracking-wide text-white transition-colors hover:bg-[hsl(180_55%_32%)] sm:inline-block sm:w-auto"
              >
                Agendá una demo
              </a>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Diseñada para ayudarte a maximizar ingresos y optimizar
                inversiones, con métricas claras y flujo de trabajo simple.
              </p>
              <p className="text-muted-foreground text-xs">
                © Realtor Track Pro — Avemiller LLC
              </p>
              <ul className="flex flex-col gap-2">
                {[
                  { href: realtorTrackPro.whatsapp, label: "WhatsApp" },
                  {
                    href: realtorTrackPro.email,
                    label: "info@realtortrackpro.com",
                  },
                  { href: realtorTrackPro.site, label: "realtortrackpro.com" },
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target={
                        item.href.startsWith("mailto:") ? undefined : "_blank"
                      }
                      rel={
                        item.href.startsWith("mailto:")
                          ? undefined
                          : "noopener noreferrer"
                      }
                      className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(180_50%_28%)] hover:opacity-90"
                    >
                      <ChevronRight className="h-4 w-4 shrink-0 opacity-70" />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
