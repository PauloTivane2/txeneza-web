"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, Camera, ImageOff, ShieldCheck } from "lucide-react";
import { ResolutionVerification } from "../resolution-verification.types";

interface ResolutionGalleryProps {
  verifications: ResolutionVerification[];
}

const ResolutionImage: React.FC<{ v: ResolutionVerification }> = ({ v }) => {
  const [hasError, setHasError] = useState(false);

  if (!v.photoUrl || hasError) {
    return (
      <div className="w-full h-28 bg-grey100 dark:bg-grey900 flex flex-col items-center justify-center text-grey400 dark:text-grey600 gap-1.5 p-2">
        <ImageOff className="w-5 h-5" />
        <span className="text-[10px]">Imagem de prova</span>
      </div>
    );
  }

  return (
    <img
      src={v.photoUrl}
      alt="Prova de resolução"
      onError={() => setHasError(true)}
      loading="lazy"
      className="w-full h-28 object-cover"
    />
  );
};

/**
 * Galeria de provas de resolução (fotografias do local já limpo)
 * associadas a uma ocorrência.
 */
export const ResolutionGallery: React.FC<ResolutionGalleryProps> = ({ verifications }) => {
  if (verifications.length === 0) return null;

  return (
    <div className="p-6 bg-light-background dark:bg-dark-background border border-grey200 dark:border-grey800 rounded-2xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-xs font-bold text-grey600 dark:text-grey400 uppercase tracking-wider flex items-center gap-2">
          <Camera className="w-3.5 h-3.5" /> Provas de Resolução ({verifications.length})
        </h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forestGreen/10 dark:bg-limeGreen/10 text-forestGreen dark:text-limeGreen flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Registo Oficial
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {verifications.map((v) => (
          <div
            key={v.id}
            className="relative rounded-xl overflow-hidden border border-grey200 dark:border-grey800 group bg-grey50 dark:bg-grey900"
          >
            <ResolutionImage v={v} />

            <div className="absolute top-1.5 right-1.5 z-10">
              {v.result === "resolvida" ? (
                <span className="p-1 rounded-full bg-emerald-600 text-white shadow flex items-center justify-center" title="Intervenção registada como resolvida">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              ) : (
                <span className="p-1 rounded-full bg-red-600 text-white shadow flex items-center justify-center" title="Intervenção contestada">
                  <XCircle className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            <div className="absolute inset-x-0 bottom-0 bg-black/70 px-2 py-1 flex justify-between items-center text-[10px] text-white font-mono">
              <span>{new Date(v.createdAt).toLocaleDateString("pt-PT", { timeZone: "Africa/Maputo" })}</span>
              <span className="text-lime-400 font-bold">CMB</span>
            </div>

            {v.notes && (
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2.5 z-20">
                <p className="text-[10px] text-white text-center leading-relaxed">{v.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
