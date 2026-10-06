# CÁBALA — AUDITORÍA INTERNA DE FUENTES DE TERCEROS Y MATRIZ DE RIESGOS (VMP1)

> **Documento de Control Técnico e Institucional**  
> Fecha: Octubre 2026 — Estado: VMP1 Preparación de Migración

---

## 1. FUENTES DE DATOS ACTUALES

### 1.1. ESPN (Proveedor Primario de Datos en Vivo)
- **Tipo de Acceso:** API REST pública basada en endpoints JSON de ESPN Sports API (`site.api.espn.com`).
- **Endpoints Utilizados:**
  - `https://site.api.espn.com/apis/site/v2/sports/soccer/arg.1/scoreboard?dates=2026`
  - `https://site.api.espn.com/apis/v2/sports/soccer/arg.1/standings`
  - `https://site.api.espn.com/apis/site/v2/sports/soccer/arg.1/teams`
  - `https://site.api.espn.com/apis/site/v2/sports/soccer/arg.1/summary?event={id}`
  - `https://site.api.espn.com/apis/site/v2/sports/soccer/arg.copa/scoreboard?dates=2026`
- **Datos Extraídos:**
  - Marcadores en tiempo real (local, visitante, minuto, periodo).
  - Cronología de incidencias (goles, tarjetas, sustituciones).
  - Estadísticas de partido (posesión, remates, tiros de esquina).
  - Tablas de posiciones de Primera División (Group A y Group B).
- **Régimen de Términos:** Los endpoints no requieren clave de desarrollador comercial pero están sujetos a los Términos de Servicio de The Walt Disney Company / ESPN.
- **Riesgos Técnicos:**
  - Cambios no anunciados en la estructura del JSON.
  - Rate limiting si se realizan demasiadas peticiones concurrentes desde una misma IP de Vercel/AWS.
  - Caídas temporales durante partidos de alta demanda.
- **Mitigación y Alternativas:**
  - CacheService con TTL escalonado (15s en vivo, 10m en catálogo de clubes).
  - Ingestión persistente en Firestore / Supabase: si ESPN falla, se sirve el último estado verificado con marca honesta `STALE` sin inventar datos.
  - Semillas offline completas de la temporada (`SEASON_MATCHES_SEED`, `TEAMS_SEED`).
  - Posibilidad de alternar a proveedores comerciales autorizados en el futuro (API-Football / Sportmonks) si el proyecto escala comercialmente.

---

### 1.2. Promiedos (Fuente Secundaria: Coeficientes Trienales de Promedios)
- **Tipo de Acceso:** Scraper HTTP GET sobre el portal web público (`https://www.promiedos.com.ar/league/liga-profesional/hc`).
- **Método Técnico:** Se descarga el HTML y se extrae mediante expresión regular el bloque estructurado SSR `<script id="__NEXT_DATA__" type="application/json">`.
- **Datos Extraídos:**
  - Tabla de Promedios con puntos y partidos disputados acumulados en las temporadas 2024, 2025 y 2026.
  - Validación cruzada de 240 partidos jugados para contrastar resultados con ESPN.
- **Régimen de Términos:** **REQUIERE VERIFICACIÓN DE TÉRMINOS**. Promiedos no provee una API pública documentada para desarrolladores. Los términos generales de sitios web habitualmente restringen la extracción masiva automatizada.
- **Riesgos Técnicos:**
  - Bloqueo por Cloudflare / Anti-bot o WAF si se detecta un User-Agent de datacenter.
  - Cambios en el diseño de páginas de Next.js de Promiedos que rompan el selector del script `__NEXT_DATA__`.
- **Mitigación y Alternativas:**
  - CÁBALA NO consulta Promiedos en cada petición de usuario. Los datos se consultan únicamente en ciclos espaciados de backend (cada 5 minutos en el updater o tras finalizar partidos) y se persisten físicamente.
  - **Plan de Sustitución Autónoma (Mediano Plazo):** CÁBALA cuenta con el acumulado histórico de 2024 y 2025 en base de datos. Una vez que CÁBALA computa de manera autónoma los puntos y partidos de 2026, **puede calcular la fórmula de promedios de forma 100% independiente**, eliminando por completo la necesidad del scraper de Promiedos.

---

### 1.3. AFA / Liga Profesional de Fútbol (Entidad Rectora del Reglamento)
- **Tipo de Acceso:** Documentos públicos de Reglamentos Generales y Circulares de Temporada Oficial.
- **Datos Utilizados:**
  - Sistema de disputa de torneos (Apertura y Clausura, 2 zonas de 15 clubes).
  - Criterios de desempate en caso de igualdad de puntos (diferencia de gol, goles a favor, partido de desempate en caso de descenso o primer puesto).
  - Asignación de plazas a Copa Libertadores 2027 y Copa Sudamericana 2027.
- **Riesgos:**
  - Modificaciones intempestivas del reglamento aprobadas en Asambleas de AFA (ej. anulación o modificación del número de descensos).
- **Mitigación:**
  - Motor de reglas formalmente testeado (`src/services/competitionRules.ts` con 27 tests automatizados en `competitionRules.test.ts`). Cualquier ajuste normativo se implementa como un cambio de parámetro verificable en los tests unitarios.

---

### 1.4. Clubes de Primera División (Identidades, Escudos y Marcas)
- **Naturaleza Legal:** Las marcas, escudos, siglas y denominaciones comerciales de los 30 clubes (Boca Juniors, River Plate, Independiente, Racing Club, San Lorenzo, Vélez, etc.) son marcas registradas de propiedad exclusiva de cada institución deportiva.
- **Uso en CÁBALA:**
  - CÁBALA utiliza los escudos exclusivamente con fines informativos, periodísticos e identificatorios en tablas y fixtures.
  - Los archivos de imagen se referencian mediante enlaces a servidores CDN públicos de ESPN (`https://a.espncdn.com/i/teamlogos/soccer/500/{id}.png`).
  - CÁBALA NO comercializa merchandising, no vende indumentaria ni cobra membresías que utilicen la imagen comercial de los clubes.
- **Aviso Requerido en Producto:**
  - Cláusula de deslinde y nominative fair use visible en los Términos y Condiciones y en el pie de página de la aplicación.
