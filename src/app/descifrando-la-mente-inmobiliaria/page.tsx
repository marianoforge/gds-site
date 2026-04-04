import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BOOK_LINKS, whatsappBookUrl } from "@/lib/book-links";
import { siteImages } from "@/lib/site-media";

export const metadata = {
  title: "Descifrando la Mente Inmobiliaria | Gustavo De Simone",
  description:
    "Libro sobre mentalidad, competencias y la tríada del psicoemprendimiento aplicada al negocio inmobiliario.",
};

const reviews: {
  name: string;
  role: string;
  quote: string;
  photo?: string;
}[] = [
  {
    name: "Jürguen Klaric",
    role: "Conferencista de ventas. Divulgador de neurociencias.",
    quote:
      "Con más de 7 años trabajando juntos, siempre confié en la capacidad de Jesica. Una de las líderes más fuertes de Argentina, no sólo por su fuerza y determinación, sino por esa capacidad de análisis que usa como herramienta de transformación.",
    photo: siteImages.bookMenteResenas[0],
  },
  {
    name: "Mauricio Benoist",
    role: "Formador de líderes y emprendedores. Empresario.",
    quote:
      "Jesica te admiro por todos los años que has logrado condensar en esta obra. Tu lenguaje resulta sencillo, práctico de llevar y con un profundo conocimiento del tema.",
    photo: siteImages.bookMenteResenas[1],
  },
  {
    name: "Dotti Peñate Sosa",
    role: "Chief Operating & Marketing Officer — RE/MAX Argentina & Uruguay",
    quote:
      "Toda persona empezando su carrera como Asesor Inmobiliario debería leer este libro porque además de su amplia formación, Gustavo tiene más de 10 años de experiencia haciendo y logrando con éxito sostenido lo que comparte.",
  },
  {
    name: "Gustavo E. Caricote",
    role: "Director Ejecutivo de Desarrollo Global RE/MAX LLC",
    quote:
      "Como líder de uno de los Top Teams Inmobiliarios de RE/MAX a nivel internacional, Gustavo De Simone tiene mucho que aportar a quienes se están iniciando en este fascinante negocio.",
  },
  {
    name: "Lucas Delgado",
    role: "Team Leader RE/MAX",
    quote:
      "Este libro es para leerlo más de una vez; no tengo dudas que en cada lectura surgirá un nuevo disparador. La redacción es simple, clara y muy consistente.",
  },
];

