"use client";

import { motion } from "framer-motion";
import { BedDouble, Bath, Car, Maximize } from "lucide-react";
import Link from "next/link";
import type { FeaturedProperty } from "@/lib/featured-properties";

type PropertiesSectionProps = {
  properties: FeaturedProperty[];
};

function PropertyCardSkeleton() {
  return (
    <div className="flex h-full flex-col bg-card rounded-2xl overflow-hidden shadow-card animate-pulse">
      <div className="h-64 bg-muted" />
      <div className="flex flex-1 flex-col p-6 gap-3">
        <div className="h-5 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <div className="h-7 w-24 rounded bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

const PropertiesSection = ({ properties }: PropertiesSectionProps) => {
  return (
    <section id="propiedades" className="bg-secondary py-10 sm:py-12 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center sm:mb-12 lg:mb-16"
        >
          <p className="text-accent font-semibold tracking-[0.15em] uppercase text-sm mb-3">
            Propiedades
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Propiedades{" "}
            <span className="font-serif italic font-normal text-primary">Destacadas</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Invertí en propiedades seleccionadas con el respaldo de nuestro equipo profesional
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {properties.length === 0
            ? Array.from({ length: 3 }).map((_, i) => <PropertyCardSkeleton key={i} />)
            : properties.map((property, index) => (
                <motion.div
                  key={property.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="group h-full"
                >
                  <Link
                    href={`/propiedad/${property.slug}`}
                    className="flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-card-hover"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        width={800}
                        height={600}
                      />
                      <div className="absolute top-4 left-4">
                        <span className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-primary-foreground">
                          {property.type}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground">
                          {property.isFeatured ? "Destacado" : "Disponible"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <p className="mb-1 text-sm font-medium text-muted-foreground">{property.location}</p>
                      <h3 className="mb-3 min-h-14 text-lg font-bold text-foreground transition-colors group-hover:text-primary line-clamp-2">
                        {property.title}
                      </h3>

                      <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <BedDouble className="h-4 w-4" /> {property.bedrooms}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Bath className="h-4 w-4" /> {property.bathrooms}
                        </span>
                        {property.parking > 0 && (
                          <span className="flex items-center gap-1.5">
                            <Car className="h-4 w-4" /> {property.parking}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Maximize className="h-4 w-4" /> {property.area}
                        </span>
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                        <p className="text-2xl font-bold text-primary">{property.price}</p>
                        <span className="text-sm font-medium text-accent hover:underline">Ver más →</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center sm:mt-10 lg:mt-12"
        >
          <Link
            href="/propiedades"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
          >
            Ver todas las propiedades
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PropertiesSection;
