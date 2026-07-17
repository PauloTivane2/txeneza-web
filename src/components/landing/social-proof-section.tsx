"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Award, BarChart3, Fingerprint } from "lucide-react";
import { BrandName } from "@/components/ui/brand-name";

export const SocialProofSection: React.FC = () => {
  const stats = [
    {
      percentage: 76.7,
      strokeDash: 240, // Visual representation for circle
      title: "Prontidão para Uso",
      desc: (
        <>
          76,7% dos munícipes entrevistados afirmaram estar totalmente dispostos a adotar a aplicação{" "}
          <BrandName /> para denunciar problemas no seu bairro.
        </>
      ),
      label: "Dispostos a usar a App",
    },
    {
      percentage: 89.3,
      strokeDash: 280,
      title: "Funcionalidades Críticas",
      desc: "89,3% expressaram a necessidade crucial de poder anexar fotografias reais e registar automaticamente a sua localização GPS para validação das denúncias.",
      label: "Exigem Foto & GPS",
    },
  ];

  const secondaryStats = [
    {
      icon: Award,
      value: "100%",
      label: "Transparência Pública",
      desc: "Acesso total aos reportes por qualquer cidadão.",
    },
    {
      icon: BarChart3,
      value: "2x mais",
      label: "Eficiência de Resposta",
      desc: "Priorização inteligente do envio de equipas.",
    },
    {
      icon: Fingerprint,
      value: "Privacidade",
      label: "Anonimato Garantido",
      desc: "Denuncie com segurança sem expor dados pessoais.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
  };

  return (
    <section className="py-20 md:py-28 bg-slate-50 dark:bg-grey900/50 text-foreground dark:text-grey50 relative overflow-hidden border-y border-slate-100 dark:border-slate-800/50">
      <div className="absolute top-1/2 left-10 w-[20%] aspect-square rounded-full bg-forestGreen/20 filter blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <span className="text-xs font-black tracking-widest text-limeGreen uppercase">Resultados do Questionário</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mt-3">
            Aceitação Comunitária Validada
          </h2>
          <p className="text-slate-605 dark:text-slate-400 mt-4 text-base sm:text-lg leading-relaxed">
            Realizámos um inquérito de opinião aos moradores das zonas afectadas da Beira para validar o interesse no projecto. A resposta foi extremamente favorável.
          </p>
        </div>

        {/* Circular Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="p-8 rounded-3xl bg-background/80 dark:bg-white/5 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-8 group hover:border-limeGreen/20 transition-all duration-300"
            >
              {/* SVG Ring Progress */}
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    className="stroke-slate-200 dark:stroke-slate-800"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="52"
                    className="stroke-limeGreen"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="326"
                    initial={{ strokeDashoffset: 326 }}
                    whileInView={{ strokeDashoffset: 326 - (326 * stat.percentage) / 100 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-foreground dark:text-white font-mono">{stat.percentage}%</span>
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Apoio</span>
                </div>
              </div>

              {/* Text Info */}
              <div className="flex-1 text-center md:text-left">
                <span className="text-xs font-bold text-limeGreen uppercase tracking-wider">{stat.label}</span>
                <h3 className="text-lg font-bold text-foreground dark:text-white mt-1.5 mb-2.5">
                  {stat.title}
                </h3>
                <p className="text-slate-605 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {stat.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Small stats cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto pt-8 border-t border-slate-200 dark:border-slate-800/80"
        >
          {secondaryStats.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-900 flex gap-4 items-start"
              >
                <div className="w-10 h-10 rounded-xl bg-forestGreen/10 border border-forestGreen/20 flex items-center justify-center text-limeGreen shrink-0 mt-0.5">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground dark:text-white font-mono">{item.value}</div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">{item.label}</h4>
                  <p className="text-[11px] text-slate-605 dark:text-slate-500 mt-1 leading-normal">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
};
