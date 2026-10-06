-- ==============================================================================
-- CÁBALA — VMP2-A: Correcciones Críticas de Esquema, Estados y Seguridad RLS
-- Versión: 20261006000002_vmp2a_schema_fixes.sql
-- Descripción:
--   1. Soporte para deducciones de puntos (penalty_points) en tablas de posiciones.
--   2. Ampliación de matches.status para soportar 'suspended' y 'delayed'.
--   3. Revocación de lectura pública de data_ingestion_runs (RLS estricto).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLA: standings (Soporte de sanciones y deducciones de puntos de AFA)
-- ------------------------------------------------------------------------------
ALTER TABLE standings 
    ADD COLUMN IF NOT EXISTS penalty_points INTEGER DEFAULT 0 NOT NULL CHECK (penalty_points >= 0);

ALTER TABLE standings 
    DROP CONSTRAINT IF EXISTS chk_standings_math_points;

ALTER TABLE standings 
    ADD CONSTRAINT chk_standings_math_points 
    CHECK (points = ((won * 3) + drawn) - penalty_points);

-- ------------------------------------------------------------------------------
-- 2. TABLA: annual_standings (Soporte de sanciones en la tabla anual acumulada)
-- ------------------------------------------------------------------------------
ALTER TABLE annual_standings 
    ADD COLUMN IF NOT EXISTS penalty_points INTEGER DEFAULT 0 NOT NULL CHECK (penalty_points >= 0);

ALTER TABLE annual_standings 
    DROP CONSTRAINT IF EXISTS chk_annual_math_points;

ALTER TABLE annual_standings 
    ADD CONSTRAINT chk_annual_math_points 
    CHECK (points = ((won * 3) + drawn) - penalty_points);

-- ------------------------------------------------------------------------------
-- 3. TABLA: matches (Estados reglamentarios completos: suspended y delayed)
-- ------------------------------------------------------------------------------
ALTER TABLE matches 
    DROP CONSTRAINT IF EXISTS chk_matches_status;

ALTER TABLE matches 
    DROP CONSTRAINT IF EXISTS matches_status_check;

ALTER TABLE matches 
    ADD CONSTRAINT chk_matches_status 
    CHECK (status IN ('scheduled', 'live', 'finished', 'postponed', 'cancelled', 'suspended', 'delayed'));

-- ------------------------------------------------------------------------------
-- 4. SEGURIDAD RLS: data_ingestion_runs (Restricción de lectura a solo service_role)
-- ------------------------------------------------------------------------------
-- Revocar lectura pública anónima sobre logs y metadatos de sincronización
DROP POLICY IF EXISTS "data_ingestion_runs_public_read" ON data_ingestion_runs;

-- Asegurar que RLS esté activo en data_ingestion_runs
ALTER TABLE data_ingestion_runs ENABLE ROW LEVEL SECURITY;

-- Nota de seguridad:
-- Al no existir ninguna política SELECT para anon o authenticated,
-- PostgreSQL aplica denegación por defecto (DENIED).
-- Únicamente el backend mediante SUPABASE_SERVICE_ROLE_KEY tiene acceso
-- completo (bypass nativo de RLS en Supabase) para registrar y auditar ingestas.
