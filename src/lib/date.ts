export const MAPUTO_TIMEZONE = "Africa/Maputo";

/**
 * Formata uma data para exibição amigável segundo o fuso horário de Moçambique (Maputo, UTC+2).
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString("pt-MZ", {
    timeZone: MAPUTO_TIMEZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formata data e hora completas no fuso horário oficial de Maputo.
 */
export function formatMaputoDateTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleString("pt-PT", {
    timeZone: MAPUTO_TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formata a hora de uma notificação com precisão, recorrendo ao fuso horário de Maputo.
 */
export function formatNotificationTimeMaputo(isoDate: Date | string | number): string {
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Agora mesmo";
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) {
      // Exibe "Há X h (HH:mm)" no fuso horário de Maputo
      const horaMaputo = date.toLocaleTimeString("pt-PT", {
        timeZone: MAPUTO_TIMEZONE,
        hour: "2-digit",
        minute: "2-digit",
      });
      return `Há ${diffHours} h (${horaMaputo})`;
    }

    return date.toLocaleString("pt-PT", {
      timeZone: MAPUTO_TIMEZONE,
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Recente";
  }
}

/**
 * Retorna a diferença de tempo em formato humano (ex: "há 2 dias").
 */
export function timeAgo(date: Date | string | number): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return `há ${interval} ano${interval > 1 ? "s" : ""}`;
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `há ${interval} mê${interval > 1 ? "ses" : "s"}`;
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `há ${interval} dia${interval > 1 ? "s" : ""}`;
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `há ${interval} hora${interval > 1 ? "s" : ""}`;
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `há ${interval} minuto${interval > 1 ? "s" : ""}`;
  
  return "agora mesmo";
}
