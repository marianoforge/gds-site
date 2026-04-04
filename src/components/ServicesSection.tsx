import { motion } from "framer-motion";
import { Shield, Target, Zap, Users, FileCheck } from "lucide-react";

const services = [
  {
    icon: Target,
    title: "Experiencia",
    desc: "Años de trayectoria y un profundo conocimiento del sector nos permiten ofrecerte el mejor asesoramiento.",
  },
  {
    icon: Shield,
    title: "Cartera Exclusiva",
    desc: "Accedemos a propiedades únicas y te ayudamos a encontrar la mejor inversión en las zonas más demandadas.",
  },
  {
    icon: Zap,
    title: "Estrategias",
    desc: "Desde marketing digital hasta recorridos virtuales, utilizamos herramientas de última generación.",
  },
  {
    icon: Users,
    title: "Asesoramiento",
    desc: "Cada cliente es único. Te guiamos en todo el proceso con total transparencia y compromiso.",
  },
  {
    icon: FileCheck,
    title: "Trámites Seguros",
    desc: "Nos encargamos de toda la gestión legal y administrativa para que solo te preocupes por la mejor decisión.",
  },
];

const ServicesSection = () => {
  return (
    <section id="servicios" className="bg-background py-10 sm:py-12 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-center sm:mb-12 lg:mb-16"
        >
          <p className="text-accent font-semibold tracking-[0.15em] uppercase text-sm mb-3">Nuestros Servicios</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            ¿Por qué <span className="font-serif italic font-normal text-primary">elegirnos?</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {services.map(({ icon: Icon, title, desc }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`group bg-card border border-border rounded-2xl p-8 hover:border-primary/30 hover:shadow-card-hover transition-all duration-300 ${
                index === 4 ? "sm:col-span-2 lg:col-span-1 lg:col-start-2" : ""
              }`}
            >
              <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
