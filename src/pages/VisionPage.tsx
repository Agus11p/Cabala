import React, { useState } from 'react';
import { 
  Trophy, 
  Swords, 
  TrendingUp, 
  Users, 
  Award, 
  Puzzle, 
  MessageSquare, 
  HeartHandshake, 
  Cpu, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Flame, 
  Calendar,
  Send,
  HelpCircle
} from 'lucide-react';
import { TableType } from '../types/football';

interface VisionPageProps {
  onNavigate: (view: string, initialTable?: TableType) => void;
  onOpenGame: () => void;
  onOpenProfile: () => void;
}

type TabFilter = 'all' | 'achieved' | 'upcoming';

export const VisionPage: React.FC<VisionPageProps> = ({
  onNavigate,
  onOpenGame,
  onOpenProfile,
}) => {
  const [filter, setFilter] = useState<TabFilter>('all');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [clubName, setClubName] = useState('');

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackText('');
      setClubName('');
    }, 3000);
  };

  // Pilares ya logrados (En desarrollo activo y 100% operativos)
  const achievedItems = [
    {
      id: 'tablas',
      title: 'Tablas del Apertura y Clausura',
      badge: 'Ya logrado · Operativo',
      summary: 'Estructura oficial de 30 clubes en Zonas A y B con sistema de desempate reglamentario AFA / LPF. Apertura concluido con consagración histórica de Belgrano de Córdoba y Clausura en plena disputa.',
      actionText: 'Explorar Tablas',
      onAction: () => onNavigate('tablas', 'clausura'),
      icon: Trophy,
    },
    {
      id: 'tabla_anual',
      title: 'Tabla General Anual Acumulada',
      badge: 'Ya logrado · Operativo',
      summary: 'Acumulación de las 32 fechas regulares de los 30 clubes de Primera División. Define en tiempo real la clasificación a Copa Libertadores 2027, Copa Sudamericana 2027 y el descenso del 30° de la tabla.',
      actionText: 'Ver Tabla Anual',
      onAction: () => onNavigate('tablas', 'anual'),
      icon: TrendingUp,
    },
    {
      id: 'partidos',
      title: 'Resultados y Partidos de la Temporada',
      badge: 'Ya logrado · Operativo',
      summary: 'Agenda completa con estados en vivo, tanteadores oficiales, partidos finalizados, fechas programadas, arbitrajes, estadios y detalles minuto a minuto.',
      actionText: 'Ver Agenda y Partidos',
      onAction: () => onNavigate('partidos'),
      icon: Flame,
    },
    {
      id: 'clubes',
      title: 'Información Exhaustiva de los 30 Clubes',
      badge: 'Ya logrado · Operativo',
      summary: 'Directorio con escudos HD oficiales, apodos populares, estadios con capacidad verificada, fecha exacta de fundación con día/mes/año y desglose completo del palmarés de títulos oficiales AFA y CONMEBOL.',
      actionText: 'Directorio de 30 Clubes',
      onAction: () => onNavigate('clubes'),
      icon: ShieldCheck,
    },
    {
      id: 'clasificaciones',
      title: 'Clasificaciones y Escenarios Deportivos',
      badge: 'Ya logrado · Operativo',
      summary: 'Copa Argentina, Supercopa Argentina y Trofeo de Campeones. Llaves eliminatorias, cuadros de clasificación internacional y régimen de permanencia en Primera División.',
      actionText: 'Ver Copas Nacionales',
      onAction: () => onNavigate('copas_nacionales'),
      icon: Award,
    },
    {
      id: 'resiliencia',
      title: 'Sistema Resiliente de Manejo de Datos',
      badge: 'Ya logrado · Operativo',
      summary: 'Arquitectura tolerante a fallos preparada para manejar estados de carga, desconexiones, inconsistencias y contingencias de red. Capas de memoria, base de datos Firestore y semillas oficiales verificables sin inventar datos.',
      actionText: 'Auditoría del Sistema',
      onAction: () => onNavigate('tablas', 'promedios'),
      icon: CheckCircle2,
    },
    {
      id: 'arquitectura',
      title: 'Arquitectura Modular y Escalable',
      badge: 'Ya logrado · Operativo',
      summary: 'Estructurada en TypeScript, Vite, Express/Serverless y persistencia en la nube, pensada para crecer e incorporar nuevas capas de juego y comunidad sin reconstruir el sistema desde cero.',
      actionText: 'Consultar Estado',
      onAction: () => onNavigate('inicio'),
      icon: Cpu,
    },
    {
      id: 'identidad',
      title: 'Interfaz con Identidad Propia del Fútbol Argentino',
      badge: 'Ya logrado · Operativo',
      summary: 'Diseño sobrio, tipografía editorial con carácter, respeto por los colores de cada institución y enfoque 100% centrado en la pasión y la mística deportiva nacional.',
      actionText: 'Ir al Inicio',
      onAction: () => onNavigate('inicio'),
      icon: Sparkles,
    },
  ];

  // 10 Pilares de la Hoja de Ruta ("Próximamente")
  const upcomingItems = [
    {
      id: 'trivia',
      title: 'Trivia Competitiva',
      icon: Trophy,
      tag: 'PRÓXIMAMENTE',
      description: 'Desafíos de preguntas de historia, clásicos inolvidables, estadísticas curiosas y mística de nuestro fútbol con cronómetro y puntuación de precisión.',
      interactiveCTA: 'Probar Demo de Trivia',
      onInteractive: onOpenGame,
    },
    {
      id: '1vs1',
      title: 'Partidas 1 vs 1 en Tiempo Real',
      icon: Swords,
      tag: 'PRÓXIMAMENTE',
      description: 'Duelos mano a mano entre dos hinchas para responder sobre sus propios clubes o clásicos rivales en rondas de 5 preguntas simultáneas.',
      interactiveCTA: 'Simular Duelo 1v1',
      onInteractive: onOpenGame,
    },
    {
      id: 'rankings',
      title: 'Rankings y Sistemas Competitivos',
      icon: TrendingUp,
      tag: 'PRÓXIMAMENTE',
      description: 'Escala ELO nacional con divisiones (Iniciado, Aficionado, Tribuno, Histórico, Leyenda) y tablas de líderes por cada uno de los 30 clubes.',
      interactiveCTA: 'Ver Tu Rating ELO',
      onInteractive: onOpenProfile,
    },
    {
      id: 'ligas',
      title: 'Ligas y Competencias entre Usuarios',
      icon: Users,
      tag: 'PRÓXIMAMENTE',
      description: 'Salas y torneos privados cerrados para competir semanalmente entre grupos de amigos, peñas futboleras y compañeros de trabajo.',
      interactiveCTA: null,
      onInteractive: null,
    },
    {
      id: 'progresion',
      title: 'Progresión y Perfiles Personalizados',
      icon: Award,
      tag: 'PRÓXIMAMENTE',
      description: 'Medallas de fidelidad, trofeos de rachas invictas, insignias por acertar pronósticos y nivel de conocimiento futbolero certificado por club.',
      interactiveCTA: 'Personalizar Perfil',
      onInteractive: onOpenProfile,
    },
    {
      id: 'desafios',
      title: 'Desafíos de Estadísticas, Clubes y Temporadas',
      icon: Puzzle,
      tag: 'PRÓXIMAMENTE',
      description: 'Misiones diarias y semanales: adivinar goleadores históricos, formar los 11 titulares de equipos campeones y completar rachas de clásicos.',
      interactiveCTA: null,
      onInteractive: null,
    },
    {
      id: 'comunidad',
      title: 'Comunidad Alrededor del Fútbol Argentino',
      icon: MessageSquare,
      tag: 'PRÓXIMAMENTE',
      description: 'Espacios de tribuna digital y debate moderado para compartir el folklore y las anécdotas de cada jornada sin agresiones ni toxicidad.',
      interactiveCTA: null,
      onInteractive: null,
    },
    {
      id: 'aportes',
      title: 'Participación Comunitaria de Datos',
      icon: HeartHandshake,
      tag: 'PRÓXIMAMENTE',
      description: 'Herramienta colaborativa donde los socios e hinchas de cada club pueden aportar fotos históricas, correcciones de datos y avisar de inconsistencias con fuentes documentadas.',
      interactiveCTA: 'Aportar Información',
      onInteractive: () => {
        const el = document.getElementById('comunidad-feedback');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'ia_analisis',
      title: 'Herramientas Inteligentes de Análisis y Escenarios',
      icon: Cpu,
      tag: 'PRÓXIMAMENTE',
      description: 'Simulador probabilístico de resultados ("¿Qué necesita mi equipo para entrar a la Copa o evitar el descenso?") con cálculo matemático de combinaciones.',
      interactiveCTA: null,
      onInteractive: null,
    },
    {
      id: 'pwa_mobile',
      title: 'Experiencia Ultra Rápida y Multiplataforma',
      icon: Smartphone,
      tag: 'PRÓXIMAMENTE',
      description: 'Aplicación PWA instalable en iOS y Android con caché offline instantáneo, consumo mínimo de batería y notificaciones de goles en tiempo real.',
      interactiveCTA: null,
      onInteractive: null,
    },
  ];

  return (
    <div className="space-y-12 animate-fadeIn pb-20 max-w-6xl mx-auto">
      {/* ───────────────────────────────────────────────────────────
          1. HERO EDITORIAL & MANIFIESTO CÁBALA
         ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-[#121519] border border-white/[0.08] p-8 sm:p-12 shadow-2xl">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#DCA842] opacity-10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚽🇦🇷</span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#DCA842]">
              Manifiesto & Hoja de Ruta Oficial
            </span>
          </div>

          <h1 className="font-editorial font-black text-3xl sm:text-5xl lg:text-6xl text-[#F1EDE6] tracking-tight leading-tight">
            CÁBALA
          </h1>

          <p className="text-base sm:text-xl font-editorial italic text-[#DCA842] leading-snug">
            Fútbol argentino, llevado un paso más allá.
          </p>

          <p className="text-xs sm:text-sm text-[#8B949E] leading-relaxed pt-2">
            CÁBALA nace de una idea simple: <strong>hacer que seguir y disfrutar el fútbol argentino sea mucho más completo</strong>.
            Actualmente nos encontramos en desarrollo activo y contamos con una base sólida de información de la Primera División argentina, incluyendo los <strong>30 clubes</strong>, sus escudos, estadios, fechas de fundación exactas, apodos, palmarés oficial verificado, partidos de la temporada y diferentes tablas de posiciones.
          </p>

          <p className="text-xs sm:text-sm text-[#8B949E] leading-relaxed">
            El proyecto busca trabajar siempre con <strong>datos reales y verificables</strong>, evitando inventar información. La idea es que CÁBALA pueda convertirse en un lugar donde cualquier persona pueda entrar, consultar cómo está su equipo y, además, interactuar con el fútbol argentino de una manera mucho más dinámica.
          </p>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          2. SELECTOR DE FILTRO DE PILARES
         ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#DCA842] block mb-0.5">
            Estado de Desarrollo del Proyecto
          </span>
          <h2 className="font-editorial font-bold text-2xl text-[#F1EDE6]">
            Pilares del Ecosistema
          </h2>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-[#121519] border border-white/[0.08] rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-[#181C22] text-[#DCA842] font-bold shadow-xs'
                : 'text-[#8B949E] hover:text-[#F1EDE6]'
            }`}
          >
            Todos ({achievedItems.length + upcomingItems.length})
          </button>
          <button
            onClick={() => setFilter('achieved')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              filter === 'achieved'
                ? 'bg-[#181C22] text-[#10B981] font-bold shadow-xs'
                : 'text-[#8B949E] hover:text-[#F1EDE6]'
            }`}
          >
            ✓ Ya Logrado ({achievedItems.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              filter === 'upcoming'
                ? 'bg-[#181C22] text-[#DCA842] font-bold shadow-xs'
                : 'text-[#8B949E] hover:text-[#F1EDE6]'
            }`}
          >
            🚀 Próximamente ({upcomingItems.length})
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────
          3. SECCIÓN: ¿QUÉ ESTAMOS DESARROLLANDO ACTUALMENTE? (YA LOGRADO)
         ─────────────────────────────────────────────────────────── */}
      {(filter === 'all' || filter === 'achieved') && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#10B981]">
                  Funcionalidades 100% Operativas
                </span>
              </div>
              <h3 className="font-editorial font-bold text-xl sm:text-2xl text-[#F1EDE6]">
                ¿Qué está ya logrado y disponible en CÁBALA?
              </h3>
            </div>
            <span className="text-xs font-num text-[#8B949E] hidden sm:block">
              {achievedItems.length} módulos activos con datos verificables
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievedItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="p-6 rounded-2xl bg-[#121519] border border-white/[0.08] hover:border-[#10B981]/40 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center border border-[#10B981]/20">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Ya logrado</span>
                      </span>
                    </div>

                    <h4 className="font-editorial font-bold text-lg text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors">
                      {item.title}
                    </h4>

                    <p className="text-xs text-[#8B949E] leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#10B981] font-semibold">Datos reales sin inventar</span>
                    <button
                      onClick={item.onAction}
                      className="px-3.5 py-1.5 rounded-lg bg-[#181C22] hover:bg-[#22272E] text-[#F1EDE6] hover:text-[#DCA842] font-semibold text-xs border border-white/[0.08] flex items-center gap-1.5 transition-colors"
                    >
                      <span>{item.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#DCA842]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ───────────────────────────────────────────────────────────
          4. SECCIÓN: ¿QUÉ QUEREMOS HACER DESPUÉS? (PRÓXIMAMENTE)
         ─────────────────────────────────────────────────────────── */}
      {(filter === 'all' || filter === 'upcoming') && (
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DCA842] animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#DCA842]">
                  En Hoja de Ruta · Próximamente
                </span>
              </div>
              <h3 className="font-editorial font-bold text-xl sm:text-2xl text-[#F1EDE6]">
                ¿Qué queremos hacer después?
              </h3>
            </div>
            <span className="text-xs font-num text-[#8B949E] hidden sm:block">
              10 iniciativas en desarrollo competitivo y comunitario
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="p-6 rounded-2xl bg-[#121519] border border-white/[0.08] hover:border-[#DCA842]/40 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#DCA842]/10 text-[#DCA842] flex items-center justify-center border border-[#DCA842]/20">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#DCA842]/15 text-[#DCA842] border border-[#DCA842]/30 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>Próximamente</span>
                      </span>
                    </div>

                    <h4 className="font-editorial font-bold text-lg text-[#F1EDE6] group-hover:text-[#DCA842] transition-colors">
                      {item.title}
                    </h4>

                    <p className="text-xs text-[#8B949E] leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#8B949E]">Fase de prototipo & diseño</span>
                    {item.interactiveCTA && item.onInteractive ? (
                      <button
                        onClick={item.onInteractive}
                        className="px-3.5 py-1.5 rounded-lg bg-[#DCA842]/10 hover:bg-[#DCA842]/20 text-[#DCA842] font-semibold text-xs border border-[#DCA842]/30 flex items-center gap-1.5 transition-colors"
                      >
                        <span>{item.interactiveCTA}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-[#8B949E]">
                        En desarrollo →
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ───────────────────────────────────────────────────────────
          5. FORMULARIO COMUNITARIO (PARTICIPACIÓN DE USUARIOS)
         ─────────────────────────────────────────────────────────── */}
      <section id="comunidad-feedback" className="p-8 rounded-3xl bg-[#121519] border border-white/[0.08] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-[#DCA842]" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#DCA842]">
                Participación Comunitaria
              </span>
            </div>
            <h3 className="font-editorial font-bold text-xl text-[#F1EDE6]">
              Aportá o detectá información de tu club
            </h3>
            <p className="text-xs text-[#8B949E]">
              ¿Detectaste un dato desactualizado, querés sumar un apodo histórico o sugerir una mejora? La comunidad de CÁBALA se construye con datos verificables.
            </p>
          </div>
        </div>

        {feedbackSent ? (
          <div className="p-6 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto" />
            <h4 className="font-editorial font-bold text-base text-[#F1EDE6]">
              ¡Muchas gracias por tu aporte a CÁBALA!
            </h4>
            <p className="text-xs text-[#8B949E]">
              Tu sugerencia fue recibida y será contrastada con fuentes oficiales de AFA y registros históricos.
            </p>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider block mb-1.5">
                  Club relacionado
                </label>
                <input
                  type="text"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  placeholder="Ej: Rosario Central, Belgrano, Platense..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#181C22] border border-white/[0.08] focus:border-[#DCA842] text-xs text-[#F1EDE6] placeholder-[#8B949E] focus:outline-hidden transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider block mb-1.5">
                  Tipo de sugerencia
                </label>
                <select className="w-full px-4 py-2.5 rounded-xl bg-[#181C22] border border-white/[0.08] focus:border-[#DCA842] text-xs text-[#F1EDE6] focus:outline-hidden transition-colors cursor-pointer">
                  <option value="estadio">Corrección o dato de Estadio / Capacidad</option>
                  <option value="apodo">Apodo o identidad popular</option>
                  <option value="fundacion">Fecha de fundación o récord histórico</option>
                  <option value="titulos">Palmarés oficial o campaña destacada</option>
                  <option value="otro">Idea o propuesta para CÁBALA</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider block mb-1.5">
                Detalle del aporte o fuente verificable
              </label>
              <textarea
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Explicá el dato o adjuntá la referencia oficial o histórica para revisarlo..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#181C22] border border-white/[0.08] focus:border-[#DCA842] text-xs text-[#F1EDE6] placeholder-[#8B949E] focus:outline-hidden transition-colors resize-none"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#DCA842] hover:bg-[#c99532] text-[#0A0C0E] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar sugerencia</span>
              </button>
            </div>
          </form>
        )}
      </section>

      {/* ───────────────────────────────────────────────────────────
          6. LA VISIÓN: EL CIERRE INSPIRADOR DE CÁBALA
         ─────────────────────────────────────────────────────────── */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#181C22] via-[#121519] to-[#0A0C0E] border border-white/[0.08] text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#DCA842] block">
            NUESTRO COMPROMISO
          </span>

          <h3 className="font-editorial font-black text-2xl sm:text-4xl text-[#F1EDE6] tracking-tight">
            La idea no es crear simplemente otra página de resultados.
          </h3>

          <p className="text-xs sm:text-sm text-[#8B949E] leading-relaxed">
            Queremos construir una plataforma alrededor del fútbol argentino, donde <strong>los datos, la competencia y la comunidad estén conectados</strong>.
          </p>

          <p className="text-xs sm:text-sm text-[#8B949E] leading-relaxed">
            Que puedas entrar para ver la tabla de tu equipo, pero también quedarte para jugar una partida, competir en un ranking, descubrir estadísticas o enfrentarte contra otra persona.
          </p>

          <div className="pt-4">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#DCA842]/10 border border-[#DCA842]/30 text-xs font-bold text-[#DCA842]">
              CÁBALA — fútbol argentino, llevado un paso más allá.
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('tablas')}
            className="px-5 py-2.5 rounded-xl bg-[#181C22] hover:bg-[#22272E] text-xs font-bold text-[#F1EDE6] hover:text-[#DCA842] border border-white/[0.08] transition-colors"
          >
            Consultar Tablas
          </button>
          <button
            onClick={() => onNavigate('clubes')}
            className="px-5 py-2.5 rounded-xl bg-[#181C22] hover:bg-[#22272E] text-xs font-bold text-[#F1EDE6] hover:text-[#DCA842] border border-white/[0.08] transition-colors"
          >
            Explorar 30 Clubes
          </button>
          <button
            onClick={onOpenGame}
            className="px-5 py-2.5 rounded-xl bg-[#DCA842] hover:bg-[#c99532] text-xs font-bold text-[#0A0C0E] uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <Trophy className="w-3.5 h-3.5 fill-[#0A0C0E]" />
            <span>Jugar Trivia 1v1</span>
          </button>
        </div>
      </section>
    </div>
  );
};
