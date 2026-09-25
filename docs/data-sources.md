# CÁBALA — Arquitectura de Datos y Fuentes de Verdad

Este documento detalla la procedencia de cada tipo de información utilizada en la plataforma CÁBALA para la temporada **2026** de la Primera División del Fútbol Argentino, garantizando el principio de **Zero-Mock** y la separación estricta entre la fuente de datos deportivos y la fuente reglamentaria.

---

## 1. Datos Deportivos: ESPN ARG.1

* **Fuente:** ESPN Soccer API (`arg.1` - Argentine Liga Profesional de Fútbol).
* **Rol:** Proveedor exclusivo de datos deportivos en vivo y resultados históricos.
* **Cobertura:**
  * Marcadores en vivo (`/scoreboard`).
  * Tablas de posiciones por zona (`/standings`).
  * Nómina de clubes participantes (`/teams`).
  * Fichas de partidos y estadísticas individuales (`/summary`).
* **Temporada oficial solicitada:** `season = 2026`.
* **Regla de Cero Invención:** Si un dato o estadística no se encuentra presente en el feed de ESPN, el sistema informa explícitamente `PROVIDER_FIELD_MISSING` o marca el estado como `EMPTY`. **Bajo ninguna circunstancia se inventan marcadores, promedios, goles o fechas artificiales.**

> **Aclaración Importante:** ESPN es el proveedor técnico de datos deportivos de CÁBALA. NO es el ente rector de la competencia ni emite reglamentaciones oficiales de la AFA.

---

## 2. Fuente Reglamentaria: AFA / Liga Profesional de Fútbol

* **Ente Rector:** Asociación del Fútbol Argentino (AFA) / Liga Profesional de Fútbol (LPF).
* **Rol:** Marco normativo oficial y reglas de competición que rigen la temporada 2026.
* **Criterios Reglamentarios Implementados en CÁBALA:**
  * **Estructura Zonal:** 30 clubes organizados en dos zonas de 15 clubes cada una (Zona A y Zona B).
  * **Fase Regular:** 16 fechas por torneo (Apertura y Clausura): 14 fechas zonales + 1 fecha interzonal de clásicos + 1 fecha interzonal complementaria.
  * **Desempates en Zonas (Orden Sucesivo Oficial AFA):**
    1. Mayor diferencia de goles general (DG).
    2. Mayor cantidad de goles a favor (GF).
    3. Partidos entre sí (Head to Head / Mini-tabla).
    4. Tabla de Fair Play reglamentaria (Amarilla: -1, Segunda Amarilla: -3 adicionales / -4 total, Roja directa: -5).
    5. Sorteo oficial de AFA (sin asignación aleatoria por software ni ordenamiento alfabético).
  * **Playoffs de Octavos de Final:** 8 primeros de Zona A y 8 primeros de Zona B (1A vs 8B, 1B vs 8A, etc., con localía para el mejor clasificado).
  * **Inhabilitación por Descenso:** Si un clasificado a playoffs en el Torneo Clausura finaliza en zona de descenso directo o desempate de permanencia, queda inhabilitado y su cupo se traslada al siguiente clasificado elegible de su zona (9°, 10°, etc.).
  * **Tabla General Anual:** Acumula exclusivamente las fases regulares (32 fechas: 16 de Apertura + 16 de Clausura). Los playoffs no computan puntos para la Tabla Anual. El 1° es proclamado Campeón de Liga 2026.
  * **Clasificación a Copas Conmebol 2027:**
    * *Copa Libertadores 2027:* 6 cupos (Campeón Apertura, Campeón Clausura, Campeón Copa Argentina + 3 mejores de Tabla Anual). Reasignación determinista a la Tabla Anual en casos de bicampeonato o campeonatos múltiples.
    * *Copa Sudamericana 2027:* 6 cupos siguientes en la Tabla Anual que no hayan clasificado a Libertadores ni estén descendidos.
  * **Descenso:** Dos descensos directos a Primera Nacional: uno por la Tabla General Anual (30°) y uno por la Tabla de Promedios (30°). Si hay igualdad en puntos, se disputa partido/triangular de desempate en cancha neutral.

---

## 3. Tabla de Promedios

* **Estado Actual:** `available: false`.
* **Motivo:** El proveedor configurado (ESPN) no provee la tabla de coeficientes acumulados de las últimas 3 temporadas (2024, 2025 y 2026).
* **Integridad CÁBALA:** No se inventan promedios ni se simulan coeficientes como si fueran oficiales. Mientras no exista un feed oficial de promedios homologado, la interfaz muestra claramente:
  > *"Tabla de Promedios no disponible en el proveedor de datos configurado. CÁBALA no genera coeficientes simulados."*

---

## 4. Inteligencia Artificial (IA) en CÁBALA

* **Principio Fundamental:** **La IA NUNCA es fuente de datos deportivos.**
* **Rol de la IA:**
  * La IA actúa como interfaz de lenguaje natural, explicador táctico y asistente consultivo.
  * **Grounding Estricto:** Toda respuesta sobre posiciones, cruces, clasificación matemática o descensos es resuelta por herramientas deterministas (`aiTools.ts`) que consultan el backend de datos de ESPN y aplican las reglas de competición de AFA.
  * La IA tiene prohibido alucinar marcadores, inventar llaves de playoffs o contradecir la matemática oficial.

---

## 5. Motor de Competición CÁBALA (`competitionRules.ts`)

* **Lógica Determinista:** Todas las reglas de desempate, generación de cruces, cálculo de escenarios de clasificación (CLINCHED, ELIMINATED, IN_CONTENTION) y reasignación de cupos internacionales son funciones puras TypeScript verificadas con 38 tests automatizados.
* **Trazabilidad:** Cualquier escenario pendiente de verificación reglamentaria (como la traslación del cupo al puesto 29° si un mismo club es último en Anual y Promedios) se reporta explícitamente con `verificationStatus: "REQUIERE_VERIFICACIÓN_REGLAMENTARIA"` y se clasifica de forma transparente en la suite de auditoría.
