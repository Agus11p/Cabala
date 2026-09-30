import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import { footballService } from './services/footballService';
import { Match, Team, StandingRow, NewsInsight, UserProfile, TableType } from './types/football';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { HomePage } from './pages/HomePage';
import { MatchCardSkeleton } from './components/common/SkeletonLoader';

// Code-splitting: Lazy-load heavy views & modals to optimize initial bundle size & load time
const MatchesPage = lazy(() => import('./pages/MatchesPage').then((m) => ({ default: m.MatchesPage })));
const StandingsPage = lazy(() => import('./pages/StandingsPage').then((m) => ({ default: m.StandingsPage })));
const ClubsPage = lazy(() => import('./pages/ClubsPage').then((m) => ({ default: m.ClubsPage })));
const DataAuditPage = lazy(() => import('./pages/DataAuditPage').then((m) => ({ default: m.DataAuditPage })));
const MatchDetailView = lazy(() => import('./components/matches/MatchDetailView').then((m) => ({ default: m.MatchDetailView })));
const ClubDetailView = lazy(() => import('./components/clubs/ClubDetailView').then((m) => ({ default: m.ClubDetailView })));
const UserProfileModal = lazy(() => import('./components/layout/UserProfileModal').then((m) => ({ default: m.UserProfileModal })));
const GameTeaserModal = lazy(() => import('./components/layout/GameTeaserModal').then((m) => ({ default: m.GameTeaserModal })));
const PreguntaleACabalaModal = lazy(() => import('./components/layout/PreguntaleACabalaModal').then((m) => ({ default: m.PreguntaleACabalaModal })));

type ViewType = 'inicio' | 'partidos' | 'tablas' | 'clubes' | 'auditoria';

interface RouteState {
  view: ViewType;
  matchId: string | null;
  clubId: string | null;
  tableType?: TableType;
}

function parseLocation(pathname: string): RouteState {
  const cleanPath = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  const matchPartida = cleanPath.match(/^\/partido\/([^/]+)$/);
  if (matchPartida) {
    return {
      view: 'partidos',
      matchId: decodeURIComponent(matchPartida[1]),
      clubId: null,
    };
  }

  const matchClub = cleanPath.match(/^\/club\/([^/]+)$/);
  if (matchClub) {
    return {
      view: 'clubes',
      matchId: null,
      clubId: decodeURIComponent(matchClub[1]),
    };
  }

  if (cleanPath === '/partidos') {
    return { view: 'partidos', matchId: null, clubId: null };
  }
  if (cleanPath === '/promedios') {
    return { view: 'tablas', matchId: null, clubId: null, tableType: 'promedios' };
  }
  if (cleanPath === '/copas') {
    return { view: 'tablas', matchId: null, clubId: null, tableType: 'copas' };
  }
  if (cleanPath === '/playoffs') {
    return { view: 'tablas', matchId: null, clubId: null, tableType: 'playoffs' };
  }
  if (cleanPath === '/tablas') {
    return { view: 'tablas', matchId: null, clubId: null, tableType: 'clausura' };
  }
  if (cleanPath === '/clubes') {
    return { view: 'clubes', matchId: null, clubId: null };
  }
  if (cleanPath === '/data-audit') {
    return { view: 'auditoria', matchId: null, clubId: null };
  }

  return { view: 'inicio', matchId: null, clubId: null };
}

function buildPath(view: ViewType, matchId?: string | null, clubId?: string | null, table?: TableType): string {
  if (matchId) return `/partido/${encodeURIComponent(matchId)}`;
  if (clubId) return `/club/${encodeURIComponent(clubId)}`;
  if (view === 'auditoria') return '/data-audit';
  if (view === 'tablas') {
    if (table === 'promedios') return '/promedios';
    if (table === 'copas') return '/copas';
    if (table === 'playoffs') return '/playoffs';
    return '/tablas';
  }
  if (view === 'partidos') return '/partidos';
  if (view === 'clubes') return '/clubes';
  return '/';
}

