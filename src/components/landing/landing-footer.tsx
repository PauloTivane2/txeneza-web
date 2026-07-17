"use client";

import React from "react";
import Link from "next/link";
import { Download, Landmark, ArrowRight, Shield } from "lucide-react";
import { BrandName } from "@/components/ui/brand-name";

export const LandingFooter: React.FC = () => {
  return (
    <footer id="download-app" className="bg-forestGreen border-t border-forestGreen/20 text-slate-300 py-16 px-4 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute bottom-0 right-0 w-[20%] aspect-square rounded-full bg-limeGreen/10 filter blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start mb-12">
          
          {/* Brand Left Column */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5 w-fit group">
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <img src="/image/TXENEZA.png" alt="Txeneza Logo" className="w-full h-full object-contain" />
              </div>
              <BrandName className="text-xl font-black tracking-tight" />
            </Link>
            <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-sm">
              Saneamento colaborativo digital para a Cidade da Beira. Mapeando e reportando focos de lixo urbano para um ambiente mais sustentável e saudável.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase text-white tracking-widest mb-1">Navegação</h4>
            <a href="#problema" className="text-xs text-slate-300 hover:text-limeGreen transition-colors">O Problema</a>
            <a href="#funcionamento" className="text-xs text-slate-300 hover:text-limeGreen transition-colors">Como Funciona</a>
            <a href="#mapa-preview" className="text-xs text-slate-300 hover:text-limeGreen transition-colors">O Mapa Público</a>
            <a href="#para-quem-e" className="text-xs text-slate-300 hover:text-limeGreen transition-colors">Público Beneficiário</a>
            <a href="#ods" className="text-xs text-slate-300 hover:text-limeGreen transition-colors font-semibold">Objectivos ODS</a>
          </div>

          {/* Download Column */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <h4 className="text-xs font-black uppercase text-white tracking-widest mb-1">Aplicação Móvel</h4>
            <p className="text-xs text-slate-300/95 max-w-xs leading-relaxed">
              Reporte lixo directamente da rua usando o GPS e câmera do seu smartphone. Compatível com Android 8.0 ou superior.
            </p>
            
            {/* APK Download with Select */}
            <div className="flex flex-col gap-2 w-full max-w-sm">
              <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 shadow-lg hover:border-limeGreen/30 transition-all">
                <Download className="w-5 h-5 text-limeGreen shrink-0 mr-3" />
                <div className="flex-1">
                  <span className="block text-[8px] text-limeGreen uppercase font-bold tracking-widest leading-none mb-1">Descarregar Aplicação</span>
                  <select
                    onChange={(e) => {
                      const url = e.target.value;
                      if (url) {
                        window.open(url, "_blank");
                        e.target.value = "";
                      }
                    }}
                    className="w-full bg-transparent text-xs font-extrabold text-white focus:outline-none cursor-pointer pr-6 appearance-none"
                    defaultValue=""
                  >
                    <option value="" disabled className="bg-slate-950 text-slate-400">Selecionar versão...</option>
                    <option value="https://download1980.mediafire.com/37949wi6fvsgbgCLo44x8LM9qCQ94Iuvr5vj4MWn4Fk-b6vi8g4-ifqUj4-0gOGHPeqpb-T4GpKUTnCQ_CKPMRiSkglII-zZ0Sf2ZnmTBU-XcT5yPlU3AhqioVT56QE0Z8qzhAvTMKEHZCwJqrjtUpcLFVlRmaJATic_Hg1NA8rPFo8/81hjrat7w2cs4g1/txeneza-arm64-v8a.apk" className="bg-slate-950 text-white">
                      Android ARM64-v8a (Celulares modernos)
                    </option>
                    <option value="https://www.mediafire.com/file/cg6dd9wato8y0uh/txeneza-armeabi-v7a.apk/file" className="bg-slate-950 text-white">
                      Android ARMeabi-v7a (Celulares antigos)
                    </option>
                    <option value="https://www.mediafire.com/file/inanxln0nz5d7in/txeneza-x86_64.apk/file" className="bg-slate-950 text-white">
                      Android Emulator x86_64 (PC)
                    </option>
                  </select>
                </div>
                <div className="absolute right-4 pointer-events-none text-slate-500 text-[10px]">▼</div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Divider */}
        <div className="h-[1px] bg-light-background dark:bg-dark-background/10 w-full my-8" />

        {/* Bottom Bar: Copyright and Discrete Admin Link */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} <BrandName />. Trabalho Acadêmico de Conclusão de Curso (Monografia) — Beira, Moçambique.
          </div>

          {/* Discrete Admin Link (Login / W2) */}
          <div className="flex items-center gap-5">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 hover:bg-light-background dark:bg-dark-background/5 text-[11px] font-bold text-slate-300 transition-all"
            >
              <Shield className="w-3.5 h-3.5 text-limeGreen" />
              Painel de Gestão (Proposta CMB)
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
