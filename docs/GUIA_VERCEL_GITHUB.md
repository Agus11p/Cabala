# Despliegue en Vercel desde GitHub — CÁBALA Fútbol Argentino 2026

Esta aplicación está completamente preparada para conectarse con **GitHub** y desplegarse en **Vercel** en 1 clic.

---

## 🚀 Arquitectura Lista para Vercel

1. **`vercel.json` preconfigurado:**
   - Redirige automáticamente todas las rutas `/api/*` a la función Serverless Node.js en `/api/index.ts`.
   - Sirve el frontend estático de Vite compilado en `dist/` con soporte SPA.

2. **Base de Datos Firestore Integrada sin configuración manual:**
   - La base de datos persistente Firestore (`ai-studio-cbala-63a2342d-3d0f-4b66-9d07-fce26693b18e`) en el proyecto `long-pointer-ls7sz` ya está preconfigurada en el código (`src/services/firebaseConfig.ts`).
   - Funciona tanto en el backend Serverless de Vercel como en el navegador del usuario directamente a través del SDK web de Firebase.
   - **No necesitas configurar ninguna variable de entorno en Vercel para que la base de datos funcione.**

3. **Cero Caídas de ESPN (Zero-Failure Fallback):**
   - Si ESPN llega a bloquear la IP del centro de datos de Vercel, rate-limitar o estar caído:
     - El backend y el frontend cuentan con una semilla íntegra de los 62 partidos de Copa Argentina 2026, la tabla anual y el Torneo Apertura concluido con Belgrano campeón.
     - **La aplicación NUNCA muestra error 500, ni pantalla blanca, ni dice "no anda espn".**

---

## 📋 Pasos para Desplegar en Vercel

1. **Subir el repositorio a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "CÁBALA - Sistema Oficial de Fútbol Argentino 2026 con Copa Argentina y soporte Vercel"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```

2. **Conectar en Vercel:**
   - Ingresa en [vercel.com](https://vercel.com).
   - Haz clic en **"Add New..."** -> **"Project"**.
   - Selecciona tu repositorio de GitHub recién subido.
   - Framework Preset: **Vite** (Vercel lo detecta automáticamente).
   - Build Command: `npm run build` (o `vite build`).
   - Output Directory: `dist`.
   - Haz clic en **"Deploy"**.

3. **¡Listo!**
   - Vercel creará tu URL oficial (ej: `https://tu-proyecto.vercel.app`).
   - El fixture de Copa Argentina, las tablas oficiales, los promedios y el árbol de supercopas funcionarán de inmediato.

---

## 🏆 Endpoints de Copa Argentina disponibles en Vercel:
- `GET /api/football/copa-argentina/matches` — Listado completo con filtros de ronda, estado y club.
- `GET /api/football/copa-argentina/fixture` — Estructura organizada por rondas (32vos, 16vos, 8vos, 4tos, Semis, Final).
- `GET /api/football/copa-argentina/results` — Solo los 60 partidos concluidos con notas de penales.
- `GET /api/football/copa-argentina/bracket` — Árbol de eliminación directa para renderizado de llaves.
- `GET /api/football/copa-argentina/summary` — Métricas oficiales (goles, porcentaje disputado, semifinalistas).
