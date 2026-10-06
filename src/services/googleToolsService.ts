/**
 * Servicio de integración de Herramientas de Google (CÁBALA 2026).
 * Prepara la infraestructura analítica y de medición para la migración a producción:
 * - Google Analytics 4 (GA4) con tracking de eventos deportivos (club favorito, partidos, tablas)
 * - Google Tag Manager (GTM)
 * - Google Search Console (verificación y sitemaps)
 * - Telemetría de engagement del hincha
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

class GoogleToolsService {
  private gaId: string | null = null;
  private isInitialized = false;

  constructor() {
    // Lee ID configurado en variables de entorno VITE o fallback seguro
    this.gaId = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GA_MEASUREMENT_ID) || null;
  }

  /**
   * Inicializa Google Analytics 4 si el ID está presente o en modo desarrollo estructurado.
   */
  public initGoogleAnalytics(measurementId?: string): void {
    if (this.isInitialized) return;
    const targetId = measurementId || this.gaId;

    if (!targetId) {
      // Modo preparación: dataLayer estructurado listo para cuando el usuario conecte su ID de GA
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      this.isInitialized = true;
      return;
    }

    try {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', targetId, {
        send_page_view: true,
        app_name: 'CÁBALA Fútbol Argentino',
        anonymize_ip: true,
      });

      // Inyectar script oficial de Google Analytics de forma asíncrona
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${targetId}`;
      document.head.appendChild(script);

      this.isInitialized = true;
    } catch (err) {
      console.warn('[GoogleToolsService] Inicialización de GA diferida:', err);
    }
  }

  /**
   * Registra una vista de página o cambio de sección.
   */
  public trackPageView(viewName: string, title?: string): void {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_title: title || `CÁBALA — ${viewName}`,
        page_location: window.location.href,
        page_path: `/${viewName}`,
      });
    }
  }

  /**
   * Registra la interacción del usuario al seleccionar un club.
   */
  public trackClubSelect(clubId: string, clubName: string): void {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'select_club', {
        club_id: clubId,
        club_name: clubName,
        event_category: 'engagement',
      });
    }
  }

  /**
   * Registra el clic en un partido para ver la ficha detallada.
   */
  public trackMatchView(matchId: string, homeTeam: string, awayTeam: string): void {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'view_match', {
        match_id: matchId,
        match_clash: `${homeTeam} vs ${awayTeam}`,
        event_category: 'fixtures',
      });
    }
  }

  /**
   * Registra la inscripción o interés en la lista de espera del modo "Jugar" (Trivia / Competitivo).
   */
  public trackWaitlistSignup(username: string, favoriteClubId: string): void {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'waitlist_signup', {
        user_name: username,
        favorite_club_id: favoriteClubId,
        feature: 'modo_jugar_1v1',
      });
    }
  }
}

export const googleToolsService = new GoogleToolsService();
