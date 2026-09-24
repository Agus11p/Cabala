import React, { useState } from 'react';
import { Team, Match } from '../../types/football';
import { TeamBadge } from '../common/TeamBadge';
import { MatchCard } from '../matches/MatchCard';
import { TabNav } from '../common/TabNav';
import { ArrowLeft, MapPin, Calendar, Trophy, Star, Shield, AlertCircle } from 'lucide-react';

interface ClubDetailViewProps {
  team: Team;
  matches: Match[];
  onBack: () => void;
  onSelectMatch: (matchId: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (teamId: string) => void;
}

type ClubTab = 'resumen' | 'partidos' | 'estadisticas' | 'historial';

export const ClubDetailView: React.FC<ClubDetailViewProps> = ({
  team,
  matches,
  onBack,
  onSelectMatch,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const [activeTab, setActiveTab] = useState<ClubTab>('resumen');

  const teamMatches = matches.filter(
    (m) =>
      m.homeTeamId === team.id ||
      m.awayTeamId === team.id ||
      m.homeTeam?.code === team.code ||
      m.awayTeam?.code === team.code ||
      m.homeTeam?.name === team.name ||
      m.awayTeam?.name === team.name
  );

  const pastMatches = teamMatches.filter((m) => m.status === 'finished');
  const upcomingMatches = teamMatches.filter((m) => m.status === 'scheduled' || m.status === 'live');

  const tabs = [
    { id: 'resumen' as const, label: 'Resumen' },
    { id: 'partidos' as const, label: `Partidos (${teamMatches.length})` },
    { id: 'estadisticas' as const, label: 'Estadísticas' },
    { id: 'historial' as const, label: 'Palmarés & Títulos' },
  ];

  const renderFormBadge = (formChar: 'W' | 'D' | 'L', idx: number) => {
    let letter = 'V';
    let style = 'bg-[#30A46C]/15 text-[#30A46C] border-[#30A46C]/30';

    if (formChar === 'D') {
      letter = 'E';
      style = 'bg-[#8B949E]/15 text-[#8B949E] border-[#8B949E]/30';
    } else if (formChar === 'L') {
      letter = 'D';
      style = 'bg-[#E5484D]/15 text-[#E5484D] border-[#E5484D]/30';
    }

    return (
      <span
        key={idx}
        className={`w-6 h-6 rounded-md border flex items-center justify-center text-xs font-bold font-num ${style}`}
      >
        {letter}
      </span>
    );
  };

  const hasStats = team.seasonStats && team.seasonStats.played > 0;

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Back Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#8B949E] hover:text-[#DCA842] transition-colors py-1.5 focus:outline-hidden"
        >
          <ArrowLeft className="w-4 h-4 text-[#DCA842]" />
          <span>Volver al directorio de clubes</span>
        </button>

        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(team.id)}
            className={`inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl border transition-all ${
              isFavorite
                ? 'bg-[#DCA842]/15 text-[#DCA842] border-[#DCA842]/40 font-bold'
                : 'bg-[#181C22] text-[#8B949E] hover:text-[#F1EDE6] border-[#22272E]'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-[#DCA842] text-[#DCA842]' : ''}`} />
            <span>{isFavorite ? 'Mi Cábala' : 'Elegir como Mi Club'}</span>
          </button>
        )}
      </div>

      {/* Hero Header with Club Identity */}
      <div className="relative overflow-hidden rounded-3xl bg-[#121519] border border-[#22272E] p-6 md:p-10 shadow-xl">
        <div
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: team.primaryColor || '#DCA842' }}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start md:items-center gap-6">
            <TeamBadge teamId={team.id} team={team} logoUrl={team.logo} size="xl" className="shrink-0" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[#8B949E] uppercase tracking-widest">
                  Primera División AFA · Torneo 2026
                </span>
              </div>
              <h1 className="font-editorial font-black text-3xl md:text-4xl text-[#F1EDE6] tracking-tight leading-tight">
                {team.name}
              </h1>
              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-5 text-xs text-[#8B949E] mt-3">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#DCA842]" />
                  <span>{team.city || 'Argentina'}</span>
                </div>
                {team.founded > 1800 && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#8B949E]" />
                    <span>Fundación: <strong className="text-[#F1EDE6]">{team.founded}</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#8B949E]" />
                  <span>{team.stadium || 'Estadio Oficial'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          {hasStats && team.seasonStats ? (
            <div className="grid grid-cols-3 gap-3 bg-[#181C22] p-4 rounded-2xl border border-[#22272E] text-center shrink-0">
              <div>
                <span className="text-[10px] text-[#8B949E] uppercase font-bold block mb-1">Posición</span>
                <span className="font-num font-black text-2xl text-[#F1EDE6]">#{team.seasonStats.position}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8B949E] uppercase font-bold block mb-1">Puntos</span>
                <span className="font-num font-black text-2xl text-[#DCA842]">{team.seasonStats.points}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8B949E] uppercase font-bold block mb-1">Partidos</span>
                <span className="font-num font-black text-2xl text-[#F1EDE6]">{team.seasonStats.played}</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#181C22] p-4 rounded-2xl border border-[#22272E] text-center shrink-0">
              <span className="text-[10px] text-[#8B949E] uppercase font-bold block mb-1">Abreviatura</span>
              <span className="font-num font-black text-2xl text-[#DCA842]">{team.code}</span>
            </div>
          )}
        </div>

        {/* Recent Form Strip */}
        {team.recentForm && team.recentForm.length > 0 && (
          <div className="mt-8 pt-5 border-t border-[#22272E] flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-[#8B949E] font-medium">Forma reciente en el campeonato:</span>
              <div className="flex items-center gap-1.5">
                {team.recentForm.map((f, i) => renderFormBadge(f, i))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex justify-start">
        <TabNav tabs={tabs} activeTab={activeTab} onChange={(t) => setActiveTab(t as ClubTab)} />
      </div>

      {/* TAB 1: RESUMEN */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          {hasStats && team.seasonStats ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#121519] border border-[#22272E]">
                <span className="text-[11px] text-[#8B949E] uppercase font-bold block mb-1">Goles a Favor</span>
                <span className="font-num font-black text-3xl text-[#F1EDE6]">{team.seasonStats.goalsFor}</span>
                <span className="text-[11px] text-[#8B949E] block mt-1">
                  {(team.seasonStats.goalsFor / team.seasonStats.played).toFixed(2)} por partido
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[#121519] border border-[#22272E]">
                <span className="text-[11px] text-[#8B949E] uppercase font-bold block mb-1">Goles en Contra</span>
                <span className="font-num font-black text-3xl text-[#F1EDE6]">{team.seasonStats.goalsAgainst}</span>
                <span className="text-[11px] text-[#8B949E] block mt-1">
                  {(team.seasonStats.goalsAgainst / team.seasonStats.played).toFixed(2)} por partido
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[#121519] border border-[#22272E]">
                <span className="text-[11px] text-[#8B949E] uppercase font-bold block mb-1">Victorias</span>
                <span className="font-num font-black text-3xl text-[#30A46C]">{team.seasonStats.won}</span>
                <span className="text-[11px] text-[#8B949E] block mt-1">
                  {((team.seasonStats.won / team.seasonStats.played) * 100).toFixed(0)}% efectividad
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[#121519] border border-[#22272E]">
                <span className="text-[11px] text-[#8B949E] uppercase font-bold block mb-1">Diferencia de Gol</span>
                <span className="font-num font-black text-3xl text-[#DCA842]">
                  {team.seasonStats.goalsFor - team.seasonStats.goalsAgainst > 0
                    ? `+${team.seasonStats.goalsFor - team.seasonStats.goalsAgainst}`
                    : team.seasonStats.goalsFor - team.seasonStats.goalsAgainst}
                </span>
                <span className="text-[11px] text-[#8B949E] block mt-1">Balance total</span>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#121519] border border-[#22272E] text-center space-y-2">
              <span className="text-xs text-[#8B949E]">
                Las métricas individuales de temporada se actualizan según la tabla de posiciones oficial.
              </span>
            </div>
          )}

          {/* Institutional Card */}
          <div className="p-6 rounded-3xl bg-[#121519] border border-[#22272E]">
            <h3 className="font-editorial font-bold text-lg text-[#F1EDE6] mb-4">
              Perfil Institucional
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#8B949E]">
              <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E]">
                <span className="block mb-1">Nombre Completo</span>
                <span className="font-bold text-[#F1EDE6] text-sm">{team.name}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E]">
                <span className="block mb-1">Localidad</span>
                <span className="font-bold text-[#F1EDE6] text-sm">{team.city || 'Argentina'}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E]">
                <span className="block mb-1">Estadio</span>
                <span className="font-bold text-[#F1EDE6] text-sm">{team.stadium || 'Estadio Oficial'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PARTIDOS */}
      {activeTab === 'partidos' && (
        <div className="space-y-6">
          {upcomingMatches.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-editorial font-bold text-base text-[#F1EDE6]">
                Próximos Compromisos
              </h3>
              <div className="space-y-3">
                {upcomingMatches.map((m) => (
                  <MatchCard key={m.id} match={m} onClick={onSelectMatch} />
                ))}
              </div>
            </div>
          )}

          {pastMatches.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-editorial font-bold text-base text-[#F1EDE6]">
                Resultados Anteriores
              </h3>
              <div className="space-y-3">
                {pastMatches.map((m) => (
                  <MatchCard key={m.id} match={m} onClick={onSelectMatch} />
                ))}
              </div>
            </div>
          )}

          {teamMatches.length === 0 && (
            <div className="p-8 rounded-2xl bg-[#121519] border border-[#22272E] text-center space-y-2">
              <p className="font-semibold text-sm text-[#F1EDE6]">Sin partidos registrados en el fixture actual</p>
              <p className="text-xs text-[#8B949E]">
                Los partidos se cargan en tiempo real según el cronograma oficial de AFA.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ESTADÍSTICAS */}
      {activeTab === 'estadisticas' && (
        <div className="p-8 rounded-3xl bg-[#121519] border border-[#22272E] text-center space-y-3">
          {hasStats && team.seasonStats ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E]">
                <span className="text-xs text-[#8B949E] block">Partidos Jugados</span>
                <span className="font-num text-2xl font-bold text-[#F1EDE6]">{team.seasonStats.played}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E]">
                <span className="text-xs text-[#8B949E] block">Victorias</span>
                <span className="font-num text-2xl font-bold text-[#30A46C]">{team.seasonStats.won}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E]">
                <span className="text-xs text-[#8B949E] block">Empates</span>
                <span className="font-num text-2xl font-bold text-[#F1EDE6]">{team.seasonStats.drawn}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E]">
                <span className="text-xs text-[#8B949E] block">Derrotas</span>
                <span className="font-num text-2xl font-bold text-[#E5484D]">{team.seasonStats.lost}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E]">
                <span className="text-xs text-[#8B949E] block">Goles a Favor</span>
                <span className="font-num text-2xl font-bold text-[#F1EDE6]">{team.seasonStats.goalsFor}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E]">
                <span className="text-xs text-[#8B949E] block">Goles en Contra</span>
                <span className="font-num text-2xl font-bold text-[#F1EDE6]">{team.seasonStats.goalsAgainst}</span>
              </div>
            </div>
          ) : (
            <div className="py-6 space-y-2">
              <AlertCircle className="w-8 h-8 text-[#DCA842] mx-auto opacity-70" />
              <h4 className="font-bold text-sm text-[#F1EDE6]">Estadísticas detalladas no disponibles</h4>
              <p className="text-xs text-[#8B949E] max-w-sm mx-auto">
                Las estadísticas avanzadas se sincronizan cuando el proveedor oficial computa los datos de la fecha.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: HISTORIAL & PALMARÉS */}
      {activeTab === 'historial' && (
        <div className="p-8 rounded-3xl bg-[#121519] border border-[#22272E] text-center space-y-3">
          {team.titlesCount && (team.titlesCount.league > 0 || team.titlesCount.nationalCup > 0 || team.titlesCount.international > 0) ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-6 rounded-2xl bg-[#181C22] border border-[#22272E] text-center">
                <Trophy className="w-8 h-8 text-[#DCA842] mx-auto mb-2" />
                <span className="text-xs text-[#8B949E] block uppercase font-bold">Ligas Nacionales</span>
                <span className="font-num text-4xl font-black text-[#F1EDE6] mt-2 block">{team.titlesCount.league}</span>
              </div>
              <div className="p-6 rounded-2xl bg-[#181C22] border border-[#22272E] text-center">
                <Trophy className="w-8 h-8 text-[#DCA842] mx-auto mb-2" />
                <span className="text-xs text-[#8B949E] block uppercase font-bold">Copas Nacionales</span>
                <span className="font-num text-4xl font-black text-[#F1EDE6] mt-2 block">{team.titlesCount.nationalCup}</span>
              </div>
              <div className="p-6 rounded-2xl bg-[#181C22] border border-[#22272E] text-center">
                <Trophy className="w-8 h-8 text-[#DCA842] mx-auto mb-2" />
                <span className="text-xs text-[#8B949E] block uppercase font-bold">Títulos Internacionales</span>
                <span className="font-num text-4xl font-black text-[#F1EDE6] mt-2 block">{team.titlesCount.international}</span>
              </div>
            </div>
          ) : (
            <div className="py-6 space-y-2">
              <Trophy className="w-8 h-8 text-[#8B949E] mx-auto opacity-50" />
              <h4 className="font-bold text-sm text-[#F1EDE6]">Palmarés oficial no disponible</h4>
              <p className="text-xs text-[#8B949E] max-w-sm mx-auto">
                El histórico oficial de títulos de AFA no está integrado en la fuente de datos actual. En cumplimiento de las reglas de CÁBALA, no se inventan copas.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
