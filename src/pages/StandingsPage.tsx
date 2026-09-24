import React, { useState, useEffect } from 'react';
import { TableType, StandingRow, PromediosRow } from '../types/football';
import { footballService } from '../services/footballService';
import { StandingsTable } from '../components/standings/StandingsTable';
import { TabNav } from '../components/common/TabNav';
import { TableRowSkeleton } from '../components/common/SkeletonLoader';
import { Info, AlertCircle, RefreshCw } from 'lucide-react';

interface StandingsPageProps {
  onSelectClub: (clubId: string) => void;
}

export const StandingsPage: React.FC<StandingsPageProps> = ({ onSelectClub }) => {
  const [activeTable, setActiveTable] = useState<TableType>('clausura');
  const [data, setData] = useState<(StandingRow | PromediosRow)[]>([]);
  const [unavailableMessage, setUnavailableMessage] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tableTabs = [
    { id: 'clausura' as const, label: 'Torneo Clausura' },
    { id: 'apertura' as const, label: 'Torneo Apertura' },
    { id: 'anual' as const, label: 'Tabla Anual 2026' },
    { id: 'promedios' as const, label: 'Tabla de Promedios' },
  ];

  const loadStandings = () => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    footballService
      .getStandings(activeTable)
      .then((res) => {
        if (!isMounted) return;
        if (!res.available) {
          setData([]);
          setUnavailableMessage(
            res.message ||
              'Datos no disponibles para este campeonato en el proveedor oficial en este momento. CÁBALA no muestra números inventados.'
          );
        } else {
          setData(res.data);
          setUnavailableMessage(undefined);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'No se pudieron sincronizar las tablas con el proveedor oficial.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  };

  useEffect(() => {
    const cleanup = loadStandings();
    return cleanup;
  }, [activeTable]);

  const getTableContextDescription = () => {
    switch (activeTable) {
      case 'clausura':
        return 'Torneo de Primera División en disputa actual con datos oficiales en vivo.';
      case 'apertura':
        return 'Clasificación de la primera mitad del año. Se habilita en su respectiva ventana oficial de competición.';
      case 'anual':
        return 'Suma total de Apertura y Clausura. Determina las plazas continentales (Libertadores y Sudamericana).';
      case 'promedios':
        return 'Cálculo acumulativo sobre las últimas tres temporadas (2024, 2025 y 2026). Si el proveedor no suministra los coeficientes acumulados, se indica estado no disponible.';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#22272E] pb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#DCA842] block mb-1">
            Posiciones Oficiales AFA
          </span>
          <h1 className="font-editorial font-black text-3xl md:text-5xl text-[#F1EDE6] tracking-tight">
            TABLAS
          </h1>
          <p className="text-xs text-[#8B949E] mt-1 font-medium">
            Clasificación regular, copas internacionales y régimen de permanencia.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#8B949E] font-num">
          <span>Temporada Oficial 2026 · Primera División</span>
          <button
            onClick={loadStandings}
            disabled={loading}
            title="Actualizar datos"
            className="p-1.5 rounded-lg bg-[#181C22] border border-[#22272E] text-[#8B949E] hover:text-[#DCA842] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table Selector */}
      <div className="flex overflow-x-auto pb-1 scrollbar-none">
        <TabNav
          tabs={tableTabs}
          activeTab={activeTable}
          onChange={(tabId) => setActiveTable(tabId as TableType)}
        />
      </div>

      {/* Explanatory contextual note */}
      <div className="flex items-center gap-3 text-xs text-[#8B949E] bg-[#121519] p-4 rounded-2xl border border-[#22272E]">
        <Info className="w-4 h-4 text-[#DCA842] shrink-0" />
        <span className="leading-relaxed">{getTableContextDescription()}</span>
      </div>

      {/* Main Standings Table or Error */}
      {loading ? (
        <div className="rounded-2xl bg-[#121519] border border-[#22272E] overflow-hidden">
          {Array.from({ length: 8 }).map((_, idx) => (
            <TableRowSkeleton key={idx} />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-[#121519] border border-[#22272E] p-8 text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-[#E5484D] mx-auto" />
          <div>
            <h3 className="text-base font-bold text-[#F1EDE6]">Error de conexión</h3>
            <p className="text-xs text-[#8B949E] mt-1">{error}</p>
          </div>
          <button
            onClick={loadStandings}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#181C22] border border-[#22272E] hover:border-[#DCA842] text-xs font-semibold text-[#F1EDE6] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reintentar carga</span>
          </button>
        </div>
      ) : (
        <StandingsTable
          tableType={activeTable}
          data={data}
          onSelectClub={onSelectClub}
          unavailableMessage={unavailableMessage}
        />
      )}
    </div>
  );
};
