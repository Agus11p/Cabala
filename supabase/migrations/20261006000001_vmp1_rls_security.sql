-- ==============================================================================
-- CÁBALA — VMP1: Row Level Security (RLS) y Políticas de Acceso
-- Versión: 20261006000001_vmp1_rls_security.sql
-- Descripción: Activa RLS en todas las tablas del esquema.
--              Garantiza lectura pública para datos fácticos deportivos.
--              Bloquea de forma absoluta escrituras desde clientes anónimos.
--              Las mutaciones quedan reservadas exclusivamente al backend
--              mediante Supabase Service Role Key (Server-side).
-- ==============================================================================

-- 1. Habilitar Row Level Security en todas las tablas
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE average_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_ingestion_runs ENABLE ROW LEVEL SECURITY;

-- 2. Políticas de LECTURA PÚBLICA (SELECT)
-- Los datos deportivos son de consulta pública para el frontend de CÁBALA.
CREATE POLICY "teams_public_read" 
    ON teams FOR SELECT 
    USING (true);

CREATE POLICY "matches_public_read" 
    ON matches FOR SELECT 
    USING (true);

CREATE POLICY "standings_public_read" 
    ON standings FOR SELECT 
    USING (true);

CREATE POLICY "annual_standings_public_read" 
    ON annual_standings FOR SELECT 
    USING (true);

CREATE POLICY "average_standings_public_read" 
    ON average_standings FOR SELECT 
    USING (true);

-- IMPORTANTE: data_ingestion_runs NO posee política SELECT para el rol anónimo.
-- Al tener RLS activo sin política para `anon`, el acceso público queda DENEGADO (DENIED).
-- Únicamente el backend mediante SUPABASE_SERVICE_ROLE_KEY tiene acceso administrativo.

-- 3. Políticas de ESCRITURA (INSERT / UPDATE / DELETE)
-- En Supabase, las conexiones que utilizan `service_role` (backend) tienen
-- la prerrogativa de bypass de RLS automáticamente.
-- Para roles estándar (anon / authenticated), no se crea ninguna política
-- de inserción, actualización ni borrado, resultando en DENEGACIÓN TOTAL POR DEFECTO.
--
-- Regla de Oro de Seguridad CÁBALA:
-- NINGÚN cliente desde el navegador con `anon_key` puede:
--   - Modificar resultados de partidos
--   - Alterar posiciones o puntos en tablas
--   - Modificar promedios ni alterar nóminas de clubes
--   - Escribir en registros de auditoría de ingesta
