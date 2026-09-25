import React from 'react';
import { StandingRow, PromediosRow, TableType, UIState, DataInconsistencyRecord } from '../../types/football';
import { TeamBadge } from '../common/TeamBadge';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface StandingsTableProps {
  tableType: TableType;
  data: (StandingRow | PromediosRow)[];
  onSelectClub: (teamId: string) => void;
  unavailableMessage?: string;
  zoneTitle?: string;
  zoneBadge?: 'A' | 'B';
  dataState?: UIState;
  inconsistencies?: DataInconsistencyRecord[];
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  tableType,
  data,
  onSelectClub,
  unavailableMessage,
  zoneTitle,
  zoneBadge,
  dataState,
  inconsistencies,
}) => {
  const isPromedios = tableType === 'promedios';
  const isAnnual = tableType === 'anual';
  const isZoneTable = tableType === 'apertura' || tableType === 'clausura' || Boolean(zoneBadge);

  // DATA INCONSISTENCY STATE
  if (dataState === 'DATA_INCONSISTENCY' && inconsistencies && inconsistencies.length > 0) {
    return (
      <div className="rounded-2xl bg-[#121519] border border-[#E63946]/40 p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
          <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 border border-[#E63946]/30 flex items-center justify-center text-[#E63946]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-editorial font-bold text-base text-[#F1EDE6]">
              Discrepancia Matemática en el Proveedor (DATA_INCONSISTENCY)
            </h3>
            <p className="text-xs text-[#8B949E]">
              CÁBALA no altera silenciosamente datos con incoherencias recibidos de ESPN.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/[0.08] text-[#8B949E]">
                <th className="py-2 px-3 font-semibold">Club</th>
                <th className="py-2 px-3 font-semibold">Campo Afectado</th>
                <th className="py-2 px-3 text-center font-semibold">Recibido</th>
                <th className="py-2 px-3 text-center font-semibold">Calculado</th>
                <th className="py-2 px-3 font-semibold">Fuente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] font-num">
              {inconsistencies.map((inc, i) => (
                <tr key={i} className="hover:bg-[#181C22]">
                  <td className="py-2 px-3 font-bold text-[#F1EDE6]">{inc.club}</td>
                  <td className="py-2 px-3 text-[#DCA842]">{inc.field}</td>
                  <td className="py-2 px-3 text-center text-[#E63946] font-bold">{String(inc.receivedValue)}</td>
                  <td className="py-2 px-3 text-center text-[#10B981] font-bold">{String(inc.expectedValue)}</td>
                  <td className="py-2 px-3 text-[#8B949E] text-[11px] truncate">{inc.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // EMPTY / UNAVAILABLE STATE (ESPECIALLY PROMEDIOS)
  if (!data || data.length === 0 || isPromedios) {
    return (
      <div className="rounded-2xl bg-[#121519] border border-white/[0.08] p-8 sm:p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#181C22] border border-white/[0.08] flex items-center justify-center mx-auto text-[#DCA842]">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-editorial font-bold text-lg text-[#F1EDE6]">
            {isPromedios ? 'Tabla de Promedios Oficiales No Disponible' : 'Datos no disponibles'}
          </h3>
          <p className="text-xs text-[#8B949E] max-w-lg mx-auto leading-relaxed">
            {isPromedios
              ? 'El proveedor de datos (ESPN) no provee actualmente la tabla de coeficientes acumulados de 3 temporadas (2024, 2025 y 2026). En cumplimiento estricto con las reglas de CÁBALA, no se inventan promedios simulados.'
              : (unavailableMessage || 'La información requerida no está disponible en el proveedor en este momento.')}
          </p>
        </div>
        {isPromedios && (
          <div className="inline-block px-3.5 py-1.5 rounded-lg bg-[#181C22] border border-white/[0.08] text-[11px] text-[#DCA842] font-semibold">
            Integridad Garantizada · Estado: available: false
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-[#121519] border border-white/[0.08]">
      {/* Optional Zone Header */}
      {zoneTitle && (
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#15191F] border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            {zoneBadge && (
              <span className="w-6 h-6 rounded-md bg-[#DCA842] text-[#0A0C0E] font-black text-xs flex items-center justify-center font-num">
                {zoneBadge}
              </span>
            )}
            <h3 className="font-editorial font-bold text-base text-[#F1EDE6] tracking-wide">
              {zoneTitle}
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-[#8B949E] uppercase tracking-wider hidden sm:inline">
            15 Clubes · 1° al 8° a Octavos
          </span>
        </div>
      )}

      {/* Main Table: Responsive & Column Adaptive */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] text-[11px] font-bold text-[#8B949E] uppercase tracking-wider bg-[#15191F]">
              <th className="py-3 px-2 sm:px-3 text-center w-10 sm:w-12">#</th>
              <th className="py-3 px-3 sm:px-4 min-w-[140px] sm:min-w-[180px]">Club</th>
              <th className="py-3 px-2 sm:px-3 text-center font-num">PJ</th>
              <th className="py-3 px-2 text-center hidden sm:table-cell font-num">PG</th>
              <th className="py-3 px-2 text-center hidden sm:table-cell font-num">PE</th>
              <th className="py-3 px-2 text-center hidden sm:table-cell font-num">PP</th>
              <th className="py-3 px-2 text-center hidden md:table-cell font-num text-[#8B949E]">GF</th>
              <th className="py-3 px-2 text-center hidden md:table-cell font-num text-[#8B949E]">GC</th>
              <th className="py-3 px-2.5 text-center font-num text-[#F1EDE6]">DG</th>
              <th className="py-3 px-3 sm:px-5 text-right font-num text-[#DCA842] bg-white/[0.02]">PTS</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/[0.04] text-xs sm:text-sm">
            {data.map((row) => {
              const standRow = row as StandingRow;
              const team = standRow.team;
              const teamName = team?.shortName || team?.name || `Club ${standRow.teamId}`;

              const isPlayoffHost = isZoneTable && standRow.position <= 4;
              const isPlayoffs = isZoneTable && standRow.position <= 8;
              const isChampion = isAnnual && standRow.position === 1;
              const isLibertadores = isAnnual && (standRow.qualificationZone === 'libertadores' || (standRow.position >= 2 && standRow.position <= 4));
              const isSudamericana = isAnnual && (standRow.qualificationZone === 'sudamericana' || (standRow.position >= 5 && standRow.position <= 10));
              const isRelegation = (isAnnual && standRow.position >= 29) || standRow.qualificationZone === 'relegation';

              // Discrete indicator color
              let indicatorColor = 'bg-transparent';
              if (isChampion) indicatorColor = 'bg-[#DCA842]';
              else if (isPlayoffHost) indicatorColor = 'bg-[#DCA842]';
              else if (isPlayoffs) indicatorColor = 'bg-[#10B981]';
              else if (isLibertadores) indicatorColor = 'bg-[#10B981]';
              else if (isSudamericana) indicatorColor = 'bg-[#4A90E2]';
              else if (isRelegation) indicatorColor = 'bg-[#E63946]';

              // DG format
              const dgText = standRow.goalDiff > 0 ? `+${standRow.goalDiff}` : `${standRow.goalDiff}`;
              const dgColor = standRow.goalDiff > 0
                ? 'text-[#10B981]'
                : standRow.goalDiff < 0
                ? 'text-[#E63946]'
                : 'text-[#8B949E]';

              return (
                <tr
                  key={standRow.teamId}
                  onClick={() => onSelectClub(standRow.teamId)}
                  className="cursor-pointer transition-colors hover:bg-white/[0.03] group relative"
                >
                  {/* Position with subtle left accent line */}
                  <td className="py-3 px-2 sm:px-3 text-center relative">
                    <span
                      aria-hidden="true"
                      className={`absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r ${indicatorColor}`}
                    />
                    <span className="font-num font-bold text-xs sm:text-sm text-[#8B949E] group-hover:text-[#F1EDE6] transition-colors tabular-nums">
                      {standRow.position}
                    </span>
                  </td>

                  {/* Club */}
                  <td className="py-3 px-3 sm:px-4">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <TeamBadge teamId={standRow.teamId} team={team} logoUrl={team?.logo} size="xs" />
                      <span className="font-medium text-xs sm:text-sm text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors truncate">
                        {teamName}
                      </span>
                    </div>
                  </td>

                  {/* PJ */}
                  <td className="py-3 px-2 sm:px-3 text-center font-num text-[#8B949E] text-xs sm:text-sm">
                    {standRow.played}
                  </td>

                  {/* PG (sm+) */}
                  <td className="py-3 px-2 text-center hidden sm:table-cell font-num text-[#8B949E] text-xs sm:text-sm">
                    {standRow.won}
                  </td>

                  {/* PE (sm+) */}
                  <td className="py-3 px-2 text-center hidden sm:table-cell font-num text-[#8B949E] text-xs sm:text-sm">
                    {standRow.drawn}
                  </td>

                  {/* PP (sm+) */}
                  <td className="py-3 px-2 text-center hidden sm:table-cell font-num text-[#8B949E] text-xs sm:text-sm">
                    {standRow.lost}
                  </td>

                  {/* GF (md+) */}
                  <td className="py-3 px-2 text-center hidden md:table-cell font-num text-[#8B949E] text-xs">
                    {standRow.goalsFor}
                  </td>

                  {/* GC (md+) */}
                  <td className="py-3 px-2 text-center hidden md:table-cell font-num text-[#8B949E] text-xs">
                    {standRow.goalsAgainst}
                  </td>

                  {/* DG */}
                  <td className={`py-3 px-2.5 text-center font-num font-bold text-xs sm:text-sm ${dgColor}`}>
                    {dgText}
                  </td>

                  {/* PTS (Visual Hero) */}
                  <td className="py-3 px-3 sm:px-5 text-right font-num font-black text-sm sm:text-base text-[#DCA842] bg-white/[0.02] tabular-nums">
                    {standRow.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Discrete Editorial Legend */}
      {isZoneTable && (
        <div className="border-t border-white/[0.08] px-4 py-2.5 bg-[#121519] flex flex-wrap items-center gap-5 text-[11px] text-[#8B949E]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-[#DCA842]" />
            <span>1° al 4°: Localía en Octavos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-[#10B981]" />
            <span>5° al 8°: Clasificación a Octavos</span>
          </div>
        </div>
      )}

      {isAnnual && (
        <div className="border-t border-white/[0.08] px-4 py-2.5 bg-[#121519] flex flex-wrap items-center gap-5 text-[11px] text-[#8B949E]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-[#DCA842]" />
            <span>1°: Campeón de Liga</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-[#10B981]" />
            <span>Libertadores 2027</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-[#4A90E2]" />
            <span>Sudamericana 2027</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-[#E63946]" />
            <span>Zona de Descenso (30°)</span>
          </div>
        </div>
      )}
    </div>
  );
};
