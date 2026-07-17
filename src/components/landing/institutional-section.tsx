"use client";

import React from "react";
import { motion } from "framer-motion";
import { HeartPulse, Home, RefreshCw, Landmark, Sparkles } from "lucide-react";
import { BrandName } from "@/components/ui/brand-name";

export const InstitutionalSection: React.FC = () => {
  const odsList = [
    {
      num: "3",
      title: "Saúde e Bem-Estar",
      desc: "Promover a saúde pública através da redução de lixeiras clandestinas que funcionam como focos de reprodução do mosquito transmissor da Malária e proliferação de diarreias.",
      color: "bg-red-650",
      icon: HeartPulse,
    },
    {
      num: "11",
      title: "Cidades e Comunidades Sustentáveis",
      desc: "Tornar os bairros da Beira mais limpos, resilientes a inundações e sustentáveis, garantindo vias públicas limpas e valas de drenagem desobstruídas.",
      color: "bg-orange-500",
      icon: Home,
    },
    {
      num: "12",
      title: "Produção e Consumo Responsáveis",
      desc: "Fomentar a sensibilização comunitária para a redução do descarte desordenado, facilitando a identificação rápida e o encaminhamento correto dos resíduos.",
      color: "bg-amber-600",
      icon: RefreshCw,
    },
  ];

  return (
    <section id="ods" className="py-20 md:py-28 bg-background dark:bg-grey900 text-foreground dark:text-grey50 relative">
      <div className="absolute top-[30%] left-[-10%] w-[45%] aspect-square rounded-full bg-forestGreen/10 filter blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column: Partnerships & Delimitation */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <span className="text-xs font-black tracking-widest text-limeGreen uppercase">Enquadramento Institucional</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Apoio à Gestão e Sustentabilidade Urbana
            </h2>
            <p className="text-slate-605 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              O <BrandName /> foi idealizado sob bases científicas para apoiar os planos locais de limpeza e higiene urbana. No âmbito do nosso estudo de viabilidade acadêmica, a solução desenha sinergias com entidades ativas na gestão de resíduos da Beira.
            </p>

            {/* Disclaimer Alert */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-grey900/90 border border-slate-200 dark:border-slate-800 flex gap-4 items-start">
              <Landmark className="w-5 h-5 text-limeGreen shrink-0 mt-0.5" />
              <div className="text-xs">
                <h4 className="font-extrabold text-foreground dark:text-slate-200">Delimitação de Integração</h4>
                <p className="text-slate-600 dark:text-slate-500 mt-1 leading-relaxed">
                  Clarificamos que esta plataforma atua de forma independente como protótipo acadêmico. Não possui integração automática formal instalada nos sistemas internos da <strong>CMB</strong>, <strong>AMOR</strong> ou <strong>Kolekt</strong>, servindo como uma proposta tecnológica viável para futura adoção.
                </p>
              </div>
            </div>

            {/* Entities Pills */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-bold text-slate-550 uppercase tracking-widest block">Entidades Referenciadas</span>
              <div className="flex flex-wrap gap-2.5">
                {[
                  "CMB (Conselho Municipal da Beira)",
                  "AMOR (Associação Moçambicana de Reciclagem)",
                  "Kolekt (Plataforma de Incentivos)"
                ].map((ent, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-grey900/90 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400"
                  >
                    {ent}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: ODS blocks */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <span className="text-[11px] font-extrabold tracking-widest text-limeGreen uppercase block mb-1">
              Alinhamento com Objectivos da ONU (ODS)
            </span>

            <div className="flex flex-col gap-6">
              {odsList.map((ods, idx) => {
                const Icon = ods.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    className="p-6 rounded-3xl bg-slate-50/40 dark:bg-white/5 border border-slate-200 dark:border-slate-800 hover:border-limeGreen/10 flex gap-5 items-start group transition-all"
                  >
                    {/* Badge ODS */}
                    <div className={`w-14 h-14 rounded-2xl ${ods.color} flex flex-col items-center justify-center shrink-0 text-white font-mono shadow-lg relative`}>
                      <span className="text-xl font-black leading-none">{ods.num}</span>
                      <span className="text-[7px] uppercase tracking-wider font-extrabold mt-0.5">ODS</span>
                    </div>

                    {/* Text */}
                    <div>
                      <h3 className="text-base font-extrabold text-foreground dark:text-white flex items-center gap-2">
                        {ods.title}
                        <Icon className="w-4 h-4 text-slate-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-605 dark:text-slate-400 mt-2 leading-relaxed">
                        {ods.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
