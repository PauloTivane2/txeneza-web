"use client";

import React, { useEffect, useState } from "react";
import { MapView, PontoRecolhaMapData } from "@/features/map/components/map-view";
import { useMapStore } from "@/features/map/map.store";
import { MapSkeleton } from "@/features/map/components/map-skeleton";
import { OccurrenceCard } from "@/features/occurrences/components/occurrence-card";
import { Map as MapIcon, MapPin, Info, X, WifiOff, AlertTriangle } from "lucide-react";

export default function AdminMapPage() {
  const { markers, fetchMapData, loading, selectedOccurrence, setSelectedOccurrence } = useMapStore();
  const [collectionPoints, setCollectionPoints] = useState<PontoRecolhaMapData[]>([]);
  const [pointsError, setPointsError] = useState<string | null>(null);
  const [pointsLoading, setPointsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    fetchMapData();

    const loadPoints = async () => {
      try {
        setPointsLoading(true);
        const res = await fetch("/api/pontos-recolha");
        if (!res.ok) throw new Error(`API devolveu estado ${res.status}`);
        const data = await res.json();
        // Apenas pontos reais cadastrados na base de dados — sem dados de demonstração.
        setCollectionPoints(Array.isArray(data) ? data : []);
        setPointsError(null);
      } catch (error) {
        console.error("Erro ao carregar pontos de recolha:", error);
        setCollectionPoints([]);
        setPointsError("Não foi possível carregar os pontos de recolha da base de dados.");
      } finally {
        setPointsLoading(false);
      }
    };
    loadPoints();
  }, [fetchMapData, mounted]);

  if (!mounted || pointsLoading || (loading && markers.length === 0)) {
    return <MapSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-forestGreen/10 dark:bg-limeGreen/10 rounded-xl">
            <MapIcon className="w-6 h-6 text-forestGreen dark:text-limeGreen" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-grey900 dark:text-grey50">
              Mapa de Ocorrências
            </h1>
            <p className="text-grey600 dark:text-grey400 text-sm mt-0.5">
              Visualização georreferenciada dos focos de resíduos denunciados e dos pontos de recolha do CMB.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/5 border border-amber-500/15 rounded-xl">
          <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-500" />
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-500 leading-tight max-w-[190px]">
            Detalhes no painel lateral para poupar dados em baixa conectividade
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa */}
        <div className="lg:col-span-2">
          <MapView
            markers={markers}
            collectionPoints={collectionPoints}
            onMarkerClick={(occ) => setSelectedOccurrence(occ)}
          />
        </div>

        {/* Painel lateral */}
        <div className="flex flex-col gap-4">
          {/* Legenda */}
          <div className="p-4 bg-light-background dark:bg-dark-background border border-grey200 dark:border-grey800 rounded-2xl">
            <h3 className="text-xs font-bold text-grey600 dark:text-grey400 uppercase tracking-wider mb-3">
              Legenda
            </h3>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="p-1 bg-grey900/90 border border-limeGreen/40 rounded-lg shrink-0">
                  <MapPin className="w-4 h-4 text-red-500" />
                </span>
                <span className="text-grey900 dark:text-grey50">Foco de resíduos denunciado</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="p-1 bg-amber-500 border border-amber-300 rounded-lg shrink-0">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </span>
                <span className="text-grey900 dark:text-grey50">Ocorrência fora da Beira</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="p-1 bg-forestGreen border border-limeGreen rounded-full shrink-0 w-6 h-6 flex items-center justify-center">
                  <img src="/icons/TXENEZA.svg" alt="Ponto de recolha" className="w-3.5 h-3.5 object-contain" />
                </span>
                <span className="text-grey900 dark:text-grey50">Ponto de recolha oficial (CMB)</span>
              </div>
            </div>
          </div>

          {/* Contagens */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-light-background dark:bg-dark-background border border-grey200 dark:border-grey800 rounded-xl">
              <p className="text-[11px] font-bold text-grey600 dark:text-grey400 uppercase tracking-wider">Denúncias</p>
              <p className="text-xl font-black text-red-500">{markers.length}</p>
            </div>
            <div className="p-3 bg-light-background dark:bg-dark-background border border-grey200 dark:border-grey800 rounded-xl">
              <p className="text-[11px] font-bold text-grey600 dark:text-grey400 uppercase tracking-wider">Pontos CMB</p>
              <p className="text-xl font-black text-forestGreen dark:text-limeGreen">{collectionPoints.length}</p>
            </div>
          </div>

          {pointsError ? (
            <div className="flex items-center gap-2 p-3 bg-red-500/5 border border-red-500/15 rounded-xl text-xs text-red-700 dark:text-red-400">
              <WifiOff className="w-4 h-4 shrink-0" />
              <span>{pointsError}</span>
            </div>
          ) : collectionPoints.length === 0 ? (
            <div className="flex items-center gap-2 p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl text-xs text-amber-700 dark:text-amber-500">
              <Info className="w-4 h-4 shrink-0" />
              <span>Ainda não há pontos de recolha cadastrados na base de dados.</span>
            </div>
          ) : null}

          {/* Detalhe selecionado */}
          {selectedOccurrence ? (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-grey600 dark:text-grey400 uppercase tracking-wider">
                  Denúncia selecionada
                </h3>
                <button
                  onClick={() => setSelectedOccurrence(null)}
                  className="flex items-center gap-1 text-xs text-grey600 dark:text-grey400 hover:text-grey900 dark:hover:text-grey50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Limpar
                </button>
              </div>
              <OccurrenceCard occurrence={selectedOccurrence} />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center p-6 border border-dashed border-grey300 dark:border-grey700 rounded-2xl text-grey500 dark:text-grey500">
              <Info className="w-5 h-5" />
              <p className="text-sm">
                Selecione um <b className="text-red-500">foco de resíduos</b> no mapa para ver os detalhes e a fotografia
                da denúncia aqui.
              </p>
              <p className="text-xs text-grey400 dark:text-grey600">
                Os pontos de recolha abrem uma janela informativa diretamente no mapa.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
