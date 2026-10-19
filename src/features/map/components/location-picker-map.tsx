"use client";

import React, { useEffect, useRef, useState } from "react";
// @ts-ignore
import Map, { Marker } from "react-map-gl/mapbox";
import { MapPin } from "lucide-react";
import { env } from "@/core/env";
import { LocationSearchInput } from "./location-search-input";
import { GeocodingResult } from "@/features/map/geocoding.service";

import "mapbox-gl/dist/mapbox-gl.css";

// Centro por defeito: Praça do Município da Beira.
const DEFAULT_CENTER: [number, number] = [-19.8272, 34.8384]; // [lat, lng]
const DEFAULT_ZOOM = 14;

interface LocationPickerMapProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (latitude: number, longitude: number) => void;
}

/**
 * Mapa interativo usado para definir a localização de um ponto de recolha:
 * - Clicar em qualquer sítio do mapa move o pin para lá.
 * - O pin é arrastável, para afinação sem ter de clicar de novo.
 * - Uma barra de pesquisa de endereço/local (Mapbox Geocoding, restrita à
 *   Beira) permite saltar diretamente para um local pesquisado.
 *
 * Mantém-se sempre no estilo claro do mapa (ver map-view.tsx / heatmap-view.tsx
 * — o mapa nunca deve seguir o dark mode do site).
 */
export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  latitude,
  longitude,
  onChange,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const pinLat = latitude ?? DEFAULT_CENTER[0];
  const pinLng = longitude ?? DEFAULT_CENTER[1];

  const handleMapClick = (e: any) => {
    const { lat, lng } = e.lngLat;
    onChange(lat, lng);
  };

  const handleMarkerDragEnd = (e: any) => {
    const { lat, lng } = e.lngLat;
    onChange(lat, lng);
  };

  const handleSearchSelect = (result: GeocodingResult) => {
    onChange(result.latitude, result.longitude);
    mapRef.current?.flyTo({
      center: [result.longitude, result.latitude],
      zoom: 16,
      duration: 900,
    });
  };

  if (!isMounted) {
    return (
      <div className="w-full h-[320px] bg-grey100 animate-pulse rounded-xl flex items-center justify-center border border-grey200">
        <span className="text-grey600 text-sm">A carregar mapa...</span>
      </div>
    );
  }

  const [mapLoaded, setMapLoaded] = useState(false);

  return (
    <div className="flex flex-col gap-2.5">
      <LocationSearchInput onSelect={handleSearchSelect} />

      <div className="relative w-full h-[320px] rounded-xl overflow-hidden border border-grey200 shadow-sm">
        <Map
          ref={mapRef}
          initialViewState={{
            latitude: pinLat,
            longitude: pinLng,
            zoom: DEFAULT_ZOOM,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/light-v11"
          mapboxAccessToken={env.mapboxToken}
          onLoad={() => setMapLoaded(true)}
          onClick={handleMapClick}
          cursor="pointer"
        >
          {mapLoaded && (
            <Marker
              latitude={pinLat}
              longitude={pinLng}
              anchor="bottom"
              draggable
              onDragEnd={handleMarkerDragEnd}
            >
              <div className="cursor-grab active:cursor-grabbing -mt-1">
                <MapPin className="w-8 h-8 text-red-500 drop-shadow-lg" fill="currentColor" strokeWidth={1.5} stroke="white" />
              </div>
            </Marker>
          )}
        </Map>

        <div className="absolute bottom-2 left-2 right-2 flex justify-center pointer-events-none">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-grey600 shadow-sm">
            Clique no mapa ou arraste o pin para ajustar
          </span>
        </div>
      </div>
    </div>
  );
};
