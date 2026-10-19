"use client";

import React, { useEffect, useState } from "react";
// @ts-ignore
import Map, { Source, Layer, NavigationControl, ScaleControl } from "react-map-gl/mapbox";
import { Flame, Radio, AlertTriangle } from "lucide-react";
import { env } from "@/core/env";
import { MapStyleToggle, MapStyleMode } from "./map-style-toggle";

import "mapbox-gl/dist/mapbox-gl.css";

interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

interface HeatmapViewProps {
  data?: HeatmapPoint[];
  center?: [number, number];
  zoom?: number;
}

// Rampa de calor: verde-floresta (baixa) → lima (média) → âmbar/vermelho (crítica).
// Baixo/médio mantêm a identidade da marca; o pico usa cores de urgência para
// sinalizar as zonas mais críticas de forma imediata e realista.
const HEAT_STOPS = [
  { d: 0.0, color: "rgba(1, 64, 58, 0)" },
  { d: 0.15, color: "rgba(1, 64, 58, 0.35)" },
  { d: 0.3, color: "rgba(173, 217, 184, 0.55)" },
  { d: 0.45, color: "rgba(181, 242, 48, 0.75)" },
  { d: 0.6, color: "rgba(250, 204, 21, 0.85)" },
  { d: 0.8, color: "rgba(234, 88, 12, 0.9)" },
  { d: 1.0, color: "#DC2626" },
];

const heatmapColor: any = [
  "interpolate",
  ["linear"],
  ["heatmap-density"],
  ...HEAT_STOPS.flatMap((s) => [s.d, s.color]),
];

// Cor dos pontos individuais (visíveis ao aproximar), em função da intensidade.
const circleColor: any = [
  "interpolate",
  ["linear"],
  ["get", "intensity"],
  0.2, "#ADD9B8",
  0.45, "#B5F230",
  0.6, "#FACC15",
  0.8, "#EA580C",
  1.0, "#DC2626",
];

