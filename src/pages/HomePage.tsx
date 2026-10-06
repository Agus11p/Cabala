import React from 'react';
import { Match, Team, StandingRow, NewsInsight, UserProfile, TableType } from '../types/football';
import { MatchCard } from '../components/matches/MatchCard';
import { TeamBadge } from '../components/common/TeamBadge';
import { CopasOverviewSection } from '../components/copas/CopasOverviewSection';
import { Zap, ChevronRight, Trophy, Flame, User, ArrowUpRight, ShieldCheck, Clock } from 'lucide-react';
import { formatStatValue, formatMatchTime, formatMatchDate } from '../utils/formatters';

interface HomePageProps {
  featuredMatch: Match | null;
  liveMatches: Match[];
  upcomingMatches: Match[];
  allMatches?: Match[];
  userClubLiveMatch?: Match | null;
  userClubRecentMatch?: Match | null;
  userClubUpcomingMatch?: Match | null;
  topTeams: Team[];
  topStandings: StandingRow[];
  news?: NewsInsight[];
  userProfile: UserProfile | null;
  onSelectMatch: (matchId: string) => void;
  onSelectClub: (clubId: string) => void;
  onFavoriteClubChange?: (clubId: string) => void;
  onNavigate: (view: string, initialTable?: TableType) => void;
  onOpenGame: () => void;
  onOpenProfile: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  featuredMatch,
  liveMatches,
  upcomingMatches,
  allMatches = [],
  userClubLiveMatch,
  userClubRecentMatch,
  userClubUpcomingMatch,
  topTeams,
  topStandings,
  news = [],
  userProfile,
  onSelectMatch,
  onSelectClub,
  onFavoriteClubChange,
  onNavigate,
  onOpenGame,
  onOpenProfile,
}) => {
  const [clubMatchTab, setClubMatchTab] = React.useState<'recent' | 'upcoming'>('recent');
  const [homeMatchFilter, setHomeMatchFilter] = React.useState<'todos' | 'resultados' | 'en_vivo' | 'por_jugar'>('todos');

  // Partidos de la Fecha Actual (Fecha 12: 2026-10-02 al 2026-10-05)
  const currentRoundMatches = React.useMemo(() => {
    const pool = allMatches && allMatches.length > 0 ? allMatches : [...liveMatches, ...upcomingMatches];
    const f12 = pool.filter((m) => m.date >= '2026-10-02' && m.date <= '2026-10-05');
    if (f12.length > 0) return f12;
    return pool.slice(0, 14);
  }, [allMatches, liveMatches, upcomingMatches]);

  const f12Finished = React.useMemo(() => {
    return currentRoundMatches.filter((m) => m.status === 'finished');
  }, [currentRoundMatches]);

  const f12Live = React.useMemo(() => {
    return currentRoundMatches.filter((m) => m.status === 'live');
  }, [currentRoundMatches]);

  const f12Scheduled = React.useMemo(() => {
    return currentRoundMatches.filter((m) => m.status === 'scheduled');
  }, [currentRoundMatches]);

  const displayedHomeMatches = React.useMemo(() => {
    if (homeMatchFilter === 'resultados') return f12Finished;
    if (homeMatchFilter === 'en_vivo') return f12Live;
    if (homeMatchFilter === 'por_jugar') return f12Scheduled;
    // 'todos': primero en vivo, luego finalizados (con sus resultados conocidos), luego por jugar
    return [...f12Live, ...f12Finished, ...f12Scheduled];
  }, [homeMatchFilter, f12Finished, f12Live, f12Scheduled]);

  const currentRoundName = featuredMatch?.round || upcomingMatches[0]?.round || 'Fecha Oficial';
  const hasLiveMatches = liveMatches.length > 0;

  // Selected favorite club object if userProfile exists
  const favoriteClub = userProfile
    ? topTeams.find((t) => t.id === userProfile.favoriteClubId) || null
    : null;

  const isFavoriteClubMatch = Boolean(
    favoriteClub &&
    featuredMatch &&
    (featuredMatch.homeTeamId === favoriteClub.id || featuredMatch.awayTeamId === favoriteClub.id)
  );

  const winRate = userProfile && userProfile.wins + userProfile.losses > 0
    ? Math.round((userProfile.wins / (userProfile.wins + userProfile.losses)) * 100)
    : 0;

  // Determinar cuál es el partido principal de tu club
  const clubActiveMatch = userClubLiveMatch || (clubMatchTab === 'recent' ? (userClubRecentMatch || userClubUpcomingMatch) : (userClubUpcomingMatch || userClubRecentMatch));

  return (
    <div className="space-y-10 animate-fadeIn pb-16">
      {/* ───────────────────────────────────────────────────────────
          1. ¿QUÉ ESTÁ PASANDO HOY?
          Header Editorial + Partido Destacado de la Jornada
         ─────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        {/* Selector y Foco del Club Preferido (MVP) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#181C22] via-[#15191F] to-[#121519] border border-white/[0.08]">
          <div className="flex items-center gap-3">
            {favoriteClub ? (
              <>
                <TeamBadge teamId={favoriteClub.id} team={favoriteClub} size="sm" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#DCA842]">
                      {clubActiveMatch?.status === 'live'
                        ? 'EN VIVO AHORA · EN JUEGO'
                        : clubActiveMatch?.status === 'finished'
                        ? 'ÚLTIMO RESULTADO · FINALIZADO'
                        : 'PRÓXIMO COMPROMISO · A JUGAR'}
                    </span>
                  </div>
                  <h3 className="font-editorial font-bold text-sm text-[#F1EDE6]">
                    {favoriteClub.name}
                  </h3>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-[#DCA842]" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#DCA842]">Personalizá tu Inicio</span>
                  <p className="text-xs text-[#8B949E]">Elegí tu club para ver su próximo partido como principal</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <label className="text-[11px] font-semibold text-[#8B949E]">Club favorito:</label>
            <select
              value={userProfile?.favoriteClubId || ''}
              onChange={(e) => onFavoriteClubChange?.(e.target.value)}
              className="bg-[#121519] border border-white/[0.12] hover:border-[#DCA842] text-xs font-semibold text-[#F1EDE6] py-1.5 px-3 rounded-xl focus:outline-hidden transition-colors cursor-pointer"
            >
              <option value="" disabled>Seleccionar club...</option>
              {topTeams.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#121519] text-[#F1EDE6]">
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Editorial Subheader */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#DCA842]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#DCA842]">
                Primera División 2026 · {currentRoundName}
              </span>
            </div>
            <h1 className="font-editorial font-black text-2xl sm:text-4xl text-[#F1EDE6] tracking-tight">
              EL PULSO DEL FÚTBOL
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-[#8B949E]">
            {hasLiveMatches ? (
              <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>{liveMatches.length} en juego</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-[#8B949E]">
                <Clock className="w-3.5 h-3.5 text-[#DCA842]" />
                <span>Programación del fin de semana</span>
              </span>
            )}
          </div>
        </div>

        {/* Hero: Dual Card for Favorite Club (Recent Played + Upcoming) or Featured Match */}
        {favoriteClub && (userClubRecentMatch || userClubUpcomingMatch || userClubLiveMatch) ? (
          <div className="space-y-3">
            {/* Toggle / Tabs for Recent vs Upcoming on Mobile */}
            {(userClubRecentMatch && userClubUpcomingMatch) && !userClubLiveMatch && (
              <div className="flex items-center gap-2 bg-[#121519] p-1.5 rounded-2xl border border-white/[0.08] w-fit">
                <button
                  onClick={() => setClubMatchTab('recent')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    clubMatchTab === 'recent'
                      ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm'
                      : 'text-[#8B949E] hover:text-[#F1EDE6]'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Último Jugado (Finalizado)</span>
                  {userClubRecentMatch.homeScore !== null && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/20 text-[#0A0C0E] font-num font-black">
                      {userClubRecentMatch.homeScore}-{userClubRecentMatch.awayScore}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setClubMatchTab('upcoming')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    clubMatchTab === 'upcoming'
                      ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm'
                      : 'text-[#8B949E] hover:text-[#F1EDE6]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Próximo Partido</span>
                </button>
              </div>
            )}

            {/* Display Active Match Card */}
            {clubActiveMatch && (
              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#DCA842] flex items-center gap-1.5">
                    {clubActiveMatch.status === 'live' ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                        <span className="text-[#10B981]">EN VIVO AHORA · TU CLUB</span>
                      </>
                    ) : clubActiveMatch.status === 'finished' ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-[#DCA842]" />
                        <span>ÚLTIMO RESULTADO DE TU CLUB · FINALIZADO</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-[#DCA842]" />
                        <span>PRÓXIMO COMPROMISO · A JUGAR</span>
                      </>
                    )}
                  </span>
                  <span className="text-[11px] text-[#8B949E]">
                    {formatMatchDate(clubActiveMatch.date, clubActiveMatch.timestamp)} · {clubActiveMatch.tournament}
                  </span>
                </div>
                <MatchCard match={clubActiveMatch} onClick={onSelectMatch} featured />
              </div>
            )}

            {/* If both exist, show the other match as compact preview below */}
            {userClubRecentMatch && userClubUpcomingMatch && !userClubLiveMatch && (
              <div className="pt-1">
                {clubMatchTab === 'recent' ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#121519] border border-white/[0.08] hover:border-[#DCA842]/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.06] text-[#8B949E]">
                        Siguiente desafío
                      </span>
                      <span className="text-xs font-bold text-[#F1EDE6]">
                        {userClubUpcomingMatch.homeTeam?.shortName || userClubUpcomingMatch.homeTeam?.name} vs {userClubUpcomingMatch.awayTeam?.shortName || userClubUpcomingMatch.awayTeam?.name}
                      </span>
                      <span className="text-xs text-[#8B949E]">
                        · {formatMatchDate(userClubUpcomingMatch.date, userClubUpcomingMatch.timestamp)} · {formatMatchTime(userClubUpcomingMatch.time, userClubUpcomingMatch.date, userClubUpcomingMatch.timestamp)} ({userClubUpcomingMatch.stadium || 'Estadio Oficial'})
                      </span>
                    </div>
                    <button
                      onClick={() => onSelectMatch(userClubUpcomingMatch.id)}
                      className="text-xs font-bold text-[#DCA842] hover:underline shrink-0"
                    >
                      Ver previa y detalles →
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#121519] border border-white/[0.08] hover:border-[#DCA842]/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                        Último resultado
                      </span>
                      <span className="text-xs font-bold text-[#F1EDE6]">
                        {userClubRecentMatch.homeTeam?.shortName || userClubRecentMatch.homeTeam?.name} {userClubRecentMatch.homeScore} - {userClubRecentMatch.awayScore} {userClubRecentMatch.awayTeam?.shortName || userClubRecentMatch.awayTeam?.name}
                      </span>
                      <span className="text-xs text-[#8B949E]">
                        · {formatMatchDate(userClubRecentMatch.date, userClubRecentMatch.timestamp)} · Finalizado ({userClubRecentMatch.stadium || 'Estadio Oficial'})
                      </span>
                    </div>
                    <button
                      onClick={() => onSelectMatch(userClubRecentMatch.id)}
                      className="text-xs font-bold text-[#DCA842] hover:underline shrink-0"
                    >
                      Ver ficha y minuto a minuto →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          featuredMatch && (
            <div>
              <MatchCard match={featuredMatch} onClick={onSelectMatch} featured />
            </div>
          )
        )}
      </section>

      {/* ───────────────────────────────────────────────────────────
          2. ¿QUÉ PUEDO CONSULTAR?
          Hub de Tablas 2026 + Agenda Compacta de Partidos
         ─────────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#DCA842] block mb-1">
            Estadísticas & Clasificaciones
          </span>
          <h2 className="font-editorial font-black text-xl sm:text-2xl text-[#F1EDE6] tracking-tight">
            TABLAS DE POSICIONES
          </h2>
          <p className="text-xs text-[#8B949E] mt-0.5">
            Estructura oficial de 30 clubes según Reglamento AFA / LPF 2026.
          </p>
        </div>

        {/* 4 Clean Table Gateway Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Apertura 2026 */}
          <div
            onClick={() => onNavigate('tablas', 'apertura')}
            className="p-5 rounded-2xl bg-[#121519] border border-white/[0.08] hover:border-[#DCA842]/50 hover:bg-[#15191F] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-[#8B949E] mb-2 font-semibold">
                <span className="text-[#30A46C] uppercase text-[10px] tracking-wider font-bold">Concluido · Campeón Belgrano</span>
                <ArrowUpRight className="w-4 h-4 text-[#8B949E] group-hover:text-[#DCA842] transition-colors" />
              </div>
              <h3 className="font-editorial font-bold text-base text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors">
                Torneo Apertura
              </h3>
              <p className="text-xs text-[#8B949E] mt-1 line-clamp-2">
                Campeón Oficial: Belgrano (Córdoba). Subcampeón: River Plate. Playoffs concluidos oficialmente.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#8B949E]">
              <span>Torneo finalizado</span>
              <span className="font-bold text-[#F1EDE6] group-hover:text-[#DCA842]">Ver cuadro y zonas →</span>
            </div>
          </div>

          {/* Clausura 2026 */}
          <div
            onClick={() => onNavigate('tablas', 'clausura')}
            className="p-5 rounded-2xl bg-[#121519] border border-white/[0.08] hover:border-[#DCA842]/50 hover:bg-[#15191F] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-[#8B949E] mb-2 font-semibold">
                <span className="text-[#10B981] uppercase text-[10px] tracking-wider font-bold">Torneo Vigente</span>
                <ArrowUpRight className="w-4 h-4 text-[#8B949E] group-hover:text-[#DCA842] transition-colors" />
              </div>
              <h3 className="font-editorial font-bold text-base text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors">
                Torneo Clausura
              </h3>
              <p className="text-xs text-[#8B949E] mt-1 line-clamp-2">
                Zona A (15) y Zona B (15). Los 8 primeros disputan playoffs con ventaja deportiva.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#8B949E]">
              <span>En disputa</span>
              <span className="font-bold text-[#F1EDE6] group-hover:text-[#DCA842]">Ver zonas →</span>
            </div>
          </div>

          {/* Tabla Anual */}
          <div
            onClick={() => onNavigate('tablas', 'anual')}
            className="p-5 rounded-2xl bg-[#121519] border border-white/[0.08] hover:border-[#DCA842]/50 hover:bg-[#15191F] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-[#8B949E] mb-2 font-semibold">
                <span className="text-[#DCA842] uppercase text-[10px] tracking-wider font-bold">30 Clubes</span>
                <ArrowUpRight className="w-4 h-4 text-[#8B949E] group-hover:text-[#DCA842] transition-colors" />
              </div>
              <h3 className="font-editorial font-bold text-base text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors">
                Tabla General Anual
              </h3>
              <p className="text-xs text-[#8B949E] mt-1 line-clamp-2">
                Acumula 32 fechas regulares. Determina el Campeón de Liga, Copas 2027 y Descenso 30°.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#8B949E]">
              <span>Libertadores y Sudamericana</span>
              <span className="font-bold text-[#F1EDE6] group-hover:text-[#DCA842]">Consultar →</span>
            </div>
          </div>

          {/* Tabla de Promedios */}
          <div
            onClick={() => onNavigate('tablas', 'promedios')}
            className="p-5 rounded-2xl bg-[#121519] border border-white/[0.08] hover:border-[#8B949E]/50 hover:bg-[#15191F] transition-all cursor-pointer group flex flex-col justify-between opacity-85 hover:opacity-100"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-[#8B949E] mb-2 font-semibold">
                <span className="text-[#8B949E] uppercase text-[10px] tracking-wider font-bold">3 Temporadas</span>
                <ArrowUpRight className="w-4 h-4 text-[#8B949E]" />
              </div>
              <h3 className="font-editorial font-bold text-base text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors">
                Tabla de Promedios
              </h3>
              <p className="text-xs text-[#8B949E] mt-1 line-clamp-2">
                Régimen de permanencia. Coeficientes pendientes de disponibilidad en el proveedor.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#8B949E]">
              <span className="text-[#DCA842]">No disponible en ESPN</span>
              <span className="font-medium text-[#8B949E]">Ver estado →</span>
            </div>
          </div>
        </div>

        {/* Asymmetric Section: Partidos & Resultados de la Fecha + Snapshot de Líderes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Left: Agenda de Partidos y Resultados de la Fecha (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-white/[0.08] gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DCA842]">
                  Torneo Clausura · Fecha 12 (Fecha Actual)
                </span>
                <h3 className="font-editorial font-bold text-lg text-[#F1EDE6]">
                  Partidos & Resultados de la Fecha
                </h3>
              </div>
              <button
                onClick={() => onNavigate('partidos')}
                className="text-xs font-semibold text-[#8B949E] hover:text-[#DCA842] flex items-center gap-1 transition-colors self-start sm:self-auto"
              >
                <span>Ver fixture completo</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#DCA842]" />
              </button>
            </div>

            {/* Sub-tabs para alternar vista previa: Todos / Resultados / En Vivo / Por Jugar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setHomeMatchFilter('todos')}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 ${
                  homeMatchFilter === 'todos'
                    ? 'bg-[#DCA842] text-[#0A0C0E] shadow-xs'
                    : 'bg-[#121519] border border-white/[0.08] text-[#8B949E] hover:text-[#F1EDE6]'
                }`}
              >
                Todos ({currentRoundMatches.length})
              </button>
              {f12Finished.length > 0 && (
                <button
                  onClick={() => setHomeMatchFilter('resultados')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    homeMatchFilter === 'resultados'
                      ? 'bg-[#DCA842] text-[#0A0C0E] shadow-xs'
                      : 'bg-[#121519] border border-white/[0.08] text-[#8B949E] hover:text-[#F1EDE6]'
                  }`}
                >
                  <span>Resultados</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/[0.12] font-num font-bold">
                    {f12Finished.length}
                  </span>
                </button>
              )}
              {f12Live.length > 0 && (
                <button
                  onClick={() => setHomeMatchFilter('en_vivo')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    homeMatchFilter === 'en_vivo'
                      ? 'bg-[#10B981] text-[#0A0C0E]'
                      : 'bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                  <span>En Vivo ({f12Live.length})</span>
                </button>
              )}
              <button
                onClick={() => setHomeMatchFilter('por_jugar')}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 ${
                  homeMatchFilter === 'por_jugar'
                    ? 'bg-[#DCA842] text-[#0A0C0E] shadow-xs'
                    : 'bg-[#121519] border border-white/[0.08] text-[#8B949E] hover:text-[#F1EDE6]'
                }`}
              >
                Por Jugar ({f12Scheduled.length})
              </button>
            </div>

            {displayedHomeMatches.length > 0 ? (
              <div className="space-y-2.5">
                {displayedHomeMatches.slice(0, 6).map((match) => (
                  <MatchCard key={match.id} match={match} onClick={onSelectMatch} />
                ))}
                {displayedHomeMatches.length > 6 && (
                  <button
                    onClick={() => onNavigate('partidos')}
                    className="w-full py-2.5 rounded-xl bg-[#121519] hover:bg-[#181C22] border border-white/[0.08] text-xs font-bold text-[#8B949E] hover:text-[#DCA842] transition-colors text-center block"
                  >
                    Ver los {displayedHomeMatches.length - 6} partidos restantes de la fecha →
                  </button>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#121519] border border-white/[0.08] text-center text-xs text-[#8B949E]">
                No hay partidos para el filtro seleccionado.
              </div>
            )}
          </div>

          {/* Right: Snapshot de Posiciones & Clubes (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B949E]">Líderes</span>
                <h3 className="font-editorial font-bold text-lg text-[#F1EDE6]">
                  Primeros Puestos
                </h3>
              </div>
              <button
                onClick={() => onNavigate('tablas')}
                className="text-xs font-semibold text-[#8B949E] hover:text-[#DCA842] flex items-center gap-1 transition-colors"
              >
                <span>Tabla completa</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#DCA842]" />
              </button>
            </div>

            {topStandings.length > 0 ? (
              <div className="bg-[#121519] border border-white/[0.08] rounded-2xl p-4 divide-y divide-white/[0.06]">
                {topStandings.slice(0, 5).map((row) => {
                  const team = row.team;
                  const teamName = team?.shortName || team?.name || `Club ${row.teamId}`;

                  return (
                    <div
                      key={row.teamId}
                      onClick={() => onSelectClub(row.teamId)}
                      className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#181C22]/60 px-2 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`font-num font-bold text-sm w-4 text-center ${row.position === 1 ? 'text-[#DCA842]' : 'text-[#8B949E]'}`}>
                          {row.position}
                        </span>
                        <TeamBadge teamId={row.teamId} team={team} logoUrl={team?.logo} size="xs" />
                        <span className="font-semibold text-xs text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors truncate">
                          {teamName}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] font-num text-[#8B949E]">{formatStatValue(row.played)} PJ</span>
                        <span className="font-num font-black text-sm text-[#F1EDE6] group-hover:text-[#DCA842] tabular-nums min-w-[28px] text-right">
                          {formatStatValue(row.points)} <span className="text-[9px] text-[#8B949E] font-medium">pts</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#121519] border border-white/[0.08] text-xs text-[#8B949E] text-center">
                Sincronizando tabla con el feed deportivo...
              </div>
            )}

            {/* Quick Argentine Club Access */}
            <div className="p-4 rounded-2xl bg-[#121519] border border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-[#DCA842] shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-[#F1EDE6]">Directorio de 30 Clubes</h4>
                  <p className="text-[10px] text-[#8B949E]">Historial, escudos oficiales y sedes</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('clubes')}
                className="px-3 py-1.5 rounded-lg bg-[#181C22] hover:bg-[#22272E] text-xs font-semibold text-[#F1EDE6] hover:text-[#DCA842] transition-colors border border-white/[0.08]"
              >
                Ver clubes →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          COPAS NACIONALES Y SUPERCOPAS
          Cuadro de clasificados oficial según reglamento AFA / LPF
         ─────────────────────────────────────────────────────────── */}
      <CopasOverviewSection
        topStandings={topStandings}
        teams={topTeams}
        onSelectClub={onSelectClub}
        onNavigate={onNavigate}
      />

      {/* ───────────────────────────────────────────────────────────
          DIRECTORIO DE 30 CLUBES DE PRIMERA DIVISIÓN
         ─────────────────────────────────────────────────────────── */}
      <section className="p-6 rounded-3xl bg-[#121519] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#DCA842]/10 border border-[#DCA842]/20 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 text-[#DCA842]" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#DCA842]">
                Instituciones Oficiales LPF 2026
              </span>
            </div>
            <h3 className="font-editorial font-bold text-lg text-[#F1EDE6]">
              DIRECTORIO DE 30 CLUBES DE PRIMERA
            </h3>
            <p className="text-xs text-[#8B949E]">
              Consultá historial de partidos, escudos oficiales en alta definición, estadios, sedes y estadísticas club por club.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('clubes')}
          className="px-5 py-2.5 rounded-xl bg-[#181C22] hover:bg-[#22272E] text-xs font-bold text-[#F1EDE6] hover:text-[#DCA842] transition-colors border border-white/[0.08] flex items-center gap-2 shrink-0 shadow-sm"
        >
          <span>Explorar los 30 clubes</span>
          <ChevronRight className="w-4 h-4 text-[#DCA842]" />
        </button>
      </section>

      {/* ───────────────────────────────────────────────────────────
          3. ¿QUÉ PUEDO HACER?
          CTA hacia la Experiencia Competitiva CÁBALA JUGAR
         ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-[#121519] border border-white/[0.08] p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#DCA842]/15 text-[#DCA842] border border-[#DCA842]/30">
                CÁBALA JUGAR · Fase Competitiva
              </span>
            </div>
            <h3 className="font-editorial font-black text-2xl sm:text-3xl text-[#F1EDE6] tracking-tight">
              MEDÍ TU CÁBALA: TRIVIA Y DUELOS 1v1
            </h3>
            <p className="text-xs sm:text-sm text-[#8B949E] leading-relaxed">
              Desafiá a otros hinchas en preguntas de historia, clásicos y mística del fútbol argentino. Ganá puntos ELO y defendé los colores de tu club en el ranking de Primera.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenGame}
              className="px-6 py-3 rounded-xl bg-[#DCA842] hover:bg-[#c99532] text-[#0A0C0E] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg hover:translate-y-[-1px]"
            >
              <Zap className="w-4 h-4 fill-[#0A0C0E]" />
              <span>Jugar ahora</span>
            </button>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          3.5 CÁBALA: LA VISIÓN · FÚTBOL ARGENTINO, LLEVADO UN PASO MÁS ALLÁ
          Manifiesto, Logros Actuales & Próximamente
         ─────────────────────────────────────────────────────────── */}
      <section className="p-7 sm:p-9 rounded-3xl bg-gradient-to-r from-[#181C22] via-[#15191F] to-[#121519] border border-white/[0.08] relative overflow-hidden space-y-6">
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-[#DCA842] opacity-5 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-base">⚽🇦🇷</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#DCA842]">
                Ecosistema Oficial CÁBALA
              </span>
            </div>
            <h3 className="font-editorial font-black text-2xl sm:text-3xl text-[#F1EDE6] tracking-tight">
              FÚTBOL ARGENTINO, LLEVADO UN PASO MÁS ALLÁ
            </h3>
            <p className="text-xs text-[#8B949E] leading-relaxed">
              La idea no es crear simplemente otra página de resultados. Queremos construir una plataforma alrededor del fútbol argentino donde <strong>los datos reales, la competencia y la comunidad estén conectados</strong>.
            </p>
          </div>

          <button
            onClick={() => onNavigate('vision')}
            className="px-4 py-2.5 rounded-xl bg-[#181C22] hover:bg-[#22272E] text-xs font-bold text-[#F1EDE6] hover:text-[#DCA842] border border-white/[0.08] transition-colors flex items-center gap-2 shrink-0"
          >
            <span>Ver Manifiesto Completo</span>
            <ChevronRight className="w-4 h-4 text-[#DCA842]" />
          </button>
        </div>

        {/* Dual Pillar Comparison: Lo Logrado vs Lo que Viene */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Box 1: Lo que ya está logrado y funcionando */}
          <div className="p-5 rounded-2xl bg-[#121519]/80 border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#10B981] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>¿Qué estamos desarrollando actualmente? (Ya logrado)</span>
              </span>
              <span className="text-[10px] text-[#8B949E] font-num">8 pilares activos</span>
            </div>
            <ul className="text-xs text-[#F1EDE6]/90 space-y-1.5 list-none">
              <li className="flex items-center gap-2">
                <span className="text-[#10B981] font-bold">✓</span>
                <span>Tablas del Apertura (Campeón Belgrano) y Clausura</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#10B981] font-bold">✓</span>
                <span>Tabla General Anual (30 clubes para Copas y Descenso)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#10B981] font-bold">✓</span>
                <span>Resultados, fixture y partidos minuto a minuto</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#10B981] font-bold">✓</span>
                <span>Información verificada de los 30 clubes (estadios, títulos, apodos)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#10B981] font-bold">✓</span>
                <span>Clasificaciones, Copas Nacionales y escenarios deportivos</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#10B981] font-bold">✓</span>
                <span>Arquitectura tolerante a fallos con datos verificables sin inventar</span>
              </li>
            </ul>
          </div>

          {/* Box 2: Lo que queremos hacer después (Próximamente) */}
          <div className="p-5 rounded-2xl bg-[#121519]/80 border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#DCA842] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#DCA842] animate-pulse" />
                <span>¿Qué queremos hacer después? (Próximamente)</span>
              </span>
              <span className="text-[10px] text-[#8B949E] font-num">10 iniciativas en curso</span>
            </div>
            <ul className="text-xs text-[#8B949E] space-y-1.5 list-none">
              <li className="flex items-center gap-2">
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#DCA842]/15 text-[#DCA842]">PRÓXIMAMENTE</span>
                <span className="text-[#F1EDE6]">🏆 Trivia competitiva & ⚔️ Partidas 1 vs 1</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#DCA842]/15 text-[#DCA842]">PRÓXIMAMENTE</span>
                <span className="text-[#F1EDE6]">📈 Rankings nacionales y sistemas competitivos ELO</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#DCA842]/15 text-[#DCA842]">PRÓXIMAMENTE</span>
                <span className="text-[#F1EDE6]">👥 Ligas y torneos privados entre amigos</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#DCA842]/15 text-[#DCA842]">PRÓXIMAMENTE</span>
                <span className="text-[#F1EDE6]">🏅 Progresión, perfiles e insignias de club</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#DCA842]/15 text-[#DCA842]">PRÓXIMAMENTE</span>
                <span className="text-[#F1EDE6]">🗣️ Comunidad de debate y 🤝 Aportes colaborativos</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#DCA842]/15 text-[#DCA842]">PRÓXIMAMENTE</span>
                <span className="text-[#F1EDE6]">🤖 Herramientas inteligentes para análisis de escenarios</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          4. ¿QUÉ ESTÁ PASANDO CON MI PROGRESO?
          Sección Nativa "TU CÁBALA"
         ─────────────────────────────────────────────────────────── */}
      {userProfile && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#DCA842] block mb-0.5">
                Identidad y Ecosistema
              </span>
              <h3 className="font-editorial font-black text-xl text-[#F1EDE6]">
                TU CÁBALA
              </h3>
            </div>
            <button
              onClick={onOpenProfile}
              className="text-xs font-semibold text-[#8B949E] hover:text-[#DCA842] flex items-center gap-1 transition-colors"
            >
              <span>Editar perfil</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#DCA842]" />
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-[#121519] border border-white/[0.08] grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            {/* User Club & Identity */}
            <div className="md:col-span-1 flex items-center gap-4 border-b md:border-b-0 md:border-r border-white/[0.08] pb-4 md:pb-0 md:pr-4">
              <TeamBadge teamId={userProfile.favoriteClubId} size="lg" className="shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-[#DCA842] tracking-wider block">
                  Club Elegido
                </span>
                <h4 className="font-editorial font-bold text-lg text-[#F1EDE6] truncate">
                  {favoriteClub?.name || 'Club de Primera'}
                </h4>
                <span className="text-xs text-[#8B949E] block">
                  {userProfile.username}
                </span>
              </div>
            </div>

            {/* Division & ELO Rating */}
            <div className="p-3.5 rounded-xl bg-[#181C22] border border-white/[0.08] text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8B949E] block mb-1">
                División & Rating
              </span>
              <span className="font-num text-2xl font-black text-[#DCA842] block">
                {userProfile.elo} <span className="text-xs font-medium text-[#8B949E]">ELO</span>
              </span>
              <span className="text-[11px] font-semibold text-[#F1EDE6] mt-0.5 block">
                {userProfile.rankTitle}
              </span>
            </div>

            {/* Win/Loss Record */}
            <div className="p-3.5 rounded-xl bg-[#181C22] border border-white/[0.08] text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8B949E] block mb-1">
                Historial de Duelos
              </span>
              <span className="font-num text-2xl font-black text-[#F1EDE6] block">
                {userProfile.wins}V <span className="text-[#8B949E] text-base font-light">/</span> {userProfile.losses}D
              </span>
              <span className="text-[11px] text-[#8B949E] mt-0.5 block">
                {winRate}% de efectividad
              </span>
            </div>

            {/* Streak & Achievements */}
            <div className="p-3.5 rounded-xl bg-[#181C22] border border-white/[0.08] text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8B949E] block mb-1">
                Racha & Logros
              </span>
              <span className="font-num text-2xl font-black text-[#10B981] flex items-center justify-center gap-1.5">
                <Zap className="w-4 h-4 fill-[#10B981]" />
                <span>{userProfile.streak} seguidas</span>
              </span>
              <span className="text-[11px] text-[#8B949E] mt-0.5 block">
                {userProfile.achievements.length} insignia desbloqueada
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Footnote: Data transparency */}
      <div className="p-4 rounded-xl bg-[#121519] border border-white/[0.08] flex items-center justify-between text-xs text-[#8B949E]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#DCA842]" />
          <span>Datos deportivos suministrados por ESPN. Reglamento: AFA / Liga Profesional.</span>
        </div>
      </div>
    </div>
  );
};
