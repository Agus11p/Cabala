/**
 * CÁBALA — Arquitectura de Analítica y Observabilidad
 *
 * Adaptador desacoplado para eventos:
 * - AnalyticsProvider (Interfaz para futuros proveedores como GA4, GTM, Firebase Analytics)
 * - NoopAnalyticsProvider (Proveedor no operativo actual para el MVP de fútbol)
 *
 * Principio:
 * NO envía datos a servicios externos mientras no sea necesario.
 * NO bloquea la interfaz de usuario.
 */

export type AnalyticsEventType =
  | 'page_view'
  | 'club_view'
  | 'match_view'
  | 'standing_view'
  | 'filter_change'
  | 'tab_change'
  | 'trivia_start'
  | 'trivia_answer'
  | 'data_inconsistency_detected'
  | 'sin_dato_displayed';

export interface AnalyticsEvent {
  event: AnalyticsEventType;
  timestamp: number;
  properties?: Record<string, string | number | boolean | null | undefined>;
}

export interface AnalyticsProvider {
  readonly name: string;
  readonly isConnected: boolean;
  trackEvent(event: AnalyticsEvent): void;
}

/**
 * NoopAnalyticsProvider: Implementación neutra actual del MVP.
 * Permite registrar y depurar eventos internamente sin telemetría externa.
 */
export class NoopAnalyticsProvider implements AnalyticsProvider {
  public readonly name = 'NoopAnalyticsProvider';
  public readonly isConnected = false;

  public trackEvent(_event: AnalyticsEvent): void {
    // Operación no-op intencional para MVP de fútbol sin telemetría externa
  }
}

class AnalyticsService {
  private provider: AnalyticsProvider;

  constructor(provider?: AnalyticsProvider) {
    this.provider = provider || new NoopAnalyticsProvider();
  }

  public setProvider(newProvider: AnalyticsProvider) {
    this.provider = newProvider;
  }

  public getProvider(): AnalyticsProvider {
    return this.provider;
  }

  public track(type: AnalyticsEventType, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      event: type,
      timestamp: Date.now(),
      properties,
    };
    try {
      this.provider.trackEvent(event);
    } catch {
      // Silencioso para garantizar UX
    }
  }

  public trackPageView(path: string, title?: string) {
    this.track('page_view', { path, title: title || (typeof document !== 'undefined' ? document.title : '') });
  }

  public trackClubView(clubId: string, clubName: string) {
    this.track('club_view', { clubId, clubName });
  }

  public trackMatchView(matchId: string, tournament: string) {
    this.track('match_view', { matchId, tournament });
  }

  public trackStandingView(tableType: string, phase?: string, zone?: string) {
    this.track('standing_view', { tableType, phase, zone });
  }

  public trackDataInconsistency(club: string, field: string, received: any, expected: any) {
    this.track('data_inconsistency_detected', { club, field, received, expected });
  }

  public trackSinDato(entity: string, field: string, context?: string) {
    this.track('sin_dato_displayed', { entity, field, context });
  }
}

export const analytics = new AnalyticsService();
