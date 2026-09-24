import React from 'react';
import { StandingRow, PromediosRow, TableType } from '../../types/football';
import { TeamBadge } from '../common/TeamBadge';
import { ShieldAlert } from 'lucide-react';

interface StandingsTableProps {
  tableType: TableType;
  data: (StandingRow | PromediosRow)[];
  onSelectClub: (teamId: string) => void;
  unavailableMessage?: string;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  tableType,
  data,
  onSelectClub,
  unavailableMessage,
}) => {
  const isPromedios = tableType === 'promedios';

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl bg-[#121519] border border-[#22272E] p-10 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#181C22] border border-[#22272E] flex items-center justify-center mx-auto text-[#DCA842]">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="font-editorial font-bold text-lg text-[#F1EDE6]">
          Datos no disponibles
        </h3>
        <p className="text-xs text-[#8B949E] max-w-md mx-auto leading-relaxed">
          {unavailableMessage ||
            'La tabla solicitada no está disponible en la fuente oficial en este momento. CÁBALA cumple la regla estricta de no inventar estadísticas ni posiciones.'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-[#121519] border border-[#22272E] shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#22272E] text-[11px] font-bold text-[#8B949E] uppercase tracking-wider bg-[#15191F]">
              <th className="py-3.5 px-3 md:px-4 text-center w-12">Pos</th>
              <th className="py-3.5 px-3 md:px-5 min-w-[150px] md:min-w-[200px]">Club</th>

              {isPromedios ? (
                <>
                  <th className="py-3.5 px-2.5 text-center hidden md:table-cell font-num">23/24</th>
                  <th className="py-3.5 px-2.5 text-center hidden md:table-cell font-num">24/25</th>
                  <th className="py-3.5 px-2.5 text-center hidden md:table-cell font-num">25/26</th>
                  <th className="py-3.5 px-3 text-center font-num">PJ</th>
                  <th className="py-3.5 px-3 text-center font-num">PTS</th>
                  <th className="py-3.5 px-4 md:px-6 text-right font-num text-[#DCA842]">Promedio</th>
                </>
              ) : (
                <>
                  <th className="py-3.5 px-3 text-center font-num">PJ</th>
                  <th className="py-3.5 px-2.5 text-center hidden sm:table-cell font-num">PG</th>
                  <th className="py-3.5 px-2.5 text-center hidden sm:table-cell font-num">PE</th>
                  <th className="py-3.5 px-2.5 text-center hidden sm:table-cell font-num">PP</th>
                  <th className="py-3.5 px-2.5 text-center hidden md:table-cell font-num">GF</th>
                  <th className="py-3.5 px-2.5 text-center hidden md:table-cell font-num">GC</th>
                  <th className="py-3.5 px-3 text-center font-num text-[#F1EDE6]">DG</th>
                  <th className="py-3.5 px-4 md:px-6 text-right font-num text-[#DCA842]">PTS</th>
                </>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#22272E] text-xs md:text-sm">
            {data.map((row) => {
              const team = row.team;
              const teamName = team?.name || team?.shortName || `Club ${row.teamId}`;

              if (isPromedios) {
                const promRow = row as PromediosRow;
                const isRelegation = promRow.isRelegationZone;
                const isLeader = promRow.position === 1;

                return (
                  <tr
                    key={promRow.teamId}
                    onClick={() => onSelectClub(promRow.teamId)}
                    className={`cursor-pointer transition-colors group ${
                      isLeader
                        ? 'bg-[#DCA842]/5 hover:bg-[#DCA842]/10'
                        : isRelegation
                        ? 'bg-rose-950/20 hover:bg-rose-950/30'
                        : 'hover:bg-[#181C22]'
                    }`}
                  >
                    {/* Position */}
                    <td className="py-3.5 px-3 md:px-4 text-center font-num font-bold">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-num ${
                          isLeader
                            ? 'bg-[#DCA842] text-[#0A0C0E] font-black'
                            : isRelegation
                            ? 'bg-[#E5484D]/20 text-[#E5484D] border border-[#E5484D]/40 font-bold'
                            : 'text-[#8B949E]'
                        }`}
                      >
                        {promRow.position}
                      </span>
                    </td>

                    {/* Club */}
                    <td className="py-3.5 px-3 md:px-5">
                      <div className="flex items-center gap-3">
                        <TeamBadge teamId={promRow.teamId} team={team} logoUrl={team?.logo} size="xs" />
                        <span className="font-semibold text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors truncate">
                          {teamName}
                        </span>
                      </div>
                    </td>

                    {/* Seasons */}
                    <td className="py-3.5 px-2.5 text-center hidden md:table-cell font-num text-[#8B949E]">
                      {promRow.seasons?.season2024Pts ?? '-'}
                    </td>
                    <td className="py-3.5 px-2.5 text-center hidden md:table-cell font-num text-[#8B949E]">
                      {promRow.seasons?.season2025Pts ?? '-'}
                    </td>
                    <td className="py-3.5 px-2.5 text-center hidden md:table-cell font-num text-[#8B949E]">
                      {promRow.seasons?.season2026Pts ?? '-'}
                    </td>

                    {/* PJ */}
                    <td className="py-3.5 px-3 text-center font-num text-[#8B949E]">
                      {promRow.totalPlayed}
                    </td>

                    {/* PTS */}
                    <td className="py-3.5 px-3 text-center font-num font-bold text-[#F1EDE6]">
                      {promRow.totalPoints}
                    </td>

                    {/* Average */}
                    <td className="py-3.5 px-4 md:px-6 text-right font-num font-black text-sm md:text-base text-[#DCA842]">
                      {promRow.average.toFixed(3)}
                    </td>
                  </tr>
                );
              }

              // Standard Standing Row
              const standRow = row as StandingRow;
              const isFirst = standRow.position === 1;
              const isLibertadores = standRow.qualificationZone === 'libertadores';
              const isSudamericana = standRow.qualificationZone === 'sudamericana';
              const isRelegation = standRow.qualificationZone === 'relegation';

              return (
                <tr
                  key={standRow.teamId}
                  onClick={() => onSelectClub(standRow.teamId)}
                  className={`cursor-pointer transition-colors group ${
                    isFirst
                      ? 'bg-[#DCA842]/5 hover:bg-[#DCA842]/10'
                      : isRelegation
                      ? 'bg-rose-950/20 hover:bg-rose-950/30'
                      : 'hover:bg-[#181C22]'
                  }`}
                >
                  {/* Position */}
                  <td className="py-3.5 px-3 md:px-4 text-center font-num font-bold">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-num ${
                        isFirst
                          ? 'bg-[#DCA842] text-[#0A0C0E] font-black'
                          : isLibertadores
                          ? 'text-[#30A46C] font-black'
                          : isSudamericana
                          ? 'text-[#3B82F6] font-bold'
                          : isRelegation
                          ? 'bg-[#E5484D]/20 text-[#E5484D] border border-[#E5484D]/40 font-bold'
                          : 'text-[#8B949E]'
                      }`}
                    >
                      {standRow.position}
                    </span>
                  </td>

                  {/* Club */}
                  <td className="py-3.5 px-3 md:px-5">
                    <div className="flex items-center gap-3">
                      <TeamBadge teamId={standRow.teamId} team={team} logoUrl={team?.logo} size="xs" />
                      <span className="font-semibold text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors truncate">
                        {teamName}
                      </span>
                    </div>
                  </td>

                  {/* Stats */}
                  <td className="py-3.5 px-3 text-center font-num text-[#8B949E]">
                    {standRow.played}
                  </td>
                  <td className="py-3.5 px-2.5 text-center hidden sm:table-cell font-num text-[#8B949E]">
                    {standRow.won}
                  </td>
                  <td className="py-3.5 px-2.5 text-center hidden sm:table-cell font-num text-[#8B949E]">
                    {standRow.drawn}
                  </td>
                  <td className="py-3.5 px-2.5 text-center hidden sm:table-cell font-num text-[#8B949E]">
                    {standRow.lost}
                  </td>
                  <td className="py-3.5 px-2.5 text-center hidden md:table-cell font-num text-[#8B949E]">
                    {standRow.goalsFor}
                  </td>
                  <td className="py-3.5 px-2.5 text-center hidden md:table-cell font-num text-[#8B949E]">
                    {standRow.goalsAgainst}
                  </td>
                  <td className="py-3.5 px-3 text-center font-num font-medium text-[#F1EDE6]">
                    {standRow.goalDiff > 0 ? `+${standRow.goalDiff}` : standRow.goalDiff}
                  </td>

                  {/* PTS */}
                  <td className="py-3.5 px-4 md:px-6 text-right font-num font-black text-sm md:text-base text-[#DCA842]">
                    {standRow.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Qualification legend */}
      {!isPromedios && (
        <div className="border-t border-[#22272E] px-4 py-3 bg-[#121519] flex flex-wrap items-center gap-6 text-[11px] text-[#8B949E]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#30A46C]" />
            <span>Zona Clasificación Copa Libertadores</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#3B82F6]" />
            <span>Zona Clasificación Copa Sudamericana</span>
          </div>
        </div>
      )}
    </div>
  );
};
