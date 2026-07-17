"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Flame, MapPin, Eye, ShieldAlert, Sparkles } from "lucide-react";
import { BrandName } from "@/components/ui/brand-name";

export const MapPreviewSection: React.FC = () => {
  const [mapMode, setMapMode] = useState<"markers" | "heatmap">("markers");
  const [selectedPin, setSelectedPin] = useState<number | null>(null);

  const mockOccurrences = [
    {
      id: 1,
      title: "Grande Acúmulo de Plásticos",
      bairro: "Munhava",
      gravidade: "Crítico",
      desc: "Lixo acumulado na berma da vala de drenagem bloqueando fluxo.",
      lat: "25%",
      lng: "35%",
      intensity: 0.9,
    },
    {
      id: 2,
      title: "Resíduos Hospitalares Descartados",
      bairro: "Chota",
      gravidade: "Crítico",
      desc: "Material contaminado encontrado em terreno baldio residencial.",
      lat: "45%",
      lng: "68%",
      intensity: 0.95,
    },
    {
      id: 3,
      title: "Foco de Entulho e Sucata",
      bairro: "Matacuane",
      gravidade: "Médio",
      desc: "Restos de construções acumulados na calçada de pedestres.",
      lat: "70%",
      lng: "25%",
      intensity: 0.6,
    },
    {
      id: 4,
      title: "Lixeira Clandestina",
      bairro: "Inhamizua",
      gravidade: "Alta",
      desc: "Acúmulo orgânico gerando mau cheiro e proliferação de insetos.",
      lat: "75%",
      lng: "65%",
      intensity: 0.8,
    },
  ];

  return (
    <section id="mapa-preview" className="py-20 md:py-28 bg-slate-50 dark:bg-grey900/50 text-foreground dark:text-grey50 relative border-y border-slate-100 dark:border-slate-800/50">
      <div className="absolute top-10 left-10 w-[20%] aspect-square rounded-full bg-forestGreen/10 filter blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span className="text-xs font-black tracking-widest text-limeGreen uppercase">Visualização de Dados</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mt-3">
            O Que o <BrandName /> Mostra
          </h2>
          <p className="text-slate-605 dark:text-slate-400 mt-4 text-sm sm:text-base leading-relaxed">
            Consulte as ocorrências em tempo real. A plataforma oferece duas formas complementares de visualizar a gravidade do problema na Beira: marcadores detalhados e mapas térmicos.
          </p>
        </div>

        {/* Mode Toggle Controls */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-background/80 dark:bg-slate-950/80 border border-slate-205 dark:border-slate-800 shadow-xl">
            <button
              onClick={() => {
                setMapMode("markers");
                setSelectedPin(null);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                mapMode === "markers"
                  ? "bg-forestGreen text-white shadow-lg"
                  : "text-slate-505 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <MapPin className="w-4 h-4" />
              Marcadores Públicos
            </button>
            <button
              onClick={() => {
                setMapMode("heatmap");
                setSelectedPin(null);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                mapMode === "heatmap"
                  ? "bg-forestGreen text-white shadow-lg"
                  : "text-slate-505 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500/20" />
              Mapa de Calor
            </button>
          </div>
        </div>

        {/* Dashboard Mockup Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Description Column */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-background/80 dark:bg-white/5 border border-slate-205 dark:border-slate-800 flex flex-col gap-5">
              <span className="flex items-center gap-2 text-xs font-bold text-limeGreen">
                <Sparkles className="w-4 h-4" />
                Destaque do Sistema
              </span>
              
              <AnimatePresence mode="wait">
                {mapMode === "markers" ? (
                  <motion.div
                    key="markers-text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-3"
                  >
                    <h3 className="text-xl font-bold text-foreground dark:text-white">Mapa de Marcadores</h3>
                    <p className="text-xs sm:text-sm text-slate-605 dark:text-slate-400 leading-relaxed">
                      Cada ponto reportado gera um marcador interativo. Ao clicar, moradores e vereadores veem fotos, gravidade, data e descrição. Ajuda a identificar incidentes individuais no seu bairro.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="heatmap-text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-3"
                  >
                    <h3 className="text-xl font-bold text-foreground dark:text-white">Zonas Críticas</h3>
                    <p className="text-xs sm:text-sm text-slate-605 dark:text-slate-400 leading-relaxed">
                      O algoritmo analisa a densidade e proximidade dos reportes, gerando &ldquo;manchas térmicas&rdquo; coloridas. Quanto mais denso e severo o lixo acumulado, mais quente fica a cor no mapa.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="h-[1px] bg-slate-100 dark:bg-grey900/90 my-1" />

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-3 text-xs text-slate-605 dark:text-slate-300">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-650 shrink-0" />
                  <span>Crítico (Ações imediatas CMB)</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-605 dark:text-slate-300">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                  <span>Alta gravidade (Programação semanal)</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-605 dark:text-slate-300">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span>Média gravidade (Monitorização)</span>
                </div>
              </div>
            </div>

            {/* Micro Interaction tip */}
            <div className="hidden lg:flex items-center gap-3 p-5 rounded-2xl bg-forestGreen/10 border border-forestGreen/20 text-xs text-slate-300">
              <Eye className="w-4.5 h-4.5 text-limeGreen shrink-0" />
              <span>Experimente alterar as abas de visualização acima para ver a simulação dinâmica.</span>
            </div>
          </div>

          {/* Right Simulated Map Dashboard */}
          <div className="lg:col-span-8 bg-background dark:bg-slate-950 rounded-3xl border border-slate-205 dark:border-slate-800 overflow-hidden flex flex-col h-[480px] sm:h-[520px] shadow-2xl relative">
            
            {/* Map Header Panel */}
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-grey900/90 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2 text-slate-605 dark:text-slate-300">
                <Map className="w-4.5 h-4.5 text-limeGreen" />
                <span>Consola Pública de Monitoramento • Beira, MZ</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Live</span>
              </div>
            </div>

            {/* Map Body Canvas */}
            <div className="flex-1 relative bg-slate-50/50 dark:bg-slate-950 overflow-hidden flex items-center justify-center">
              
              {/* Map Outline paths simulation */}
              <svg className="absolute inset-0 w-full h-full stroke-slate-800/80 stroke-[2] fill-transparent pointer-events-none" viewBox="0 0 800 500">
                {/* Coastal outline of Beira and some river channels */}
                <path d="M 50,450 C 150,400 250,430 350,380 C 450,330 500,280 600,320 C 700,360 750,220 820,180" strokeWidth="3" className="stroke-slate-750" />
                {/* Streets networks */}
                <path d="M 100,50 L 100,450" />
                <path d="M 250,50 L 250,450" />
                <path d="M 450,50 L 450,450" />
                <path d="M 650,50 L 650,450" />
                <path d="M 50,150 L 750,150" />
                <path d="M 50,300 L 750,300" />
                <path d="M 100,150 L 250,300" />
                <path d="M 450,150 L 650,300" />
              </svg>

              {/* Neighborhood Overlay Labels */}
              <span className="absolute top-12 left-16 text-[10px] text-slate-600 font-extrabold uppercase tracking-widest">Munhava</span>
              <span className="absolute top-24 right-32 text-[10px] text-slate-600 font-extrabold uppercase tracking-widest">Chota</span>
              <span className="absolute bottom-24 left-24 text-[10px] text-slate-600 font-extrabold uppercase tracking-widest">Matacuane</span>
              <span className="absolute bottom-16 right-28 text-[10px] text-slate-600 font-extrabold uppercase tracking-widest">Inhamizua</span>

              {/* HEATMAP LAYER */}
              <AnimatePresence>
                {mapMode === "heatmap" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    {/* Munhava Hotspot */}
                    <div className="absolute top-[25%] left-[35%] w-36 h-36 -translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full filter blur-2xl opacity-80 mix-blend-screen" />
                    <div className="absolute top-[25%] left-[35%] w-20 h-20 -translate-x-1/2 -translate-y-1/2 bg-orange-500 rounded-full filter blur-xl opacity-90 mix-blend-screen" />

                    {/* Chota Hotspot */}
                    <div className="absolute top-[45%] left-[68%] w-44 h-44 -translate-x-1/2 -translate-y-1/2 bg-red-650 rounded-full filter blur-2xl opacity-85 mix-blend-screen" />
                    <div className="absolute top-[45%] left-[68%] w-24 h-24 -translate-x-1/2 -translate-y-1/2 bg-amber-500 rounded-full filter blur-xl opacity-95 mix-blend-screen" />

                    {/* Matacuane Hotspot */}
                    <div className="absolute top-[70%] left-[25%] w-24 h-24 -translate-x-1/2 -translate-y-1/2 bg-amber-600 rounded-full filter blur-xl opacity-70 mix-blend-screen" />

                    {/* Inhamizua Hotspot */}
                    <div className="absolute top-[75%] left-[65%] w-32 h-32 -translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full filter blur-2xl opacity-75 mix-blend-screen" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* PINS LAYER */}
              <AnimatePresence>
                {mapMode === "markers" && (
                  <>
                    {mockOccurrences.map((pin) => (
                      <motion.button
                        key={pin.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.2, zIndex: 50 }}
                        onClick={() => setSelectedPin(pin.id)}
                        style={{ top: pin.lat, left: pin.lng }}
                        className="absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer group"
                      >
                        {/* Pulse */}
                        <span className={`absolute inset-0 rounded-full animate-ping opacity-25 ${
                          pin.gravidade === "Crítico" ? "bg-red-500" : "bg-orange-500"
                        }`} />
                        {/* Pin body */}
                        <div className={`w-4.5 h-4.5 rounded-full border border-white flex items-center justify-center shadow-lg relative ${
                          pin.gravidade === "Crítico" ? "bg-red-600" : "bg-orange-500"
                        }`}>
                          <div className="w-1.5 h-1.5 bg-light-background dark:bg-dark-background rounded-full" />
                        </div>
                      </motion.button>
                    ))}
                  </>
                )}
              </AnimatePresence>

              {/* Selected Pin Details Overlay Card */}
              <AnimatePresence>
                {selectedPin !== null && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    className="absolute bottom-6 left-6 right-6 bg-background/95 dark:bg-grey900/95 backdrop-blur-md border border-slate-205 dark:border-slate-800 p-4 rounded-2xl shadow-2xl z-50 flex flex-col gap-3"
                  >
                    {(() => {
                      const pin = mockOccurrences.find((p) => p.id === selectedPin);
                      if (!pin) return null;
                      return (
                        <>
                          <div className="flex justify-between items-start">
                            <div className="flex gap-2.5 items-center">
                              <div className="w-7 h-7 rounded-lg bg-red-955 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                                <ShieldAlert className="w-4.5 h-4.5" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-sm text-foreground dark:text-white">{pin.title}</h4>
                                <span className="text-[10px] text-slate-605 dark:text-slate-400">Bairro: {pin.bairro}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => setSelectedPin(null)}
                              className="text-[10px] text-slate-605 dark:text-slate-400 hover:text-foreground dark:hover:text-white px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md transition-colors"
                            >
                              Fechar
                            </button>
                          </div>
                          <p className="text-xs text-slate-605 dark:text-slate-400 leading-relaxed">{pin.desc}</p>
                          <div className="flex items-center justify-between mt-1 text-[10px]">
                            <div className="flex gap-2">
                              <span className="px-2 py-0.5 bg-red-500/20 text-red-450 rounded-full font-bold">
                                {pin.gravidade}
                              </span>
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-605 dark:text-slate-400 rounded-full">
                                Pendente
                              </span>
                            </div>
                            <span className="text-slate-500">Hoje às 06:12</span>
                          </div>
                        </>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
