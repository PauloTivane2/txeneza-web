"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AppMockup } from "./app-mockup";
import { PlusCircle, Flame, ArrowDown, Info, X } from "lucide-react";
import { BrandName } from "@/components/ui/brand-name";

export const HeroSection: React.FC = () => {
  const [showToast, setShowToast] = useState(false);

  const handleReportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const appUri = "txeneza://";
    const fallbackTimeout = 1200;
    
    let appOpened = false;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        appOpened = true;
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.location.href = appUri;
    
    setTimeout(() => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (!appOpened) {
        setShowToast(true);
        const downloadSection = document.getElementById("download-app");
        if (downloadSection) {
          downloadSection.scrollIntoView({ behavior: "smooth" });
        }
        // Auto-fechar após 5 segundos
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    }, fallbackTimeout);
  };

  return (
    <section className="relative min-h-[95vh] pt-28 md:pt-36 pb-16 flex items-center overflow-hidden bg-gradient-to-b from-forestGreen via-background to-background dark:via-grey900 dark:to-grey900 text-foreground dark:text-grey50">
      {/* Background Graphic Patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-limeGreen/10 via-transparent to-transparent -z-10 pointer-events-none" />
      <div className="absolute top-[20%] left-[-10%] w-[45%] aspect-square rounded-full bg-forestGreen/30 filter blur-3xl -z-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center lg:justify-start gap-2.5 mx-auto lg:mx-0 w-fit px-4 py-1.5 rounded-full bg-limeGreen/10 border border-limeGreen/20 text-limeGreen text-xs font-extrabold tracking-wide uppercase"
            >
              <span className="w-2 h-2 rounded-full bg-limeGreen animate-ping" />
              Saneamento Inteligente • Cidade da Beira
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center justify-center lg:justify-start gap-4"
            >
              <img 
                src="/image/TXENEZA.png" 
                alt="Txeneza Logo" 
                className="w-14 h-18 sm:w-16 sm:h-20 object-contain shrink-0 filter drop-shadow-[0_8px_16px_rgba(181,242,48,0.15)]" 
              />
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none">
                <BrandName />
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-2xl font-semibold text-slate-700 dark:text-slate-200 leading-snug"
            >
              Por uma Beira mais limpa e saudável. Denuncie, mapeie e transforme a sua comunidade.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-sm sm:text-base text-slate-650 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Uma plataforma colaborativa que permite aos cidadãos reportar focos de lixo acumulado em segundos pelo telemóvel e ajuda o Município a priorizar as equipas de recolha.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-4"
            >
              <button
                onClick={handleReportClick}
                className="flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold bg-limeGreen text-forestGreen hover:bg-lightLime hover:scale-[1.02] shadow-xl shadow-limeGreen/20 active:scale-95 transition-all"
              >
                <PlusCircle className="w-5 h-5 stroke-[2.5]" />
                Denunciar um ponto de lixo
              </button>
              
              <a
                href="#mapa-preview"
                className="flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold bg-slate-100/80 text-slate-800 border border-slate-200 hover:bg-slate-250/80 dark:bg-white/5 dark:text-white dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-white/10 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500/20" />
                Ver mapa de calor
              </a>
            </motion.div>

            {/* Micro Scroll indicator (desktop only) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1 }}
              className="hidden lg:flex items-center gap-2 mt-8 text-xs text-slate-500 font-medium cursor-pointer"
            >
              <ArrowDown className="w-4 h-4 animate-bounce" />
              <span>Deslize para ver o estudo e o problema</span>
            </motion.div>
          </div>

          {/* Hero Right Content (Mockup) */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 50 }}
            className="lg:col-span-5 flex justify-center w-full relative"
          >
            {/* Imagem TXENEZA.png sem fundo ao lado esquerdo do telefone */}
            <motion.div 
              initial={{ opacity: 0, x: -35, rotate: -8 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="absolute left-[-70px] top-[25%] w-[120px] h-[150px] hidden xl:block pointer-events-none"
            >
              <img 
                src="/image/TXENEZA.png" 
                alt="Txeneza Brand Logo" 
                className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(181,242,48,0.15)]" 
              />
            </motion.div>
            <AppMockup />
          </motion.div>

        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] sm:w-full max-w-md"
          >
            <div className="bg-forestGreen/95 dark:bg-grey900/95 backdrop-blur-md border border-limeGreen/30 shadow-2xl rounded-2xl p-4 flex gap-3.5 items-start text-white">
              <div className="p-2 rounded-xl bg-limeGreen/10 border border-limeGreen/20 text-limeGreen shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-black uppercase tracking-wider text-limeGreen">
                  Aplicação não detetada
                </h5>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed font-sans break-words">
                  Para efetuar uma denúncia, necessita da aplicação <BrandName />. A encaminhar para a secção de descarregamento abaixo...
                </p>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
