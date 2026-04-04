import Link from "next/link";
import { BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BOOK_LINKS, whatsappBookUrl } from "@/lib/book-links";

export const metadata = {
  title: "100% Emprendedor | Gustavo De Simone",
  description:
    "Libro de Gustavo De Simone: emprendimiento, planificación y experiencia en el rubro inmobiliario.",
};

export default function BookEmprendedorPage() {
  const title = "100% Emprendedor";
  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <main className="pb-20 pt-28">
        <div className="container mx-auto max-w-5xl px-4 lg:px-8">
          <p className="text-accent mb-2 text-sm font-semibold uppercase tracking-[0.15em]">Libros</p>

          <div className="mb-12">
            {/* Tapas y galería del libro: reactivar cuando los assets estén listos (siteImages + next/image)
            <div className="relative mx-auto aspect-3/2 w-full max-w-lg overflow-hidden rounded-2xl bg-card shadow-card lg:mx-0">
              <Image
                src={siteImages.book100EmprendedorCover}
                alt="Tapa del libro 100% Emprendedor"
                fill
                className="object-contain p-4"
                sizes="(max-width: 1024px) 100vw, 480px"
                priority
              />
            </div>
            */}
            <div>
              <h1 className="font-serif text-primary mb-6 text-4xl font-bold italic md:text-5xl">{title}</h1>
              <p className="text-foreground mb-8 text-lg leading-relaxed">
                Gustavo es un empresario, autor y conferencista que ha acumulado más de 15 años de experiencia y éxitos en el rubro
                inmobiliario. A lo largo de su trayectoria ha acumulado distintos premios y reconocimientos, incluido el galardón como
                el team leader #1 del mundo en ventas.
              </p>
              <a
                href={whatsappBookUrl(title)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-xl px-8 py-3.5 font-semibold transition-colors hover:bg-primary-dark"
              >
                <BookOpen className="h-5 w-5" />
                Conseguí tu ejemplar
              </a>
            </div>
          </div>

          {/* Galería del libro: reactivar cuando los assets estén listos
          <section className="mb-12">
            <h2 className="text-foreground mb-6 text-2xl font-bold">Galería</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {siteImages.book100EmprendedorGallery.map((src, index) => (
                <div
                  key={src}
                  className="relative aspect-4/3 overflow-hidden rounded-2xl bg-card shadow-card"
                >
                  <Image
                    src={src}
                    alt={`${title} — imagen ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </section>
          */}

          <div className="mx-auto max-w-3xl">
            <section className="bg-card mb-12 rounded-2xl p-8 shadow-card">
              <h2 className="text-foreground mb-4 text-2xl font-bold">Prólogo</h2>
              <p className="text-muted-foreground mb-3 text-sm font-semibold">Por Sofía Stamateas</p>
              <blockquote className="text-foreground/90 border-accent/40 border-l-4 pl-4 text-base leading-relaxed italic">
                Si hay algo que define a un profesional que es emprendedor, es la capacidad de ver en cada crisis una oportunidad; pero
                una verdadera oportunidad, no un simple mantra repetitivo que opere como un oasis en medio de vicisitudes del negocio.
                Porque ser <strong>100% Emprendedor</strong> es saber que no podemos esperar que las condiciones sean favorables para
                comenzar.
              </blockquote>
            </section>

            <section className="bg-card mb-12 rounded-2xl p-8 shadow-card">
              <h2 className="text-foreground mb-4 text-2xl font-bold">A quién va dirigido</h2>
              <p className="text-foreground/90 leading-relaxed">
                Me dispuse a escribir este libro para todos los emprendedores que se animan a salir de su zona de confort y deciden
                arriesgarlo todo para emprender en este mundo, donde muy pocos son capaces o tienen la valentía de hacerlo. En el
                competitivo mundo de los negocios, la planificación estratégica es fundamental para el éxito a largo plazo. Herramientas
                como el plan de negocios son esenciales para establecer una base sólida y guiar el crecimiento de una empresa. En este
                libro, exploramos la importancia y los beneficios de utilizar estas herramientas, así como orientación práctica sobre cómo
                desarrollar y aplicar un plan de negocios efectivo.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-card/50 p-8">
              <h2 className="text-foreground mb-4 text-xl font-bold">También te puede interesar</h2>
              <Link href={BOOK_LINKS[1].href} className="text-primary font-semibold hover:underline">
                {BOOK_LINKS[1].label} →
              </Link>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
