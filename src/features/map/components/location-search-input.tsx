"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, Loader2, MapPin } from "lucide-react";
import { searchBeiraPlaces, GeocodingResult } from "@/features/map/geocoding.service";

interface LocationSearchInputProps {
  onSelect: (result: GeocodingResult) => void;
  placeholder?: string;
}

const DEBOUNCE_MS = 350;

export const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  onSelect,
  placeholder = "Pesquisar local (ex.: Mercado Central)",
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const found = await searchBeiraPlaces(query);
      setResults(found);
      setLoading(false);
      setOpen(true);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Fecha a lista de resultados ao clicar fora.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (result: GeocodingResult) => {
    onSelect(result);
    setQuery(result.placeName);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-grey400">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-white dark:bg-grey950 border border-grey200 dark:border-grey800 rounded-xl py-2.5 pl-9 pr-3.5 text-sm text-grey900 dark:text-grey50 placeholder:text-grey400 dark:placeholder:text-grey600 focus:outline-none focus:border-limeGreen/60 focus:ring-2 focus:ring-limeGreen/10 transition-all shadow-sm"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-30 top-full mt-1.5 w-full bg-white dark:bg-grey900 border border-grey200 dark:border-grey800 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.id}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-grey100 dark:hover:bg-grey800 transition-colors border-b border-grey100 dark:border-grey800 last:border-b-0"
            >
              <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-forestGreen dark:text-limeGreen" />
              <span className="text-xs text-grey800 dark:text-grey200 leading-snug">{result.placeName}</span>
            </button>
          ))}
        </div>
      )}

      {open && !loading && query.trim().length >= 3 && results.length === 0 && (
        <div className="absolute z-30 top-full mt-1.5 w-full bg-white dark:bg-grey900 border border-grey200 dark:border-grey800 rounded-xl shadow-xl px-3.5 py-3 text-xs text-grey500 dark:text-grey400">
          Nenhum local encontrado na região da Beira.
        </div>
      )}
    </div>
  );
};
