import React, { useState, useMemo, useEffect } from 'react';
import { ZoneStanding, StandingRow, Match } from '../../types/football';
import { TeamBadge } from '../common/TeamBadge';
import { footballService } from '../../services/footballService';
import { formatMatchTime } from '../../utils/formatters';
import {
  Trophy,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Info,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldAlert,
  Calendar,
  MapPin,
  Clock,
  Lock,
} from 'lucide-react';

interface PlayoffBracketViewProps {
  zoneA: ZoneStanding[];
  zoneB: ZoneStanding[];
  onSelectClub: (clubId: string) => void;
  tournamentPhase?: 'apertura' | 'clausura';
  matches?: Match[];
}

interface MatchupSlot {
  id: string;
  roundName: 'Octavos de Final' | 'Cuartos de Final' | 'Semifinales' | 'Final';
  matchNumber: number;
  homeTeam: any;
  awayTeam: any;
  homeScore?: number | null;
  awayScore?: number | null;
  homeSeedLabel?: string;
  awaySeedLabel?: string;
  homeAdvantageText?: string;
  venueNote?: string;
  tiebreakRule?: string;
  winnerTeamId?: string;
  winnerTeamName?: string;
  date?: string;
  time?: string;
  stadium?: string;
  status?: string;
  isRealFinished?: boolean;
}

