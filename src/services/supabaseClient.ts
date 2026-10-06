/**
 * CÁBALA — Cliente Aislado de Supabase (VMP1)
 *
 * Módulo de preparación de infraestructura futura.
 * NO reemplaza Firebase ni altera el Data Engine en VMP1.
 *
 * Principios de Seguridad:
 * - El frontend únicamente utiliza `VITE_SUPABASE_ANON_KEY` (clave pública).
 * - La clave `SUPABASE_SERVICE_ROLE_KEY` NUNCA se importa ni expone en el cliente.
 * - Si las variables no están configuradas, el cliente opera en modo inactivo
 *   degradando con gracia sin generar excepciones no controladas.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
  '';

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

/**
 * Función de comprobación de conectividad aislada para validaciones y tests.
 */
export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string; configured: boolean }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      configured: false,
      message: 'Supabase no configurado en este entorno. Operando con persistencia principal actual (Firestore).',
    };
  }

  try {
    const { error } = await supabase.from('teams').select('id').limit(1);
    if (error) {
      return {
        ok: false,
        configured: true,
        message: `Error al consultar Supabase: ${error.message}`,
      };
    }
    return {
      ok: true,
      configured: true,
      message: 'Conexión con Supabase PostgreSQL establecida correctamente.',
    };
  } catch (err: any) {
    return {
      ok: false,
      configured: true,
      message: `Fallo de conexión Supabase: ${err?.message || 'Error desconocido'}`,
    };
  }
}
