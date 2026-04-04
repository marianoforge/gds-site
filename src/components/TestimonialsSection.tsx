"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote, User } from "lucide-react";
import type { GooglePlaceReviews, GoogleReview } from "@/lib/google-reviews";

function ReviewAvatar({ name, photoUrl }: { name: string; photoUrl: string }) {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [photoUrl, name]);

  const trimmed = photoUrl.trim();
  const showImg = trimmed.length > 0 && !broken;

  if (!showImg) {
    return (
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 ring-2 ring-accent/30"
        aria-hidden
      >
        <User className="h-5 w-5 text-accent" strokeWidth={2} />
      </div>
    );
  }

  return (
    <img
      src={trimmed}
      alt=""
      className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-accent/30"
      width={40}
      height={40}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
    />
  );
}

const FALLBACK_REVIEWS: GoogleReview[] = [
  {
    authorName: "Juan Martin Biondi",
    authorPhoto: "",
    rating: 5,
    text: "Excelente experiencia! Compré un departamento hace poco y fui atendido por Eugenio, muy amable, súper atento a todo y responsable!",
    relativeTime: "",
    time: 0,
  },
  {
    authorName: "Ekaterina Simbireva",
    authorPhoto: "",
    rating: 5,
    text: "Quiero agradecer y recomendar la inmobiliaria, en especial al agente inmobiliario Eugenio, quien nos ayudó a concretar la operación de compra de la propiedad en todas las etapas de la transacción.",
    relativeTime: "",
    time: 0,
  },
  {
    authorName: "Ana Rey",
    authorPhoto: "",
    rating: 5,
    text: "Excelente profesional Lorena Kenny, desde el primer contacto fue muy atenta y clara, siempre dispuesta a resolver dudas, nos asesoró y acompañó resolviendo todo de manera rápida y ordenada.",
    relativeTime: "",
    time: 0,
  },
  {
    authorName: "Viviana Casati",
    authorPhoto: "",
    rating: 5,
    text: "Estoy muy agradecida por el acompañamiento recibido en la compra de mi departamento. Un equipo profesional, transparente y con un trato humano que realmente marca la diferencia.",
    relativeTime: "",
    time: 0,
  },
  {
    authorName: "Leonardo Besada",
    authorPhoto: "",
    rating: 5,
    text: "Nos atendió Lorena, excelente la predisposición y entender las necesidades que teníamos. 100% recomendable.",
    relativeTime: "",
    time: 0,
  },
];

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/place/Gustavo+De+Simone+Soluciones+Inmobiliarias/@-34.5477,-58.4556,17z";

type Props = {
  googleReviews: GooglePlaceReviews | null;
};

const TestimonialsSection = ({ googleReviews }: Props) => {
  const googleList = googleReviews?.reviews ?? [];
  const googleNames = new Set(googleList.map((r) => r.authorName.toLowerCase()));
  const extraFallbacks = FALLBACK_REVIEWS.filter((r) => !googleNames.has(r.authorName.toLowerCase()));
  const reviews = [...googleList, ...extraFallbacks];
  const totalReviews = googleReviews?.totalReviews ?? 149;
  const overallRating = googleReviews?.rating ?? 5;

  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((p) => (p + 1) % reviews.length);
  const prev = () => setCurrent((p) => (p - 1 + reviews.length) % reviews.length);

  const review = reviews[current];

  return (
    <section id="testimonios" className="relative overflow-hidden bg-primary-dark py-10 sm:py-12 md:py-20 lg:py-24">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-center sm:mb-12 lg:mb-16"
        >
          <p className="text-accent font-semibold tracking-[0.15em] uppercase text-sm mb-3">
            Testimonios
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
            Lo que dicen nuestros <span className="font-serif italic font-normal">clientes</span>
          </h2>

          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-2 text-primary-foreground/60 hover:text-accent transition-colors text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="font-semibold text-accent">{overallRating}</span>
            <span>({totalReviews} reseñas en Google)</span>
          </a>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="relative h-[320px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="text-center w-full"
              >
                <Quote className="w-12 h-12 text-accent/40 mx-auto mb-6" />

                <div className="flex justify-center gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < review.rating ? "text-accent fill-accent" : "text-primary-foreground/20"}`}
                    />
                  ))}
                </div>

                <p className="text-primary-foreground/90 text-lg md:text-xl leading-relaxed mb-8 font-light line-clamp-5">
                  "{review.text}"
                </p>

                <div className="flex items-center justify-center gap-3">
                  <ReviewAvatar name={review.authorName} photoUrl={review.authorPhoto} />
                  <div className="text-left">
                    <p className="text-accent font-semibold">{review.authorName}</p>
                    {review.relativeTime ? (
                      <p className="text-primary-foreground/40 text-xs">{review.relativeTime}</p>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/60 hover:bg-primary-foreground/10 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    i === current ? "bg-accent w-8" : "bg-primary-foreground/30 w-2.5"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-12 h-12 rounded-full border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/60 hover:bg-primary-foreground/10 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
