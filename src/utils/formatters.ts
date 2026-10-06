/**
 * CÁBALA — Utilidades de Formato Estricto y Regla "SIN DATO"
 *
 * REGLAS FUNDAMENTALES:
 * 1. DATOS INVENTADOS = ERROR.
 * 2. Si un dato no puede obtenerse de una fuente verificable: mostrar "SIN DATO".
 * 3. CERO (0) NO SIGNIFICA SIN DATO:
 *    - Si un equipo tiene 0 goles -> mostrar: "0"
 *    - Si no sabemos cuántos goles tiene -> mostrar: "SIN DATO"
 *    - NUNCA convertir null -> 0.
 * 4. NUNCA usar: "N/A", "?", "--", "0" cuando el significado real es ausencia de dato.
 */

export const SIN_DATO_TEXT = 'SIN DATO';

/**
 * Formatea un valor numérico distinguiendo explícitamente entre 0 real y ausencia de dato.
 */
export function formatStatValue(
  val: number | null | undefined,
  options?: {
    suffix?: string;
    prefix?: string;
    sign?: boolean;
  }
): string {
  // Verificación estricta: 0 es un número real válido
  if (val === 0) {
    const sfx = options?.suffix || '';
    const pfx = options?.prefix || '';
    return `${pfx}0${sfx}`;
  }

  // Si es nulo, indefinido o NaN, es SIN DATO
  if (val === null || val === undefined || isNaN(val)) {
    return SIN_DATO_TEXT;
  }

  const sfx = options?.suffix || '';
  const pfx = options?.prefix || '';
  const signStr = options?.sign && val > 0 ? '+' : '';
  return `${pfx}${signStr}${val}${sfx}`;
}

/**
 * Formatea cadenas de texto. Si están vacías o contienen placeholders ambiguos, retorna "SIN DATO".
 */
export function formatTextValue(val: string | null | undefined): string {
  if (!val) return SIN_DATO_TEXT;
  const trimmed = val.trim();
  if (
    trimmed === '' ||
    trimmed === '--' ||
    trimmed === '---' ||
    trimmed === '--:--' ||
    trimmed === 'N/A' ||
    trimmed === 'n/a' ||
    trimmed === '?' ||
    trimmed.toUpperCase() === 'SIN DATO' ||
    trimmed.toUpperCase() === 'SIN_DATO'
  ) {
    return SIN_DATO_TEXT;
  }
  return trimmed;
}

/**
 * Formatea horarios de partidos al huso horario oficial de Argentina (UTC-3 / ART).
 * Si no hay horario oficial confirmado, retorna "Sin definir".
 */
export function formatMatchTime(timeStr?: string | null, dateStr?: string | null, timestamp?: number | null): string {
  // 0. Si se provee timestamp numérico UTC, es la fuente de verdad absoluta para convertir al huso de Argentina
  if (typeof timestamp === 'number' && !isNaN(timestamp) && timestamp > 0) {
    const dt = new Date(timestamp);
    if (!isNaN(dt.getTime())) {
      const artTime = new Intl.DateTimeFormat('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(dt);
      return `${artTime} hs`;
    }
  }

  if (!timeStr) return 'Sin definir';
  const trimmed = timeStr.trim();
  if (
    trimmed === '' ||
    trimmed === '--:--' ||
    trimmed === '--' ||
    trimmed === '00:00' ||
    trimmed === '00:00:00' ||
    trimmed.toLowerCase() === 'tbd' ||
    trimmed.toLowerCase() === 'a confirmar' ||
    trimmed.toLowerCase() === 'sin dato' ||
    trimmed.toLowerCase() === 'sin_dato' ||
    trimmed.toLowerCase() === 'sin definir'
  ) {
    return 'Sin definir';
  }

  // 1. Si contiene formato ISO con indicador de zona UTC (contiene 'Z') o fecha completa
  if (trimmed.includes('Z') || (trimmed.includes('T') && (trimmed.includes('+') || trimmed.includes('-')))) {
    try {
      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) {
        const artTime = new Intl.DateTimeFormat('es-AR', {
          timeZone: 'America/Argentina/Buenos_Aires',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(d);
        return `${artTime} hs`;
      }
    } catch {
      // Fallback
    }
  }

  // 2. Si ya viene en formato de hora oficial HH:mm (ej. "21:30", "19:15"), ya es la hora oficial argentina
  const hhmmMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmmMatch) {
    const hh = hhmmMatch[1].padStart(2, '0');
    const mm = hhmmMatch[2];
    return `${hh}:${mm} hs`;
  }

  // 3. Si viene con segundos (ej. "21:30:00")
  const hhmmssMatch = trimmed.match(/^(\d{1,2}):(\d{2}):\d{2}$/);
  if (hhmmssMatch) {
    const hh = hhmmssMatch[1].padStart(2, '0');
    const mm = hhmmssMatch[2];
    return `${hh}:${mm} hs`;
  }

  // 4. Fallback general: extraer los dos primeros números
  const match = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    const hh = match[1].padStart(2, '0');
    const mm = match[2];
    return `${hh}:${mm} hs`;
  }

  return 'Sin definir';
}

/**
 * Formatea fechas al estándar argentino DD/MM/YYYY o día completo.
 */
export function formatMatchDate(dateStr?: string | null, timestamp?: number | null, options?: { full?: boolean }): string {
  if (typeof timestamp === 'number' && !isNaN(timestamp) && timestamp > 0) {
    const dt = new Date(timestamp);
    if (!isNaN(dt.getTime())) {
      if (options?.full) {
        return new Intl.DateTimeFormat('es-AR', {
          timeZone: 'America/Argentina/Buenos_Aires',
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }).format(dt);
      }
      return new Intl.DateTimeFormat('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(dt);
    }
  }

  if (!dateStr) return 'Fecha a confirmar';
  const trimmed = dateStr.trim();
  const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymdMatch) {
    const [_, y, m, d] = ymdMatch;
    return `${d}/${m}/${y}`;
  }

  return trimmed;
}

/**
 * Formatea el minuto de un partido o incidencia garantizando el formato reglamentario oficial:
 * - "45+2'" en lugar de "452"
 * - "90+3'" en lugar de "903"
 * - Preserva strings con tiempo añadido y añade apóstrofe limpio.
 */
export function formatMatchMinute(minute?: number | string | null): string {
  if (minute === null || minute === undefined || minute === '') {
    return '';
  }
  const str = String(minute).trim().replace(/'/g, '');
  if (!str) return '';

  // Already formatted like "45+2" or "90+4"
  if (/^\d+\+\d+$/.test(str)) {
    return `${str}'`;
  }

  // Concatenated without plus: 452 -> 45+2', 453 -> 45+3'
  const match45 = str.match(/^45(\d+)$/);
  if (match45) {
    return `45+${match45[1]}'`;
  }

  // Concatenated without plus: 903 -> 90+3', 904 -> 90+4'
  const match90 = str.match(/^90(\d+)$/);
  if (match90) {
    return `90+${match90[1]}'`;
  }

  const num = parseInt(str, 10);
  if (!isNaN(num)) {
    if (num > 90) {
      return `90+${num - 90}'`;
    }
    return `${num}'`;
  }

  return `${str}'`;
}

