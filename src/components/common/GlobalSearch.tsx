import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Team } from '../../types/football';
import { TeamBadge } from './TeamBadge';
import { Search, X, Shield, ArrowRight } from 'lucide-react';

interface GlobalSearchProps {
  teams: Team[];
  onSelectClub: (clubId: string) => void;
  className?: string;
  isMobileModal?: boolean;
  onCloseMobileModal?: () => void;
}

function normalizeSearchText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  teams,
  onSelectClub,
  className = '',
  isMobileModal = false,
  onCloseMobileModal,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalize and filter teams from real list
  const filteredTeams = useMemo(() => {
    const term = normalizeSearchText(query);
    if (!term) return [];

    return teams
      .filter((team) => {
        const nameNorm = normalizeSearchText(team.name);
        const shortNameNorm = normalizeSearchText(team.shortName || '');
        const codeNorm = normalizeSearchText(team.code || '');
        const cityNorm = normalizeSearchText(team.city || '');
        const stadiumNorm = normalizeSearchText(team.stadium || '');

        return (
          nameNorm.includes(term) ||
          shortNameNorm.includes(term) ||
          codeNorm.includes(term) ||
          cityNorm.includes(term) ||
          stadiumNorm.includes(term)
        );
      })
      .sort((a, b) => {
        const aName = normalizeSearchText(a.name);
        const bName = normalizeSearchText(b.name);
        const aStarts = aName.startsWith(term);
        const bStarts = bName.startsWith(term);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 8); // Top 8 relevant results
  }, [teams, query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut '/' to focus search on desktop
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(filteredTeams.length > 0 ? 0 : -1);
  }, [filteredTeams]);

  const handleSelect = (teamId: string) => {
    onSelectClub(teamId);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
    if (onCloseMobileModal) {
      onCloseMobileModal();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && e.key === 'ArrowDown') {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredTeams.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % filteredTeams.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredTeams.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + filteredTeams.length) % filteredTeams.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTeams.length > 0) {
        const target = selectedIndex >= 0 && selectedIndex < filteredTeams.length
          ? filteredTeams[selectedIndex]
          : filteredTeams[0];
        handleSelect(target.id);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
      if (onCloseMobileModal) {
        onCloseMobileModal();
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Bar Input */}
      <div className="relative flex items-center">
        <div className="absolute left-3 pointer-events-none text-[#8B949E]">
          <Search className="w-3.5 h-3.5" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Buscar club... (Boca, River, Racing)"
          aria-label="Buscar entre los 30 clubes de Primera División"
          className="w-full bg-[#121519] border border-white/[0.08] focus:border-[#DCA842] text-[#F1EDE6] text-xs rounded-xl pl-9 pr-8 py-2 outline-hidden placeholder:text-[#8B949E]/70 transition-all font-medium"
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 text-[#8B949E] hover:text-[#F1EDE6] p-0.5 rounded transition-colors"
            title="Limpiar búsqueda"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          !isMobileModal && (
            <kbd className="hidden lg:inline-flex absolute right-2.5 items-center px-1.5 py-0.5 text-[9px] font-mono text-[#8B949E]/60 bg-white/[0.04] border border-white/[0.06] rounded pointer-events-none">
              /
            </kbd>
          )
        )}
      </div>

      {/* Autocomplete Results Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#121519] border border-[#22272E] rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[380px] flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-2 border-b border-white/[0.06] bg-black/20 flex items-center justify-between text-[10px] text-[#8B949E]">
            <span className="font-semibold uppercase tracking-wider">
              Clubes ({filteredTeams.length})
            </span>
            <span className="text-[9px]">Usa ↑ ↓ y Enter</span>
          </div>

          <div className="overflow-y-auto divide-y divide-white/[0.04] p-1">
            {filteredTeams.length > 0 ? (
              filteredTeams.map((team, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => handleSelect(team.id)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${
                      isSelected
                        ? 'bg-[#181C22] text-[#F1EDE6]'
                        : 'text-[#8B949E] hover:text-[#F1EDE6] hover:bg-[#181C22]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <TeamBadge teamId={team.id} size="sm" className="shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold truncate ${
                              isSelected ? 'text-[#DCA842]' : 'text-[#F1EDE6]'
                            }`}
                          >
                            {team.name}
                          </span>
                          <span className="text-[10px] font-mono text-[#8B949E] bg-white/[0.04] px-1.5 py-0.2 rounded">
                            {team.code}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#8B949E] truncate">
                          {team.zone ? `Zona ${team.zone}` : 'Primera División'}
                          {team.city ? ` · ${team.city}` : ''}
                        </div>
                      </div>
                    </div>
                    <ArrowRight
                      className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
                        isSelected ? 'opacity-100 text-[#DCA842]' : 'opacity-0'
                      }`}
                    />
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center space-y-2">
                <Shield className="w-8 h-8 text-[#8B949E]/40 mx-auto" />
                <p className="text-xs text-[#F1EDE6] font-medium">
                  No se encontraron clubes para &ldquo;{query}&rdquo;
                </p>
                <p className="text-[11px] text-[#8B949E]">
                  Probá buscando por nombre o apodo (ej: Boca, River, Racing, Newell&apos;s, Vélez)
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
