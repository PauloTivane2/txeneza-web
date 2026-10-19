"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { occurrencesService } from "@/features/occurrences/occurrences.service";
import { Occurrence, OccurrenceStatus } from "@/features/occurrences/occurrences.types";
import {
  OCCURRENCE_STATUS_META,
  OCCURRENCE_STATUS_ORDER,
} from "@/features/occurrences/occurrence-status";
import { ConfirmDialog, ConfirmTone } from "@/components/ui/confirm-dialog";
import { OccurrenceDetailSkeleton } from "@/features/occurrences/components/occurrence-detail-skeleton";
import { ResolutionProofModal } from "@/features/occurrences/components/resolution-proof-modal";
import { ResolutionGallery } from "@/features/occurrences/components/resolution-gallery";
import { resolutionVerificationService } from "@/features/occurrences/resolution-verification.service";
import { ResolutionVerification } from "@/features/occurrences/resolution-verification.types";
import {
  ArrowLeft,
  MapPin,
  Tag,
  Calendar,
  User,
  ImageOff,
  Map as MapIcon,
  Loader2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { resolveBairro, FORA_DA_BEIRA } from "@/core/geo/beira-bairros";

const STATUS_TONE: Record<OccurrenceStatus, ConfirmTone> = {
  pendente: "warning",
  "em-progresso": "info",
  resolvido: "success",
  rejeitado: "danger",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OccurrenceDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [occurrence, setOccurrence] = useState<Occurrence | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<OccurrenceStatus | null>(null);
  const [pendingStatus, setPendingStatus] = useState<OccurrenceStatus | null>(null);
  const [imgError, setImgError] = useState(false);
  const [verifications, setVerifications] = useState<ResolutionVerification[]>([]);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [savingProof, setSavingProof] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteOccurrence = async () => {
    if (!occurrence) return;
    setDeleting(true);
    try {
      await occurrencesService.delete(occurrence.id);
      router.push("/admin/occurrences");
    } catch (err: any) {
      alert(err.message || "Erro ao eliminar ocorrência.");
      setDeleting(false);
    }
  };

  useEffect(() => {
    async function load() {
      const data = await occurrencesService.getById(id);
      setOccurrence(data);
      setVerifications(await resolutionVerificationService.getByOccurrence(id));
      setLoading(false);
    }
    load();
  }, [id]);

  const [updateError, setUpdateError] = useState<string | null>(null);

  const handleUpdateStatus = async () => {
    if (!occurrence || !pendingStatus) return;
    setUpdating(pendingStatus);
    setUpdateError(null);
    try {
      const updated = await occurrencesService.updateStatus(occurrence.id, pendingStatus);
      setOccurrence({ ...updated });
      setPendingStatus(null);
    } catch (err: any) {
      console.error("Erro ao atualizar estado:", err);
      setUpdateError(err.message || "Não foi possível atualizar o estado.");
    } finally {
      setUpdating(null);
    }
  };

  const handleConfirmProof = async (photoFiles: File[], notes: string) => {
    if (!occurrence || photoFiles.length === 0) return;
    setSavingProof(true);
    try {
      await resolutionVerificationService.createMany(
        occurrence.id,
        photoFiles,
        notes || undefined
      );

      // Recarrega a lista de provas atualizada diretamente da BD
      const freshVerifs = await resolutionVerificationService.getByOccurrence(id);
      setVerifications(freshVerifs);
      
      // Recarrega os dados atualizados da ocorrência para refletir a resolução ou a reabertura automática
      const fresh = await occurrencesService.getById(id);
      if (fresh) setOccurrence({ ...fresh });
      
      setPendingStatus(null);
      setProofModalOpen(false);
    } catch (err: any) {
      console.error("Erro ao submeter prova:", err);
    } finally {
      setSavingProof(false);
    }
  };

  const handleCancelProof = () => {
    setProofModalOpen(false);
    setPendingStatus(null);
  };

  if (loading) {
    return <OccurrenceDetailSkeleton />;
  }

  if (!occurrence) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-red-500">Ocorrência não encontrada.</p>
        <button
          onClick={() => router.push("/admin/occurrences")}
          className="px-4 py-2.5 rounded-xl text-sm font-bold bg-limeGreen text-forestGreen hover:bg-lightLime transition-colors"
        >
          Voltar à Lista
        </button>
      </div>
    );
  }

  const meta = OCCURRENCE_STATUS_META[occurrence.status];
  const geo = resolveBairro(occurrence.latitude, occurrence.longitude);
  const isFora = occurrence.bairro === FORA_DA_BEIRA || !geo.isDentroDaBeira;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Voltar */}
      <button
        onClick={() => router.push("/admin/occurrences")}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-grey600 dark:text-grey400 hover:text-forestGreen dark:hover:text-limeGreen transition-colors self-start"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar à Lista
      </button>

      {/* Cabeçalho */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <span className="text-xs font-mono text-grey500 dark:text-grey500">
            ID: {occurrence.id}
          </span>
          <h1 className="text-2xl font-black tracking-tight text-grey900 dark:text-grey50 mt-1">
            {occurrence.title}
          </h1>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-full border ${meta.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </div>

      {/* Aviso Crítico de Localização Fora do Município */}
      {isFora && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex items-start gap-3.5 text-amber-800 dark:text-amber-300">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 leading-normal">
            <h4 className="text-sm font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Anomalia Geográfica: Coordenadas Fora do Município da Beira
            </h4>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-1">
              Esta ocorrência possui coordenadas GPS ({occurrence.latitude.toFixed(5)}, {occurrence.longitude.toFixed(5)}) situadas a aproximadamente <strong className="font-extrabold underline">{geo.distanciaCentroKm} km</strong> da Cidade da Beira. O registo não pertence a nenhum dos 31 bairros oficiais sob gestão do Conselho Municipal da Beira (CMB).
            </p>
          </div>
        </div>
      )}

      {/* Imagem da denúncia */}
      {occurrence.imageUrl && !imgError ? (
        <img
          src={occurrence.imageUrl}
          alt={occurrence.title}
          onError={() => setImgError(true)}
          className="w-full max-h-80 object-cover rounded-2xl border border-grey200 dark:border-grey800"
        />
      ) : (
        <div className="w-full h-40 rounded-2xl border border-dashed border-grey300 dark:border-grey700 flex items-center justify-center text-grey400 dark:text-grey600 gap-2">
          <ImageOff className="w-5 h-5" />
          <span className="text-sm">Sem fotografia da denúncia</span>
        </div>
      )}

      {/* Descrição */}
      <div className="p-6 bg-light-background dark:bg-dark-background border border-grey200 dark:border-grey800 rounded-2xl">
        <h3 className="text-xs font-bold text-grey600 dark:text-grey400 uppercase tracking-wider mb-2">
          Descrição
        </h3>
        <p className="text-sm text-grey900 dark:text-grey50 leading-relaxed">{occurrence.description}</p>
      </div>

      {/* Detalhes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailRow
          icon={<MapPin className="w-4 h-4" />}
          label="Bairro da Ocorrência"
          value={
            isFora
              ? `Fora da Beira (aprox. ${geo.distanciaCentroKm} km)`
              : occurrence.bairro || "—"
          }
          accent={isFora}
        />
        <DetailRow
          icon={<User className="w-4 h-4" />}
          label="Reportado por"
          value={
            occurrence.reportedBy
              ? occurrence.reporterBairro
                ? `${occurrence.reportedBy} · Residente em: ${occurrence.reporterBairro}`
                : occurrence.reportedBy
              : "Munícipe"
          }
        />
        <DetailRow
          icon={<Calendar className="w-4 h-4" />}
          label="Reportado em"
          value={new Date(occurrence.createdAt).toLocaleString("pt-PT", { timeZone: "Africa/Maputo" })}
        />
      </div>

      {/* Localização */}
      <div className="p-5 bg-light-background dark:bg-dark-background border border-grey200 dark:border-grey800 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-xs font-bold text-grey600 dark:text-grey400 uppercase tracking-wider mb-1">
            Localização
          </h3>
          <p className="text-sm font-mono text-grey900 dark:text-grey50">
            {occurrence.latitude.toFixed(5)}, {occurrence.longitude.toFixed(5)}
          </p>
        </div>
        <Link
          href="/admin/map"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-forestGreen/5 dark:bg-limeGreen/5 border border-forestGreen/10 dark:border-limeGreen/10 text-forestGreen dark:text-limeGreen hover:bg-forestGreen/10 dark:hover:bg-limeGreen/10 transition-colors"
        >
          <MapIcon className="w-4 h-4" /> Ver no mapa
        </Link>
      </div>

      {/* Provas de resolução já registadas (apenas para ocorrências sob jurisdição municipal) */}
      {!isFora && <ResolutionGallery verifications={verifications} />}

      {/* Ações de gestão */}
      <div className="p-6 bg-light-background dark:bg-dark-background border border-grey200 dark:border-grey800 rounded-2xl flex flex-col gap-6">
        {!isFora ? (
          <div>
            <h3 className="text-xs font-bold text-grey600 dark:text-grey400 uppercase tracking-wider mb-4">
              Alterar Estado
            </h3>
            <div className="flex flex-wrap gap-2">
              {OCCURRENCE_STATUS_ORDER.map((s) => {
                const m = OCCURRENCE_STATUS_META[s];
                const isCurrent = occurrence.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => {
                      setPendingStatus(s);
                      if (s === "resolvido") setProofModalOpen(true);
                    }}
                    disabled={isCurrent || updating !== null}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all disabled:cursor-not-allowed ${
                      isCurrent
                        ? `${m.badge} opacity-100`
                        : "bg-grey100 dark:bg-grey900 border-grey200 dark:border-grey800 text-grey700 dark:text-grey300 hover:border-grey300 dark:hover:border-grey700 disabled:opacity-50"
                    }`}
                  >
                    {updating === s ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                    )}
                    {isCurrent ? `Estado atual: ${m.label}` : m.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              A opção de alterar estado encontra-se desativada porque as coordenadas georreferenciadas desta denúncia situam-se fora da jurisdição territorial do Município da Beira.
            </span>
          </div>
        )}

        <div className="pt-4 border-t border-grey200 dark:border-grey800 flex justify-between items-center">
          <div>
            <h4 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
              Zona de Perigo
            </h4>
            <p className="text-xs text-grey500 mt-0.5">
              Eliminar esta ocorrência remove permanentemente os seus dados e fotografias.
            </p>
          </div>
          <button
            onClick={() => setDeleteConfirmOpen(true)}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 transition-all disabled:opacity-50"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Eliminar Ocorrência
          </button>
        </div>
      </div>

      {/* Confirmação de alteração de estado (exceto "Resolvido", que exige prova fotográfica) */}
      <ConfirmDialog
        open={pendingStatus !== null && pendingStatus !== "resolvido"}
        tone={pendingStatus ? STATUS_TONE[pendingStatus] : "brand"}
        title="Alterar estado da ocorrência"
        description={
          pendingStatus ? (
            <>
              Confirma a alteração do estado para{" "}
              <b className="text-grey900 dark:text-grey50">
                «{OCCURRENCE_STATUS_META[pendingStatus].label}»
              </b>
              ? O munícipe poderá ser notificado desta mudança.
            </>
          ) : null
        }
        confirmLabel="Confirmar alteração"
        loading={updating !== null}
        onConfirm={handleUpdateStatus}
        onCancel={() => setPendingStatus(null)}
      />

      {/* Prova fotográfica obrigatória para marcar como "Resolvido" */}
      <ResolutionProofModal
        open={proofModalOpen}
        loading={savingProof || updating !== null}
        onConfirm={handleConfirmProof}
        onCancel={handleCancelProof}
      />

      {/* Confirmação de Eliminação da Ocorrência */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        tone="danger"
        title="Eliminar ocorrência"
        description="Tem a certeza que deseja eliminar esta ocorrência? Esta ação é permanente e removerá todas as provas de resolução e notificações registadas."
        confirmLabel="Eliminar permanentemente"
        loading={deleting}
        onConfirm={handleDeleteOccurrence}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-light-background dark:bg-dark-background border border-grey200 dark:border-grey800 rounded-2xl">
      <div className="p-2 rounded-lg bg-forestGreen/10 dark:bg-limeGreen/10 text-forestGreen dark:text-limeGreen shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-grey600 dark:text-grey400 uppercase tracking-wider">
          {label}
        </p>
        <p
          className={`text-sm font-bold truncate ${
            accent ? "text-forestGreen dark:text-limeGreen" : "text-grey900 dark:text-grey50"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
