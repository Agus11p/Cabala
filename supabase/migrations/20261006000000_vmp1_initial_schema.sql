-- ==============================================================================
-- CÁBALA — VMP1: Esquema Relacional PostgreSQL Inicial para Supabase
-- Versión: 20261006000000_vmp1_initial_schema.sql
-- Descripción: Tablas canónicas, constraints, relaciones e índices relacionales
--              compatibles al 100% con el Data Engine deportivo de CÁBALA.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLA: teams (30 Clubes de Primera División)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    short_name VARCHAR(64) NOT NULL,
    slug VARCHAR(64) NOT NULL,
    code VARCHAR(16) NOT NULL,
    logo_url VARCHAR(512),
    zone CHAR(1) CHECK (zone IN ('A', 'B') OR zone IS NULL),
    city VARCHAR(128),
    neighborhood VARCHAR(128),
    province VARCHAR(128),
    stadium VARCHAR(128),
    stadium_nickname VARCHAR(128),
    stadium_capacity INTEGER CHECK (stadium_capacity >= 0 OR stadium_capacity IS NULL),
    founded INTEGER CHECK (founded >= 1800 AND founded <= 2100 OR founded IS NULL),
    founded_full_date VARCHAR(64),
    nickname VARCHAR(128),
    nicknames JSONB DEFAULT '[]'::jsonb,
    history_summary TEXT,
    president VARCHAR(128),
    manager VARCHAR(128),
    official_website VARCHAR(256),
    primary_color VARCHAR(16),
    secondary_color VARCHAR(16),
    accent_color VARCHAR(16),
    titles_count JSONB DEFAULT '{"league":0,"nationalCup":0,"international":0,"total":0}'::jsonb,
    honors JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_teams_zone ON teams(zone);
CREATE INDEX IF NOT EXISTS idx_teams_code ON teams(code);
CREATE INDEX IF NOT EXISTS idx_teams_slug ON teams(slug);

