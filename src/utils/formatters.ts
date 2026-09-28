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
 * Formatea horarios de partidos. Si no hay hora válida, retorna "SIN DATO".
 */
export function formatMatchTime(timeStr: string | null | undefined): string {
  if (!timeStr) return SIN_DATO_TEXT;
  const trimmed = timeStr.trim();
  if (trimmed === '' || trimmed === '--:--' || trimmed === '--') {
    return SIN_DATO_TEXT;
  }
  return trimmed;
}
