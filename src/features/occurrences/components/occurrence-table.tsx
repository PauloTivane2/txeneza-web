"use client";

import React, { useState } from "react";
import { Occurrence } from "@/features/occurrences/occurrences.types";
import { OCCURRENCE_STATUS_META } from "@/features/occurrences/occurrence-status";
import { ImageIcon, MapPin, ChevronRight, Trash2, AlertTriangle } from "lucide-react";
import { resolveBairro, FORA_DA_BEIRA } from "@/core/geo/beira-bairros";
import { formatDate } from "@/lib/date";

interface OccurrenceTableProps {
  occurrences: Occurrence[];
  onSelect?: (occ: Occurrence) => void;
  onDelete?: (occ: Occurrence) => void;
}

const Thumb: React.FC<{ occ: Occurrence }> = ({ occ }) => {
  const [error, setError] = useState(false);
  if (!occ.imageUrl || error) {
    return (
      <div className="w-11 h-11 rounded-lg bg-grey100 dark:bg-grey800 flex items-center justify-center text-grey400 dark:text-grey600 shrink-0">
        <ImageIcon className="w-4 h-4" />
      </div>
    );
  }
  return (
    <img
      src={occ.imageUrl}
      alt={occ.title}
      onError={() => setError(true)}
      loading="lazy"
      className="w-11 h-11 rounded-lg object-cover shrink-0 border border-grey200 dark:border-grey800"
    />
  );
};

export const OccurrenceTable: React.FC<OccurrenceTableProps> = ({ occurrences, onSelect, onDelete }) => {
  return (
    <div className="w-full border border-grey200 dark:border-grey800 rounded-2xl bg-light-background dark:bg-dark-background overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-grey100 dark:bg-grey900/40 text-xs font-bold text-grey600 dark:text-grey400 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Ocorrência</th>
              <th className="px-5 py-3.5 hidden md:table-cell">Categoria</th>
              <th className="px-5 py-3.5 hidden lg:table-cell">Data</th>
              <th className="px-5 py-3.5">Estado</th>
              <th className="px-5 py-3.5 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-grey200 dark:divide-grey800">
            {occurrences.map((occ) => {
              const meta = OCCURRENCE_STATUS_META[occ.status];
              const geo = resolveBairro(occ.latitude, occ.longitude);
              const isFora = occ.bairro === FORA_DA_BEIRA || !geo.isDentroDaBeira;

              return (
                <tr
                  key={occ.id}
                  onClick={() => onSelect?.(occ)}
                  className={`hover:bg-grey100 dark:hover:bg-grey900/40 transition-colors cursor-pointer group ${
                    isFora ? "bg-amber-500/[0.04] dark:bg-amber-500/[0.06] border-l-4 border-l-amber-500" : ""
                  }`}
                >
                  {/* Ocorrência: miniatura + título + bairro */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Thumb occ={occ} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-grey900 dark:text-grey50 truncate max-w-[220px]">
                            {occ.title}
                          </p>
                          {isFora && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Fora da Área
                            </span>
                          )}
                        </div>

                        {/* Localização / Bairro com destaque */}
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          {isFora ? (
                            <span
                              className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md"
                              title={`Coordenadas a aprox. ${geo.distanciaCentroKm} km da Beira`}
                            >
                              <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                              Fora da Beira ({geo.distanciaCentroKm > 999 ? "+999" : geo.distanciaCentroKm} km)
                            </span>
                          ) : (
                            occ.bairro && (
                              <span className="inline-flex items-center gap-1 text-xs text-grey600 dark:text-grey400 font-medium">
                                <MapPin className="w-3 h-3 text-forestGreen dark:text-limeGreen shrink-0" />
                                {occ.bairro}
                              </span>
                            )
                          )}

                          {occ.reporterBairro && occ.reporterBairro !== occ.bairro && (
                            <span
                              className="text-[10px] text-grey600 dark:text-grey400 bg-grey200/60 dark:bg-grey800/80 px-1.5 py-0.5 rounded font-normal"
                              title={`Munícipe reside em: ${occ.reporterBairro}`}
                            >
                              Morador de {occ.reporterBairro}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Categoria */}
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-xs font-medium text-forestGreen dark:text-limeGreen bg-forestGreen/5 dark:bg-limeGreen/5 border border-forestGreen/10 dark:border-limeGreen/10 px-2.5 py-1 rounded-lg">
                      {occ.category}
                    </span>
                  </td>

                  {/* Data */}
                  <td className="px-5 py-3.5 hidden lg:table-cell text-grey600 dark:text-grey400">
                    {formatDate(occ.createdAt)}
                  </td>

                  {/* Estado */}
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold py-1 px-2.5 rounded-full border ${meta.badge}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>
                  </td>

                  {/* Ação */}
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onDelete && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(occ);
                          }}
                          title="Eliminar ocorrência"
                          className="p-1.5 rounded-lg text-grey400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-forestGreen dark:text-limeGreen opacity-70 group-hover:opacity-100 transition-opacity">
                        Ver detalhes
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
