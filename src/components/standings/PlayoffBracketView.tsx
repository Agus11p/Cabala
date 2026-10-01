import React, { useState, useMemo } from 'react';
import { ZoneStanding, StandingRow } from '../../types/football';
import { TeamBadge } from '../common/TeamBadge';
import { Trophy, Award, ShieldAlert, Sparkles, RotateCcw, CheckCircle2, ChevronRight, Info } from 'lucide-react';

interface PlayoffBracketViewProps {
  zoneA: ZoneStanding[];
  zoneB: ZoneStanding[];
  onSelectClub: (clubId: string) => void;
  tournamentPhase?: 'apertura' | 'clausura';
}

interface MatchupSlot {
  id: string;
  roundName: 'Octavos de Final' | 'Cuartos de Final' | 'Semifinales' | 'Final';
  matchNumber: number;
  homeTeam: ZoneStanding | StandingRow | null;
  awayTeam: ZoneStanding | StandingRow | null;
  homeSeedLabel: string;
  awaySeedLabel: string;
  homeAdvantageText: string;
  venueNote: string;
  tiebreakRule: string;
  winnerTeamId?: string;
  parentMatch1?: number;
  parentMatch2?: number;
}

export const PlayoffBracketView: React.FC<PlayoffBracketViewProps> = ({
  zoneA,
  zoneB,
  onSelectClub,
  tournamentPhase = 'clausura',
}) => {
  const [selectedPhase, setSelectedPhase] = useState<'clausura' | 'apertura'>(tournamentPhase);
  const [viewMode, setViewMode] = useState<'bracket' | 'cards'>('bracket');
  const [userPicks, setUserPicks] = useState<Record<string, string>>({});

  // Asegurar orden de clasificación por mérito deportivo (1° al 15°)
  const sortedA = useMemo(() => {
    return [...zoneA].sort((a, b) => (a.zonePosition || a.position) - (b.zonePosition || b.position));
  }, [zoneA]);

  const sortedB = useMemo(() => {
    return [...zoneB].sort((a, b) => (a.zonePosition || a.position) - (b.zonePosition || b.position));
  }, [zoneB]);

  const qA = sortedA.slice(0, 8);
  const qB = sortedB.slice(0, 8);

  const hasEnoughTeams = qA.length >= 8 && qB.length >= 8;

  // Cruces oficiales de Octavos de Final (AFA 2026):
  // Llave 1: 1A vs 8B -> Ganador a QF 1
  // Llave 2: 4B vs 5A -> Ganador a QF 1
  // Llave 3: 2B vs 7A -> Ganador a QF 2
  // Llave 4: 3A vs 6B -> Ganador a QF 2
  // Llave 5: 1B vs 8A -> Ganador a QF 3
  // Llave 6: 4A vs 5B -> Ganador a QF 3
  // Llave 7: 2A vs 7B -> Ganador a QF 4
  // Llave 8: 3B vs 6A -> Ganador a QF 4

  const octavosPairings = useMemo(() => {
    if (!hasEnoughTeams) return [];

    return [
      { num: 1, home: qA[0], away: qB[7], homeSeed: '1°A', awaySeed: '8°B' },
      { num: 2, home: qB[3], away: qA[4], homeSeed: '4°B', awaySeed: '5°A' },
      { num: 3, home: qB[1], away: qA[6], homeSeed: '2°B', awaySeed: '7°A' },
      { num: 4, home: qA[2], away: qB[5], homeSeed: '3°A', awaySeed: '6°B' },
      { num: 5, home: qB[0], away: qA[7], homeSeed: '1°B', awaySeed: '8°A' },
      { num: 6, home: qA[3], away: qB[4], homeSeed: '4°A', awaySeed: '5°B' },
      { num: 7, home: qA[1], away: qB[6], homeSeed: '2°A', awaySeed: '7°B' },
      { num: 8, home: qB[2], away: qA[5], homeSeed: '3°B', awaySeed: '6°A' },
    ];
  }, [hasEnoughTeams, qA, qB]);

  // Resolver ganador de un matchup dado por usuario o por seed
  const getWinner = (matchId: string, team1?: any, team2?: any) => {
    if (!team1 && !team2) return null;
    if (team1 && !team2) return team1;
    if (!team1 && team2) return team2;

    const pickedId = userPicks[matchId];
    if (pickedId) {
      if (team1?.teamId === pickedId) return team1;
      if (team2?.teamId === pickedId) return team2;
    }

    // Predicción por mérito deportivo: mayor puntaje o mejor posición
    const pts1 = team1.points ?? 0;
    const pts2 = team2.points ?? 0;
    if (pts1 !== pts2) return pts1 > pts2 ? team1 : team2;

    const pos1 = team1.zonePosition || team1.position || 99;
    const pos2 = team2.zonePosition || team2.position || 99;
    return pos1 <= pos2 ? team1 : team2;
  };

  const handlePickWinner = (matchId: string, teamId: string) => {
    setUserPicks((prev) => ({ ...prev, [matchId]: teamId }));
  };

  const handleResetPicks = () => {
    setUserPicks({});
  };

  // Construir rondas completas
  const octavosMatches: MatchupSlot[] = useMemo(() => {
    return octavosPairings.map((pair) => ({
      id: `r16_${pair.num}`,
      roundName: 'Octavos de Final',
      matchNumber: pair.num,
      homeTeam: pair.home,
      awayTeam: pair.away,
      homeSeedLabel: pair.homeSeed,
      awaySeedLabel: pair.awaySeed,
      homeAdvantageText: `Local: ${pair.home?.team?.name || pair.home?.teamId} (Mejor ubicado)`,
      venueNote: `Estadio de ${pair.home?.team?.name || 'Local'}`,
      tiebreakRule: '90 min. En caso de empate: penales directos.',
      winnerTeamId: getWinner(`r16_${pair.num}`, pair.home, pair.away)?.teamId,
    }));
  }, [octavosPairings, userPicks]);

  // Cuartos de Final (4 llaves)
  const cuartosMatches: MatchupSlot[] = useMemo(() => {
    if (octavosMatches.length < 8) return [];
    const w1 = getWinner('r16_1', octavosMatches[0].homeTeam, octavosMatches[0].awayTeam);
    const w2 = getWinner('r16_2', octavosMatches[1].homeTeam, octavosMatches[1].awayTeam);
    const w3 = getWinner('r16_3', octavosMatches[2].homeTeam, octavosMatches[2].awayTeam);
    const w4 = getWinner('r16_4', octavosMatches[3].homeTeam, octavosMatches[3].awayTeam);
    const w5 = getWinner('r16_5', octavosMatches[4].homeTeam, octavosMatches[4].awayTeam);
    const w6 = getWinner('r16_6', octavosMatches[5].homeTeam, octavosMatches[5].awayTeam);
    const w7 = getWinner('r16_7', octavosMatches[6].homeTeam, octavosMatches[6].awayTeam);
    const w8 = getWinner('r16_8', octavosMatches[7].homeTeam, octavosMatches[7].awayTeam);

    return [
      {
        id: 'qf_1',
        roundName: 'Cuartos de Final',
        matchNumber: 1,
        homeTeam: w1,
        awayTeam: w2,
        homeSeedLabel: 'G-L1',
        awaySeedLabel: 'G-L2',
        homeAdvantageText: 'Mejor clasificado de fase regular',
        venueNote: 'Estadio de mejor ubicado o sede AFA',
        tiebreakRule: '90 min. Empate: definición por penales.',
        winnerTeamId: getWinner('qf_1', w1, w2)?.teamId,
        parentMatch1: 1,
        parentMatch2: 2,
      },
      {
        id: 'qf_2',
        roundName: 'Cuartos de Final',
        matchNumber: 2,
        homeTeam: w3,
        awayTeam: w4,
        homeSeedLabel: 'G-L3',
        awaySeedLabel: 'G-L4',
        homeAdvantageText: 'Mejor clasificado de fase regular',
        venueNote: 'Estadio de mejor ubicado o sede AFA',
        tiebreakRule: '90 min. Empate: definición por penales.',
        winnerTeamId: getWinner('qf_2', w3, w4)?.teamId,
        parentMatch1: 3,
        parentMatch2: 4,
      },
      {
        id: 'qf_3',
        roundName: 'Cuartos de Final',
        matchNumber: 3,
        homeTeam: w5,
        awayTeam: w6,
        homeSeedLabel: 'G-L5',
        awaySeedLabel: 'G-L6',
        homeAdvantageText: 'Mejor clasificado de fase regular',
        venueNote: 'Estadio de mejor ubicado o sede AFA',
        tiebreakRule: '90 min. Empate: definición por penales.',
        winnerTeamId: getWinner('qf_3', w5, w6)?.teamId,
        parentMatch1: 5,
        parentMatch2: 6,
      },
      {
        id: 'qf_4',
        roundName: 'Cuartos de Final',
        matchNumber: 4,
        homeTeam: w7,
        awayTeam: w8,
        homeSeedLabel: 'G-L7',
        awaySeedLabel: 'G-L8',
        homeAdvantageText: 'Mejor clasificado de fase regular',
        venueNote: 'Estadio de mejor ubicado o sede AFA',
        tiebreakRule: '90 min. Empate: definición por penales.',
        winnerTeamId: getWinner('qf_4', w7, w8)?.teamId,
        parentMatch1: 7,
        parentMatch2: 8,
      },
    ];
  }, [octavosMatches, userPicks]);

  // Semifinales (2 llaves)
  const semifinalMatches: MatchupSlot[] = useMemo(() => {
    if (cuartosMatches.length < 4) return [];
    const wQ1 = getWinner('qf_1', cuartosMatches[0].homeTeam, cuartosMatches[0].awayTeam);
    const wQ2 = getWinner('qf_2', cuartosMatches[1].homeTeam, cuartosMatches[1].awayTeam);
    const wQ3 = getWinner('qf_3', cuartosMatches[2].homeTeam, cuartosMatches[2].awayTeam);
    const wQ4 = getWinner('qf_4', cuartosMatches[3].homeTeam, cuartosMatches[3].awayTeam);

    return [
      {
        id: 'sf_1',
        roundName: 'Semifinales',
        matchNumber: 1,
        homeTeam: wQ1,
        awayTeam: wQ2,
        homeSeedLabel: 'G-C1',
        awaySeedLabel: 'G-C2',
        homeAdvantageText: 'Cancha Neutral designada por AFA',
        venueNote: 'Estadio Neutral',
        tiebreakRule: '90 min. En caso de empate: definición directa por penales.',
        winnerTeamId: getWinner('sf_1', wQ1, wQ2)?.teamId,
      },
      {
        id: 'sf_2',
        roundName: 'Semifinales',
        matchNumber: 2,
        homeTeam: wQ3,
        awayTeam: wQ4,
        homeSeedLabel: 'G-C3',
        awaySeedLabel: 'G-C4',
        homeAdvantageText: 'Cancha Neutral designada por AFA',
        venueNote: 'Estadio Neutral',
        tiebreakRule: '90 min. En caso de empate: definición directa por penales.',
        winnerTeamId: getWinner('sf_2', wQ3, wQ4)?.teamId,
      },
    ];
  }, [cuartosMatches, userPicks]);

  // Gran Final (1 llave)
  const finalMatch: MatchupSlot | null = useMemo(() => {
    if (semifinalMatches.length < 2) return null;
    const wS1 = getWinner('sf_1', semifinalMatches[0].homeTeam, semifinalMatches[0].awayTeam);
    const wS2 = getWinner('sf_2', semifinalMatches[1].homeTeam, semifinalMatches[1].awayTeam);

    return {
      id: 'final_1',
      roundName: 'Final',
      matchNumber: 1,
      homeTeam: wS1,
      awayTeam: wS2,
      homeSeedLabel: 'Finalista 1',
      awaySeedLabel: 'Finalista 2',
      homeAdvantageText: 'Sede Neutral (Designada por AFA)',
      venueNote: 'Estadio Madre de Ciudades / Kempes / Monumental',
      tiebreakRule: '90 min. Si persiste empate: 30 min de tiempo extra y luego penales.',
      winnerTeamId: getWinner('final_1', wS1, wS2)?.teamId,
    };
  }, [semifinalMatches, userPicks]);

  const championTeam = finalMatch ? getWinner('final_1', finalMatch.homeTeam, finalMatch.awayTeam) : null;

  if (!hasEnoughTeams) {
    return (
      <div className="p-8 rounded-3xl bg-[#121519] border border-white/[0.08] text-center space-y-3">
        <ShieldAlert className="w-8 h-8 text-[#DCA842] mx-auto" />
        <h3 className="font-editorial font-bold text-lg text-[#F1EDE6]">
          Fase Regular en Disputa
        </h3>
        <p className="text-xs text-[#8B949E] max-w-md mx-auto">
          Se requieren al menos 8 clubes confirmados por zona (A y B) para proyectar el cuadro completo de playoffs.
        </p>
      </div>
    );
  }

  const renderTeamSlot = (
    team: ZoneStanding | StandingRow | null,
    seedLabel: string,
    matchId: string,
    isWinner: boolean,
    isOpponentWinner: boolean,
    labelBadge?: string
  ) => {
    if (!team) {
      return (
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px] text-[#8B949E] flex items-center justify-between">
          <span className="italic">Por definir ({seedLabel})</span>
          <span className="text-[10px] font-num text-[#8B949E]/60">—</span>
        </div>
      );
    }

    const teamId = team.teamId;
    const teamName = team.team?.shortName || team.team?.name || `Club ${teamId}`;
    const pts = team.points ?? 0;

    return (
      <div
        onClick={() => handlePickWinner(matchId, teamId)}
        className={`group p-2 rounded-xl transition-all flex items-center justify-between cursor-pointer border ${
          isWinner
            ? 'bg-[#DCA842]/15 border-[#DCA842] shadow-sm shadow-[#DCA842]/10'
            : isOpponentWinner
            ? 'bg-[#15191F]/50 border-white/[0.04] opacity-60 hover:opacity-100'
            : 'bg-[#181C22] border-white/[0.06] hover:border-[#DCA842]/50 hover:bg-[#1D222A]'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`font-num font-bold text-[10px] px-1.5 py-0.5 rounded ${
              seedLabel.includes('A')
                ? 'bg-[#10B981]/15 text-[#10B981]'
                : seedLabel.includes('B')
                ? 'bg-[#3B82F6]/15 text-[#3B82F6]'
                : 'bg-white/[0.08] text-[#DCA842]'
            }`}
          >
            {seedLabel}
          </span>
          <TeamBadge teamId={teamId} team={team.team} logoUrl={team.team?.logo} size="xs" />
          <span className="font-semibold text-xs text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors truncate">
            {teamName}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-num text-[#8B949E]">{pts} pts</span>
          {labelBadge && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#30A46C] px-1.5 py-0.5 rounded bg-[#30A46C]/10">
              {labelBadge}
            </span>
          )}
          {isWinner && (
            <CheckCircle2 className="w-3.5 h-3.5 text-[#DCA842] fill-[#DCA842]/20" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Phase selector, View mode, Simulator controls */}
      <div className="bg-[#121519] border border-white/[0.08] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Phase switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#181C22] p-1 rounded-xl border border-white/[0.08]">
            <button
              onClick={() => setSelectedPhase('clausura')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedPhase === 'clausura'
                  ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm'
                  : 'text-[#8B949E] hover:text-[#F1EDE6]'
              }`}
            >
              Playoffs Clausura 2026
            </button>
            <button
              onClick={() => setSelectedPhase('apertura')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedPhase === 'apertura'
                  ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm'
                  : 'text-[#8B949E] hover:text-[#F1EDE6]'
              }`}
            >
              Playoffs Apertura 2026
            </button>
          </div>
        </div>

        {/* View Mode & Reset Simulator */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {Object.keys(userPicks).length > 0 && (
            <button
              onClick={handleResetPicks}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181C22] hover:bg-[#22272E] text-xs font-semibold text-[#8B949E] hover:text-[#DCA842] border border-white/[0.08] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar</span>
            </button>
          )}

          <div className="flex items-center bg-[#181C22] p-1 rounded-xl border border-white/[0.08] text-xs font-semibold">
            <button
              onClick={() => setViewMode('bracket')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                viewMode === 'bracket' ? 'bg-[#DCA842] text-[#0A0C0E] font-bold' : 'text-[#8B949E] hover:text-[#F1EDE6]'
              }`}
            >
              Cuadro Completo
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                viewMode === 'cards' ? 'bg-[#DCA842] text-[#0A0C0E] font-bold' : 'text-[#8B949E] hover:text-[#F1EDE6]'
              }`}
            >
              Por Rondas
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Interactive Banner */}
      <div className="bg-[#121519] border border-white/[0.08] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-[#8B949E]">
          <Sparkles className="w-4 h-4 text-[#DCA842] shrink-0" />
          <span>
            <strong className="text-[#F1EDE6]">Simulador de Llaves:</strong> Hacé clic en cualquier club para clasificarlo a la siguiente ronda.
          </span>
        </div>

        {championTeam && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#DCA842]/15 border border-[#DCA842]/30 text-[#DCA842] font-bold">
            <Trophy className="w-4 h-4 text-[#DCA842]" />
            <span>Campeón Proyectado: {championTeam.team?.name || championTeam.teamId}</span>
          </div>
        )}
      </div>

      {/* VIEW 1: HORIZONTAL BRACKET TREE */}
      {viewMode === 'bracket' ? (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[960px] grid grid-cols-4 gap-4 bg-[#121519] border border-white/[0.08] rounded-3xl p-6 shadow-xl">
            {/* Column 1: Octavos de Final (8 matches) */}
            <div className="space-y-4">
              <div className="pb-2 border-b border-white/[0.08]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DCA842] block">Ronda 1</span>
                <h4 className="font-editorial font-bold text-sm text-[#F1EDE6]">Octavos de Final</h4>
                <span className="text-[10px] text-[#8B949E]">Localía 1° a 4°</span>
              </div>

              <div className="space-y-3">
                {octavosMatches.map((m) => {
                  const isHomeWinner = m.winnerTeamId === m.homeTeam?.teamId;
                  const isAwayWinner = m.winnerTeamId === m.awayTeam?.teamId;

                  return (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-2xl bg-[#15191F] border border-white/[0.08] hover:border-[#DCA842]/30 transition-all space-y-1.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between text-[10px] text-[#8B949E] px-1 font-semibold">
                        <span>Llave #{m.matchNumber}</span>
                        <span className="text-[#10B981]">90' + Pen</span>
                      </div>
                      {renderTeamSlot(m.homeTeam, m.homeSeedLabel, m.id, isHomeWinner, isAwayWinner, 'Local')}
                      {renderTeamSlot(m.awayTeam, m.awaySeedLabel, m.id, isAwayWinner, isHomeWinner)}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Cuartos de Final (4 matches) */}
            <div className="space-y-4">
              <div className="pb-2 border-b border-white/[0.08]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DCA842] block">Ronda 2</span>
                <h4 className="font-editorial font-bold text-sm text-[#F1EDE6]">Cuartos de Final</h4>
                <span className="text-[10px] text-[#8B949E]">4 Ganadores</span>
              </div>

              <div className="space-y-8 pt-4">
                {cuartosMatches.map((m) => {
                  const isHomeWinner = m.winnerTeamId === m.homeTeam?.teamId;
                  const isAwayWinner = m.winnerTeamId === m.awayTeam?.teamId;

                  return (
                    <div
                      key={m.id}
                      className="p-3 rounded-2xl bg-[#15191F] border border-white/[0.08] hover:border-[#DCA842]/30 transition-all space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between text-[10px] text-[#8B949E] px-1 font-semibold">
                        <span>Cuartos #{m.matchNumber}</span>
                        <span>90' + Pen</span>
                      </div>
                      {renderTeamSlot(m.homeTeam, m.homeSeedLabel, m.id, isHomeWinner, isAwayWinner)}
                      {renderTeamSlot(m.awayTeam, m.awaySeedLabel, m.id, isAwayWinner, isHomeWinner)}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column 3: Semifinales (2 matches) */}
            <div className="space-y-4">
              <div className="pb-2 border-b border-white/[0.08]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DCA842] block">Ronda 3</span>
                <h4 className="font-editorial font-bold text-sm text-[#F1EDE6]">Semifinales</h4>
                <span className="text-[10px] text-[#8B949E]">Cancha Neutral</span>
              </div>

              <div className="space-y-24 pt-16">
                {semifinalMatches.map((m) => {
                  const isHomeWinner = m.winnerTeamId === m.homeTeam?.teamId;
                  const isAwayWinner = m.winnerTeamId === m.awayTeam?.teamId;

                  return (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-2xl bg-[#15191F] border border-white/[0.08] hover:border-[#DCA842]/40 transition-all space-y-2 shadow-md"
                    >
                      <div className="flex items-center justify-between text-[10px] text-[#8B949E] px-1 font-semibold">
                        <span className="text-[#DCA842]">Semi #{m.matchNumber}</span>
                        <span>Sede Neutral</span>
                      </div>
                      {renderTeamSlot(m.homeTeam, m.homeSeedLabel, m.id, isHomeWinner, isAwayWinner)}
                      {renderTeamSlot(m.awayTeam, m.awaySeedLabel, m.id, isAwayWinner, isHomeWinner)}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column 4: Gran Final + Campeón */}
            <div className="space-y-4">
              <div className="pb-2 border-b border-white/[0.08]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DCA842] block">Definición</span>
                <h4 className="font-editorial font-bold text-sm text-[#F1EDE6]">Gran Final AFA</h4>
                <span className="text-[10px] text-[#8B949E]">Tiempo Extra + Penales</span>
              </div>

              <div className="space-y-6 pt-24">
                {finalMatch && (
                  <div className="p-4 rounded-3xl bg-gradient-to-b from-[#181C22] to-[#121519] border-2 border-[#DCA842]/40 shadow-xl space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#DCA842] font-bold pb-2 border-b border-white/[0.08]">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-[#DCA842]" />
                        <span>FINAL OFICIAL</span>
                      </div>
                      <span className="text-[10px] text-[#8B949E] font-medium">Estadio Neutral</span>
                    </div>

                    <div className="space-y-2">
                      {renderTeamSlot(
                        finalMatch.homeTeam,
                        finalMatch.homeSeedLabel,
                        finalMatch.id,
                        finalMatch.winnerTeamId === finalMatch.homeTeam?.teamId,
                        finalMatch.winnerTeamId === finalMatch.awayTeam?.teamId
                      )}
                      {renderTeamSlot(
                        finalMatch.awayTeam,
                        finalMatch.awaySeedLabel,
                        finalMatch.id,
                        finalMatch.winnerTeamId === finalMatch.awayTeam?.teamId,
                        finalMatch.winnerTeamId === finalMatch.homeTeam?.teamId
                      )}
                    </div>

                    <div className="text-[10px] text-[#8B949E] text-center pt-1 border-t border-white/[0.06]">
                      90 min + 30 min tiempo extra + penales
                    </div>
                  </div>
                )}

                {/* Champion Trophy Display */}
                {championTeam && (
                  <div className="p-4 rounded-3xl bg-[#DCA842]/10 border border-[#DCA842]/40 text-center space-y-2 animate-fadeIn">
                    <Trophy className="w-8 h-8 text-[#DCA842] mx-auto filter drop-shadow-md" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#DCA842] block">
                        CAMPEÓN OFICIAL AFA 2026
                      </span>
                      <h3 className="font-editorial font-black text-lg text-[#F1EDE6]">
                        {championTeam.team?.name || championTeam.teamId}
                      </h3>
                      <span className="text-[10px] text-[#8B949E] block mt-0.5">
                        Clasifica a Supercopa y Conmebol Libertadores 2027
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: ROUND BY ROUND DETAILED CARDS */
        <div className="space-y-6">
          {/* Octavos de Final Cards */}
          <div className="bg-[#121519] border border-white/[0.08] rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DCA842]">Fase Eliminatoria</span>
                <h3 className="font-editorial font-bold text-lg text-[#F1EDE6]">Octavos de Final (8 Llaves)</h3>
              </div>
              <span className="text-xs text-[#8B949E]">16 clubes clasificados</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {octavosMatches.map((m) => {
                const isHomeWinner = m.winnerTeamId === m.homeTeam?.teamId;
                const isAwayWinner = m.winnerTeamId === m.awayTeam?.teamId;

                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-[#181C22] border border-white/[0.08] hover:border-[#DCA842]/40 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#8B949E] pb-2 border-b border-white/[0.06]">
                      <span className="font-bold text-[#DCA842]">Llave #{m.matchNumber}</span>
                      <span>{m.tiebreakRule}</span>
                    </div>

                    <div className="space-y-2">
                      {renderTeamSlot(m.homeTeam, m.homeSeedLabel, m.id, isHomeWinner, isAwayWinner, 'Local')}
                      {renderTeamSlot(m.awayTeam, m.awaySeedLabel, m.id, isAwayWinner, isHomeWinner)}
                    </div>

                    <div className="text-[11px] text-[#8B949E] pt-1 flex items-center justify-between">
                      <span>{m.venueNote}</span>
                      <button
                        onClick={() => m.homeTeam && onSelectClub(m.homeTeam.teamId)}
                        className="text-[#DCA842] hover:underline text-[10px] font-semibold"
                      >
                        Ver club →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Regulatory AFA Appendix */}
      <div className="p-4 rounded-2xl bg-[#121519] border border-white/[0.08] flex items-start gap-3 text-xs text-[#8B949E] leading-relaxed">
        <Info className="w-4 h-4 text-[#DCA842] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#F1EDE6]">Normativa Reglamentaria AFA / LPF 2026:</strong> Los 8 primeros de cada zona disputan los playoffs en llaves cruzadas (1A vs 8B, 1B vs 8A, etc.). La localía en Octavos corresponde al mejor ubicado de la fase regular. En caso de igualdad al término de los 90 minutos reglamentarios, en Octavos, Cuartos y Semifinales se define directamente por tiros desde el punto penal. La Gran Final dispone de 30 minutos de tiempo suplementario antes de los penales. Si un clasificado resulta descendido por Tabla Anual o Promedios, queda inhabilitado y su plaza es asignada al 9° clasificado de su zona.
        </div>
      </div>
    </div>
  );
};
