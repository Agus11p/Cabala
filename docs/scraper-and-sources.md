# CÁBALA — Auditoría de Fuentes, Ingestión y Política de Scraper

Este documento formaliza la auditoría de fuentes de datos, la identificación de faltantes y la política reglamentaria y ética de ingestión para **CÁBALA (Temporada 2026)**.

---

## 1. Regla Suprema del Proyecto

> **DATOS INVENTADOS = ERROR**
> Si un dato no puede obtenerse de una fuente verificable:
> **mostrar `SIN DATO`**
>
> **CERO (0) NO SIGNIFICA SIN DATO:**
> - Si un equipo tiene 0 goles recibidos o 0 derrotas, se exhibe `0`.
> - Si se desconoce el valor, se exhibe `SIN DATO`.
> - Nunca convertir `null` en `0`.

---

## 2. Diagnóstico de Datos Faltantes en el Proveedor Actual (ESPN arg.1)

Tras la auditoría del feed de ESPN para la Liga Profesional 2026, se identificaron los siguientes campos no suministrados:

1. **Tabla de Promedios Acumulada (3 Temporadas):**
   - ESPN reporta posiciones de Apertura y Clausura por zona, pero **no computa la tabla trianual de coeficientes (2024-2025-2026)**.
   - *Tratamiento:* Se marca explícitamente con `status: "SIN_DATO"`. La UI muestra `SIN DATO`.

2. **Racha Reciente Detallada de Club:**
   - La API de equipos de ESPN entrega la nómina de clubes, pero no siempre serializa la secuencia histórica de los últimos 5 partidos por institución de forma atómica.
   - *Tratamiento:* Cuando no está disponible, se expone `recentForm: []` y la UI muestra el distintivo `SIN DATO`.

3. **Historial Completo de Títulos AFA (Palmarés):**
   - La API de ESPN no entrega un desglose fidedigno de títulos amateur/profesionales de AFA.
   - *Tratamiento:* En lugar de inventar copas, se muestra `SIN DATO`.

4. **Designaciones Arbitrales Previas:**
   - Para partidos programados a varios días, el referí se designa cerca de la fecha.
   - *Tratamiento:* Si no está confirmado en el feed, se muestra `SIN DATO`.

---

## 3. Análisis de Fuentes Públicas Candidatas para Ingestión / Scraper

| Fuente | Datos que Aportaría | Viabilidad Técnica | Viabilidad Legal / Términos | Decisión de Ingestión |
| :--- | :--- | :--- | :--- | :--- |
| **AFA Boletines Oficiales (afa.com.ar)** | Resoluciones disciplinarias, tablas de promedios oficiales, circulares reglamentarias. | Baja (PDFs estructurados heterogéneos publicados semanalmente). | Alta (documentos públicos de la casa madre del fútbol). | **Candidato Aprobado:** Ingestor de lectura de circulares para auditoría reglamentaria. |
| **Promiedos (promiedos.com.ar)** | Tabla de promedios trianual calculada, fixtures históricos. | Media (HTML dinámico, protecciones anti-bot de Cloudflare). | No permite scraping automatizado masivo sin acuerdo previo. | **Rechazado:** La política de CÁBALA prohíbe el bypass de Cloudflare, CAPTCHA o protecciones anti-bot. Se mantiene `SIN DATO`. |
| **Liga Profesional Oficial (ligaprofesional.ar)** | Estadísticas oficiales de partido, designaciones arbitrales. | Media (APIs internas privadas). | No documentada para consumo de terceros. | **Rechazado temporalmente:** Requiere convenio de datos. |

---

## 4. Política Anti-Bypass y Ética de Ingestión

En estricto cumplimiento de las directivas del proyecto:

1. **Sin bypass de CAPTCHA:** Bajo ninguna circunstancia el motor de ingestión resolverá o eludirá CAPTCHAs.
2. **Sin elusión de protecciones anti-bot:** Si un servidor rechaza la solicitud (HTTP 403, 429, WAF), se aborta la sincronización.
3. **Respeto a Rate Limits:** Máximo 60 req/min hacia endpoints de ESPN y caché obligatoria en memoria (TTL 1 a 3 minutos).
4. **Fallo Seguro hacia SIN DATO:** Ante cualquier inconsistencia o imposibilidad de conexión, el sistema persiste `status: "SIN_DATO"` con su respectivo registro de trazabilidad (`provenance`).

---

## 5. Arquitectura del Flujo de Datos

```text
DATA SOURCES (ESPN arg.1 / AFA Boletines)
     ↓
INGESTION LAYER (MultiProviderIngestionEngine)
     ↓
NORMALIZATION (src/types/dataContract.ts)
     ↓
VALIDATION (validateStandingsIntegrity / validateZoneIntegrity)
     ↓
DATABASE (DatabaseProvider / Memory Cache Normalizada)
     ↓
CÁBALA API (Express Routes /server.ts)
     ↓
FRONTEND (React UI con Regla Estricta SIN DATO)
```

---

## 6. Estados de Trazabilidad (Provenance)

Cada registro relevante en el sistema contiene:

* `source`: Identificador de la fuente (e.g. `'ESPN'`, `'AFA_REGULATIONS'`).
* `fetchedAt`: Marca de tiempo ISO del momento exacto de captura.
* `season`: Temporada computada (`2026`).
* `status`:
  * `VERIFIED`: Dato validado por el motor y consistente matemáticamente.
  * `UNAVAILABLE`: Fuente caída o no responde temporalmente.
  * `STALE`: Dato en caché expirado.
  * `ERROR`: Falla de red o deserialización.
  * `DATA_INCONSISTENCY`: Discrepancia matemática detectada en la fuente.
  * `SIN_DATO`: Dato ausente o no entregado por el proveedor.
