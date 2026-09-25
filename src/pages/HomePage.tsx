import React from 'react';
import { Match, Team, StandingRow, NewsInsight, UserProfile, TableType } from '../types/football';
import { MatchCard } from '../components/matches/MatchCard';
import { TeamBadge } from '../components/common/TeamBadge';
import { Zap, ChevronRight, Trophy, Flame, User, ArrowUpRight, ShieldCheck, Clock } from 'lucide-react';

interface HomePageProps {
  featuredMatch: Match | null;
  liveMatches: Match[];
  upcomingMatches: Match[];
  topTeams: Team[];
  topStandings: StandingRow[];
  news: NewsInsight[];
  userProfile: UserProfile | null;
  onSelectMatch: (matchId: string) => void;
  onSelectClub: (clubId: string) => void;
  onNavigate: (view: string, initialTable?: TableType) => void;
  onOpenGame: () => void;
  onOpenProfile: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  featuredMatch,
  liveMatches,
  upcomingMatches,
  topTeams,
  topStandings,
  news,
  userProfile,
  onSelectMatch,
  onSelectClub,
  onNavigate,
  onOpenGame,
  onOpenProfile,
}) => {
  const currentRoundName = featuredMatch?.round || upcomingMatches[0]?.round || 'Fecha Oficial';
  const hasLiveMatches = liveMatches.length > 0;

  // Selected favorite club object if userProfile exists
  const favoriteClub = userProfile
    ? topTeams.find((t) => t.id === userProfile.favoriteClubId) || null
    : null;

  const winRate = userProfile && userProfile.wins + userProfile.losses > 0
    ? Math.round((userProfile.wins / (userProfile.wins + userProfile.losses)) * 100)
    : 0;

  return (
    <div className="space-y-10 animate-fadeIn pb-16">
      {/* ───────────────────────────────────────────────────────────
          1. ¿QUÉ ESTÁ PASANDO HOY?
          Header Editorial + Partido Destacado de la Jornada
         ─────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
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

        {/* Hero: Featured Match Card */}
        {featuredMatch && (
          <div>
            <MatchCard match={featuredMatch} onClick={onSelectMatch} featured />
          </div>
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
                <span className="text-[#DCA842] uppercase text-[10px] tracking-wider font-bold">Fase Regular</span>
                <ArrowUpRight className="w-4 h-4 text-[#8B949E] group-hover:text-[#DCA842] transition-colors" />
              </div>
              <h3 className="font-editorial font-bold text-base text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors">
                Torneo Apertura
              </h3>
              <p className="text-xs text-[#8B949E] mt-1 line-clamp-2">
                Zona A (15) y Zona B (15). Clasifican los 8 primeros de cada zona a Octavos de Final.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#8B949E]">
              <span>16 Fechas</span>
              <span className="font-bold text-[#F1EDE6] group-hover:text-[#DCA842]">Ver zonas →</span>
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

        {/* Asymmetric Section: Próximos Partidos + Snapshot de Líderes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Left: Agenda Compacta de Partidos (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B949E]">Agenda Oficial</span>
                <h3 className="font-editorial font-bold text-lg text-[#F1EDE6]">
                  Próximos Encuentros
                </h3>
              </div>
              <button
                onClick={() => onNavigate('partidos')}
                className="text-xs font-semibold text-[#8B949E] hover:text-[#DCA842] flex items-center gap-1 transition-colors"
              >
                <span>Ver todos</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#DCA842]" />
              </button>
            </div>

            {upcomingMatches.length > 0 ? (
              <div className="space-y-2.5">
                {upcomingMatches.slice(0, 4).map((match) => (
                  <MatchCard key={match.id} match={match} onClick={onSelectMatch} />
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#121519] border border-white/[0.08] text-center text-xs text-[#8B949E]">
                No hay partidos programados en la ventana actual.
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
                        <span className="text-[11px] font-num text-[#8B949E]">{row.played} PJ</span>
                        <span className="font-num font-black text-sm text-[#F1EDE6] group-hover:text-[#DCA842] tabular-nums min-w-[28px] text-right">
                          {row.points} <span className="text-[9px] text-[#8B949E] font-medium">pts</span>
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

      {/* ───────────────────────────────────────────────────────────
          Actualidad & Noticias Editoriales
         ─────────────────────────────────────────────────────────── */}
      {news.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#DCA842]">Crónicas y Actualidad</span>
              <h3 className="font-editorial font-bold text-xl text-[#F1EDE6]">
                Noticias de Primera
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {news.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-[#121519] border border-white/[0.08] hover:border-[#DCA842]/40 hover:bg-[#15191F] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[#8B949E] mb-2.5 font-semibold">
                    <span className="text-[#DCA842] uppercase text-[10px] tracking-wider font-bold">{item.tag}</span>
                    <span>{item.readTime}</span>
                  </div>
                  <h4 className="font-editorial font-bold text-sm text-[#F1EDE6] mb-2 leading-snug line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#8B949E] leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-[#8B949E]">
                  <span className="font-medium text-[#F1EDE6]">{item.author}</span>
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
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