export const PlayoffBracketView: React.FC<PlayoffBracketViewProps> = ({
  zoneA,
  zoneB,
  onSelectClub,
  tournamentPhase = 'apertura',
  matches: propMatches,
}) => {
  const [selectedPhase, setSelectedPhase] = useState<'clausura' | 'apertura'>(tournamentPhase);
  const [allMatches, setAllMatches] = useState<Match[]>(propMatches || []);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Simulación para Clausura (solo para certámenes en desarrollo)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [unlockedStep, setUnlockedStep] = useState<number>(1);
  const [userPicks, setUserPicks] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<'stepper' | 'bracket'>('bracket');

  // Cargar todos los partidos de la temporada para evaluar el ciclo de vida real
  useEffect(() => {
    let isMounted = true;
    if (!propMatches || propMatches.length === 0) {
      setLoadingMatches(true);
      footballService
        .getMatches({ scope: 'all' })
        .then((mList) => {
          if (isMounted) {
            setAllMatches(mList);
            setLoadingMatches(false);
          }
        })
        .catch((err) => {
          console.warn('[PlayoffBracketView] Error cargando partidos:', err);
          if (isMounted) setLoadingMatches(false);
        });
    } else {
      setAllMatches(propMatches);
    }
    return () => {
      isMounted = false;
    };
  }, [propMatches]);

  // ─────────────────────────────────────────────────────────────
  // 1. EVALUACIÓN LÓGICA DE FASE: APERTURA (FINALIZADO)
  // ─────────────────────────────────────────────────────────────
  const aperturaPlayoffMatches = useMemo(() => {
    return allMatches.filter(
      (m) => m.phase === 'apertura' && m.round && m.round.includes('apertura---')
    );
  }, [allMatches]);

  const aperturaFinalMatch = useMemo(() => {
    return aperturaPlayoffMatches.find((m) => m.round === 'apertura---final');
  }, [aperturaPlayoffMatches]);

  const isAperturaFinished = useMemo(() => {
    return (
      aperturaPlayoffMatches.length >= 15 &&
      aperturaPlayoffMatches.every((m) => m.status === 'finished') &&
      aperturaFinalMatch?.status === 'finished'
    );
  }, [aperturaPlayoffMatches, aperturaFinalMatch]);

  const aperturaChampion = useMemo(() => {
    if (!aperturaFinalMatch || aperturaFinalMatch.status !== 'finished') return null;
    const hScore = aperturaFinalMatch.homeScore ?? 0;
    const aScore = aperturaFinalMatch.awayScore ?? 0;
    if (aScore > hScore) {
      return aperturaFinalMatch.awayTeam;
    } else if (hScore > aScore) {
      return aperturaFinalMatch.homeTeam;
    }
    return null;
  }, [aperturaFinalMatch]);

  const aperturaRunnerUp = useMemo(() => {
    if (!aperturaFinalMatch || aperturaFinalMatch.status !== 'finished') return null;
    const hScore = aperturaFinalMatch.homeScore ?? 0;
    const aScore = aperturaFinalMatch.awayScore ?? 0;
    if (aScore > hScore) {
      return aperturaFinalMatch.homeTeam;
    } else if (hScore > aScore) {
      return aperturaFinalMatch.awayTeam;
    }
    return null;
  }, [aperturaFinalMatch]);

  // ─────────────────────────────────────────────────────────────
  // 2. EVALUACIÓN LÓGICA DE FASE: CLAUSURA (EN JUEGO)
  // ─────────────────────────────────────────────────────────────
  const clausuraRegularMatches = useMemo(() => {
    return allMatches.filter(
      (m) => m.phase === 'clausura' && (!m.round || !m.round.includes('clausura---'))
    );
  }, [allMatches]);

  const clausuraRegularTotal = clausuraRegularMatches.length;
  const clausuraRegularFinished = clausuraRegularMatches.filter((m) => m.status === 'finished').length;
  const isClausuraRegularFinished =
    clausuraRegularTotal > 0 && clausuraRegularFinished >= clausuraRegularTotal;
  const clausuraMatchesRemaining = Math.max(0, clausuraRegularTotal - clausuraRegularFinished);

  // ─────────────────────────────────────────────────────────────
  // 3. APERTURA: LLAVES REALES DETERMINADAS POR DATOS OFICIALES
  // ─────────────────────────────────────────────────────────────
  const aperturaRealBracket = useMemo(() => {
    if (!isAperturaFinished) return null;

    const r16 = aperturaPlayoffMatches
      .filter((m) => m.round === 'apertura---round-of-16')
      .map((m, idx): MatchupSlot => {
        const hScore = m.homeScore ?? 0;
        const aScore = m.awayScore ?? 0;
        const winnerTeam = hScore >= aScore ? m.homeTeam : m.awayTeam;
        return {
          id: m.id,
          roundName: 'Octavos de Final',
          matchNumber: idx + 1,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          homeSeedLabel: 'Clasificado',
          awaySeedLabel: 'Clasificado',
          homeAdvantageText: `Local: ${m.homeTeam?.name || 'Local'}`,
          venueNote: m.stadium || 'Estadio Oficial',
          tiebreakRule: '90 min · Penales en caso de empate',
          winnerTeamId: winnerTeam?.id,
          winnerTeamName: winnerTeam?.name,
          date: m.date,
          time: m.time,
          stadium: m.stadium || undefined,
          status: m.status,
          isRealFinished: true,
        };
      });

    const qf = aperturaPlayoffMatches
      .filter((m) => m.round === 'apertura---quarterfinals')
      .map((m, idx): MatchupSlot => {
        const hScore = m.homeScore ?? 0;
        const aScore = m.awayScore ?? 0;
        const winnerTeam = hScore >= aScore ? m.homeTeam : m.awayTeam;
        return {
          id: m.id,
          roundName: 'Cuartos de Final',
          matchNumber: idx + 1,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          homeSeedLabel: 'Ganador 8vos',
          awaySeedLabel: 'Ganador 8vos',
          homeAdvantageText: `Local: ${m.homeTeam?.name || 'Local'}`,
          venueNote: m.stadium || 'Estadio Oficial',
          tiebreakRule: '90 min · Penales en caso de empate',
          winnerTeamId: winnerTeam?.id,
          winnerTeamName: winnerTeam?.name,
          date: m.date,
          time: m.time,
          stadium: m.stadium || undefined,
          status: m.status,
          isRealFinished: true,
        };
      });

    const sf = aperturaPlayoffMatches
      .filter((m) => m.round === 'apertura---semifinals')
      .map((m, idx): MatchupSlot => {
        const hScore = m.homeScore ?? 0;
        const aScore = m.awayScore ?? 0;
        // Para semis: Argentinos 1 vs 1 Belgrano (avanzó Belgrano por penales)
        // River 1 vs 0 Central (avanzó River)
        const winnerTeam =
          m.id === '401872677'
            ? m.awayTeam // Belgrano avanzó sobre Argentinos
            : hScore >= aScore
            ? m.homeTeam
            : m.awayTeam;
        return {
          id: m.id,
          roundName: 'Semifinales',
          matchNumber: idx + 1,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          homeSeedLabel: 'Ganador 4tos',
          awaySeedLabel: 'Ganador 4tos',
          homeAdvantageText: 'Estadio Neutral Designado AFA',
          venueNote: m.stadium || 'Estadio Neutral',
          tiebreakRule: '90 min · Penales en caso de empate',
          winnerTeamId: winnerTeam?.id,
          winnerTeamName: winnerTeam?.name,
          date: m.date,
          time: m.time,
          stadium: m.stadium || undefined,
          status: m.status,
          isRealFinished: true,
        };
      });

    const fn = aperturaFinalMatch
      ? [
          {
            id: aperturaFinalMatch.id,
            roundName: 'Final' as const,
            matchNumber: 1,
            homeTeam: aperturaFinalMatch.homeTeam,
            awayTeam: aperturaFinalMatch.awayTeam,
            homeScore: aperturaFinalMatch.homeScore,
            awayScore: aperturaFinalMatch.awayScore,
            homeSeedLabel: 'Finalista 1',
            awaySeedLabel: 'Finalista 2',
            homeAdvantageText: 'Estadio Neutral Oficial AFA',
            venueNote: aperturaFinalMatch.stadium || 'Estadio Único Madre de Ciudades, Santiago del Estero',
            tiebreakRule: '90 min + Alargue + Penales',
            winnerTeamId: aperturaChampion?.id,
            winnerTeamName: aperturaChampion?.name,
            date: aperturaFinalMatch.date,
            time: aperturaFinalMatch.time,
            stadium: aperturaFinalMatch.stadium || 'Estadio Único Madre de Ciudades',
            status: aperturaFinalMatch.status,
            isRealFinished: true,
          },
        ]
      : [];

    return {
      octavos: r16,
      cuartos: qf,
      semis: sf,
      final: fn,
    };
  }, [isAperturaFinished, aperturaPlayoffMatches, aperturaFinalMatch, aperturaChampion]);

  // ─────────────────────────────────────────────────────────────
  // 4. CLAUSURA: PROYECCIÓN PROVISIONAL SEGÚN TABLAS ACTUALES
  // ─────────────────────────────────────────────────────────────
  const sortedA = useMemo(() => {
    return [...zoneA].sort((a, b) => (a.zonePosition || a.position) - (b.zonePosition || b.position));
  }, [zoneA]);

  const sortedB = useMemo(() => {
    return [...zoneB].sort((a, b) => (a.zonePosition || a.position) - (b.zonePosition || b.position));
  }, [zoneB]);

  const qA = sortedA.slice(0, 8);
  const qB = sortedB.slice(0, 8);
  const hasEnoughTeams = qA.length >= 8 && qB.length >= 8;

  // Cruces oficiales proyectados según Reglamento AFA (1A vs 8B, etc.)
  const clausuraProjectedPairings = useMemo(() => {
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

  const resolveFavorite = (team1?: any, team2?: any) => {
    if (!team1 && !team2) return null;
    if (team1 && !team2) return team1;
    if (!team1 && team2) return team2;
    const pts1 = team1.points ?? 0;
    const pts2 = team2.points ?? 0;
    if (pts1 !== pts2) return pts1 > pts2 ? team1 : team2;
    const pos1 = team1.zonePosition || team1.position || 99;
    const pos2 = team2.zonePosition || team2.position || 99;
    return pos1 <= pos2 ? team1 : team2;
  };

  const getWinner = (matchId: string, team1?: any, team2?: any, allowedIfUnlocked = false) => {
    if (!team1 && !team2) return null;
    const pickedId = userPicks[matchId];
    if (pickedId) {
      if (team1?.teamId === pickedId || team1?.id === pickedId) return team1;
      if (team2?.teamId === pickedId || team2?.id === pickedId) return team2;
    }
    if (allowedIfUnlocked) {
      return resolveFavorite(team1, team2);
    }
    return null;
  };

  const clausuraOctavos: MatchupSlot[] = useMemo(() => {
    return clausuraProjectedPairings.map((pair) => {
      const matchId = `r16_${pair.num}`;
      const isRoundResolved = unlockedStep > 1;
      const winner = getWinner(matchId, pair.home, pair.away, isRoundResolved);

      return {
        id: matchId,
        roundName: 'Octavos de Final',
        matchNumber: pair.num,
        homeTeam: pair.home?.team || pair.home,
        awayTeam: pair.away?.team || pair.away,
        homeSeedLabel: pair.homeSeed,
        awaySeedLabel: pair.awaySeed,
        homeAdvantageText: `Localía: ${pair.home?.team?.name || (pair.home as any)?.name || 'Local'}`,
        venueNote: `Estadio de ${pair.home?.team?.name || (pair.home as any)?.name || 'Local'}`,
        tiebreakRule: '90 min · Penales en caso de empate',
        winnerTeamId: winner?.teamId || winner?.id,
        winnerTeamName: winner?.team?.name || winner?.name,
        isRealFinished: false,
      };
    });
  }, [clausuraProjectedPairings, userPicks, unlockedStep]);

  const clausuraCuartos: MatchupSlot[] = useMemo(() => {
    if (clausuraOctavos.length < 8) return [];
    const getOctavoWinner = (idx: number) => {
      const m = clausuraOctavos[idx];
      return getWinner(m.id, m.homeTeam, m.awayTeam, unlockedStep >= 2);
    };

    const w1 = getOctavoWinner(0);
    const w2 = getOctavoWinner(1);
    const w3 = getOctavoWinner(2);
    const w4 = getOctavoWinner(3);
    const w5 = getOctavoWinner(4);
    const w6 = getOctavoWinner(5);
    const w7 = getOctavoWinner(6);
    const w8 = getOctavoWinner(7);

    const isRoundResolved = unlockedStep > 2;

    return [
      {
        id: 'qf_1',
        roundName: 'Cuartos de Final',
        matchNumber: 1,
        homeTeam: unlockedStep >= 2 ? w1 : null,
        awayTeam: unlockedStep >= 2 ? w2 : null,
        homeSeedLabel: 'G-L1',
        awaySeedLabel: 'G-L2',
        homeAdvantageText: 'Mejor ubicado fase regular',
        venueNote: 'Estadio de mejor clasificado',
        tiebreakRule: '90 min · Penales en caso de empate',
        winnerTeamId: unlockedStep >= 2 ? getWinner('qf_1', w1, w2, isRoundResolved)?.id : undefined,
        winnerTeamName: unlockedStep >= 2 ? getWinner('qf_1', w1, w2, isRoundResolved)?.name : undefined,
      },
      {
        id: 'qf_2',
        roundName: 'Cuartos de Final',
        matchNumber: 2,
        homeTeam: unlockedStep >= 2 ? w3 : null,
        awayTeam: unlockedStep >= 2 ? w4 : null,
        homeSeedLabel: 'G-L3',
        awaySeedLabel: 'G-L4',
        homeAdvantageText: 'Mejor ubicado fase regular',
        venueNote: 'Estadio de mejor clasificado',
        tiebreakRule: '90 min · Penales en caso de empate',
        winnerTeamId: unlockedStep >= 2 ? getWinner('qf_2', w3, w4, isRoundResolved)?.id : undefined,
        winnerTeamName: unlockedStep >= 2 ? getWinner('qf_2', w3, w4, isRoundResolved)?.name : undefined,
      },
      {
        id: 'qf_3',
        roundName: 'Cuartos de Final',
        matchNumber: 3,
        homeTeam: unlockedStep >= 2 ? w5 : null,
        awayTeam: unlockedStep >= 2 ? w6 : null,
        homeSeedLabel: 'G-L5',
        awaySeedLabel: 'G-L6',
        homeAdvantageText: 'Mejor ubicado fase regular',
        venueNote: 'Estadio de mejor clasificado',
        tiebreakRule: '90 min · Penales en caso de empate',
        winnerTeamId: unlockedStep >= 2 ? getWinner('qf_3', w5, w6, isRoundResolved)?.id : undefined,
        winnerTeamName: unlockedStep >= 2 ? getWinner('qf_3', w5, w6, isRoundResolved)?.name : undefined,
      },
      {
        id: 'qf_4',
        roundName: 'Cuartos de Final',
        matchNumber: 4,
        homeTeam: unlockedStep >= 2 ? w7 : null,
        awayTeam: unlockedStep >= 2 ? w8 : null,
        homeSeedLabel: 'G-L7',
        awaySeedLabel: 'G-L8',
        homeAdvantageText: 'Mejor ubicado fase regular',
        venueNote: 'Estadio de mejor clasificado',
        tiebreakRule: '90 min · Penales en caso de empate',
        winnerTeamId: unlockedStep >= 2 ? getWinner('qf_4', w7, w8, isRoundResolved)?.id : undefined,
        winnerTeamName: unlockedStep >= 2 ? getWinner('qf_4', w7, w8, isRoundResolved)?.name : undefined,
      },
    ];
  }, [clausuraOctavos, userPicks, unlockedStep]);

  const clausuraSemis: MatchupSlot[] = useMemo(() => {
    if (clausuraCuartos.length < 4) return [];
    const getCuartosWinner = (idx: number) => {
      const m = clausuraCuartos[idx];
      return getWinner(m.id, m.homeTeam, m.awayTeam, unlockedStep >= 3);
    };

    const wQ1 = getCuartosWinner(0);
    const wQ2 = getCuartosWinner(1);
    const wQ3 = getCuartosWinner(2);
    const wQ4 = getCuartosWinner(3);
    const isRoundResolved = unlockedStep > 3;

    return [
      {
        id: 'sf_1',
        roundName: 'Semifinales',
        matchNumber: 1,
        homeTeam: unlockedStep >= 3 ? wQ1 : null,
        awayTeam: unlockedStep >= 3 ? wQ2 : null,
        homeSeedLabel: 'G-C1',
        awaySeedLabel: 'G-C2',
        homeAdvantageText: 'Cancha Neutral designada por AFA',
        venueNote: 'Estadio Neutral',
        tiebreakRule: '90 min · Penales en caso de empate',
        winnerTeamId: unlockedStep >= 3 ? getWinner('sf_1', wQ1, wQ2, isRoundResolved)?.id : undefined,
        winnerTeamName: unlockedStep >= 3 ? getWinner('sf_1', wQ1, wQ2, isRoundResolved)?.name : undefined,
      },
      {
        id: 'sf_2',
        roundName: 'Semifinales',
        matchNumber: 2,
        homeTeam: unlockedStep >= 3 ? wQ3 : null,
        awayTeam: unlockedStep >= 3 ? wQ4 : null,
        homeSeedLabel: 'G-C3',
        awaySeedLabel: 'G-C4',
        homeAdvantageText: 'Cancha Neutral designada por AFA',
        venueNote: 'Estadio Neutral',
        tiebreakRule: '90 min · Penales en caso de empate',
        winnerTeamId: unlockedStep >= 3 ? getWinner('sf_2', wQ3, wQ4, isRoundResolved)?.id : undefined,
        winnerTeamName: unlockedStep >= 3 ? getWinner('sf_2', wQ3, wQ4, isRoundResolved)?.name : undefined,
      },
    ];
  }, [clausuraCuartos, userPicks, unlockedStep]);

  const clausuraFinal: MatchupSlot[] = useMemo(() => {
    if (clausuraSemis.length < 2) return [];
    const wS1 = getWinner('sf_1', clausuraSemis[0].homeTeam, clausuraSemis[0].awayTeam, unlockedStep >= 4);
    const wS2 = getWinner('sf_2', clausuraSemis[1].homeTeam, clausuraSemis[1].awayTeam, unlockedStep >= 4);
    const champion = unlockedStep >= 4 ? getWinner('final_clausura', wS1, wS2, true) : null;

    return [
      {
        id: 'final_clausura',
        roundName: 'Final',
        matchNumber: 1,
        homeTeam: unlockedStep >= 4 ? wS1 : null,
        awayTeam: unlockedStep >= 4 ? wS2 : null,
        homeSeedLabel: 'Finalista 1',
        awaySeedLabel: 'Finalista 2',
        homeAdvantageText: 'Sede Única Neutral AFA',
        venueNote: 'Estadio Único Madre de Ciudades / Estadio Kempes',
        tiebreakRule: '90 min + Alargue + Penales',
        winnerTeamId: champion?.id,
        winnerTeamName: champion?.name,
      },
    ];
  }, [clausuraSemis, userPicks, unlockedStep]);

  // Manejo de clicks en simulación (solo habilitado para Clausura)
  const handleSelectWinner = (matchId: string, teamId: string) => {
    if (selectedPhase === 'apertura') return; // Bloqueado terminantemente
    setUserPicks((prev) => ({
      ...prev,
      [matchId]: teamId,
    }));
  };

  const handleNextStep = () => {
    if (selectedPhase === 'apertura') return;
    if (currentStep < 4) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (next > unlockedStep) {
        setUnlockedStep(next);
      }
    }
  };

  const handlePrevStep = () => {
    if (selectedPhase === 'apertura') return;
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleResetSimulation = () => {
    if (selectedPhase === 'apertura') return;
    setUserPicks({});
    setCurrentStep(1);
    setUnlockedStep(1);
  };

  // Selector de partidos a renderizar según fase
  const isAperturaMode = selectedPhase === 'apertura';

  const displayedOctavos = isAperturaMode ? aperturaRealBracket?.octavos || [] : clausuraOctavos;
  const displayedCuartos = isAperturaMode ? aperturaRealBracket?.cuartos || [] : clausuraCuartos;
  const displayedSemis = isAperturaMode ? aperturaRealBracket?.semis || [] : clausuraSemis;
  const displayedFinal = isAperturaMode ? aperturaRealBracket?.final || [] : clausuraFinal;

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          SELECTOR OFICIAL DE TORNEO (APERTURA vs CLAUSURA)
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#121519] border border-white/[0.08] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider">
            Torneo Oficial:
          </span>
          <div className="flex items-center bg-[#181C22] p-1 rounded-xl border border-white/[0.08]">
            <button
              onClick={() => {
                setSelectedPhase('apertura');
                setViewMode('bracket'); // Apertura solo muestra cuadro oficial terminado
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedPhase === 'apertura'
                  ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm'
                  : 'text-[#8B949E] hover:text-[#F1EDE6]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Apertura 2026 (Finalizado)</span>
            </button>
            <button
              onClick={() => setSelectedPhase('clausura')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedPhase === 'clausura'
                  ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm'
                  : 'text-[#8B949E] hover:text-[#F1EDE6]'
              }`}
            >
              <span>Clausura 2026 (En disputa)</span>
            </button>
          </div>
        </div>

        {/* Controles para Clausura (ocultos completamente en Apertura) */}
        {!isAperturaMode ? (
          <div className="flex items-center gap-2">
            {(unlockedStep > 1 || Object.keys(userPicks).length > 0) && (
              <button
                onClick={handleResetSimulation}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181C22] hover:bg-[#22272E] text-xs font-semibold text-[#8B949E] hover:text-[#DCA842] border border-white/[0.08] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar Proyección</span>
              </button>
            )}

            <div className="flex items-center bg-[#181C22] p-1 rounded-xl border border-white/[0.08] text-xs font-semibold">
              <button
                onClick={() => setViewMode('bracket')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  viewMode === 'bracket' ? 'bg-[#DCA842] text-[#0A0C0E] font-bold' : 'text-[#8B949E] hover:text-[#F1EDE6]'
                }`}
              >
                Cuadro Proyectado
              </button>
              <button
                onClick={() => setViewMode('stepper')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  viewMode === 'stepper' ? 'bg-[#DCA842] text-[#0A0C0E] font-bold' : 'text-[#8B949E] hover:text-[#F1EDE6]'
                }`}
              >
                Simulador Paso a Paso
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#30A46C]/10 border border-[#30A46C]/25 text-[11px] font-bold text-[#30A46C]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resultados Oficiales Verificados AFA</span>
            </span>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BANNER DEL APERTURA (FINALIZADO - CAMPEÓN BELGRANO)
         ───────────────────────────────────────────────────────────── */}
      {isAperturaMode && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#182338] via-[#121927] to-[#10141D] border-2 border-[#DCA842]/50 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center p-2 shrink-0 shadow-lg">
                <TeamBadge
                  logoUrl={aperturaChampion?.logo || 'https://a.espncdn.com/i/teamlogos/soccer/500/4.png'}
                  teamId={aperturaChampion?.id || '4'}
                  size="xl"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-[#DCA842]/20 border border-[#DCA842]/40 text-[#DCA842] text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    CAMPEÓN OFICIAL AFA 2026
                  </span>
                  <span className="text-[11px] text-[#8B949E]">
                    Final Apertura: River 2 - 3 Belgrano
                  </span>
                </div>
                <h3 className="font-editorial font-black text-2xl sm:text-3xl text-[#F1EDE6] tracking-tight">
                  {aperturaChampion?.name || 'Belgrano (Córdoba)'}
                </h3>
                <p className="text-xs text-[#8B949E] mt-0.5">
                  Subcampeón: {aperturaRunnerUp?.name || 'River Plate'} · Clasificado directo a Copa Libertadores 2027 (Argentina 1) y Trofeo de Campeones 2026.
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 rounded-xl bg-black/30 border border-white/[0.08] shrink-0">
              <span className="text-[10px] text-[#8B949E] uppercase font-bold tracking-wider">
                Simulación Deshabilitada
              </span>
              <span className="text-xs font-semibold text-[#DCA842] flex items-center gap-1 mt-0.5">
                <Lock className="w-3 h-3" />
                Certamen Concluido
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex items-center gap-2 text-xs text-[#8B949E]">
            <Info className="w-4 h-4 text-[#DCA842] shrink-0" />
            <span>
              La opción de simulación del Apertura está <strong>oculta</strong> de acuerdo al motor de datos: al haberse disputado el 100% de los cotejos y consagrado el campeón en la final oficial, el cuadro expone exclusivamente los marcadores y clasificaciones reales verificadas.
            </span>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          BANNER DEL CLAUSURA (EN DISPUTA - FASE REGULAR PENDIENTE)
         ───────────────────────────────────────────────────────────── */}
      {!isAperturaMode && (
        <div className="p-5 rounded-2xl bg-[#121519] border border-amber-500/25 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  Reglamento AFA 2026 · Fase Regular en Desarrollo
                </span>
                <h3 className="font-editorial font-bold text-lg text-[#F1EDE6]">
                  Playoffs Torneo Clausura: Por Definir
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl bg-[#181C22] border border-white/[0.08] text-[#8B949E]">
              <span>Fechas pendientes:</span>
              <span className="text-amber-400 font-num">{clausuraMatchesRemaining} partidos</span>
            </div>
          </div>

          <p className="text-xs text-[#8B949E] leading-relaxed">
            Conforme a la lógica oficial de competición, <strong>hasta que no concluyan las 16 fechas regulares no se habilitan ni disputan los playoffs oficiales</strong>. Los cruces mostrados a continuación corresponden a la <em>proyección provisional</em> según el orden deportivo actual de Zona A y Zona B. El campeón del Torneo Clausura permanece formalmente <strong>Por definir</strong>.
          </p>
        </div>
      )}

      {/* STEPPER SIMULATION BAR (SOLO EN MODO STEPPER PARA CLAUSURA) */}
      {!isAperturaMode && viewMode === 'stepper' && (
        <div className="bg-[#121519] border border-white/[0.08] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs pb-1">
            <span className="text-[#8B949E] font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#DCA842]" />
              Proyección Hipotética: Elegí los ganadores de cada llave para avanzar ronda a ronda.
            </span>
            <span className="text-[11px] font-bold text-[#DCA842]">
              Paso {currentStep} de 4
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { num: 1, label: 'Octavos', count: '8 Llaves' },
              { num: 2, label: 'Cuartos', count: '4 Llaves' },
              { num: 3, label: 'Semifinales', count: '2 Llaves' },
              { num: 4, label: 'Gran Final', count: '🏆 Campeón' },
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isUnlocked = unlockedStep >= step.num;
              const isCompleted = unlockedStep > step.num;

              return (
                <button
                  key={step.num}
                  disabled={!isUnlocked}
                  onClick={() => isUnlocked && setCurrentStep(step.num)}
                  className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                    isActive
                      ? 'bg-[#18202F] border-[#DCA842] shadow-sm'
                      : isCompleted
                      ? 'bg-[#181C22] border-white/[0.08] hover:border-white/[0.15]'
                      : 'bg-[#121519] border-white/[0.04] opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                        isActive
                          ? 'bg-[#DCA842] text-[#0A0C0E]'
                          : isCompleted
                          ? 'bg-[#30A46C] text-white'
                          : 'bg-white/[0.08] text-[#8B949E]'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.num}
                    </span>
                    <span className="text-[10px] font-medium text-[#8B949E]">{step.count}</span>
                  </div>
                  <span className={`text-xs font-bold block truncate ${isActive ? 'text-[#F1EDE6]' : 'text-[#8B949E]'}`}>
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Stepper Navigation buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentStep === 1
                  ? 'text-[#8B949E]/40 cursor-not-allowed'
                  : 'bg-[#181C22] hover:bg-[#22272E] text-[#F1EDE6] border border-white/[0.08]'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Ronda Anterior</span>
            </button>

            <button
              onClick={handleNextStep}
              disabled={currentStep === 4}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentStep === 4
                  ? 'bg-white/[0.04] text-[#8B949E]/40 cursor-not-allowed border border-white/[0.04]'
                  : 'bg-[#DCA842] hover:bg-[#E5B555] text-[#0A0C0E] shadow-sm'
              }`}
            >
              <span>Avanzar a Siguiente Ronda</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CUADRO VISUAL DE PLAYOFFS (BRACKET)
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* COLUMNA 1: OCTAVOS DE FINAL */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <span className="text-xs font-black uppercase tracking-wider text-[#F1EDE6] flex items-center gap-1.5">
              <span>Octavos de Final</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-[#8B949E] font-num">8</span>
            </span>
            <span className="text-[10px] text-[#8B949E]">
              {isAperturaMode ? '8 partidos jugados' : '1A-8B · 2A-7B...'}
            </span>
          </div>

          <div className="space-y-3">
            {displayedOctavos.map((slot) => (
              <PlayoffMatchCard
                key={slot.id}
                slot={slot}
                isAperturaMode={isAperturaMode}
                onSelectWinner={(teamId) => handleSelectWinner(slot.id, teamId)}
                onSelectClub={onSelectClub}
              />
            ))}
          </div>
        </div>

        {/* COLUMNA 2: CUARTOS DE FINAL */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <span className="text-xs font-black uppercase tracking-wider text-[#F1EDE6] flex items-center gap-1.5">
              <span>Cuartos de Final</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-[#8B949E] font-num">4</span>
            </span>
            <span className="text-[10px] text-[#8B949E]">
              {isAperturaMode ? '4 clasificados' : 'Cruce de ganadores'}
            </span>
          </div>

          <div className="space-y-3">
            {displayedCuartos.map((slot) => (
              <PlayoffMatchCard
                key={slot.id}
                slot={slot}
                isAperturaMode={isAperturaMode}
                onSelectWinner={(teamId) => handleSelectWinner(slot.id, teamId)}
                onSelectClub={onSelectClub}
              />
            ))}
          </div>
        </div>

        {/* COLUMNA 3: SEMIFINALES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <span className="text-xs font-black uppercase tracking-wider text-[#F1EDE6] flex items-center gap-1.5">
              <span>Semifinales</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-[#8B949E] font-num">2</span>
            </span>
            <span className="text-[10px] text-[#8B949E]">Sede Neutral</span>
          </div>

          <div className="space-y-3">
            {displayedSemis.map((slot) => (
              <PlayoffMatchCard
                key={slot.id}
                slot={slot}
                isAperturaMode={isAperturaMode}
                onSelectWinner={(teamId) => handleSelectWinner(slot.id, teamId)}
                onSelectClub={onSelectClub}
              />
            ))}
          </div>
        </div>

        {/* COLUMNA 4: GRAN FINAL */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <span className="text-xs font-black uppercase tracking-wider text-[#DCA842] flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              <span>Gran Final</span>
            </span>
            <span className="text-[10px] text-[#8B949E]">
              {isAperturaMode ? 'Campeón Consagrado' : 'Por definir'}
            </span>
          </div>

          <div className="space-y-3">
            {displayedFinal.map((slot) => (
              <PlayoffMatchCard
                key={slot.id}
                slot={slot}
                isAperturaMode={isAperturaMode}
                isFinalMatch={true}
                onSelectWinner={(teamId) => handleSelectWinner(slot.id, teamId)}
                onSelectClub={onSelectClub}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// COMPONENTE AUXILIAR: TARJETA DE PARTIDO DE PLAYOFF
// ─────────────────────────────────────────────────────────────
interface PlayoffMatchCardProps {
  slot: MatchupSlot;
  isAperturaMode: boolean;
  isFinalMatch?: boolean;
  onSelectWinner: (teamId: string) => void;
  onSelectClub: (clubId: string) => void;
}

const PlayoffMatchCard: React.FC<PlayoffMatchCardProps> = ({
  slot,
  isAperturaMode,
  isFinalMatch,
  onSelectWinner,
  onSelectClub,
}) => {
  const homeTeam = slot.homeTeam;
  const awayTeam = slot.awayTeam;

  const homeId = homeTeam?.teamId || homeTeam?.id;
  const awayId = awayTeam?.teamId || awayTeam?.id;

  const homeName = homeTeam?.team?.name || homeTeam?.name || 'Por definir';
  const awayName = awayTeam?.team?.name || awayTeam?.name || 'Por definir';

  const homeLogo = homeTeam?.team?.logo || homeTeam?.logo;
  const awayLogo = awayTeam?.team?.logo || awayTeam?.logo;

  const isHomeWinner = slot.winnerTeamId && slot.winnerTeamId === homeId;
  const isAwayWinner = slot.winnerTeamId && slot.winnerTeamId === awayId;

  return (
    <div
      className={`p-3 rounded-2xl border transition-all ${
        isFinalMatch
          ? 'bg-gradient-to-b from-[#182338] to-[#101726] border-2 border-[#DCA842]/60 shadow-lg shadow-[#DCA842]/10'
          : 'bg-[#121519] border-white/[0.08] hover:border-white/[0.15]'
      }`}
    >
      {/* Header del Partido: Ronda y Horario en huso de Argentina */}
      <div className="flex items-center justify-between text-[10px] text-[#8B949E] pb-2 mb-2 border-b border-white/[0.06]">
        <span className="font-semibold text-[#F1EDE6]">
          {slot.roundName} {slot.matchNumber ? `· Llave ${slot.matchNumber}` : ''}
        </span>
        {slot.time ? (
          <span className="flex items-center gap-1 font-num text-[#DCA842]">
            <Clock className="w-3 h-3" />
            {formatMatchTime(slot.time, slot.date)}
          </span>
        ) : (
          <span className="text-[#8B949E]">Sin definir</span>
        )}
      </div>

      {/* Equipos y Goles */}
      <div className="space-y-1.5">
        {/* Local */}
        <div
          onClick={() => {
            if (!isAperturaMode && homeId) {
              onSelectWinner(homeId);
            } else if (homeId) {
              onSelectClub(homeId);
            }
          }}
          className={`flex items-center justify-between p-2 rounded-xl transition-all ${
            isHomeWinner
              ? 'bg-[#30A46C]/15 border border-[#30A46C]/40 text-[#F1EDE6] font-bold'
              : 'bg-[#181C22]/80 border border-white/[0.04] text-[#8B949E]'
          } ${!isAperturaMode && homeId ? 'cursor-pointer hover:bg-white/[0.06]' : ''}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {homeLogo ? (
              <TeamBadge logoUrl={homeLogo} teamId={homeId} size="xs" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center text-[9px] font-black text-[#8B949E]">
                {slot.homeSeedLabel || 'L'}
              </div>
            )}
            <span className={`text-xs truncate ${isHomeWinner ? 'text-[#F1EDE6] font-bold' : ''}`}>
              {homeName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pl-2">
            {slot.homeScore !== null && slot.homeScore !== undefined ? (
              <span className={`text-sm font-num font-bold ${isHomeWinner ? 'text-[#30A46C]' : 'text-[#8B949E]'}`}>
                {slot.homeScore}
              </span>
            ) : isHomeWinner ? (
              <CheckCircle2 className="w-4 h-4 text-[#30A46C]" />
            ) : null}
          </div>
        </div>

        {/* Visitante */}
        <div
          onClick={() => {
            if (!isAperturaMode && awayId) {
              onSelectWinner(awayId);
            } else if (awayId) {
              onSelectClub(awayId);
            }
          }}
          className={`flex items-center justify-between p-2 rounded-xl transition-all ${
            isAwayWinner
              ? 'bg-[#30A46C]/15 border border-[#30A46C]/40 text-[#F1EDE6] font-bold'
              : 'bg-[#181C22]/80 border border-white/[0.04] text-[#8B949E]'
          } ${!isAperturaMode && awayId ? 'cursor-pointer hover:bg-white/[0.06]' : ''}`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {awayLogo ? (
              <TeamBadge logoUrl={awayLogo} teamId={awayId} size="xs" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center text-[9px] font-black text-[#8B949E]">
                {slot.awaySeedLabel || 'V'}
              </div>
            )}
            <span className={`text-xs truncate ${isAwayWinner ? 'text-[#F1EDE6] font-bold' : ''}`}>
              {awayName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pl-2">
            {slot.awayScore !== null && slot.awayScore !== undefined ? (
              <span className={`text-sm font-num font-bold ${isAwayWinner ? 'text-[#30A46C]' : 'text-[#8B949E]'}`}>
                {slot.awayScore}
              </span>
            ) : isAwayWinner ? (
              <CheckCircle2 className="w-4 h-4 text-[#30A46C]" />
            ) : null}
          </div>
        </div>
      </div>

      {/* Footer del Partido: Estadio y Fecha */}
      <div className="pt-2 mt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-[#8B949E]">
        <span className="truncate max-w-[130px]" title={slot.venueNote || slot.stadium}>
          {slot.stadium || slot.venueNote || 'Estadio Oficial'}
        </span>
        {slot.date ? (
          <span className="font-num text-[10px]">{slot.date}</span>
        ) : (
          <span>A confirmar</span>
        )}
      </div>
    </div>
  );
};
