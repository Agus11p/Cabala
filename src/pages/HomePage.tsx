import React from 'react';
import { Match, Team, StandingRow, NewsInsight } from '../types/football';
import { MatchCard } from '../components/matches/MatchCard';
import { TeamBadge } from '../components/common/TeamBadge';
import { Zap, ChevronRight, ShieldCheck } from 'lucide-react';

interface HomePageProps {
  featuredMatch: Match | null;
  liveMatches: Match[];
  upcomingMatches: Match[];
  topTeams: Team[];
  topStandings: StandingRow[];
  news: NewsInsight[];
  onSelectMatch: (matchId: string) => void;
  onSelectClub: (clubId: string) => void;
  onNavigate: (view: string) => void;
  onOpenGame: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  featuredMatch,
  liveMatches,
  upcomingMatches,
  topTeams,
  topStandings,
  news,
  onSelectMatch,
  onSelectClub,
  onNavigate,
  onOpenGame,
}) => {
  const currentRoundName = featuredMatch?.round || upcomingMatches[0]?.round || 'Liga Profesional';
  const hasLiveMatches = liveMatches.length > 0;

  return (
    <div className="space-y-12 animate-fadeIn pb-16">
      {/* 1. PORTADA EDITORIAL / IDENTIDAD */}
      <section className="border-b border-[#22272E] pb-6 pt-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#DCA842]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#DCA842]">
                Primera División · Temporada Oficial 2026
              </span>
            </div>
            <h1 className="font-editorial font-black text-3xl md:text-5xl text-[#F1EDE6] tracking-tight leading-none">
              {currentRoundName}
            </h1>
            <p className="text-sm text-[#8B949E] mt-2 max-w-xl font-medium">
              Todo el pulso del fútbol argentino con datos e información de fuentes oficiales.
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="text-left md:text-right border-l md:border-l-0 md:border-r border-[#22272E] pl-4 md:pl-0 md:pr-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B949E] block">Estado</span>
              {hasLiveMatches ? (
                <span className="font-num text-xl font-black text-[#30A46C] flex items-center gap-1.5 md:justify-end">
                  <span className="w-2 h-2 rounded-full bg-[#30A46C] animate-pulse" />
                  EN JUEGO
                </span>
              ) : (
                <span className="font-num text-xl font-bold text-[#8B949E] block">
                  PROGRAMADOS
                </span>
              )}
            </div>
            <div className="text-left md:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B949E] block">Partidos Registrados</span>
              <span className="font-num text-xl font-black text-[#F1EDE6]">
                {upcomingMatches.length + liveMatches.length + (featuredMatch ? 1 : 0)} cotejos
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PARTIDO DESTACADO / MONUMENTAL SCOREBOARD */}
      {featuredMatch && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#DCA842]">Compromiso de la jornada</span>
              <h2 className="font-editorial font-bold text-xl text-[#F1EDE6]">
                {featuredMatch.status === 'live' ? 'En Vivo Ahora' : 'Partido Destacado'}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('partidos')}
              className="text-xs font-semibold text-[#8B949E] hover:text-[#DCA842] flex items-center gap-1 transition-colors"
            >
              <span>Ver fixture completo</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#DCA842]" />
            </button>
          </div>

          <MatchCard match={featuredMatch} onClick={onSelectMatch} featured />
        </section>
      )}

      {/* 3. ASYMMETRIC GRID: AGENDA DE PARTIDOS + TABLA DE POSICIONES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left (7 cols): Próximos Encuentros */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B949E]">Fixture Oficial AFA</span>
                <h3 className="font-editorial font-bold text-xl text-[#F1EDE6]">
                  Partidos Oficiales
                </h3>
              </div>
              <button
                onClick={() => onNavigate('partidos')}
                className="text-xs font-semibold text-[#8B949E] hover:text-[#DCA842] flex items-center gap-1 transition-colors"
              >
                <span>Agenda</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#DCA842]" />
              </button>
            </div>

            {upcomingMatches.length > 0 ? (
              <div className="space-y-3">
                {upcomingMatches.slice(0, 4).map((match) => (
                  <MatchCard key={match.id} match={match} onClick={onSelectMatch} />
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#121519] border border-[#22272E] text-center text-xs text-[#8B949E]">
                No hay partidos pendientes en este bloque horario. Consultá la agenda completa.
              </div>
            )}
          </div>

          {/* CÁBALA JUGAR BANNER TEASER */}
          <div className="relative overflow-hidden rounded-3xl bg-[#121519] border border-[#22272E] p-6 md:p-8 hover:border-[#DCA842]/40 transition-colors">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#DCA842]/15 text-[#DCA842] border border-[#DCA842]/30">
                    Ecosistema Competitivo · Próxima Fase
                  </span>
                </div>
                <h3 className="font-editorial font-bold text-xl text-[#F1EDE6]">
                  Desafío Cábala: Trivia y 1v1
                </h3>
                <p className="text-xs text-[#8B949E] max-w-md leading-relaxed">
                  Poné a prueba tu conocimiento de historia, ídolos y mística del fútbol argentino. Partidas con ranking y sistema ELO en desarrollo.
                </p>
              </div>

              <button
                onClick={onOpenGame}
                className="shrink-0 px-5 py-3 rounded-xl bg-[#DCA842] hover:bg-[#c99532] text-[#0A0C0E] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg hover:translate-y-[-1px]"
              >
                <Zap className="w-4 h-4 fill-[#0A0C0E]" />
                <span>Probar demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right (5 cols): Snapshot de Posiciones & Clubes */}
        <div className="lg:col-span-5 space-y-6">
          {/* Top Standings Summary */}
          <section className="bg-[#121519] border border-[#22272E] rounded-3xl p-6 shadow-md">
            <div className="flex items-center justify-between pb-4 border-b border-[#22272E] mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DCA842]">Primera División</span>
                <h3 className="font-editorial font-bold text-lg text-[#F1EDE6]">
                  Tabla de Posiciones
                </h3>
              </div>
              <button
                onClick={() => onNavigate('tablas')}
                className="text-xs font-semibold text-[#8B949E] hover:text-[#DCA842] flex items-center gap-1 transition-colors"
              >
                <span>Ver tabla</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#DCA842]" />
              </button>
            </div>

            {topStandings.length > 0 ? (
              <div className="divide-y divide-[#22272E]/60">
                {topStandings.slice(0, 5).map((row) => {
                  const team = row.team;
                  const teamName = team?.shortName || team?.name || `Club ${row.teamId}`;

                  return (
                    <div
                      key={row.teamId}
                      onClick={() => onSelectClub(row.teamId)}
                      className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#181C22]/50 px-2 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`font-num font-bold text-xs w-4 text-center ${row.position === 1 ? 'text-[#DCA842]' : 'text-[#8B949E]'}`}>
                          {row.position}
                        </span>
                        <TeamBadge teamId={row.teamId} team={team} logoUrl={team?.logo} size="xs" />
                        <span className="font-semibold text-xs text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors truncate">
                          {teamName}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className="font-num text-[#8B949E] text-xs">{row.played} PJ</span>
                        <span className="font-num font-black text-base tabular-nums text-[#F1EDE6] group-hover:text-[#DCA842]">
                          {row.points} <span className="text-[10px] text-[#8B949E] font-medium">pts</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#8B949E] py-4 text-center">
                Tabla de posiciones en sincronización con la fuente oficial.
              </p>
            )}
          </section>

          {/* Quick Access to Top Argentine Clubs */}
          <section className="bg-[#121519] border border-[#22272E] rounded-3xl p-6 shadow-md">
            <div className="flex items-center justify-between pb-4 border-b border-[#22272E] mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B949E]">Instituciones</span>
                <h3 className="font-editorial font-bold text-lg text-[#F1EDE6]">
                  Clubes de Primera
                </h3>
              </div>
              <button
                onClick={() => onNavigate('clubes')}
                className="text-xs font-semibold text-[#8B949E] hover:text-[#DCA842] flex items-center gap-1 transition-colors"
              >
                <span>Directorio ({topTeams.length})</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#DCA842]" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {topTeams.slice(0, 6).map((team) => (
                <button
                  key={team.id}
                  onClick={() => onSelectClub(team.id)}
                  className="p-3 rounded-xl bg-[#181C22] hover:bg-[#1C2128] border border-[#22272E] hover:border-[#DCA842]/40 flex items-center gap-3 text-left transition-all group"
                >
                  <TeamBadge teamId={team.id} team={team} logoUrl={team.logo} size="xs" />
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors block truncate">
                      {team.shortName || team.name}
                    </span>
                    <span className="text-[10px] font-num text-[#8B949E] block">
                      {team.code} · {team.city || 'Argentina'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* 4. REAL FOOTBALL NEWS & EDITORIAL ARTICLES */}
      {news.length > 0 && (
        <section className="pt-6 border-t border-[#22272E]">
          <div className="mb-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#DCA842]">Actualidad Oficial</span>
            <h2 className="font-editorial font-black text-2xl text-[#F1EDE6]">
              Noticias del Fútbol Argentino
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {news.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-[#121519] border border-[#22272E] hover:border-[#DCA842]/40 hover:bg-[#15191F] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[#8B949E] mb-3 font-semibold">
                    <span className="text-[#DCA842] uppercase tracking-wider font-bold">{item.tag}</span>
                    <span>{item.readTime}</span>
                  </div>
                  <h4 className="font-editorial font-bold text-base text-[#F1EDE6] mb-2.5 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#8B949E] leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#22272E] flex items-center justify-between text-[11px] text-[#8B949E]">
                  <span className="font-medium text-[#F1EDE6]">{item.author}</span>
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer sober note */}
      <div className="p-4 rounded-2xl bg-[#121519] border border-[#22272E] flex items-center justify-between text-xs text-[#8B949E]">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#DCA842]" />
          <span>CÁBALA Data Engine · Datos oficiales de la Liga Profesional de Fútbol AFA 2026. Sin datos ficticios.</span>
        </div>
      </div>
    </div>
  );
};
