import React, { useState } from 'react';
import { UserProfile, Team } from '../../types/football';
import { TeamBadge } from '../common/TeamBadge';
import { X, Award, Shield, Zap, TrendingUp, Check } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  teams: Team[];
  onSelectFavoriteClub: (clubId: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  teams,
  onSelectFavoriteClub,
}) => {
  const [isChangingClub, setIsChangingClub] = useState(false);

  if (!isOpen) return null;

  const currentClub = teams.find((t) => t.id === user.favoriteClubId) || teams[0];
  const winRate = Math.round((user.wins / (user.wins + user.losses)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#121519] border border-[#22272E] rounded-3xl overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="p-6 border-b border-[#22272E] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#DCA842] font-bold block mb-1">
              Perfil de Hincha
            </span>
            <h2 className="font-editorial font-black text-2xl text-[#F1EDE6]">
              Tu Cábala
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#181C22] text-[#8B949E] hover:text-[#F1EDE6] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* User Card */}
          <div className="p-5 rounded-2xl bg-[#181C22] border border-[#22272E] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0A0C0E] border border-[#22272E] flex items-center justify-center text-xl font-editorial font-black text-[#DCA842]">
                {user.username.slice(0, 2)}
              </div>
              <div>
                <h3 className="font-editorial font-black text-xl text-[#F1EDE6] leading-tight">
                  {user.username}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[#DCA842] font-bold tracking-wide">
                    {user.rankTitle}
                  </span>
                  <span className="text-[#8B949E] text-xs">·</span>
                  <span className="font-num font-bold text-xs text-[#8B949E]">
                    {user.elo} ELO
                  </span>
                </div>
              </div>
            </div>

            {/* Favorite Club Badge */}
            <div className="text-right flex flex-col items-end">
              <TeamBadge teamId={user.favoriteClubId} size="md" className="mb-1" />
              <button
                onClick={() => setIsChangingClub(!isChangingClub)}
                className="text-[10px] text-[#8B949E] hover:text-[#DCA842] transition-colors underline"
              >
                {isChangingClub ? 'Cerrar selector' : 'Cambiar club'}
              </button>
            </div>
          </div>

          {/* Club selector accordion if open */}
          {isChangingClub && (
            <div className="p-4 rounded-2xl bg-[#0A0C0E] border border-[#22272E] space-y-3">
              <span className="text-xs font-semibold text-[#8B949E] block">
                Seleccioná tu club de Primera División:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {teams.map((t) => {
                  const isSelected = t.id === user.favoriteClubId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectFavoriteClub(t.id);
                        setIsChangingClub(false);
                      }}
                      className={`flex items-center gap-2 p-2 rounded-xl text-xs transition-colors text-left ${
                        isSelected
                          ? 'bg-[#181C22] text-[#DCA842] border border-[#DCA842]/40 font-bold'
                          : 'bg-[#121519] text-[#F1EDE6] hover:bg-[#181C22]'
                      }`}
                    >
                      <TeamBadge teamId={t.id} size="xs" />
                      <span className="truncate">{t.shortName}</span>
                      {isSelected && <Check className="w-3 h-3 ml-auto text-[#DCA842]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Competitive Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#181C22] border border-[#22272E] text-center">
              <span className="text-[10px] uppercase font-semibold text-[#8B949E] block mb-1">Duelos Ganados</span>
              <span className="font-num font-black text-2xl text-[#F1EDE6]">{user.wins}</span>
              <span className="text-[10px] text-[#8B949E] block mt-0.5">{winRate}% de éxito</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#181C22] border border-[#22272E] text-center">
              <span className="text-[10px] uppercase font-semibold text-[#8B949E] block mb-1">Duelos Perdidos</span>
              <span className="font-num font-black text-2xl text-[#F1EDE6]">{user.losses}</span>
              <span className="text-[10px] text-[#8B949E] block mt-0.5">{user.wins + user.losses} jugados</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#181C22] border border-[#22272E] text-center">
              <span className="text-[10px] uppercase font-semibold text-[#8B949E] block mb-1">Racha Activa</span>
              <span className="font-num font-black text-2xl text-[#DCA842] flex items-center justify-center gap-1">
                <Zap className="w-4 h-4 fill-[#DCA842]" />
                <span>{user.streak}</span>
              </span>
              <span className="text-[10px] text-[#8B949E] block mt-0.5">victorias seguidas</span>
            </div>
          </div>

          {/* Achievements Preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8B949E]">
                Logros Desbloqueados ({user.achievements.length})
              </h4>
            </div>

            <div className="space-y-2">
              {user.achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="p-3 rounded-xl bg-[#181C22] border border-[#22272E] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#DCA842]/10 text-[#DCA842] flex items-center justify-center shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-[#F1EDE6]">
                        {ach.title}
                      </h5>
                      <p className="text-[11px] text-[#8B949E]">
                        {ach.desc}
                      </p>
                    </div>
                  </div>
                  {ach.unlockedAt && (
                    <span className="text-[10px] text-[#8B949E] font-num shrink-0">
                      {ach.unlockedAt}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0A0C0E] border-t border-[#22272E] text-center text-xs text-[#8B949E]">
          La progresión y matchmaking 1v1 se habilitarán formalmente en la Fase 2 y 3.
        </div>
      </div>
    </div>
  );
};
