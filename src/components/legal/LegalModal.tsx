import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, Cookie, BookOpen, Mail, AlertTriangle } from 'lucide-react';

export type LegalTab = 'terminos' | 'privacidad' | 'cookies' | 'reglamento' | 'contacto';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terminos',
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#121519] border border-white/[0.12] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-gradient-to-r from-[#181C22] to-[#121519]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DCA842]/15 text-[#DCA842] border border-[#DCA842]/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/[0.08] text-[#DCA842]">
                  Base Legal e Institucional
                </span>
                <span className="text-[10px] text-[#8B949E] uppercase tracking-wider font-semibold">
                  Versión VMP1
                </span>
              </div>
              <h2 className="font-editorial font-black text-lg sm:text-2xl text-[#F1EDE6] tracking-tight">
                CÁBALA — Información Normativa
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="w-8 h-8 rounded-full bg-[#181C22] text-[#8B949E] hover:text-[#F1EDE6] hover:bg-[#22272E] flex items-center justify-center transition-colors shrink-0 border border-white/[0.06]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Callout */}
        <div className="bg-[#DCA842]/10 border-b border-[#DCA842]/20 px-4 py-2.5 flex items-center gap-2.5 text-[#DCA842] text-[11px] font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            Borrador técnico preliminar estructurado para auditoría. Pendiente de homologación jurídica definitiva por profesional legal matriculado antes del lanzamiento comercial.
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-2 sm:px-6 bg-[#0E1115] border-b border-white/[0.06] overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab('terminos')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'terminos'
                ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm'
                : 'text-[#8B949E] hover:text-[#F1EDE6] hover:bg-white/[0.04]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Términos y Condiciones</span>
          </button>

          <button
            onClick={() => setActiveTab('privacidad')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'privacidad'
                ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm'
                : 'text-[#8B949E] hover:text-[#F1EDE6] hover:bg-white/[0.04]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacidad</span>
          </button>

          <button
            onClick={() => setActiveTab('cookies')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'cookies'
                ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm'
                : 'text-[#8B949E] hover:text-[#F1EDE6] hover:bg-white/[0.04]'
            }`}
          >
            <Cookie className="w-3.5 h-3.5" />
            <span>Cookies</span>
          </button>

          <button
            onClick={() => setActiveTab('reglamento')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'reglamento'
                ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm'
                : 'text-[#8B949E] hover:text-[#F1EDE6] hover:bg-white/[0.04]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Reglamento AFA 2026</span>
          </button>

          <button
            onClick={() => setActiveTab('contacto')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'contacto'
                ? 'bg-[#DCA842] text-[#0A0C0E] shadow-sm'
                : 'text-[#8B949E] hover:text-[#F1EDE6] hover:bg-white/[0.04]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contacto</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain flex-1 text-xs leading-relaxed text-[#8B949E] space-y-5">
          {/* TAB 1: TÉRMINOS Y CONDICIONES */}
          {activeTab === 'terminos' && (
            <div className="space-y-4 text-justify">
              <h3 className="font-editorial font-bold text-base text-[#F1EDE6]">
                1. Términos y Condiciones de Uso de CÁBALA
              </h3>
              <p>
                <strong>1.1. Naturaleza del Servicio:</strong> CÁBALA es una plataforma digital independiente de consulta informativa, estadística y cultural sobre el fútbol argentino (Liga Profesional de Fútbol y Copa Argentina). Su finalidad es de divulgación deportiva, consulta comunitaria y entretenimiento para los aficionados.
              </p>
              <p>
                <strong>1.2. Deslinde de Afiliación Institucional:</strong> CÁBALA declara expresamente que es un proyecto tecnológico autónomo. No cuenta con afiliación orgánica, patrocinio, sponsoreo ni respaldo comercial directo de la Asociación del Fútbol Argentino (AFA), la Liga Profesional de Fútbol (LPF), la Confederación Sudamericana de Fútbol (CONMEBOL), ESPN Inc., Promiedos ni de ninguno de los 30 clubes de Primera División, salvo convenio escrito explícito debidamente anunciado.
              </p>
              <p>
                <strong>1.3. Propiedad Intelectual y Marcas de Terceros:</strong> Los nombres, siglas, emblemas heráldicos y escudos de los clubes (ej. River Plate, Boca Juniors, Racing, Independiente, San Lorenzo, etc.) pertenecen a sus respectivos legítimos titulares. Se exhiben en esta plataforma bajo el principio de uso leal informativo (<em>nominative fair use</em> / derecho de cita informativa deportiva) con el único fin de permitir al usuario la identificación visual inequívoca de los encuentros y tablas de clasificación.
              </p>
              <p>
                <strong>1.4. Exactitud y Disponibilidad de Datos:</strong> Los datos deportivos provienen de proveedores y portales de acceso público (ESPN y fuentes secundarias). Si bien CÁBALA implementa validación matemática y cruzada estricta, el servicio se provee "tal cual está" (<em>as is</em>) sin garantías implícitas sobre la inmediatez absoluta en caso de caídas de red o fallas de conectividad externa.
              </p>
              <p>
                <strong>1.5. Reglas de Conducta para Futuras Funcionalidades:</strong> Se prohíbe terminantemente el uso de scripts, bots, ingeniería inversa, scraping agresivo contra nuestra infraestructura o cualquier intento de alteración de marcadores o clasificaciones.
              </p>
              <p>
                <strong>1.6. Jurisdicción y Contacto:</strong> Para cualquier consulta, reclamo de derechos o solicitud de rectificación, el canal de comunicación es <code>[EMAIL_DE_CONTACTO]</code>. La jurisdicción aplicable quedará sujeta a revisión legal profesional en la jurisdicción del titular de la plataforma.
              </p>
              <p className="text-[10px] text-white/40 italic">
                Última actualización técnica: 05 de Octubre de 2026.
              </p>
            </div>
          )}

          {/* TAB 2: POLÍTICA DE PRIVACIDAD */}
          {activeTab === 'privacidad' && (
            <div className="space-y-4 text-justify">
              <h3 className="font-editorial font-bold text-base text-[#F1EDE6]">
                2. Política de Privacidad y Tratamiento de Datos
              </h3>
              <div className="p-3.5 rounded-xl bg-[#181C22] border border-white/[0.08] text-[#F1EDE6] font-medium">
                Principio Rector de CÁBALA: Recopilación Mínima Indispensable. No vendemos, no comercializamos ni compartimos datos personales con intermediarios de publicidad.
              </div>
              <p>
                <strong>2.1. Datos que NO recopilamos:</strong> CÁBALA NO solicita ni almacena números de Documento Nacional de Identidad (DNI), CUIT/CUIL, teléfonos particulares, domicilios físicos, datos bancarios, números de tarjeta de crédito ni datos sensibles.
              </p>
              <p>
                <strong>2.2. Datos Funcionales Técnicos Actuales:</strong> La aplicación utiliza el almacenamiento local del navegador (<em>localStorage</em>) para registrar:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>El club favorito seleccionado por el hincha para personalizar la portada.</li>
                <li>La caché temporal de partidos y tablas (<code>cabala_cache_v4:*</code>) para permitir la navegación sin consumo excesivo de datos móviles y funcionamiento offline.</li>
                <li>El apodo o correo voluntariamente ingresado en la lista de espera del modo competitivo.</li>
              </ul>
              <p>
                <strong>2.3. Menores de Edad:</strong> Si bien el contenido deportivo es apto para todo público, la eventual creación futura de cuentas y participación en rankings competitivos requerirá consentimiento de acuerdo con la legislación vigente. En caso de detectar datos de menores no autorizados, serán eliminados inmediatamente a requerimiento en <code>[EMAIL_DE_CONTACTO]</code>.
              </p>
              <p>
                <strong>2.4. Derechos ARCO:</strong> Todo usuario tiene derecho a solicitar el acceso, rectificación, actualización o supresión de sus registros escribiendo a <code>[EMAIL_DE_CONTACTO]</code>.
              </p>
            </div>
          )}

          {/* TAB 3: POLÍTICA DE COOKIES */}
          {activeTab === 'cookies' && (
            <div className="space-y-4 text-justify">
              <h3 className="font-editorial font-bold text-base text-[#F1EDE6]">
                3. Política de Cookies y Almacenamiento Local
              </h3>
              <p>
                <strong>3.1. ¿Qué tecnologías utilizamos?</strong> CÁBALA prioriza el almacenamiento local HTML5 (<em>Web Storage API</em>) por encima de las cookies tradicionales, minimizando la transmisión innecesaria de cabeceras en cada petición HTTP.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[#F1EDE6]">
                      <th className="py-2 pr-3 font-semibold">Clave / Nombre</th>
                      <th className="py-2 px-3 font-semibold">Tipo</th>
                      <th className="py-2 pl-3 font-semibold">Finalidad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    <tr>
                      <td className="py-2 pr-3 font-mono text-[#DCA842]">cabala_user_profile_v1</td>
                      <td className="py-2 px-3">LocalStorage</td>
                      <td className="py-2 pl-3">Almacena el club favorito y rango honorífico del hincha.</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 font-mono text-[#DCA842]">cabala_cache_v4:*</td>
                      <td className="py-2 px-3">LocalStorage</td>
                      <td className="py-2 pl-3">Caché de partidos y tablas con TTL para acelerar la carga en telefonía móvil.</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 font-mono text-[#DCA842]">_ga / _ga_*</td>
                      <td className="py-2 px-3">Cookie Analítica (Futura)</td>
                      <td className="py-2 pl-3">Medición de audiencia agregada y anónima mediante Google Analytics 4 (en preparación).</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                El usuario puede borrar su almacenamiento local en cualquier momento desde las opciones de configuración de su navegador web sin alterar el funcionamiento esencial de la plataforma.
              </p>
            </div>
          )}

          {/* TAB 4: REGLAMENTO DE COMPETENCIA AFA 2026 */}
          {activeTab === 'reglamento' && (
            <div className="space-y-4 text-justify">
              <h3 className="font-editorial font-bold text-base text-[#F1EDE6]">
                4. Síntesis Explicativa del Reglamento AFA / LPF 2026
              </h3>
              <p>
                CÁBALA cuenta con un motor de arbitraje matemático determinista que refleja fielmente las pautas reglamentarias aprobadas por la Asociación del Fútbol Argentino para la Temporada Oficial 2026:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 rounded-xl bg-[#181C22] border border-white/[0.06] space-y-1">
                  <span className="font-bold text-[#DCA842] block">Formato de Zonas:</span>
                  <p>30 clubes distribuidos en dos zonas de 15 equipos (Zona A y Zona B). Fase regular de 16 fechas (14 zonales + 2 interzonales).</p>
                </div>
                <div className="p-3 rounded-xl bg-[#181C22] border border-white/[0.06] space-y-1">
                  <span className="font-bold text-[#10B981] block">Clasificación a Octavos:</span>
                  <p>Clasifican del 1° al 8° de cada zona. Cruces cruzados: 1A vs 8B, 1B vs 8A, etc. Ventaja de localía para los 4 mejores.</p>
                </div>
                <div className="p-3 rounded-xl bg-[#181C22] border border-white/[0.06] space-y-1">
                  <span className="font-bold text-blue-400 block">Tabla Anual Acumulada:</span>
                  <p>Suma exclusivamente las 32 fechas de las fases regulares. Los playoffs NO suman puntos para la tabla anual. El 1° es Campeón de Liga.</p>
                </div>
                <div className="p-3 rounded-xl bg-[#181C22] border border-white/[0.06] space-y-1">
                  <span className="font-bold text-red-400 block">Régimen de Descenso:</span>
                  <p>Dos descensos a Primera Nacional: último puesto de la Tabla Anual y último de la Tabla de Promedios. En caso de igualdad en último puesto, partido desempate reglamentario.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CONTACTO INSTITUCIONAL */}
          {activeTab === 'contacto' && (
            <div className="space-y-4">
              <h3 className="font-editorial font-bold text-base text-[#F1EDE6]">
                5. Canales Institucionales y Reportes
              </h3>
              <p>
                Para consultas formales, solicitudes institucionales de clubes, reportes de inconsistencias estadísticas o notificaciones de propiedad intelectual:
              </p>
              <div className="p-4 rounded-2xl bg-[#181C22] border border-white/[0.08] space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#DCA842]" />
                  <div>
                    <span className="text-[10px] text-[#8B949E] uppercase font-bold block">
                      Correo Electrónico de Contacto:
                    </span>
                    <span className="font-mono text-sm font-bold text-[#F1EDE6]">
                      [EMAIL_DE_CONTACTO]
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-[#8B949E] pt-2 border-t border-white/[0.06]">
                  Por favor incluya en el asunto: <em>[CÁBALA - Sugerencia / Legal / Inconsistencia]</em> junto a la URL del encuentro o club en cuestión para su resolución prioritaria.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#0A0C0E] flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-[#8B949E] font-medium hidden sm:inline">
            CÁBALA Fútbol Argentino · Transparencia y Deporte
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#DCA842] hover:bg-[#c99532] text-[#0A0C0E] font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#DCA842]/20"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
