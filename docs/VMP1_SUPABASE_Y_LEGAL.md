# CÁBALA — DOCUMENTACIÓN TÉCNICA DE VMP1
## Infraestructura PostgreSQL en Supabase, Seguridad RLS y Base Normativa

---

## 1. ESQUEMA RELACIONAL POSTGRESQL (SUPABASE)
Ubicación de migraciones versionadas:
- `supabase/migrations/20261006000000_vmp1_initial_schema.sql`
- `supabase/migrations/20261006000001_vmp1_rls_security.sql`

### Tablas Creadas:
1. `teams`: Catálogo de 30 clubes de Primera División con códigos canónicos unívocos, zonas ('A' o 'B'), información institucional, estadios y palmarés.
2. `matches`: Fixture oficial 2026 (495 partidos), marcadores verificados, estados ('scheduled', 'live', 'finished'), minutos de juego con tiempo añadido, foreign keys cruzadas hacia `teams` y restricciones que impiden que un club juegue contra sí mismo.
3. `standings`: Tablas de posiciones zonales (Apertura y Clausura) con restricciones de consistencia matemática a nivel de base de datos (`played = won + drawn + lost`, `points = (won * 3) + drawn`, `goal_difference = goals_for - goals_against`).
4. `annual_standings`: Tabla general anual consolidada de los 30 clubes para clasificación a Copas 2027 y descenso anual.
5. `average_standings`: Tabla de coeficientes trienales (2024 + 2025 + 2026) con validación estricta de sumas de puntos y partidos.
6. `data_ingestion_runs`: Historial de ejecuciones del motor de ingesta para trazabilidad y auditoría de sincronizaciones.

---

## 2. SEGURIDAD Y POLÍTICAS RLS (ROW LEVEL SECURITY)
- **Todas las tablas** tienen `ENABLE ROW LEVEL SECURITY;`.
- **Políticas de Lectura (SELECT):** Acceso público sin restricciones para consulta deportiva en el frontend de CÁBALA.
- **Políticas de Escritura (INSERT / UPDATE / DELETE):** Denegadas por defecto para el rol anónimo (`anon`). Únicamente el backend mediante `service_role` (que realiza bypass seguro de RLS en servidor) puede insertar o actualizar resultados.

---

## 3. SEPARACIÓN DE VARIABLES DE ENTORNO
Documentadas en `.env.example`:
- **Públicas de cliente:** `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- **Servidor exclusivamente:** `SUPABASE_SERVICE_ROLE_KEY` (sin prefijo `VITE_`, nunca accesible desde el navegador).

---

## 4. BASE LEGAL Y REGULATORIA (UI & DESLINDES)
Integrada en el modal `LegalModal.tsx` y accesible desde el pie de página de la aplicación:
- `/terminos`: Términos y Condiciones con deslinde de AFA, LPF, Conmebol, ESPN, Promiedos y clubes.
- `/privacidad`: Política de minimización de datos (sin recolección de DNI, tarjetas ni datos sensibles).
- `/cookies`: Política explicativa de LocalStorage técnico funcional y analítica anónima en preparación.
- `/reglamento`: Síntesis explicativa del sistema de disputa AFA 2026.
- `/contacto`: Información de reporte con placeholder institucional `[EMAIL_DE_CONTACTO]`.

---

## 5. FRECUENCIA DE ACTUALIZACIÓN DE RESULTADOS
- **Backend:** Intervalo de sincronización periódica general acelerado de 15 minutos a **5 minutos** en `server.ts`.
- **Frontend:** Polling activo en vivo cada **30 segundos** en `App.tsx` cuando un usuario está visualizando la ficha de un partido en ese momento, y auto-refresco del fixture general cada **5 minutos** (o cada 60s si hay partidos en juego).
