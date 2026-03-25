import { Search, MapPin, Home, BedDouble } from "lucide-react";
import { motion } from "framer-motion";
import { siteImages } from "@/lib/site-media";

const HeroSection = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <img
        src={siteImages.hero}
        alt="Edificio de lujo en Buenos Aires"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-hero" />

      <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <p className="text-accent font-semibold tracking-[0.2em] uppercase text-sm mb-4">
            Soluciones Inmobiliarias
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-primary-foreground leading-tight mb-6">
            ¡Concretando Metas{" "}
            <span className="italic font-serif font-normal">Juntos!</span>
          </h1>
          <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light">
            Encontrá la propiedad ideal en CABA y Provincia de Buenos Aires. 
            Más de 1000 propiedades disponibles con asesoramiento personalizado.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="max-w-4xl mx-auto bg-card/95 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-card-hover"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
            <div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-3">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <div className="flex flex-col w-full">
                <span className="text-xs text-muted-foreground font-medium">Ubicación</span>
                <select className="bg-transparent text-foreground text-sm font-medium outline-none cursor-pointer">
                  <option>Todas las zonas</option>
                  <option>Palermo</option>
                  <option>Belgrano</option>
                  <option>Recoleta</option>
                  <option>Núñez</option>
                  <option>Caballito</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-3">
              <Home className="w-5 h-5 text-primary shrink-0" />
              <div className="flex flex-col w-full">
                <span className="text-xs text-muted-foreground font-medium">Tipo</span>
                <select className="bg-transparent text-foreground text-sm font-medium outline-none cursor-pointer">
                  <option>Todos</option>
                  <option>Departamento</option>
                  <option>Casa</option>
                  <option>PH</option>
                  <option>Terreno</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-3">
              <BedDouble className="w-5 h-5 text-primary shrink-0" />
              <div className="flex flex-col w-full">
                <span className="text-xs text-muted-foreground font-medium">Dormitorios</span>
                <select className="bg-transparent text-foreground text-sm font-medium outline-none cursor-pointer">
                  <option>Cualquiera</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4+</option>
                </select>
              </div>
            </div>

            <button className="flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl px-6 py-3 font-semibold text-sm hover:bg-primary-dark transition-colors">
              <Search className="w-5 h-5" />
              Buscar
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex flex-wrap justify-center gap-8 md:gap-16 mt-12"
        >
          {[
            { number: "1000+", label: "Propiedades" },
            { number: "15+", label: "Años de experiencia" },
            { number: "98%", label: "Clientes satisfechos" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-accent">{stat.number}</p>
              <p className="text-primary-foreground/60 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