export default function App() {
  // Initial route parse from window.location
  const initialRoute = parseLocation(typeof window !== 'undefined' ? window.location.pathname : '/');

  // Navigation & View states
  const [currentView, setCurrentView] = useState<ViewType>(initialRoute.view);
  const [initialStandingsTable, setInitialStandingsTable] = useState<TableType | undefined>(initialRoute.tableType);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(initialRoute.matchId);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(initialRoute.clubId);
  const [detailedMatch, setDetailedMatch] = useState<Match | null>(null);

  // Scroll Restoration Registry: path -> scrollY
  const scrollPositions = useRef<Record<string, number>>({});
  const currentPathRef = useRef<string>(typeof window !== 'undefined' ? window.location.pathname : '/');

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

  // Set manual scroll restoration on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Firebase initialization check (dynamic import to avoid bundling Firebase into initial JS)
  useEffect(() => {
    import('./services/firebaseClient')
      .then((m) => m.testFirebaseConnection())
      .catch((err) => {
        console.warn('Firebase connection check:', err?.message || err);
      });
  }, []);

  // Fetch match details whenever selectedMatchId is set or changed
  useEffect(() => {
    let isCancelled = false;
    if (selectedMatchId) {
      footballService
        .getMatchById(selectedMatchId)
        .then((detail) => {
          if (!isCancelled && detail) {
            setDetailedMatch(detail);
          }
        })
        .catch((err) => {
          console.error('Failed to load detailed match info:', err);
        });
    } else {
      setDetailedMatch(null);
    }
    return () => {
      isCancelled = true;
    };
  }, [selectedMatchId]);

  // Sync state from URL popstate (Browser Back/Forward)
  useEffect(() => {
    const handlePopState = () => {
      const newPath = window.location.pathname;
      const prevPath = currentPathRef.current;

      // Save scroll of the page being left
      scrollPositions.current[prevPath] = window.scrollY;
      currentPathRef.current = newPath;

      const route = parseLocation(newPath);
      setCurrentView(route.view);
      setSelectedMatchId(route.matchId);
      setSelectedClubId(route.clubId);
      if (route.tableType) {
        setInitialStandingsTable(route.tableType);
      }

      // Restore scroll if returning to a previously visited path
      const savedY = scrollPositions.current[newPath];
      if (savedY !== undefined) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: savedY, behavior: 'instant' });
          setTimeout(() => {
            window.scrollTo({ top: savedY, behavior: 'instant' });
          }, 50);
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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

  // Navigates to a top-level route with History pushState & smooth scroll to top
  const handleNavigate = (view: string, initialTable?: TableType) => {
    const targetView = view as ViewType;
    const targetPath = buildPath(targetView, null, null, initialTable);

    // Save previous scroll
    scrollPositions.current[currentPathRef.current] = window.scrollY;

    if (window.location.pathname !== targetPath) {
      window.history.pushState({ path: targetPath }, '', targetPath);
    }
    currentPathRef.current = targetPath;

    setCurrentView(targetView);
    if (initialTable) {
      setInitialStandingsTable(initialTable);
    }
    setSelectedMatchId(null);
    setSelectedClubId(null);
    setDetailedMatch(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Internal tab change inside StandingsPage (/tablas, /promedios, /copas, /playoffs)
  const handleTableChange = (table: TableType) => {
    setInitialStandingsTable(table);
    const targetPath = buildPath('tablas', null, null, table);
    if (window.location.pathname !== targetPath) {
      window.history.replaceState({ path: targetPath }, '', targetPath);
      currentPathRef.current = targetPath;
    }
  };

  // Open match detail: saves scroll, pushes /partido/:id, scrolls top
  const handleSelectMatch = (matchId: string) => {
    // Save current scroll position before entering detail view
    scrollPositions.current[currentPathRef.current] = window.scrollY;

    const targetPath = `/partido/${encodeURIComponent(matchId)}`;
    window.history.pushState({ path: targetPath }, '', targetPath);
    currentPathRef.current = targetPath;

    setSelectedMatchId(matchId);
    setSelectedClubId(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Open club detail: saves scroll, pushes /club/:id, scrolls top
  const handleSelectClub = (clubId: string) => {
    // Save current scroll position before entering detail view
    scrollPositions.current[currentPathRef.current] = window.scrollY;

    const targetPath = `/club/${encodeURIComponent(clubId)}`;
    window.history.pushState({ path: targetPath }, '', targetPath);
    currentPathRef.current = targetPath;

    setSelectedClubId(clubId);
    setSelectedMatchId(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Back from match detail: uses window.history.back() or parent fallback with scroll restoration
  const handleBackFromMatch = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      handleNavigate('partidos');
    }
  };

  // Back from club detail: uses window.history.back() or parent fallback with scroll restoration
  const handleBackFromClub = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      handleNavigate('clubes');
    }
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

  const pageLoadingFallback = (
    <div className="space-y-6 animate-pulse">
      <div className="h-44 rounded-3xl bg-[#121519] border border-[#22272E]" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <MatchCardSkeleton />
          <MatchCardSkeleton />
        </div>
        <div className="h-80 rounded-2xl bg-[#121519] border border-[#22272E]" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0C0E] text-[#F1EDE6] flex flex-col antialiased selection:bg-[#DCA842]/30 selection:text-[#F1EDE6]">
      {/* Top Navbar */}
      {userProfile && (
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          user={userProfile}
          teams={teams}
          onSelectClub={handleSelectClub}
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
              {/* Detail View 1: Match Detail */}
              {selectedMatchId ? (
                activeMatch ? (
                  <Suspense fallback={pageLoadingFallback}>
                    <MatchDetailView
                      match={activeMatch}
                      onBack={handleBackFromMatch}
                      onSelectTeam={handleSelectClub}
                    />
                  </Suspense>
                ) : (
                  <div className="p-8 text-center bg-[#121519] rounded-2xl border border-[#22272E] space-y-3">
                    <p className="text-sm font-semibold text-[#F1EDE6]">Partido no encontrado o no disponible</p>
                    <button
                      onClick={handleBackFromMatch}
                      className="px-4 py-2 rounded-xl bg-[#DCA842] text-[#0A0C0E] font-bold text-xs"
                    >
                      Volver a Partidos
                    </button>
                  </div>
                )
              ) : selectedClubId ? (
                /* Detail View 2: Club Detail */
                activeClub ? (
                  <Suspense fallback={pageLoadingFallback}>
                    <ClubDetailView
                      team={activeClub}
                      matches={matches}
                      onBack={handleBackFromClub}
                      onSelectMatch={handleSelectMatch}
                    />
                  </Suspense>
                ) : (
                  <div className="p-8 text-center bg-[#121519] rounded-2xl border border-[#22272E] space-y-3">
                    <p className="text-sm font-semibold text-[#F1EDE6]">Club no encontrado</p>
                    <button
                      onClick={handleBackFromClub}
                      className="px-4 py-2 rounded-xl bg-[#DCA842] text-[#0A0C0E] font-bold text-xs"
                    >
                      Volver a Clubes
                    </button>
                  </div>
                )
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
                    <Suspense fallback={pageLoadingFallback}>
                      <MatchesPage
                        matches={matches}
                        onSelectMatch={handleSelectMatch}
                        onRefresh={handleRefreshMatches}
                        isLoading={isRefreshingMatches}
                      />
                    </Suspense>
                  )}

                  {currentView === 'tablas' && (
                    <Suspense fallback={pageLoadingFallback}>
                      <StandingsPage
                        onSelectClub={handleSelectClub}
                        initialTable={initialStandingsTable}
                        onTableChange={handleTableChange}
                      />
                    </Suspense>
                  )}

                  {currentView === 'clubes' && (
                    <Suspense fallback={pageLoadingFallback}>
                      <ClubsPage
                        teams={teams}
                        onSelectClub={handleSelectClub}
                      />
                    </Suspense>
                  )}

                  {currentView === 'auditoria' && (
                    <Suspense fallback={pageLoadingFallback}>
                      <DataAuditPage />
                    </Suspense>
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
                <button onClick={() => handleNavigate('tablas', 'promedios')} className="hover:text-[#F1EDE6] transition-colors">
                  Promedios
                </button>
                <button onClick={() => handleNavigate('tablas', 'copas')} className="hover:text-[#F1EDE6] transition-colors">
                  Copas
                </button>
                <button onClick={() => handleNavigate('tablas', 'playoffs')} className="hover:text-[#F1EDE6] transition-colors">
                  Playoffs
                </button>
                <button onClick={() => handleNavigate('clubes')} className="hover:text-[#F1EDE6] transition-colors">
                  Clubes
                </button>
                <button onClick={() => handleNavigate('auditoria')} className="hover:text-[#F1EDE6] transition-colors font-bold text-[#DCA842]">
                  Auditoría de Datos
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

      {/* User Identity Modal ("Tu Cábala") - Loaded on demand */}
      {isProfileOpen && userProfile && (
        <Suspense fallback={null}>
          <UserProfileModal
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            user={userProfile}
            teams={teams}
            onSelectFavoriteClub={handleFavoriteClubChange}
          />
        </Suspense>
      )}

      {/* Game Teaser Interactive Modal ("Jugar") - Loaded on demand */}
      {isGameTeaserOpen && (
        <Suspense fallback={null}>
          <GameTeaserModal
            isOpen={isGameTeaserOpen}
            onClose={() => setIsGameTeaserOpen(false)}
          />
        </Suspense>
      )}

      {/* AI Assistant Modal ("Preguntale a CÁBALA") - Loaded on demand */}
      {isAiChatOpen && (
        <Suspense fallback={null}>
          <PreguntaleACabalaModal
            isOpen={isAiChatOpen}
            onClose={() => setIsAiChatOpen(false)}
            onSelectClub={handleSelectClub}
          />
        </Suspense>
      )}
    </div>
  );
}
