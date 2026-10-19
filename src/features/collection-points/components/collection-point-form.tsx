"use client";

import React from "react";
import { MapPin, Plus, Loader2, Pencil, X, CheckCircle2, XCircle, AlertTriangle, ArrowLeftRight } from "lucide-react";
import dynamic from "next/dynamic";
import { Combobox } from "@/components/ui/combobox";
import { BAIRROS_BEIRA_NOMES } from "@/core/geo/beira-bairros";

const LocationPickerMap = dynamic(
  () => import("@/features/map/components/location-picker-map").then((m) => m.LocationPickerMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[320px] bg-grey100 dark:bg-grey900 animate-pulse rounded-xl flex items-center justify-center border border-grey200 dark:border-grey800">
        <span className="text-grey600 dark:text-grey400 text-sm">A carregar mapa...</span>
      </div>
    ),
  }
);

interface CollectionPointFormProps {
  form: {
    nome: string;
    setNome: (v: string) => void;
    latitude: string;
    setLatitude: (v: string) => void;
    longitude: string;
    setLongitude: (v: string) => void;
    bairro: string;
    setBairro: (v: string) => void;
    horario: string;
    setHorario: (v: string) => void;
    estado: "activo" | "inactivo";
    setEstado: (v: "activo" | "inactivo") => void;
    handleSelectLocation: (lat: number, lng: number) => void;
    handleSwapCoordinates: () => void;
    isSwapSuspected: boolean;
    isOutsideBounds: boolean;
    confirmOutsideBounds: boolean;
    setConfirmOutsideBounds: (v: boolean) => void;
    editingId: string | null;
  };
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  isEditing: boolean;
  onCancel: () => void;
}

const inputClass =
  "w-full bg-grey100 dark:bg-grey950 border border-grey200 dark:border-grey800 rounded-xl py-2.5 px-3.5 text-sm text-grey900 dark:text-grey50 placeholder:text-grey400 dark:placeholder:text-grey600 focus:outline-none focus:border-limeGreen/50 focus:ring-2 focus:ring-limeGreen/10 transition-all";

const labelClass =
  "text-xs font-bold text-grey600 dark:text-grey400 uppercase tracking-wider";

export const CollectionPointForm: React.FC<CollectionPointFormProps> = ({
  form,
  onSubmit,
  submitting,
  isEditing,
  onCancel,
}) => {
  return (
    <div className="p-6 bg-light-background dark:bg-dark-background border border-grey200 dark:border-grey800 rounded-2xl shadow-sm sticky top-24">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-forestGreen/10 dark:bg-limeGreen/10 rounded-lg text-forestGreen dark:text-limeGreen">
            {isEditing ? <Pencil className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
          </div>
          <h3 className="text-lg font-bold text-grey900 dark:text-grey50">
            {isEditing ? "Editar Ponto" : "Registar Ponto"}
          </h3>
        </div>
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1 text-xs font-bold text-grey600 dark:text-grey400 hover:text-grey900 dark:hover:text-grey50 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Cancelar
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {/* Nome */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Nome do Local *</label>
          <input
            type="text"
            required
            placeholder="Ex: Ecoponto Praça da Beira"
            value={form.nome}
            onChange={(e) => form.setNome(e.target.value)}
            disabled={submitting}
            className={inputClass}
          />
        </div>

        {/* Bairro — Combobox */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Bairro *</label>
          <Combobox
            options={BAIRROS_BEIRA_NOMES}
            value={form.bairro}
            onChange={form.setBairro}
            placeholder="Selecione o bairro"
            searchPlaceholder="Pesquisar bairro..."
            emptyMessage="Bairro não encontrado."
            disabled={submitting}
          />
          <span className="text-[10px] text-grey500 dark:text-grey500">
            As coordenadas são sugeridas automaticamente ao escolher o bairro.
          </span>
        </div>

        {/* Localização — mapa interativo (clique/arrasto do pin + pesquisa) */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Localização *</label>
          <LocationPickerMap
            key={form.editingId ?? "new"}
            latitude={form.latitude ? parseFloat(form.latitude) : null}
            longitude={form.longitude ? parseFloat(form.longitude) : null}
            onChange={form.handleSelectLocation}
          />

          {/* Coordenadas — só leitura, refletem o pin no mapa acima */}
          <div className="grid grid-cols-2 gap-3 mt-1">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-grey500 uppercase tracking-wider">Latitude</span>
              <input
                type="text"
                readOnly
                value={form.latitude}
                placeholder="—"
                className="w-full bg-grey100 dark:bg-grey950 border border-grey200 dark:border-grey800 rounded-lg py-2 px-3 text-xs font-mono text-grey700 dark:text-grey300 cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-grey500 uppercase tracking-wider">Longitude</span>
              <input
                type="text"
                readOnly
                value={form.longitude}
                placeholder="—"
                className="w-full bg-grey100 dark:bg-grey950 border border-grey200 dark:border-grey800 rounded-lg py-2 px-3 text-xs font-mono text-grey700 dark:text-grey300 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Aviso: coordenadas possivelmente trocadas */}
          {form.isSwapSuspected && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-700 dark:text-amber-400">
              <ArrowLeftRight className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">
                <p className="font-bold">Estes valores parecem trocados (latitude/longitude).</p>
                <button
                  type="button"
                  onClick={form.handleSwapCoordinates}
                  className="mt-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 font-bold text-[11px] transition-colors"
                >
                  Trocar automaticamente
                </button>
              </div>
            </div>
          )}

          {/* Aviso: ponto fora dos limites da Beira — bloqueia o Guardar até confirmar */}
          {form.isOutsideBounds && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">
                <p className="font-bold">Este ponto está fora dos limites da Beira. Confirma o local?</p>
                <label className="flex items-center gap-2 mt-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.confirmOutsideBounds}
                    onChange={(e) => form.setConfirmOutsideBounds(e.target.checked)}
                    className="w-3.5 h-3.5 accent-red-600"
                  />
                  <span className="font-bold">Sim, confirmo — gravar mesmo assim</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Horário */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Horário de Recolha</label>
          <input
            type="text"
            placeholder="Ex: Seg–Sex · 06h–18h"
            value={form.horario}
            onChange={(e) => form.setHorario(e.target.value)}
            disabled={submitting}
            className={inputClass}
          />
        </div>

        {/* Estado — toggle segmentado */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Estado</label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-grey100 dark:bg-grey950 border border-grey200 dark:border-grey800 rounded-xl">
            <button
              type="button"
              onClick={() => form.setEstado("activo")}
              disabled={submitting}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                form.estado === "activo"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "text-grey600 dark:text-grey400 border border-transparent"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
            </button>
            <button
              type="button"
              onClick={() => form.setEstado("inactivo")}
              disabled={submitting}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                form.estado === "inactivo"
                  ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                  : "text-grey600 dark:text-grey400 border border-transparent"
              }`}
            >
              <XCircle className="w-3.5 h-3.5" /> Inativo
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || (form.isOutsideBounds && !form.confirmOutsideBounds)}
          className="w-full mt-2 py-3 rounded-xl text-sm font-bold bg-limeGreen text-forestGreen hover:bg-lightLime active:scale-[0.99] shadow-lg shadow-limeGreen/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              A guardar...
            </>
          ) : isEditing ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Guardar Alterações
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Cadastrar Ponto
            </>
          )}
        </button>
      </form>
    </div>
  );
};
