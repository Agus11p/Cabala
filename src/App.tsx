import React, { useState, useEffect, useCallback } from 'react';
import { footballService } from './services/footballService';
import { Match, Team, StandingRow, NewsInsight, UserProfile } from './types/football';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { UserProfileModal } from './components/layout/UserProfileModal';
import { GameTeaserModal } from './components/layout/GameTeaserModal';
import { PreguntaleACabalaModal } from './components/layout/PreguntaleACabalaModal';
import { HomePage } from './pages/HomePage';
import { MatchesPage } from './pages/MatchesPage';
import { StandingsPage } from './pages/StandingsPage';
import { ClubsPage } from './pages/ClubsPage';
import { MatchDetailView } from './components/matches/MatchDetailView';
import { ClubDetailView } from './components/clubs/ClubDetailView';
import { MatchCardSkeleton } from './components/common/SkeletonLoader';
import { testFirebaseConnection } from './services/firebaseClient';

export default function App() {
  // Navigation & View states
  const [currentView, setCurrentView] = useState<'inicio' | 'partidos' | 'tablas' | 'clubes'>('inicio');
  const [initialStandingsTable, setInitialStandingsTable] = useState<any>(undefined);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [detailedMatch, setDetailedMatch] = useState<Match | null>(null);

  // Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGameTeaserOpen, setIsGameTeaserOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  // Core Data State
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [topStandings, setTopStandings] = useState<StandingRow[]>([]);
  const [news, setNews] = useState<NewsInsight[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingMatches, setIsRefreshingMatches] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Firebase initialization check
  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [allMatches, allTeams, standingsRes, newsInsights, user] = await Promise.all([
        footballService.getMatches(),
        footballService.getTeams(),
        footballService.getStandings('clausura'),
        footballService.getNews(),
        footballService.getUserProfile(),
      ]);

      setMatches(allMatches);
      setTeams(allTeams);
      setTopStandings((standingsRes.data || []) as StandingRow[]);
      setNews(newsInsights);
      setUserProfile(user);
      setIsLoading(false);
    } catch (err: any) {
      setError(err?.message || 'Ocurrió un error al cargar la información oficial. Por favor reintentá.');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefreshMatches = async () => {
    setIsRefreshingMatches(true);
    try {
      const refreshedMatches = await footballService.getMatches();
      setMatches(refreshedMatches);
    } catch (err) {
      console.error('Error refreshing matches:', err);
    } finally {
      setIsRefreshingMatches(false);
    }
  };

  const handleNavigate = (view: string, initialTable?: any) => {
    setCurrentView(view as any);
    if (initialTable) {
      setInitialStandingsTable(initialTable);
    }
    setSelectedMatchId(null);
    setSelectedClubId(null);
    setDetailedMatch(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMatch = async (matchId: string) => {
    setSelectedMatchId(matchId);
    setSelectedClubId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const detail = await footballService.getMatchById(matchId);
      if (detail) {
        setDetailedMatch(detail);
      }
    } catch (err) {
      console.error('Failed to load detailed match info:', err);
    }
  };

  const handleSelectClub = (clubId: string) => {
    setSelectedClubId(clubId);
    setSelectedMatchId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromMatch = () => {
    setSelectedMatchId(null);
    setDetailedMatch(null);
  };

  const handleBackFromClub = () => {
    setSelectedClubId(null);
  };

  const handleFavoriteClubChange = async (clubId: string) => {
    const updated = await footballService.setFavoriteClub(clubId);
    setUserProfile(updated);
  };

  // Selected entities
  const fallbackMatch = selectedMatchId ? matches.find((m) => m.id === selectedMatchId) || null : null;
  const activeMatch = detailedMatch || fallbackMatch;
  const activeClub = selectedClubId ? teams.find((t) => t.id === selectedClubId) : null;
  const featuredMatch = matches.find((m) => m.status === 'live') || matches[0] || null;
  const liveMatches = matches.filter((m) => m.status === 'live');
  const upcomingMatches = matches.filter((m) => m.status === 'scheduled');

  return (
    <div className="min-h-screen bg-[#0A0C0E] text-[#F1EDE6] flex flex-col antialiased selection:bg-[#DCA842]/30 selection:text-[#F1EDE6]">
      {/* Top Navbar */}
      {userProfile && (
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          user={userProfile}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenGame={() => setIsGameTeaserOpen(true)}
          onOpenAiChat={() => setIsAiChatOpen(true)}
        />
      )}

      {/* Main Layout: Sidebar (desktop) + Content */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Desktop Sidebar */}
        {userProfile && (
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            user={userProfile}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenGame={() => setIsGameTeaserOpen(true)}
            onOpenAiChat={() => setIsAiChatOpen(true)}
          />
        )}

        {/* Dynamic Center Stage */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-6 md:py-8">
          {isLoading ? (
            <div className="space-y-6">
              <div className="h-64 rounded-3xl bg-[#121519] border border-[#22272E] animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <MatchCardSkeleton key={i} />
                  ))}
                </div>
                <div className="h-96 rounded-2xl bg-[#121519] border border-[#22272E] animate-pulse" />
              </div>
            </div>
          ) : error ? (
            <div className="rounded-3xl bg-[#121519] border border-[#22272E] p-12 text-center space-y-4 max-w-md mx-auto my-12">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto text-xl font-bold">
                !
              </div>
              <h2 className="font-editorial font-bold text-xl text-[#F1EDE6]">
                Conexión con el proveedor de datos (ESPN)
              </h2>
              <p className="text-xs text-[#8B949E] leading-relaxed">{error}</p>
              <button
                onClick={loadData}
                className="px-5 py-2.5 rounded-xl bg-[#DCA842] text-[#0A0C0E] font-bold text-xs uppercase tracking-wider hover:bg-[#c99532] transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
              {/* If a match detail is open */}
              {selectedMatchId && activeMatch ? (
                <MatchDetailView
                  match={activeMatch}
                  onBack={handleBackFromMatch}
                  onSelectTeam={handleSelectClub}
                />
              ) : selectedClubId && activeClub ? (
                /* If a club detail is open */
                <ClubDetailView
                  team={activeClub}
                  matches={matches}
                  onBack={handleBackFromClub}
                  onSelectMatch={handleSelectMatch}
                />
              ) : (
                /* Top-Level Views */
                <>
                  {currentView === 'inicio' && (
                    <HomePage
                      featuredMatch={featuredMatch}
                      liveMatches={liveMatches}
                      upcomingMatches={upcomingMatches}
                      topTeams={teams}
                      topStandings={topStandings}
                      news={news}
                      userProfile={userProfile}
                      onSelectMatch={handleSelectMatch}
                      onSelectClub={handleSelectClub}
                      onNavigate={handleNavigate}
                      onOpenGame={() => setIsGameTeaserOpen(true)}
                      onOpenProfile={() => setIsProfileOpen(true)}
                    />
                  )}

                  {currentView === 'partidos' && (
                    <MatchesPage
                      matches={matches}
                      onSelectMatch={handleSelectMatch}
                      onRefresh={handleRefreshMatches}
                      isLoading={isRefreshingMatches}
                    />
                  )}

                  {currentView === 'tablas' && (
                    <StandingsPage
                      onSelectClub={handleSelectClub}
                      initialTable={initialStandingsTable}
                    />
                  )}

                  {currentView === 'clubes' && (
                    <ClubsPage
                      teams={teams}
                      onSelectClub={handleSelectClub}
                    />
                  )}
                </>
              )}
            </>
          )}

          {/* Sober Editorial Footer */}
          <footer className="mt-16 pt-8 border-t border-[#22272E] text-xs text-[#8B949E] pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-editorial font-black text-lg tracking-tight text-[#F1EDE6]">
                    CÁBALA
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-[#DCA842] font-bold">
                    Fútbol Argentino
                  </span>
                </div>
                <p className="text-[11px] text-[#8B949E] max-w-sm">
                  Plataforma oficial y de consulta del fútbol de Primera División de la República Argentina con fuentes de datos oficiales y reglamento AFA 2026.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-5 text-[11px]">
                <button onClick={() => handleNavigate('inicio')} className="hover:text-[#F1EDE6] transition-colors">
                  Inicio
                </button>
                <button onClick={() => handleNavigate('partidos')} className="hover:text-[#F1EDE6] transition-colors">
                  Partidos
                </button>
                <button onClick={() => handleNavigate('tablas')} className="hover:text-[#F1EDE6] transition-colors">
                  Tablas
                </button>
                <button onClick={() => handleNavigate('clubes')} className="hover:text-[#F1EDE6] transition-colors">
                  Clubes
                </button>
                <button onClick={() => setIsAiChatOpen(true)} className="hover:text-[#DCA842] transition-colors text-[#DCA842]">
                  Consultar IA
                </button>
                <span className="text-[#8B949E]/50">·</span>
                <span>Temporada Oficial 2026</span>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenGame={() => setIsGameTeaserOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* User Identity Modal ("Tu Cábala") */}
      {userProfile && (
        <UserProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={userProfile}
          teams={teams}
          onSelectFavoriteClub={handleFavoriteClubChange}
        />
      )}

      {/* Game Teaser Interactive Modal ("Jugar") */}
      <GameTeaserModal
        isOpen={isGameTeaserOpen}
        onClose={() => setIsGameTeaserOpen(false)}
      />

      {/* AI Assistant Modal ("Preguntale a CÁBALA") */}
      <PreguntaleACabalaModal
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        onSelectClub={handleSelectClub}
      />
    </div>
  );
}
