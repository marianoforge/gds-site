import { motion } from "framer-motion";
import { Award, Users, TrendingUp } from "lucide-react";
import { siteImages } from "@/lib/site-media";

const AboutSection = () => {
  return (
    <section id="nosotros" className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-card-hover">
              <img
                src={siteImages.aboutTeam}
                alt="Equipo de Gustavo De Simone"
                className="w-full h-[400px] lg:h-[500px] object-cover"
                loading="lazy"
                width={800}
                height={600}
              />
            </div>
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-4 lg:-right-8 bg-primary text-primary-foreground rounded-2xl p-6 shadow-card-hover">
              <p className="text-3xl font-bold">15+</p>
              <p className="text-sm text-primary-foreground/80">Años de<br />trayectoria</p>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-accent font-semibold tracking-[0.15em] uppercase text-sm mb-3">Sobre Nosotros</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              Gustavo De Simone<br />
              <span className="font-serif italic font-normal text-primary">Soluciones Inmobiliarias</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Somos un equipo de profesionales que priorizamos el confort de nuestros clientes. 
              Disfrutamos concretar las metas y sueños de quienes requieren de nuestros conocimientos 
              a la hora de apostar en los bienes raíces.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Proyectando al crecimiento constante, enfocados en la expansión de próximas sucursales. 
              Rodeados de una energía afable en nuestra oficina, la cual nos hace reafirmar a diario 
              que amamos nuestra profesión.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: Award, title: "CPI 8456", desc: "CABA" },
                { icon: Users, title: "CMCPSI 7213", desc: "PBA" },
                { icon: TrendingUp, title: "Crecimiento", desc: "Constante" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