export const HeatmapView: React.FC<HeatmapViewProps> = ({
  data = [],
  center = [-19.8272, 34.8384],
  zoom = 12,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const [styleMode, setStyleMode] = useState<MapStyleMode>("normal");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[600px] bg-grey100 dark:bg-grey950 animate-pulse rounded-2xl flex items-center justify-center border border-grey200 dark:border-grey800">
        <span className="text-grey600 dark:text-grey500 text-sm">A carregar mapa de calor...</span>
      </div>
    );
  }

  const geojsonSource: any = {
    type: "FeatureCollection",
    features: data
      .filter((point) => point && Number.isFinite(Number(point.lng)) && Number.isFinite(Number(point.lat)))
      .map((point) => ({
        type: "Feature" as const,
        properties: {
          intensity: point.intensity || 1,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [Number(point.lng), Number(point.lat)],
        },
      })),
  };

  return (
    <div className="relative w-full h-[600px] bg-grey100 dark:bg-grey950 rounded-2xl overflow-hidden border border-grey200 dark:border-grey800 shadow-sm transition-all duration-300">
      
      {/* Banner de Conectividade Instável */}
      {connectionWarning && (
        <div className="absolute top-16 left-4 right-4 z-20 flex items-start gap-2.5 p-3.5 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl backdrop-blur-md text-xs font-bold animate-fadeIn">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="flex-1 leading-normal">
            Contexto de Baixa Conectividade: Texturas do mapa (ruas e relevo) indisponíveis devido a oscilações de rede. A camada térmica do mapa de calor de Beira continua operacional com dados em cache local.
          </div>
          <button 
            onClick={() => setConnectionWarning(false)}
            className="px-2 py-1 hover:bg-amber-500/20 rounded-lg transition-colors shrink-0 text-[10px] font-black uppercase"
          >
            Dispensar
          </button>
        </div>
      )}

      {/* Badge flutuante — identificação da camada */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 bg-forestGreen/90 dark:bg-grey900/85 backdrop-blur-md rounded-xl border border-limeGreen/25 shadow-lg">
        <Flame className="w-4 h-4 text-limeGreen" />
        <span className="text-xs font-black text-white uppercase tracking-wider">Mapa de Calor</span>
        <span className="text-[8px] tracking-wider uppercase px-1.5 py-0.5 bg-limeGreen/20 text-limeGreen rounded-md font-black border border-limeGreen/20">
          Densidade estimada
        </span>
      </div>

      {/* Legenda flutuante */}
      <div className="absolute bottom-8 left-4 z-10 flex flex-col gap-1.5 px-3 py-2.5 bg-light-background/85 dark:bg-grey900/85 backdrop-blur-md rounded-xl border border-grey200 dark:border-grey800/80 shadow-lg">
        <span className="text-[10px] font-bold text-grey600 dark:text-grey400 uppercase tracking-wider">
          Densidade de resíduos
        </span>
        <div className="flex items-center gap-1.5">
          <div
            className="h-2 w-32 rounded-full"
            style={{
              background:
                "linear-gradient(to right, #01403A, #ADD9B8, #B5F230, #FACC15, #EA580C, #DC2626)",
            }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-grey600 dark:text-grey500 font-mono">
          <span>Baixa</span>
          <span>Moderada</span>
          <span>Crítica</span>
        </div>
      </div>

      {/* Estatística flutuante — pontos monitorizados */}
      <div className="absolute top-4 right-14 z-10 flex flex-col gap-0.5 px-3 py-2 bg-light-background/85 dark:bg-grey900/85 backdrop-blur-md rounded-xl border border-grey200 dark:border-grey800/80 shadow-lg">
        <div className="flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-limeGreen" />
          <span className="text-[10px] font-bold text-grey900 dark:text-grey50 uppercase tracking-wider">
            Pontos monitorizados
          </span>
        </div>
        <span className="text-lg font-black text-forestGreen dark:text-limeGreen leading-none">
          {data.length}
        </span>
      </div>

      {/* Alternância de estilo do mapa (Normal / Satélite) */}
      <div className="absolute bottom-8 right-4 z-20">
        <MapStyleToggle mode={styleMode} onChange={setStyleMode} />
      </div>

      <Map
        initialViewState={{
          latitude: center[0],
          longitude: center[1],
          zoom: zoom,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={styleMode === "satellite" ? env.mapboxStyles.satellite : env.mapboxStyles.normal}
        mapboxAccessToken={env.mapboxToken}
        attributionControl={false}
        onError={() => {
          if (!connectionWarning) {
            setConnectionWarning(true);
          }
        }}
      >
        <NavigationControl position="top-right" showCompass={false} />
        <ScaleControl position="bottom-right" maxWidth={120} unit="metric" />

        <Source id="heatmap-source" type="geojson" data={geojsonSource}>
          {/* Camada de calor — domina em vista afastada */}
          <Layer
            id="heatmap-layer"
            type="heatmap"
            maxzoom={16}
            paint={{
              "heatmap-weight": ["interpolate", ["linear"], ["get", "intensity"], 0, 0, 1, 1],
              "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 8, 1, 15, 3],
              "heatmap-color": heatmapColor,
              "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 8, 18, 13, 34, 16, 56],
              // Desvanece à medida que se aproxima, dando lugar aos pontos individuais.
              "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0.9, 16, 0],
            }}
          />

          {/* Camada de pontos — surge em vista aproximada */}
          <Layer
            id="heatmap-points"
            type="circle"
            minzoom={13}
            paint={{
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                13, ["interpolate", ["linear"], ["get", "intensity"], 0, 2, 1, 6],
                18, ["interpolate", ["linear"], ["get", "intensity"], 0, 6, 1, 20],
              ],
              "circle-color": circleColor,
              "circle-stroke-color": "rgba(255,255,255,0.85)",
              "circle-stroke-width": 1,
              "circle-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0, 15, 0.85],
            }}
          />
        </Source>
      </Map>
    </div>
  );
};
