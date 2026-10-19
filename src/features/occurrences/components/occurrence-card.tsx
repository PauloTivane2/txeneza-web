"use client";

import React, { useState } from "react";
import { Occurrence } from "@/features/occurrences/occurrences.types";
import { Badge } from "@/components/ui/badge";
import { MapPin, ImageOff, Calendar, Tag, AlertTriangle } from "lucide-react";
import { resolveBairro, FORA_DA_BEIRA } from "@/core/geo/beira-bairros";

interface OccurrenceCardProps {
  occurrence: Occurrence;
  onClick?: () => void;
}

export const OccurrenceCard: React.FC<OccurrenceCardProps> = ({ occurrence, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const rawLat = (occurrence as any)?.latitude ?? (occurrence as any)?.lat;
  const rawLng = (occurrence as any)?.longitude ?? (occurrence as any)?.lng ?? (occurrence as any)?.lon;
  const hasValidCoords = Number.isFinite(Number(rawLat)) && Number.isFinite(Number(rawLng));
  const lat = hasValidCoords ? Number(rawLat) : -19.8272;
  const lng = hasValidCoords ? Number(rawLng) : 34.8384;
  const geo = resolveBairro(lat, lng);
  const isFora = occurrence.bairro === FORA_DA_BEIRA || !geo.isDentroDaBeira;

  const getBadgeVariant = (status: Occurrence["status"]) => {
    switch (status) {
      case "pendente": return "warning";
      case "em-progresso": return "info";
      case "resolvido": return "success";
      case "rejeitado": return "error";
      default: return "default";
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-light-background dark:bg-dark-background border rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col ${
        isFora ? "border-amber-500/50 ring-1 ring-amber-500/20" : "border-grey200 dark:border-grey800"
      }`}
    >
      {/* Imagem da denúncia */}
      {occurrence.imageUrl && !imgError ? (
        <div className="relative w-full h-40 bg-grey100 dark:bg-grey900">
          <img
            src={occurrence.imageUrl}
            alt={occurrence.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            {isFora && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-md">
                <AlertTriangle className="w-2.5 h-2.5" />
                Fora da Beira
              </span>
            )}
            <Badge variant={getBadgeVariant(occurrence.status)}>
              {occurrence.status.toUpperCase()}
            </Badge>
          </div>
        </div>
      ) : (
        <div className="w-full h-24 bg-grey100 dark:bg-grey900 flex items-center justify-center text-grey400 dark:text-grey600">
          <ImageOff className="w-6 h-6" />
        </div>
      )}

      <div className="p-4 flex flex-col gap-3">
        {(!occurrence.imageUrl || imgError) && (
          <div className="flex justify-between items-center">
            {isFora ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                <AlertTriangle className="w-2.5 h-2.5" />
                Fora da Beira
              </span>
            ) : <div />}
            <Badge variant={getBadgeVariant(occurrence.status)}>
              {occurrence.status.toUpperCase()}
            </Badge>
          </div>
        )}

        <div>
          <h4 className="font-bold text-grey900 dark:text-grey50 leading-snug">{occurrence.title}</h4>
          <p className="text-sm text-grey600 dark:text-grey400 mt-1 leading-relaxed">
            {occurrence.description}
          </p>
        </div>

        <div className="flex flex-col gap-1.5 text-xs text-grey600 dark:text-grey400 border-t border-grey200 dark:border-grey800 pt-3">
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 shrink-0 text-forestGreen dark:text-limeGreen" />
            <span className="font-medium text-forestGreen dark:text-limeGreen">{occurrence.category}</span>
          </div>
          {isFora ? (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 p-1.5 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
              <span>Fora da Área Municipal ({geo.distanciaCentroKm} km)</span>
              <span className="ml-auto font-mono text-[10px] text-amber-600/70">
                {hasValidCoords ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : "—"}
              </span>
            </div>
          ) : occurrence.bairro && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{occurrence.bairro}</span>
              <span className="ml-auto font-mono text-[10px] text-grey400 dark:text-grey500">
                {hasValidCoords ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : "—"}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{new Date(occurrence.createdAt).toLocaleDateString("pt-PT", { timeZone: "Africa/Maputo" })}</span>
            {occurrence.reportedBy && (
              <span className="ml-auto truncate max-w-[55%] text-right">{occurrence.reportedBy}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
