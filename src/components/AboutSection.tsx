import { motion } from "framer-motion";
import { Award, Users, TrendingUp } from "lucide-react";
import { siteImages } from "@/lib/site-media";

const AboutSection = () => {
  return (
    <section id="nosotros" className="bg-background py-10 sm:py-12 md:py-20 lg:py-24">
      <div className="container mx-auto max-w-full px-4 max-[399px]:px-5 sm:px-5 lg:px-8">
        <div className="grid items-center gap-10 max-[399px]:gap-8 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto w-full max-w-full lg:mx-0"
          >
            <div className="overflow-hidden rounded-xl shadow-card-hover ring-1 ring-border/60 max-[399px]:rounded-lg lg:rounded-2xl">
              <img
                src={siteImages.aboutTeam}
                alt="Equipo de Gustavo De Simone"
                className="h-[min(22rem,70vw)] w-full object-cover sm:h-104 lg:h-[500px]"
                loading="lazy"
                width={800}
                height={600}
              />
            </div>
            <div className="absolute bottom-3 right-3 z-10 max-w-[min(12rem,calc(100%-1.5rem))] rounded-xl bg-primary p-4 text-primary-foreground shadow-card-hover ring-1 ring-primary-foreground/10 max-[399px]:bottom-2.5 max-[399px]:right-2.5 max-[399px]:p-3.5 max-[399px]:rounded-lg lg:max-w-none lg:rounded-2xl lg:p-6 lg:-bottom-6 lg:-right-4 xl:-right-8">
              <p className="text-2xl font-bold tabular-nums max-[399px]:text-xl lg:text-3xl">15+</p>
              <p className="text-xs text-primary-foreground/85 max-[399px]:leading-snug sm:text-sm">
                Años de
                <br />
                trayectoria
              </p>
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

            <div className="grid grid-cols-1 gap-6 max-[399px]:grid-cols-2 max-[399px]:gap-x-3 max-[399px]:gap-y-5 sm:grid-cols-3 sm:gap-6">
              {[
                { icon: Award, title: "CPI 8456", desc: "CABA" },
                { icon: Users, title: "CMCPSI 7213", desc: "PBA" },
                { icon: TrendingUp, title: "Crecimiento", desc: "Constante" },
              ].map(({ icon: Icon, title, desc }, index) => (
                <div
                  key={title}
                  className={`flex min-w-0 items-start gap-2.5 sm:gap-3 ${
                    index === 2 ? "max-[399px]:col-span-2 max-[399px]:justify-center" : ""
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-light ring-1 ring-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{title}</p>
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
