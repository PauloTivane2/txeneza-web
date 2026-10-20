
"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  Info,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Trash2,
  Volume2,
  VolumeX,
  ArrowRight,
  Inbox,
  Clock,
  MapPin,
  Mail,
  MailOpen,
} from "lucide-react";
import { useNotificationsStore } from "@/features/notifications/notifications.store";
import { notificationSound } from "@/lib/notification-sound";
import { formatNotificationTimeMaputo } from "@/lib/date";

export const NotificationBell: React.FC = () => {
  const router = useRouter();
  const {
    notifications,
    filterTab,
    setFilterTab,
    fetchNotifications,
    markAsRead,
    markAsUnread,
    toggleRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotificationsStore();

  const [isOpen, setIsOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    setMuted(notificationSound.isMuted());
  }, [fetchNotifications]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !muted;
    setMuted(next);
    notificationSound.setMuted(next);
    if (!next) {
      notificationSound.playChime();
    }
  };

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filterTab === "nao_lidas") return !n.read;
      if (filterTab === "denuncias") {
        return (
          n.type === "nova_denuncia" ||
          n.type === "ocorrencia" ||
          n.type === "alerta_critico"
        );
      }
      if (filterTab === "criticas") {
        return (
          n.type === "alerta_critico" ||
          n.gravidade === "critica" ||
          n.message.toLowerCase().includes("crítica") ||
          n.message.toLowerCase().includes("critica")
        );
      }
      return true;
    });
  }, [notifications, filterTab]);

  const counts = useMemo(() => {
    const total = notifications.length;
    const naoLidas = notifications.filter((n) => !n.read).length;
    const denuncias = notifications.filter(
      (n) => n.type === "nova_denuncia" || n.type === "ocorrencia" || n.type === "alerta_critico"
    ).length;
    const criticas = notifications.filter(
      (n) =>
        n.type === "alerta_critico" ||
        n.gravidade === "critica" ||
        n.message.toLowerCase().includes("crítica") ||
        n.message.toLowerCase().includes("critica")
    ).length;
    return { total, naoLidas, denuncias, criticas };
  }, [notifications]);

  const formatNotificationTime = (isoDate: string) => {
    return formatNotificationTimeMaputo(isoDate);
  };

  const getNotificationIcon = (type: string, message: string) => {
    const isCritica =
      type === "alerta_critico" ||
      message.toLowerCase().includes("crítica") ||
      message.toLowerCase().includes("critica");

    if (isCritica) {
      return (
        <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
          <AlertOctagon className="w-4 h-4" />
        </div>
      );
    }

    if (type === "reabertura_automatica") {
      return (
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    }

    if (type === "resolucao_validada" || type === "verificacao") {
      return (
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      );
    }

    if (type === "nova_denuncia" || type === "ocorrencia") {
      return (
        <div className="p-2 rounded-xl bg-forestGreen/10 dark:bg-limeGreen/15 text-forestGreen dark:text-limeGreen border border-forestGreen/20 dark:border-limeGreen/25 shrink-0">
          <MapPin className="w-4 h-4" />
        </div>
      );
    }

    return (
      <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shrink-0">
        <Info className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão do Sino */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-forestGreen/40 ${
          isOpen
            ? "bg-forestGreen/10 dark:bg-limeGreen/15 text-forestGreen dark:text-limeGreen border-forestGreen/30 dark:border-limeGreen/40 shadow-sm"
            : "bg-grey100/80 dark:bg-grey800/80 border-grey200/80 dark:border-grey700/60 text-grey700 dark:text-grey300 hover:bg-grey200/80 dark:hover:bg-grey700/80"
        }`}
        title="Central de Notificações em Tempo Real"
        aria-label="Ver notificações"
      >
        <Bell className={`w-4 h-4 ${unreadCount > 0 ? "animate-pulse" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-grey900 shadow-md animate-in zoom-in-50">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Painel Dropdown Expandido */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-[340px] sm:w-[460px] bg-white dark:bg-grey900 border border-grey200 dark:border-grey800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Cabeçalho */}
          <div className="p-4 border-b border-grey100 dark:border-grey800/80 bg-grey50/60 dark:bg-grey900/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight text-grey900 dark:text-grey50">
                  Notificações
                </span>
                {unreadCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    {unreadCount} não lidas
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Em dia
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {/* Controlo de Som */}
                <button
                  onClick={toggleSound}
                  className="p-1.5 rounded-lg text-grey500 hover:text-grey800 dark:text-grey400 dark:hover:text-grey100 hover:bg-grey200/60 dark:hover:bg-grey800 transition-colors"
                  title={muted ? "Ativar som de alertas" : "Silenciar alertas"}
                  aria-label="Controlo de som"
                >
                  {muted ? (
                    <VolumeX className="w-4 h-4 text-rose-500" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-forestGreen dark:text-limeGreen" />
                  )}
                </button>

                {/* Marcar todas como lidas */}
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-forestGreen dark:text-limeGreen hover:underline px-2 py-1 rounded-lg hover:bg-forestGreen/10 dark:hover:bg-limeGreen/10 transition-colors"
                    title="Marcar todas como lidas"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Marcar lidas</span>
                  </button>
                )}

                {/* Limpar todas */}
                {notifications.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm("Deseja eliminar todas as notificações?")) {
                        clearAllNotifications();
                      }
                    }}
                    className="p-1.5 text-grey400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                    title="Limpar todas as notificações"
                    aria-label="Limpar todas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Abas de Filtragem */}
            <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-grey200/60 dark:border-grey800/60">
              <button
                onClick={() => setFilterTab("todas")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  filterTab === "todas"
                    ? "bg-forestGreen text-white dark:bg-limeGreen dark:text-forestGreen shadow-xs"
                    : "text-grey600 dark:text-grey400 hover:bg-grey200/50 dark:hover:bg-grey800/60"
                }`}
              >
                Todas ({counts.total})
              </button>
              <button
                onClick={() => setFilterTab("nao_lidas")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  filterTab === "nao_lidas"
                    ? "bg-forestGreen text-white dark:bg-limeGreen dark:text-forestGreen shadow-xs"
                    : "text-grey600 dark:text-grey400 hover:bg-grey200/50 dark:hover:bg-grey800/60"
                }`}
              >
                Não Lidas ({counts.naoLidas})
              </button>
              <button
                onClick={() => setFilterTab("denuncias")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  filterTab === "denuncias"
                    ? "bg-forestGreen text-white dark:bg-limeGreen dark:text-forestGreen shadow-xs"
                    : "text-grey600 dark:text-grey400 hover:bg-grey200/50 dark:hover:bg-grey800/60"
                }`}
              >
                Denúncias ({counts.denuncias})
              </button>
              <button
                onClick={() => setFilterTab("criticas")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  filterTab === "criticas"
                    ? "bg-rose-500 text-white shadow-xs"
                    : "text-grey600 dark:text-grey400 hover:bg-grey200/50 dark:hover:bg-grey800/60"
                }`}
              >
                Críticas ({counts.criticas})
              </button>
            </div>
          </div>

          {/* Lista de Notificações */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-grey100 dark:divide-grey800/60">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-6 flex flex-col items-center justify-center text-center gap-2">
                <div className="p-3 bg-grey100 dark:bg-grey800/60 rounded-full text-grey400 dark:text-grey500">
                  <Inbox className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-grey700 dark:text-grey300">
                  Nenhuma notificação encontrada
                </p>
                <p className="text-[11px] text-grey400 dark:text-grey500 max-w-xs">
                  {filterTab === "nao_lidas"
                    ? "Todas as notificações já foram marcadas como lidas."
                    : "Novos alertas em tempo real aparecerão automaticamente nesta lista."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const cleanMessage = n.message.replace(/[\u{1F300}-\u{1FAFF}]/gu, "").trim();

                return (
                  <div
                    key={n.id}
                    className={`group relative p-3.5 px-4 flex items-start gap-3 transition-colors ${
                      !n.read
                        ? "bg-forestGreen/[0.04] dark:bg-limeGreen/[0.05]"
                        : "hover:bg-grey50 dark:hover:bg-grey800/40"
                    }`}
                  >
                    {/* Indicador visual de não lida */}
                    <div className="pt-2">
                      <span
                        className={`block w-2 h-2 rounded-full transition-all ${
                          !n.read
                            ? "bg-forestGreen dark:bg-limeGreen ring-2 ring-forestGreen/20 dark:ring-limeGreen/30"
                            : "bg-transparent"
                        }`}
                      />
                    </div>

                    {/* Ícone da Notificação */}
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        if (!n.read) markAsRead(n.id);
                        if (n.occurrenceId) {
                          setIsOpen(false);
                          router.push(`/admin/occurrences/${n.occurrenceId}`);
                        }
                      }}
                    >
                      {getNotificationIcon(n.type, cleanMessage)}
                    </div>

                    {/* Conteúdo da Notificação */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => {
                        if (!n.read) markAsRead(n.id);
                        if (n.occurrenceId) {
                          setIsOpen(false);
                          router.push(`/admin/occurrences/${n.occurrenceId}`);
                        }
                      }}
                    >
                      <p
                        className={`text-xs leading-snug ${
                          !n.read
                            ? "font-bold text-grey950 dark:text-grey50"
                            : "font-medium text-grey700 dark:text-grey300"
                        }`}
                      >
                        {cleanMessage}
                      </p>

                      <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-[10px] font-medium text-grey400 dark:text-grey500">
                          <Clock className="w-3 h-3" />
                          {formatNotificationTime(n.createdAt)}
                        </span>

                        {n.occurrenceId && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-forestGreen dark:text-limeGreen hover:underline">
                            <span>Ver detalhes</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ações Rápidas em Linha */}
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      {/* Botão de Marcar como Lida / Não Lida */}
                      {!n.read ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(n.id);
                          }}
                          className="p-1.5 text-forestGreen dark:text-limeGreen hover:bg-forestGreen/10 dark:hover:bg-limeGreen/15 rounded-lg transition-colors"
                          title="Marcar como lida"
                          aria-label="Marcar como lida"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsUnread(n.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-grey400 hover:text-grey700 dark:hover:text-grey200 hover:bg-grey200/60 dark:hover:bg-grey800 rounded-lg transition-all"
                          title="Marcar como não lida"
                          aria-label="Marcar como não lida"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Botão Eliminar */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(n.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-grey400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                        title="Eliminar notificação"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
