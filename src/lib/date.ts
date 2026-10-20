export const MAPUTO_TIMEZONE = "Africa/Maputo";

/**
 * Garante que strings de data/hora vindas do PostgreSQL/Supabase (que vêm sem 'Z')
 * são tratadas como UTC, evitando desfasamentos de fuso horário.
 */
export function parseUtcDate(raw: Date | string | number | null | undefined): Date {
  if (!raw) return new Date();
  if (raw instanceof Date) return raw;
  if (typeof raw === "number") return new Date(raw);

  const str = String(raw).trim();
  if (!str) return new Date();

  let isoStr = str;
  if (!str.endsWith("Z") && !str.includes("+") && !/-\d{2}:?\d{2}$/.test(str)) {
    isoStr = str.includes("T") ? `${str}Z` : `${str.replace(" ", "T")}Z`;
  }

  const d = new Date(isoStr);
  return isNaN(d.getTime()) ? new Date(str) : d;
}

/**
 * Formata uma data para exibição amigável segundo o fuso horário de Moçambique (Maputo, UTC+2).
 */
export function formatDate(date: Date | string | number): string {
  const d = parseUtcDate(date);
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
  const d = parseUtcDate(date);
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
    const date = parseUtcDate(isoDate);
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
