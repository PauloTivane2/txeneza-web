"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/core/supabase";
import { notificationSound } from "@/lib/notification-sound";
import { LiveAlertPayload } from "@/components/ui/realtime-toast-alert";
import { useOccurrencesStore } from "@/features/occurrences/occurrences.store";
import { useMapStore } from "@/features/map/map.store";
import { useDashboardStore } from "@/features/dashboard/dashboard.store";
import { useNotificationsStore } from "@/features/notifications/notifications.store";
import { Occurrence, OccurrenceStatus } from "@/features/occurrences/occurrences.types";
import { findClosestBairro } from "@/core/geo/beira-bairros";
import { parseUtcDate } from "@/lib/date";

export function useAdminRealtime() {
  const [alerts, setAlerts] = useState<LiveAlertPayload[]>([]);
  const processedIdsRef = useRef<Set<string>>(new Set());

  // Solicita permissão para notificações nativas do browser (Desktop Notifications)
  const requestDesktopPermission = useCallback(async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        try {
          await Notification.requestPermission();
        } catch (_) {}
      }
    }
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const triggerLiveAlert = useCallback(
    (payload: LiveAlertPayload) => {
      // Evita duplicar o mesmo alerta em rajada
      if (processedIdsRef.current.has(payload.id)) return;
      processedIdsRef.current.add(payload.id);

      // Mantém tamanho do Set sob controlo
      if (processedIdsRef.current.size > 100) {
        processedIdsRef.current.clear();
        processedIdsRef.current.add(payload.id);
      }

      // 1. Toca som suave (se não estiver silenciado)
      notificationSound.playChime();

      // 2. Adiciona ao estado dos Toasts flutuantes
      setAlerts((prev) => [payload, ...prev].slice(0, 5));

      // 3. Notificação nativa do SO/Navegador (sem emojis)
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try {
          const cleanBody = (payload.message || payload.title).replace(/[\u{1F300}-\u{1FAFF}]/gu, "").trim();
          new Notification("Txeneza · Nova Notificação", {
            body: cleanBody,
            icon: "/icons/TXENEZA.svg",
            tag: payload.id,
          });
        } catch (_) {}
      }

      // 4. Auto-dispensa após 7 segundos
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== payload.id));
      }, 7000);
    },
    []
  );

  useEffect(() => {
    requestDesktopPermission();

    // Cria o canal Realtime no Supabase
    const channel = supabase
      .channel("admin-realtime-global-channel")
      // A. Ouve inserções na tabela de ocorrências (novas denúncias do mobile)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ocorrencia" },
        async (payload) => {
          const newRow = payload.new as any;
          if (!newRow) return;

          // Mapeia para o formato de Occurrence
          let status: OccurrenceStatus = "pendente";
          if (newRow.estado === "em_analise") status = "em-progresso";
          else if (newRow.estado === "resolvida") status = "resolvido";
          else if (newRow.estado === "rejeitada") status = "rejeitado";

          const gravidade = newRow.gravidade || "media";
          const isCritica = gravidade === "critica";

          const lat = Number(newRow.latitude);
          const lng = Number(newRow.longitude);
          const occurrenceBairro = newRow.bairro && newRow.bairro.trim() !== "" ? newRow.bairro : findClosestBairro(lat, lng);

          const createdAtIso = parseUtcDate(newRow.data_hora_registo).toISOString();

          const occurrenceObj: Occurrence = {
            id: newRow.id_ocorrencia,
            title: `Nova Denúncia`,
            description: newRow.descricao || "Sem descrição adicional",
            category: "Resíduo",
            latitude: lat,
            longitude: lng,
            bairro: occurrenceBairro,
            status,
            gravidade,
            createdAt: createdAtIso,
          };

          const messageText = newRow.descricao
            ? `Nova denúncia em ${occurrenceBairro} (${gravidade}): ${newRow.descricao}`
            : `Nova denúncia de resíduos registada no bairro ${occurrenceBairro}.`;

          // 1. Adiciona imediatamente à central de notificações (Sino) em 0ms
          useNotificationsStore.getState().addNotification({
            id: `occ-${newRow.id_ocorrencia}`,
            userId: newRow.id_utilizador || "admin",
            occurrenceId: newRow.id_ocorrencia,
            type: isCritica ? "alerta_critico" : "nova_denuncia",
            message: messageText,
            read: false,
            gravidade,
            createdAt: createdAtIso,
          });

          // 2. Dispara alerta audiovisual completo (Toast, Chime, Notificação do Navegador)
          triggerLiveAlert({
            id: newRow.id_ocorrencia,
            occurrenceId: newRow.id_ocorrencia,
            title: `Nova Denúncia · ${occurrenceBairro}`,
            message: messageText,
            gravidade,
            createdAt: createdAtIso,
          });

          // 3. Atualiza as lojas ativas (Tabela, Mapa, Estatísticas)
          useOccurrencesStore.getState().addOrUpdateOccurrence(occurrenceObj);
          useMapStore.getState().addOrUpdateMarker(occurrenceObj);
          useDashboardStore.getState().fetchStats(true);
        }
      )
      // B. Ouve inserções na tabela de notificações (geradas pelo Trigger PostgreSQL)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notificacao" },
        (payload) => {
          const newNotif = payload.new as any;
          if (!newNotif) return;

          const cleanMessage = (newNotif.mensagem || "").replace(/[\u{1F300}-\u{1FAFF}]/gu, "").trim();
          const notifDateIso = parseUtcDate(newNotif.data_hora).toISOString();

          // 1. Adiciona à central de notificações em 0ms
          useNotificationsStore.getState().addNotification({
            id: newNotif.id_notificacao,
            userId: newNotif.id_utilizador,
            occurrenceId: newNotif.id_ocorrencia,
            type: newNotif.tipo || "sistema",
            message: cleanMessage,
            read: newNotif.lida || false,
            createdAt: notifDateIso,
          });

          // 2. Dispara alerta visual e sonoro
          triggerLiveAlert({
            id: newNotif.id_notificacao,
            occurrenceId: newNotif.id_ocorrencia,
            title: "Notificação do Sistema",
            message: cleanMessage,
            createdAt: newNotif.data_hora || new Date().toISOString(),
          });
        }
      )
      // C. Ouve alterações de estado em ocorrências (ex.: resoluções, reaberturas)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "ocorrencia" },
        (payload) => {
          const updatedRow = payload.new as any;
          if (!updatedRow) return;

          let status: OccurrenceStatus = "pendente";
          const est = String(updatedRow.estado || "").toLowerCase();
          if (est === "em_analise" || est === "em_progresso" || est === "em-progresso") status = "em-progresso";
          else if (est === "resolvida" || est === "resolvido" || est === "concluido" || est === "concluida") status = "resolvido";
          else if (est === "rejeitada" || est === "rejeitado") status = "rejeitado";

          const updateLat = Number(updatedRow.latitude);
          const updateLng = Number(updatedRow.longitude);
          const updateBairro = updatedRow.bairro && updatedRow.bairro.trim() !== "" ? updatedRow.bairro : findClosestBairro(updateLat, updateLng);

          const occurrenceObj: Occurrence = {
            id: updatedRow.id_ocorrencia,
            title: `Ocorrência`,
            description: updatedRow.descricao || "",
            category: "Resíduo",
            latitude: updateLat,
            longitude: updateLng,
            bairro: updateBairro,
            status,
            gravidade: updatedRow.gravidade || "media",
            createdAt: updatedRow.data_hora_registo || new Date().toISOString(),
            updatedAt: updatedRow.data_hora_sync || new Date().toISOString(),
          };

          useOccurrencesStore.getState().addOrUpdateOccurrence(occurrenceObj);
          useMapStore.getState().addOrUpdateMarker(occurrenceObj);
          useDashboardStore.getState().fetchStats(true);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "verificacao_resolucao" },
        () => {
          useMapStore.getState().fetchMapData();
          useDashboardStore.getState().fetchStats(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [triggerLiveAlert, requestDesktopPermission]);

  return {
    alerts,
    dismissAlert,
  };
}
