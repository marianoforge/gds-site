import { motion } from "framer-motion";
import { BedDouble, Bath, Car, Maximize } from "lucide-react";
import { siteImages } from "@/lib/site-media";

const properties = [
  {
    image: siteImages.property1,
    title: "Departamento 3 Amb. con Cochera en Palermo",
    price: "U$270,000",
    type: "Venta",
    beds: 2,
    baths: 1,
    parking: 1,
    area: "66 m²",
  },
  {
    image: siteImages.property2,
    title: "Penthouse con Terraza en Puerto Madero",
    price: "U$450,000",
    type: "Venta",
    beds: 3,
    baths: 2,
    parking: 2,
    area: "120 m²",
  },
  {
    image: siteImages.property3,
    title: "Casa Moderna con Jardín en Zona Norte",
    price: "U$380,000",
    type: "Venta",
    beds: 4,
    baths: 3,
    parking: 2,
    area: "250 m²",
  },
];

const PropertiesSection = () => {
  return (
    <section id="propiedades" className="py-24 bg-secondary">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-accent font-semibold tracking-[0.15em] uppercase text-sm mb-3">Propiedades</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Propiedades <span className="font-serif italic font-normal text-primary">Destacadas</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Invertí en propiedades seleccionadas con el respaldo de nuestro equipo profesional
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property, index) => (
            <motion.div
              key={property.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  width={800}
                  height={600}
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide">
                    {property.type}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1.5 rounded-lg">
                    Destacado
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-bold text-foreground text-lg mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {property.title}
                </h3>

                <div className="flex items-center gap-4 mb-4 text-muted-foreground text-sm">
                  <span className="flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4" /> {property.beds}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Bath className="w-4 h-4" /> {property.baths}
                  </span>
                  {property.parking > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Car className="w-4 h-4" /> {property.parking}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Maximize className="w-4 h-4" /> {property.area}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <p className="text-2xl font-bold text-primary">{property.price}</p>
                  <span className="text-sm font-medium text-accent hover:underline">
                    Ver más →
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
          >
            Ver todas las propiedades
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default PropertiesSection;
