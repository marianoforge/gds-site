import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { BOOK_LINKS, SITE_PHONE_DISPLAY, SITE_WHATSAPP_HREF } from "@/lib/book-links";

const DEVELOPER_EMAIL = "desimone.mariano@gmail.com";
const DEVELOPER_WHATSAPP_HREF = "https://wa.me/34637017737";
const DEVELOPER_WHATSAPP_DISPLAY = "+34 637 017 737";

function InstagramIcon({ className }: { className?: string }) {
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

const Footer = () => {
  return (
    <footer className="bg-navy py-10 text-primary-foreground/80 sm:py-12 md:py-16">
      <div className="container mx-auto max-w-full px-4 max-[399px]:px-5 lg:px-8">
        <div className="mb-12 grid grid-cols-2 gap-x-5 gap-y-10 max-[399px]:gap-x-4 md:grid-cols-2 md:gap-12 lg:grid-cols-4">
          <div className="col-span-2 text-center md:col-span-1 md:text-left">
            <div className="mx-auto mb-4 w-full max-w-69 md:mx-0">
              <h3 className="mb-0 block h-[22px] w-full overflow-hidden text-xl font-bold uppercase text-primary-foreground text-justify [text-justify:inter-character] after:inline-block after:w-full after:content-[''] max-md:mx-auto max-md:max-w-[16rem] max-md:text-left max-md:[text-justify:auto]">
                GUSTAVO DE SIMONE
              </h3>
              <p className="mt-1 block h-[13px] w-full overflow-hidden text-[10px] font-medium uppercase text-primary-foreground/50 text-justify [text-justify:inter-character] after:inline-block after:w-full after:content-[''] max-md:mx-auto max-md:max-w-[16rem] max-md:text-left max-md:[text-justify:auto]">
                SOLUCIONES INMOBILIARIAS
              </p>
            </div>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-primary-foreground/60 md:mx-0">
              Concretando metas juntos. Tu socio de confianza en bienes raíces en Buenos Aires.
            </p>
          </div>

          <div className="text-center md:text-left">
            <h4 className="mb-4 font-semibold text-primary-foreground">Navegación</h4>
            <div className="flex flex-col items-center space-y-2 md:items-start">
              {[
                ["Inicio", "/#inicio"],
                ["Nosotros", "/#nosotros"],
                ["Propiedades", "/#propiedades"],
                ["Todas las propiedades", "/propiedades"],
                ["Servicios", "/#servicios"],
                ["Testimonios", "/#testimonios"],
                ["Contacto", "/#contacto"],
              ].map(([label, href]) => (
                <a key={href} href={href} className="block text-sm text-primary-foreground/50 transition-colors hover:text-accent">
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div className="text-center md:text-left">
            <h4 className="mb-4 font-semibold text-primary-foreground">Libros</h4>
            <div className="flex flex-col items-center space-y-2 md:items-start">
              {BOOK_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-sm text-primary-foreground/50 transition-colors hover:text-accent"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="col-span-2 flex flex-col items-center text-center md:col-span-1 md:items-start md:text-left">
            <h4 className="mb-4 w-full font-semibold text-primary-foreground">Contacto</h4>
            <div className="flex w-full max-w-sm flex-col items-center space-y-3 md:max-w-none md:items-start">
              <a
                href="#"
                className="flex items-start justify-center gap-2 text-center text-sm text-primary-foreground/50 transition-colors hover:text-accent md:justify-start md:text-left"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> Av. Cabildo 3950, Piso 13, CABA
              </a>
              <a
                href={SITE_WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-primary-foreground/50 transition-colors hover:text-accent md:justify-start"
              >
                <Phone className="h-4 w-4 shrink-0" /> {SITE_PHONE_DISPLAY}
              </a>
              <a
                href="https://instagram.com/gds_soluciones_inmobiliarias"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-primary-foreground/50 transition-colors hover:text-accent md:justify-start"
              >
                <InstagramIcon className="h-4 w-4 shrink-0" /> @gds_soluciones_inmobiliarias
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col gap-6">
          <p className="text-xs text-primary-foreground/50 text-center md:text-left">
            Desarrollado por{" "}
            <span className="text-primary-foreground/70">Mariano De Simone</span>
            {" — "}
            <a
              href={`mailto:${DEVELOPER_EMAIL}`}
              className="text-accent hover:underline underline-offset-2"
            >
              {DEVELOPER_EMAIL}
            </a>
            {" · "}
            <a
              href={DEVELOPER_WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline underline-offset-2"
            >
              WhatsApp {DEVELOPER_WHATSAPP_DISPLAY}
            </a>
          </p>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-primary-foreground/40">
              © {new Date().getFullYear()} Gustavo De Simone — Soluciones Inmobiliarias. Todos los derechos reservados.
            </p>
            <p className="text-xs text-primary-foreground/40">
              CPI 8456 (CABA) · CMCPSI 7213 (PBA)
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
