import React, { useState, useEffect } from 'react';
import { Team, Match } from '../../types/football';
import { TeamBadge } from '../common/TeamBadge';
import { MatchCard } from '../matches/MatchCard';
import { TabNav } from '../common/TabNav';
import { ArrowLeft, MapPin, Calendar, Trophy, Star, Shield, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { formatStatValue, formatTextValue } from '../../utils/formatters';
import { SinDatoBadge } from '../common/SinDatoBadge';
import { footballService } from '../../services/footballService';

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
  const [dossier, setDossier] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadInstitutional() {
      try {
        const d = await footballService.getClubInstitutional(team.id, team.name);
        if (isMounted) setDossier(d);
      } catch (err) {
        console.error('Error cargando dossier institucional:', err);
      }
    }
    loadInstitutional();
    return () => {
      isMounted = false;
    };
  }, [team.id, team.name]);

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

  const hasStats = Boolean(team.seasonStats && typeof team.seasonStats.played === 'number');
  const titles = team.titlesCount || { league: 0, nationalCup: 0, international: 0, total: 0 };
  const totalTitles = titles.total ?? (titles.league + titles.nationalCup + titles.international);
  const nicknamesList = team.nicknames && team.nicknames.length > 0 ? team.nicknames : (team.nickname ? [team.nickname] : []);

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
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-[#8B949E] uppercase tracking-widest px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08]">
                  Primera División AFA · Torneo 2026
                </span>
                {team.zone && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#DCA842]/15 text-[#DCA842] border border-[#DCA842]/30">
                    Zona {team.zone}
                  </span>
                )}
                {totalTitles > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-[#DCA842] border border-amber-500/30 flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-[#DCA842]" />
                    <span>{totalTitles} {totalTitles === 1 ? 'Título Oficial' : 'Títulos Oficiales'}</span>
                  </span>
                )}
              </div>

              <div>
                <h1 className="font-editorial font-black text-3xl md:text-5xl text-[#F1EDE6] tracking-tight leading-tight">
                  {team.name}
                </h1>
                {nicknamesList.length > 0 && (
                  <p className="text-xs sm:text-sm text-[#DCA842] font-medium mt-1">
                    Apodos: <span className="text-[#F1EDE6] font-semibold">{nicknamesList.join(' · ')}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#8B949E] pt-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#DCA842]" />
                  <span>{team.neighborhood ? `${team.neighborhood}, ` : ''}{team.city}{team.province && team.province !== team.city ? ` (${team.province})` : ''}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#8B949E]" />
                  <span>
                    Fundación:{' '}
                    <strong className="text-[#F1EDE6]">
                      {team.foundedFullDate || team.founded}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#8B949E]" />
                  <span>
                    {team.stadium}
                    {team.stadiumNickname ? ` ("${team.stadiumNickname}")` : ''}
                    {team.stadiumCapacity ? ` · ${team.stadiumCapacity.toLocaleString('es-AR')} esp.` : ''}
                  </span>
                </div>
                {team.officialWebsite && (
                  <div className="flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-[#DCA842]" />
                    <a
                      href={team.officialWebsite}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#DCA842] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Sitio Oficial</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          {hasStats && team.seasonStats ? (
            <div className="grid grid-cols-3 gap-3 bg-[#181C22] p-4 rounded-2xl border border-[#22272E] text-center shrink-0">
              <div>
                <span className="text-[10px] text-[#8B949E] uppercase font-bold block mb-1">Posición</span>
                <span className="font-num font-black text-2xl text-[#F1EDE6]">
                  #{formatStatValue(team.seasonStats.position)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8B949E] uppercase font-bold block mb-1">Puntos</span>
                <span className="font-num font-black text-2xl text-[#DCA842]">
                  {formatStatValue(team.seasonStats.points)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8B949E] uppercase font-bold block mb-1">Partidos</span>
                <span className="font-num font-black text-2xl text-[#F1EDE6]">
                  {formatStatValue(team.seasonStats.played)}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-[#181C22] p-4 rounded-2xl border border-[#22272E] text-center shrink-0">
              <span className="text-[10px] text-[#8B949E] uppercase font-bold block mb-1">Abreviatura Oficial</span>
              <span className="font-num font-black text-2xl text-[#DCA842]">{team.code}</span>
              <span className="text-[10px] text-[#8B949E] block mt-1">AFA / FIFA</span>
            </div>
          )}
        </div>

        {/* Recent Form Strip */}
        <div className="mt-8 pt-5 border-t border-[#22272E] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-[#8B949E] font-medium">Últimos 5 partidos (Forma oficial):</span>
            {team.recentForm && team.recentForm.length > 0 ? (
              <div className="flex items-center gap-1.5">
                {team.recentForm.map((f, i) => renderFormBadge(f, i))}
              </div>
            ) : (
              <SinDatoBadge inline label="SIN DATO" />
            )}
          </div>
          {team.manager && (
            <div className="text-xs text-[#8B949E]">
              Director Técnico: <strong className="text-[#F1EDE6]">{team.manager}</strong>
            </div>
          )}
        </div>
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
                <span className="font-num font-black text-3xl text-[#F1EDE6]">
                  {formatStatValue(team.seasonStats.goalsFor)}
                </span>
                <span className="text-[11px] text-[#8B949E] block mt-1">
                  {team.seasonStats.played > 0
                    ? `${(team.seasonStats.goalsFor / team.seasonStats.played).toFixed(2)} por partido`
                    : '0 por partido'}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[#121519] border border-[#22272E]">
                <span className="text-[11px] text-[#8B949E] uppercase font-bold block mb-1">Goles en Contra</span>
                <span className="font-num font-black text-3xl text-[#F1EDE6]">
                  {formatStatValue(team.seasonStats.goalsAgainst)}
                </span>
                <span className="text-[11px] text-[#8B949E] block mt-1">
                  {team.seasonStats.played > 0
                    ? `${(team.seasonStats.goalsAgainst / team.seasonStats.played).toFixed(2)} por partido`
                    : '0 por partido'}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[#121519] border border-[#22272E]">
                <span className="text-[11px] text-[#8B949E] uppercase font-bold block mb-1">Victorias</span>
                <span className="font-num font-black text-3xl text-[#10B981]">
                  {formatStatValue(team.seasonStats.won)}
                </span>
                <span className="text-[11px] text-[#8B949E] block mt-1">
                  {team.seasonStats.played > 0
                    ? `${((team.seasonStats.won / team.seasonStats.played) * 100).toFixed(0)}% efectividad`
                    : '0% efectividad'}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[#121519] border border-[#22272E]">
                <span className="text-[11px] text-[#8B949E] uppercase font-bold block mb-1">Diferencia de Gol</span>
                <span className="font-num font-black text-3xl text-[#DCA842]">
                  {formatStatValue(team.seasonStats.goalsFor - team.seasonStats.goalsAgainst, { sign: true })}
                </span>
                <span className="text-[11px] text-[#8B949E] block mt-1">Balance total</span>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#121519] border border-[#22272E] text-center space-y-2">
              <SinDatoBadge inline label="SIN DATO" />
              <p className="text-xs text-[#8B949E]">
                Las métricas individuales de temporada se actualizan según la tabla de posiciones oficial de ESPN.
              </p>
            </div>
          )}

          {/* Institutional Card with Official Verification */}
          <div className="p-6 rounded-3xl bg-[#121519] border border-[#22272E] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#22272E] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#30A46C]" />
                <h3 className="font-editorial font-bold text-lg text-[#F1EDE6]">
                  Perfil Institucional & Verificación AFA
                </h3>
              </div>
              <div>
                {dossier?.status === 'VERIFIED' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#30A46C]/15 text-[#30A46C] border border-[#30A46C]/30">
                    VERIFIED · Dominio Institucional Oficial
                  </span>
                ) : (
                  <SinDatoBadge inline label="SIN DATO OFICIAL" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#8B949E]">
              <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E]">
                <span className="block mb-1 text-[10px] uppercase font-bold text-[#8B949E]">Nombre Completo</span>
                <span className="font-bold text-[#F1EDE6] text-sm block">{dossier?.name || team.name}</span>
                <span className="text-[11px] text-[#8B949E] mt-1 block">Abreviatura: {team.code}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E]">
                <span className="block mb-1 text-[10px] uppercase font-bold text-[#8B949E]">Sede y Jurisdicción</span>
                <span className="font-bold text-[#F1EDE6] text-sm block">
                  {dossier?.city ? `${dossier.city}, ${dossier.province}` : formatTextValue(team.city)}
                </span>
                <span className="text-[11px] text-[#8B949E] mt-1 block">Afiliado directo AFA</span>
              </div>
              <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E]">
                <span className="block mb-1 text-[10px] uppercase font-bold text-[#8B949E]">Estadio Oficial</span>
                <span className="font-bold text-[#F1EDE6] text-sm block">
                  {dossier?.stadium || formatTextValue(team.stadium)}
                </span>
                <span className="text-[11px] text-[#8B949E] mt-1 block">Capacidad según AFA</span>
              </div>
            </div>

            {dossier?.officialWebsiteUrl && (
              <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8B949E] block">Canal Oficial Descubierto</span>
                  <span className="font-mono text-xs text-[#DCA842]">{dossier.officialDomain}</span>
                </div>
                <a
                  href={dossier.officialWebsiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#DCA842]/10 text-[#DCA842] hover:bg-[#DCA842]/20 font-semibold transition-colors shrink-0"
                >
                  <span>Portal Institucional del Club</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {dossier?.verificationNotes && (
              <div className="text-[11px] text-[#8B949E] bg-[#181C22] p-3 rounded-xl border border-[#22272E]">
                <strong>Nota de Procedencia CÁBALA:</strong> {dossier.verificationNotes}
              </div>
            )}
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
              <SinDatoBadge inline label="SIN DATO" />
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
                <span className="font-num text-2xl font-bold text-[#F1EDE6]">
                  {formatStatValue(team.seasonStats.played)}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E]">
                <span className="text-xs text-[#8B949E] block">Victorias</span>
                <span className="font-num text-2xl font-bold text-[#10B981]">
                  {formatStatValue(team.seasonStats.won)}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E]">
                <span className="text-xs text-[#8B949E] block">Empates</span>
                <span className="font-num text-2xl font-bold text-[#F1EDE6]">
                  {formatStatValue(team.seasonStats.drawn)}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E]">
                <span className="text-xs text-[#8B949E] block">Derrotas</span>
                <span className="font-num text-2xl font-bold text-[#E63946]">
                  {formatStatValue(team.seasonStats.lost)}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E]">
                <span className="text-xs text-[#8B949E] block">Goles a Favor</span>
                <span className="font-num text-2xl font-bold text-[#F1EDE6]">
                  {formatStatValue(team.seasonStats.goalsFor)}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[#181C22] border border-[#22272E]">
                <span className="text-xs text-[#8B949E] block">Goles en Contra</span>
                <span className="font-num text-2xl font-bold text-[#F1EDE6]">
                  {formatStatValue(team.seasonStats.goalsAgainst)}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-6 space-y-3">
              <SinDatoBadge inline label="SIN DATO" />
              <h4 className="font-bold text-sm text-[#F1EDE6]">Estadísticas detalladas no disponibles</h4>
              <p className="text-xs text-[#8B949E] max-w-sm mx-auto">
                Las estadísticas avanzadas se sincronizan cuando el proveedor de datos (ESPN) computa los datos de la fecha.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: HISTORIAL & PALMARÉS */}
      {activeTab === 'historial' && (
        <div className="space-y-6">
          {/* Official Titles Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#121519] border border-white/[0.08] text-center">
              <Trophy className="w-6 h-6 text-[#DCA842] mx-auto mb-1.5" />
              <span className="text-[10px] text-[#8B949E] block uppercase font-bold tracking-wider">Ligas Nacionales</span>
              <span className="font-num text-3xl font-black text-[#F1EDE6] mt-1 block">{titles.league}</span>
              <span className="text-[10px] text-[#8B949E] mt-0.5 block">AFA Oficial</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#121519] border border-white/[0.08] text-center">
              <Trophy className="w-6 h-6 text-[#DCA842] mx-auto mb-1.5" />
              <span className="text-[10px] text-[#8B949E] block uppercase font-bold tracking-wider">Copas Nacionales</span>
              <span className="font-num text-3xl font-black text-[#F1EDE6] mt-1 block">{titles.nationalCup}</span>
              <span className="text-[10px] text-[#8B949E] mt-0.5 block">Copas AFA</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#121519] border border-white/[0.08] text-center">
              <Trophy className="w-6 h-6 text-[#DCA842] mx-auto mb-1.5" />
              <span className="text-[10px] text-[#8B949E] block uppercase font-bold tracking-wider">Títulos Internacionales</span>
              <span className="font-num text-3xl font-black text-[#F1EDE6] mt-1 block">{titles.international}</span>
              <span className="text-[10px] text-[#8B949E] mt-0.5 block">CONMEBOL / FIFA</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#181C22] border border-[#DCA842]/30 text-center shadow-sm">
              <Trophy className="w-6 h-6 text-[#DCA842] mx-auto mb-1.5" />
              <span className="text-[10px] text-[#DCA842] block uppercase font-black tracking-wider">Total Oficiales</span>
              <span className="font-num text-3xl font-black text-[#DCA842] mt-1 block">{totalTitles}</span>
              <span className="text-[10px] text-[#8B949E] mt-0.5 block">Primera División</span>
            </div>
          </div>

          {/* Highlights & Historical Campaigns */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#121519] border border-white/[0.08] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#DCA842] block mb-1">
                  {totalTitles > 0 ? 'Palmarés Verificado AFA / CONMEBOL' : 'Trayectoria en Primera División'}
                </span>
                <h3 className="font-editorial font-bold text-xl text-[#F1EDE6]">
                  {totalTitles > 0 ? 'Conquistas y Títulos Destacados' : 'Grandes Campañas & Logros Históricos'}
                </h3>
              </div>
              <span className="text-xs text-[#8B949E]">
                {totalTitles > 0 ? `${totalTitles} trofeos en vitrina` : 'En busca de su 1ª estrella de Primera'}
              </span>
            </div>

            {team.honors?.summary && (
              <p className="text-xs sm:text-sm text-[#F1EDE6]/90 leading-relaxed font-medium bg-[#181C22] p-4 rounded-xl border border-white/[0.06]">
                {team.honors.summary}
              </p>
            )}

            {team.honors?.highlighted && team.honors.highlighted.length > 0 ? (
              <div className="space-y-2.5 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B949E] block">
                  {totalTitles > 0 ? 'Principales Títulos Conquistados:' : 'Hitos e Historial Institucional:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {team.honors.highlighted.map((highlight, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-[#181C22]/80 border border-white/[0.06] hover:border-[#DCA842]/30 transition-colors"
                    >
                      <Trophy className="w-4 h-4 text-[#DCA842] shrink-0 mt-0.5" />
                      <span className="text-xs font-semibold text-[#F1EDE6] leading-snug">
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Club Origin & History */}
            {team.historySummary && (
              <div className="pt-4 border-t border-white/[0.06] space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#DCA842] block">
                  Reseña Histórica & Mística
                </span>
                <p className="text-xs text-[#8B949E] leading-relaxed">
                  {team.historySummary}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