-- ------------------------------------------------------------------------------
-- 2. TABLA: matches (Fixture, Partidos en Vivo y Resultados Oficiales)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS matches (
    id VARCHAR(64) PRIMARY KEY,
    season VARCHAR(16) NOT NULL,
    competition VARCHAR(128) NOT NULL,
    matchday VARCHAR(128) NOT NULL,
    round_number INTEGER CHECK (round_number >= 0 OR round_number IS NULL),
    date DATE NOT NULL,
    time VARCHAR(16),
    kickoff_time VARCHAR(16),
    timestamp BIGINT NOT NULL,
    home_team_id VARCHAR(32) NOT NULL REFERENCES teams(id) ON UPDATE CASCADE,
    away_team_id VARCHAR(32) NOT NULL REFERENCES teams(id) ON UPDATE CASCADE,
    home_score INTEGER CHECK (home_score >= 0 OR home_score IS NULL),
    away_score INTEGER CHECK (away_score >= 0 OR away_score IS NULL),
    status VARCHAR(32) NOT NULL CHECK (status IN ('scheduled', 'live', 'finished', 'postponed', 'cancelled', 'suspended', 'delayed')),
    minute VARCHAR(16),
    venue VARCHAR(128),
    phase VARCHAR(32) CHECK (phase IN ('apertura', 'clausura', 'playoffs', 'copa_argentina') OR phase IS NULL),
    zone CHAR(1) CHECK (zone IN ('A', 'B') OR zone IS NULL),
    source VARCHAR(64) DEFAULT 'ESPN' NOT NULL,
    events JSONB DEFAULT '[]'::jsonb,
    stats JSONB,
    provenance JSONB DEFAULT '{}'::jsonb NOT NULL,
    is_stale BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_matches_distinct_teams CHECK (home_team_id <> away_team_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_season_phase ON matches(season, phase);
CREATE INDEX IF NOT EXISTS idx_matches_teams ON matches(home_team_id, away_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_timestamp ON matches(timestamp);

-- ------------------------------------------------------------------------------
-- 3. TABLA: standings (Tablas de Posiciones Zonales - Torneo Apertura y Clausura)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS standings (
    id VARCHAR(64) PRIMARY KEY,
    season VARCHAR(16) NOT NULL,
    competition VARCHAR(64) NOT NULL,
    zone CHAR(1) NOT NULL CHECK (zone IN ('A', 'B')),
    team_id VARCHAR(32) NOT NULL REFERENCES teams(id) ON UPDATE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 1 AND position <= 30),
    played INTEGER NOT NULL CHECK (played >= 0),
    won INTEGER NOT NULL CHECK (won >= 0),
    drawn INTEGER NOT NULL CHECK (drawn >= 0),
    lost INTEGER NOT NULL CHECK (lost >= 0),
    goals_for INTEGER NOT NULL CHECK (goals_for >= 0),
    goals_against INTEGER NOT NULL CHECK (goals_against >= 0),
    goal_difference INTEGER NOT NULL,
    points INTEGER NOT NULL CHECK (points >= 0),
    penalty_points INTEGER DEFAULT 0 NOT NULL CHECK (penalty_points >= 0),
    form JSONB DEFAULT '[]'::jsonb,
    qualification_zone VARCHAR(64),
    qualification_reason VARCHAR(128),
    source VARCHAR(64) DEFAULT 'ESPN' NOT NULL,
    provenance JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_standings_math_played CHECK (played = won + drawn + lost),
    CONSTRAINT chk_standings_math_diff CHECK (goal_difference = goals_for - goals_against),
    CONSTRAINT chk_standings_math_points CHECK (points = ((won * 3) + drawn) - penalty_points),
    CONSTRAINT uq_standings_season_phase_zone_team UNIQUE (season, competition, zone, team_id)
);

CREATE INDEX IF NOT EXISTS idx_standings_query ON standings(season, competition, zone, position);

-- ------------------------------------------------------------------------------
-- 4. TABLA: annual_standings (Tabla General Acumulada Anual - 30 Clubes)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS annual_standings (
    id VARCHAR(64) PRIMARY KEY,
    season VARCHAR(16) NOT NULL,
    team_id VARCHAR(32) NOT NULL REFERENCES teams(id) ON UPDATE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 1 AND position <= 30),
    played INTEGER NOT NULL CHECK (played >= 0),
    won INTEGER NOT NULL CHECK (won >= 0),
    drawn INTEGER NOT NULL CHECK (drawn >= 0),
    lost INTEGER NOT NULL CHECK (lost >= 0),
    goals_for INTEGER NOT NULL CHECK (goals_for >= 0),
    goals_against INTEGER NOT NULL CHECK (goals_against >= 0),
    goal_difference INTEGER NOT NULL,
    points INTEGER NOT NULL CHECK (points >= 0),
    penalty_points INTEGER DEFAULT 0 NOT NULL CHECK (penalty_points >= 0),
    qualification_zone VARCHAR(64),
    source VARCHAR(64) DEFAULT 'CÁBALA_CONSOLIDATED' NOT NULL,
    provenance JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_annual_math_played CHECK (played = won + drawn + lost),
    CONSTRAINT chk_annual_math_diff CHECK (goal_difference = goals_for - goals_against),
    CONSTRAINT chk_annual_math_points CHECK (points = ((won * 3) + drawn) - penalty_points),
    CONSTRAINT uq_annual_standings_season_team UNIQUE (season, team_id)
);

CREATE INDEX IF NOT EXISTS idx_annual_standings_query ON annual_standings(season, position);

-- ------------------------------------------------------------------------------
-- 5. TABLA: average_standings (Tabla de Promedios Trienales 2024 - 2026)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS average_standings (
    id VARCHAR(64) PRIMARY KEY,
    season VARCHAR(16) NOT NULL,
    team_id VARCHAR(32) NOT NULL REFERENCES teams(id) ON UPDATE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 1 AND position <= 30),
    points_2024 INTEGER DEFAULT 0 NOT NULL CHECK (points_2024 >= 0),
    played_2024 INTEGER DEFAULT 0 NOT NULL CHECK (played_2024 >= 0),
    points_2025 INTEGER DEFAULT 0 NOT NULL CHECK (points_2025 >= 0),
    played_2025 INTEGER DEFAULT 0 NOT NULL CHECK (played_2025 >= 0),
    points_2026 INTEGER DEFAULT 0 NOT NULL CHECK (points_2026 >= 0),
    played_2026 INTEGER DEFAULT 0 NOT NULL CHECK (played_2026 >= 0),
    total_points INTEGER NOT NULL CHECK (total_points >= 0),
    total_played INTEGER NOT NULL CHECK (total_played >= 0),
    average NUMERIC(6, 3) NOT NULL CHECK (average >= 0),
    relegation_status VARCHAR(64),
    source VARCHAR(64) DEFAULT 'PROMIEDOS' NOT NULL,
    source_url VARCHAR(256),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_average_math_points CHECK (total_points = points_2024 + points_2025 + points_2026),
    CONSTRAINT chk_average_math_played CHECK (total_played = played_2024 + played_2025 + played_2026),
    CONSTRAINT uq_average_standings_season_team UNIQUE (season, team_id)
);

CREATE INDEX IF NOT EXISTS idx_average_standings_query ON average_standings(season, position);

-- ------------------------------------------------------------------------------
-- 6. TABLA: data_ingestion_runs (Auditoría y Trazabilidad de Ingestas)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_ingestion_runs (
    id VARCHAR(64) PRIMARY KEY,
    provider VARCHAR(64) NOT NULL,
    endpoint VARCHAR(256) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    finished_at TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL CHECK (status IN ('RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL')),
    records_count INTEGER DEFAULT 0 NOT NULL,
    errors JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_data_ingestion_runs_started ON data_ingestion_runs(started_at DESC);