export default function BookMentePage() {
  const title = "Descifrando la Mente Inmobiliaria";
  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <main className="pb-20 pt-28">
        <div className="container mx-auto max-w-5xl px-4 lg:px-8">
          <p className="text-accent mb-2 text-sm font-semibold uppercase tracking-[0.15em]">Libros</p>

          <div className="mb-12">
            {/* Tapa del libro: reactivar cuando el asset esté listo (siteImages.bookMenteCover + next/image)
            <div className="relative mx-auto aspect-5/3 w-full max-w-lg overflow-hidden rounded-2xl bg-card shadow-card lg:mx-0">
              <Image
                src={siteImages.bookMenteCover}
                alt="Tapa del libro Descifrando la Mente Inmobiliaria"
                fill
                className="object-contain p-4"
                sizes="(max-width: 1024px) 100vw, 480px"
                priority
              />
            </div>
            */}
            <div>
              <h1 className="font-serif text-primary mb-6 text-3xl font-bold italic md:text-5xl">{title}</h1>
              <p className="text-foreground mb-8 text-lg leading-relaxed">
                ¿Sabías que el 85% de los asesores inmobiliarios no genera un negocio sólido, e incluso no alcanza el equivalente a un
                sueldo básico? En el libro <em>{title}</em> te contaremos los lineamientos básicos para sacar provecho de una de las
                profesiones más rentables que existen.
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

          {/* Interior del libro: reactivar cuando los assets estén listos (siteImages.bookMenteInterior)
          <section className="mb-12">
            <h2 className="text-foreground mb-6 text-2xl font-bold">Dentro del libro</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {siteImages.bookMenteInterior.map((src, index) => (
                <div
                  key={src}
                  className="relative aspect-3/5 overflow-hidden rounded-2xl bg-card shadow-card"
                >
                  <Image
                    src={src}
                    alt={`${title} — interior ${index + 1}`}
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
              <h2 className="text-foreground mb-4 text-2xl font-bold">¿Qué vas a lograr?</h2>
              <p className="text-foreground/90 mb-4 leading-relaxed">
                Te adentrarás en la interpretación y enfoque correcto de negocio. Aprenderás a reconocer las bondades que te ofrece,
                pero también los obstáculos y las habilidades que debés entrenar.
              </p>
              <p className="text-foreground/90 leading-relaxed">
                Desarrollarás tu mentalidad, incorporarás conocimientos técnicos y te impulsará a generar acciones. Conocerás el lado
                oculto de tu propia mente y de la actitud inconsciente de los otros que resiste generar éxito.
              </p>
            </section>

            <section className="bg-card mb-12 rounded-2xl p-8 shadow-card">
              <h2 className="text-foreground mb-4 text-2xl font-bold">¿Cómo lo vas a lograr?</h2>
              <p className="text-foreground/90 mb-4 leading-relaxed">
                A través de una fórmula que hemos desarrollado: la <strong>tríada del psicoemprendimiento</strong>. Es una estructura de
                tres ejes, formulada para cualquier tipo de emprendimiento, que te servirá de base para encarar tanto esta profesión
                como cualquier otra.
              </p>
              <p className="text-foreground/90 leading-relaxed">
                Por su simpleza y claridad, la tríada te marcará un camino de trabajo para organizarte y liderarte internamente, cuando
                la multiplicidad de situaciones y tareas amenaza con desorientar.
              </p>
            </section>

            <section className="bg-card mb-12 rounded-2xl p-8 shadow-card">
              <h2 className="text-foreground mb-4 text-2xl font-bold">Prólogo</h2>
              <p className="text-muted-foreground mb-3 text-sm font-semibold">Por Mauricio Benoist</p>
              <blockquote className="text-foreground/90 mb-10 border-accent/40 border-l-4 pl-4 text-base leading-relaxed italic">
                Cada aprendizaje aquí señalado es la suma de más de 10 años de experiencia en el ramo… La competencia en el ramo siempre
                es feroz… resulta sumamente importante aprender de quienes sí han llegado a la cima, cómo llegar y mantenerse.
              </blockquote>
              <h3 className="text-foreground mb-3 text-lg font-bold">Introducción — Dotti Peñate Sosa</h3>
              <p className="text-foreground/90 leading-relaxed italic">
                Estoy convencida de que el negocio inmobiliario es uno de los más rentables para quienes realmente desean dedicarse full
                time. Con su fórmula de la tríada de competencias necesarias, este libro te equipará mejor para tu carrera.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-foreground mb-8 text-2xl font-bold">Reseñas</h2>
              <div className="flex flex-col gap-6">
                {reviews.map((r) => (
                  <div key={r.name} className="bg-card rounded-2xl p-6 shadow-card">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      {r.photo ? (
                        <div className="relative mx-auto h-36 w-28 shrink-0 overflow-hidden rounded-xl bg-secondary sm:mx-0">
                          <Image
                            src={r.photo}
                            alt={r.name}
                            fill
                            className="object-cover"
                            sizes="112px"
                          />
                        </div>
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground mb-1 font-bold">{r.name}</p>
                        <p className="text-muted-foreground mb-3 text-sm">{r.role}</p>
                        <p className="text-foreground/90 text-sm leading-relaxed">&ldquo;{r.quote}&rdquo;</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card/50 p-8">
              <h2 className="text-foreground mb-4 text-xl font-bold">También te puede interesar</h2>
              <Link href={BOOK_LINKS[0].href} className="text-primary font-semibold hover:underline">
                {BOOK_LINKS[0].label} →
              </Link>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
