"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import { BOOKS, BOOKS_HERO_IMAGE, whatsappBookUrl } from "@/lib/book-links";

export default function BooksSection() {
  return (
    <section id="libros" className="border-border/80 border-t bg-secondary py-10 sm:py-14 md:py-20">
      <div className="container mx-auto max-w-5xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-center md:mb-12"
        >
          <p className="text-accent mb-3 text-sm font-semibold tracking-[0.15em] uppercase">Libros</p>
          <h2 className="text-foreground text-3xl font-bold md:text-4xl">
            Conocimiento para{" "}
            <span className="font-serif font-normal italic text-primary">crecer sin límites</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="shadow-card border-border/60 relative mb-8 aspect-16/7 overflow-hidden rounded-2xl border md:mb-10"
        >
          <Image
            src={BOOKS_HERO_IMAGE}
            alt="Libros de Gustavo De Simone: 100% Emprendedor y Descifrando la Mente Inmobiliaria"
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
          <div className="absolute inset-0 bg-linear-to-t from-primary/70 via-primary/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
            <p className="text-primary-foreground/90 max-w-xl text-sm leading-relaxed md:text-base">
              Dos obras escritas por Gustavo De Simone para emprendedores y profesionales del negocio inmobiliario.
            </p>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {BOOKS.map((book, index) => (
            <motion.article
              key={book.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="shadow-card border-border/60 flex flex-col overflow-hidden rounded-2xl border bg-card"
            >
              <Link href={book.href} className="group relative aspect-4/3 overflow-hidden bg-secondary">
                <Image
                  src={book.cover}
                  alt={`Tapa del libro ${book.label}`}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 480px"
                />
              </Link>
              <div className="flex flex-1 flex-col p-6 md:p-8">
                <h3 className="font-serif text-primary mb-3 text-2xl font-bold italic">{book.label}</h3>
                <p className="text-muted-foreground mb-6 flex-1 text-sm leading-relaxed">{book.excerpt}</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href={book.href}
                    className="border-border text-foreground hover:border-primary/40 inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-colors"
                  >
                    Ver más
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href={whatsappBookUrl(book.label)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary text-primary-foreground hover:bg-primary-dark inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors"
                  >
                    <BookOpen className="h-4 w-4" />
                    Conseguí tu ejemplar
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
