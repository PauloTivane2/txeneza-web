"use client";

import React from "react";
import { motion } from "framer-motion";
import { Camera, MapPin, Sliders, CheckCircle } from "lucide-react";
import { BrandName } from "@/components/ui/brand-name";

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: "01",
      title: "Fotografar",
      desc: "Abra a aplicação e capture uma foto nítida do ponto de lixo acumulado. A imagem ajuda a verificar as dimensões e o tipo de resíduo.",
      icon: Camera,
      color: "limeGreen",
    },
    {
      num: "02",
      title: "Localizar",
      desc: "O GPS do seu telemóvel deteta a localização geográfica exata de forma automática. Não precisa de digitar moradas ou saber nomes de ruas.",
      icon: MapPin,
      color: "sageGreen",
    },
    {
      num: "03",
      title: "Classificar",
      desc: "Indique o nível de gravidade aproximado (pequeno, médio ou crítico) para ajudar as equipas de limpeza a priorizar as ocorrências.",
      icon: Sliders,
      color: "amber-500",
    },
    {
      num: "04",
      title: "Confirmar",
      desc: "Submeta o relatório. A ocorrência é guardada, aparece instantaneamente no mapa público e fica pronta para análise municipal.",
      icon: CheckCircle,
      color: "emerald-550",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
  };

  return (
    <section id="funcionamento" className="py-20 md:py-28 bg-background dark:bg-grey900 text-foreground dark:text-grey50 relative">
      {/* Decorative radial gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] aspect-square rounded-full bg-forestGreen/10 filter blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <span className="text-xs font-black tracking-widest text-limeGreen uppercase">Fluxo de Reporte</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mt-3">
            Como Funciona o <BrandName />?
          </h2>
          <p className="text-slate-650 dark:text-slate-400 mt-4 text-base sm:text-lg leading-relaxed">
            Reportar um foco de lixo leva menos de 1 minuto. Desenvolvemos um fluxo simples e acessível para qualquer cidadão colaborar na melhoria do saneamento da cidade.
          </p>
        </div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex lg:grid overflow-x-auto lg:overflow-x-visible flex-nowrap lg:flex-wrap lg:grid-cols-4 gap-6 lg:gap-8 relative snap-x snap-mandatory pb-6 lg:pb-0 scrollbar-none"
        >
          {/* Connector Line (Desktop only) */}
          <div className="hidden lg:block absolute top-[2.25rem] left-[10%] right-[10%] h-[2px] bg-slate-200 dark:bg-slate-800 -z-10" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="min-w-[85%] sm:min-w-[45%] lg:min-w-0 snap-center bg-slate-50/60 dark:bg-white/5 border border-slate-200 dark:border-slate-800 hover:border-limeGreen/20 rounded-3xl p-6 relative group transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Step Bubble & Icon */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="w-11 h-11 rounded-2xl bg-background dark:bg-slate-950 flex items-center justify-center text-limeGreen border border-slate-200 dark:border-slate-800 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-slate-300 dark:text-slate-800 font-mono group-hover:text-limeGreen/10 transition-colors">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground dark:text-white mb-2.5 group-hover:text-limeGreen transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-slate-605 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
