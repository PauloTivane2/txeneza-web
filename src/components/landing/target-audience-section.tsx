"use client";

import React from "react";
import { motion } from "framer-motion";
import { Home, Zap, Store, HelpCircle } from "lucide-react";
import { BrandName } from "@/components/ui/brand-name";

export const TargetAudienceSection: React.FC = () => {
  const groups = [
    {
      title: "Mulheres Chefes de Família",
      desc: "Historicamente responsáveis pela gestão doméstica e salubridade dos lares. São as primeiras a lidar com as consequências de lixeiras próximas a habitações e o risco direto de saúde para as crianças.",
      icon: Home,
      role: "Gestão do Lar & Proteção Familiar",
      color: "limeGreen",
    },
    {
      title: "Jovens e Estudantes",
      desc: "A geração conectada da Beira. Funcionam como facilitadores digitais na comunidade, ajudando vizinhos mais velhos a registar reportes e liderando ações voluntárias de limpeza nos bairros.",
      icon: Zap,
      role: "Mobilização Digital & Voluntariado",
      color: "sageGreen",
    },
    {
      title: "Vendedores Ambulantes",
      desc: "Trabalham diariamente nos mercados informais e vias públicas. Estão directamente expostos aos focos de resíduos não recolhidos que prejudicam as suas vendas e ameaçam a higiene dos produtos alimentares.",
      icon: Store,
      role: "Higiene no Comércio de Rua",
      color: "amber-500",
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
    <section id="para-quem-e" className="py-20 md:py-28 bg-background dark:bg-grey900 text-foreground dark:text-grey50 relative">
      <div className="absolute top-[10%] right-[5%] w-[35%] aspect-square rounded-full bg-forestGreen/10 filter blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <span className="text-xs font-black tracking-widest text-limeGreen uppercase">Impacto Social</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mt-3">
            Para Quem é o <BrandName />?
          </h2>
          <p className="text-slate-605 dark:text-slate-400 mt-4 text-base sm:text-lg leading-relaxed">
            Embora desenhada para toda a população da Beira, a nossa monografia científica identifica três grupos prioritários que mais sofrem com a ineficiência do saneamento e mais beneficiam da plataforma.
          </p>
        </div>

        {/* Audience Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex md:grid overflow-x-auto md:overflow-x-visible flex-nowrap md:flex-wrap md:grid-cols-3 gap-6 md:gap-8 snap-x snap-mandatory pb-6 md:pb-0 scrollbar-none"
        >
          {groups.map((group, index) => {
            const Icon = group.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="min-w-[85%] sm:min-w-[45%] md:min-w-0 snap-center bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 hover:border-limeGreen/20 rounded-3xl p-8 relative flex flex-col justify-between group transition-all duration-300"
              >
                <div>
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-background dark:bg-slate-950 flex items-center justify-center text-limeGreen border border-slate-200 dark:border-slate-800 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-foreground dark:text-white mb-3 group-hover:text-limeGreen transition-colors">
                    {group.title}
                  </h3>
                  <p className="text-slate-605 dark:text-slate-400 text-sm leading-relaxed mb-6">
                    {group.desc}
                  </p>
                </div>

                {/* Subtag */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-900 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>Papel</span>
                  <span className="text-limeGreen font-semibold">{group.role}</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Monograph Quote Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-16 p-6 sm:p-8 rounded-3xl bg-forestGreen/10 border border-forestGreen/20 text-center max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-6"
        >
          <div className="w-12 h-12 rounded-2xl bg-forestGreen/30 flex items-center justify-center text-limeGreen shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Abordagem Inclusiva e Centrada no Cidadão</h4>
            <p className="text-xs text-slate-605 dark:text-slate-400 mt-1 leading-relaxed">
              &ldquo;A inclusão digital de grupos historicamente vulneráveis na Beira é essencial para democratizar a gestão do saneamento. O <BrandName /> atua como ponte tecnológica reduzindo a assimetria na comunicação com o poder público municipal.&rdquo; <span className="text-slate-500 block mt-1">— Citação da Monografia Académica de Suporte.</span>
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
