import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { BOOK_LINKS } from "@/lib/book-links";

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
    <footer className="bg-navy text-primary-foreground/80 py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-primary-foreground mb-2">GUSTAVO DE SIMONE</h3>
            <p className="text-[10px] tracking-[0.35em] uppercase text-primary-foreground/50 mb-4">Soluciones Inmobiliarias</p>
            <p className="text-sm leading-relaxed text-primary-foreground/60">
              Concretando metas juntos. Tu socio de confianza en bienes raíces en Buenos Aires.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Navegación</h4>
            <div className="space-y-2">
              {[
                ["Inicio", "/#inicio"],
                ["Nosotros", "/#nosotros"],
                ["Propiedades", "/#propiedades"],
                ["Todas las propiedades", "/propiedades"],
                ["Servicios", "/#servicios"],
                ["Testimonios", "/#testimonios"],
                ["Contacto", "/#contacto"],
              ].map(([label, href]) => (
                <a key={href} href={href} className="block text-sm text-primary-foreground/50 hover:text-accent transition-colors">
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Libros</h4>
            <div className="space-y-2">
              {BOOK_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-sm text-primary-foreground/50 hover:text-accent transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Contacto</h4>
            <div className="space-y-3">
              <a href="#" className="flex items-center gap-2 text-sm text-primary-foreground/50 hover:text-accent transition-colors">
                <MapPin className="w-4 h-4 shrink-0" /> Av. Cabildo 3950, Piso 13, CABA
              </a>
              <a href="https://wa.me/5491165252190" className="flex items-center gap-2 text-sm text-primary-foreground/50 hover:text-accent transition-colors">
                <Phone className="w-4 h-4 shrink-0" /> +54 9 11 6525-2190
              </a>
              <a href="https://instagram.com/gds_soluciones_inmobiliarias" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary-foreground/50 hover:text-accent transition-colors">
                <InstagramIcon className="w-4 h-4 shrink-0" /> @gds_soluciones_inmobiliarias
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} Gustavo De Simone — Soluciones Inmobiliarias. Todos los derechos reservados.
          </p>
          <p className="text-xs text-primary-foreground/40">
            CPI 8456 (CABA) · CMCPSI 7213 (PBA)
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
