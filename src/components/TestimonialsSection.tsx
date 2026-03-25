import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const testimonials = [
  {
    text: "Excelente experiencia! Compré un departamento hace poco y fui atendido por Eugenio, muy amable, súper atento a todo y responsable!",
    author: "Juan Martin Biondi",
  },
  {
    text: "Quiero agradecer y recomendar la inmobiliaria, en especial al agente inmobiliario Eugenio, quien nos ayudó a concretar la operación de compra de la propiedad en todas las etapas de la transacción.",
    author: "Ekaterina Simbireva",
  },
  {
    text: "Excelente profesional Lorena Kenny, desde el primer contacto fue muy atenta y clara, siempre dispuesta a resolver dudas, nos asesoró y acompañó resolviendo todo de manera rápida y ordenada.",
    author: "Ana Rey",
  },
  {
    text: "Estoy muy agradecida por el acompañamiento recibido en la compra de mi departamento. Un equipo profesional, transparente y con un trato humano que realmente marca la diferencia.",
    author: "Viviana Casati",
  },
  {
    text: "Nos atendió Lorena, excelente la predisposición y entender las necesidades que teníamos. 100% recomendable.",
    author: "Leonardo Besada",
  },
];

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((p) => (p + 1) % testimonials.length);
  const prev = () => setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length);

  return (
    <section id="testimonios" className="py-24 bg-primary-dark relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-accent font-semibold tracking-[0.15em] uppercase text-sm mb-3">Testimonios</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
            Lo que dicen nuestros <span className="font-serif italic font-normal">clientes</span>
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="relative min-h-[250px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <Quote className="w-12 h-12 text-accent/40 mx-auto mb-6" />
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-accent fill-accent" />
                  ))}
                </div>
                <p className="text-primary-foreground/90 text-lg md:text-xl leading-relaxed mb-8 font-light">
                  "{testimonials[current].text}"
                </p>
                <p className="text-accent font-semibold text-lg">
                  {testimonials[current].author}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/60 hover:bg-primary-foreground/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === current ? "bg-accent w-8" : "bg-primary-foreground/30"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-12 h-12 rounded-full border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/60 hover:bg-primary-foreground/10 transition-colors"
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
