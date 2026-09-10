# PUNTO — by KREA

**PUNTO** es el lugar digital de Sol de Julio. La primera etapa (esta) es el
Marketplace: publicás, la gente busca, contacta por WhatsApp. La arquitectura
está preparada para crecer hacia negocios, servicios, empleos y más — ver
`ARCHITECTURE.md`.

## Stack

- React 19 + Vite
- Supabase (Auth + Postgres + Storage)
- React Router
- CSS puro (sin frameworks)

## 1. Crear el proyecto en Supabase

1. Andá a [supabase.com](https://supabase.com), creá una cuenta y un proyecto nuevo.
2. Elegí una región cercana (ej: São Paulo) y guardá la contraseña de la base.
3. Esperá a que el proyecto termine de aprovisionarse (1-2 min).

## 2. Correr el schema

1. En el dashboard de Supabase, andá a **SQL Editor** > **New query**.
2. Copiá y pegá todo el contenido de `supabase/schema.sql`.
3. Ejecutalo (Run). Esto crea las tablas, las políticas de seguridad (RLS) y el bucket de imágenes.
4. Después corré también `supabase/migrations/002_favorites_and_alerts.sql` en una query nueva. Agrega favoritos y deja preparada (sin usar todavía) la tabla de alertas de búsqueda para una etapa futura.
5. Por último, `supabase/migrations/003_avatars.sql`. Crea el bucket de storage para fotos de perfil (la columna ya existía, faltaba el bucket).

Si algo falla porque una extensión no está disponible en tu plan, avisame y lo resolvemos.

## 3. Configurar las variables de entorno

1. Copiá `.env.example` como `.env`:
   ```
   cp .env.example .env
   ```
2. En Supabase: **Project Settings > API**. Copiá:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

## 4. Instalar dependencias y correr en local

```bash
npm install
npm run dev
```

Abrí `http://localhost:5173`.

## 5. Convertirte en admin

Por defecto, todo usuario nuevo se crea con `role = 'user'`. Para acceder a `/admin`:

1. Registrate normalmente en la app.
2. En Supabase, andá a **Table Editor > profiles**, buscá tu usuario y cambiá `role` a `admin`.

## 6. Deploy

**Recomendado: Cloudflare Pages.** Netlify cambió a un plan gratis medido en
"créditos" (300/mes, cada deploy a producción gasta 15) que se agota rápido
mientras estás iterando seguido. Cloudflare Pages tiene ancho de banda
ilimitado y 500 builds/mes gratis, sin tarjeta — mucho más cómodo para esta
etapa del proyecto. Dejé el proyecto listo para los dos.

### Deploy en Cloudflare Pages

1. Entrá a [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**, y elegí tu repo.
2. Configuración de build:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. Cloudflare va a detectar solo la carpeta `functions/` (el equivalente a la edge function de Netlify) y el `public/_redirects` para las rutas de la SPA — no hace falta tocar nada más ahí.
4. Agregá las variables de entorno en **Settings > Environment variables** (marcá tanto Production como Preview):
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_NAME`, `VITE_APP_BY`, `VITE_APP_TAGLINE` (para el build)
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `APP_NAME` (mismos valores sin el prefijo `VITE_` — los usa `functions/producto/[slug].js` para las previews)
5. Guardá y hacé **Retry deployment** para que tome las variables.

De ahí en adelante, el flujo es idéntico al de Netlify: cada `git push` a `main` dispara un deploy solo.

### Deploy en Netlify (alternativa)

1. Subí el proyecto a un repo de GitHub.
2. En Netlify: **Add new site > Import an existing project**.
3. Netlify va a detectar automáticamente `netlify.toml` (build command, publish dir, redirects de la SPA y la edge function de Open Graph ya están configurados ahí).
4. Agregá las variables de entorno en **Site settings > Environment variables**:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_NAME`, `VITE_APP_BY`, `VITE_APP_TAGLINE` (para el build de la app)
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `APP_NAME` (mismos valores, sin el prefijo `VITE_` — los necesita la edge function de previews, que corre en un runtime separado del build de Vite y no tiene acceso a las variables `VITE_*`)

Si usás Netlify, cuidado con la cantidad de deploys: cada uno gasta créditos del plan gratis. Para probar cambios chicos seguido, conviene revisar en tu carpeta local con `npm run dev` antes de pushear.

### Verificar que las previews de WhatsApp/Facebook funcionen

Una vez deployado (en cualquiera de los dos), probá una URL de producto en el [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) (funciona también para validar cómo la va a leer WhatsApp, que usa el mismo sistema de crawler). Si no aparece la preview esperada, revisá los logs de la function en el dashboard correspondiente (`og-listing` en Netlify, o `producto/[slug]` en Cloudflare Pages > Functions logs).

## Logo e identidad visual

- `public/brand/logo-192.png` y `logo-512.png`: el ícono de marca en los tamaños que usa la app (header, footer, previews). Se usan tal cual en `src/components/layout/Logo.jsx`.
- `public/favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png`: generados a partir del mismo logo, para la pestaña del navegador y accesos directos en celular.
- `design/logo-master.png`: el archivo original en alta resolución (1254×1254), **no se sube al sitio en producción** — queda solo como referencia para cuando armen la versión vectorial (SVG).

Cuando tengan el SVG definitivo: reemplazá `public/brand/logo-192.png` (o agregá un `logo.svg` nuevo) y actualizá la constante `LOGO_ICON_SRC` en `src/components/layout/Logo.jsx`. El texto "PUNTO" / "by KREA" se renderiza en vivo con CSS (no es parte de la imagen), así que no hay que tocar nada más para que se siga viendo nítido.

## Estructura del proyecto

```
src/
  components/
    layout/       Header, BottomNav, Footer, Logo
    listing/      ListingCard, CategoryPills, ReportModal, FavoriteButton, SaveAlertButton
    ui/           Icons.jsx (set de íconos SVG)
  pages/
    Home, Search, ListingDetail, SellerProfile, CreateListing, Auth
    Profile, EditProfile, Favorites, History, Alerts
    Admin/        Dashboard, AdminListings, AdminUsers, AdminCategories, AdminReports
  hooks/          useAuth, useListings, useCategories, useFavorites
  utils/          slug.js, whatsapp.js, viewHistory.js
  lib/            supabaseClient.js
supabase/
  schema.sql                              Schema inicial (MVP)
  migrations/
    002_favorites_and_alerts.sql          Favoritos + tabla de alertas
    003_avatars.sql                       Bucket de fotos de perfil
netlify/
  edge-functions/og-listing.js  Previews de Open Graph para Netlify
netlify.toml                    Config de build, redirects SPA y edge function (Netlify)
functions/
  producto/[slug].js            Previews de Open Graph para Cloudflare Pages (mismo propósito que og-listing.js)
public/_redirects               Redirects de la SPA (Netlify y Cloudflare Pages usan el mismo formato)
ARCHITECTURE.md                 Cómo la base actual se prepara para negocios/servicios/etc.
```

### Sobre las alertas de búsqueda

Guardar una alerta (botón "Guardar esta búsqueda" en `/buscar`) es un simple
insert en `search_alerts`. **No hay avisos automáticos todavía** — la página
`/perfil/alertas` calcula, en el momento en que el usuario la visita, cuántas
publicaciones nuevas matchean cada alerta desde que se guardó. Es un modelo
"pull" (el usuario entra a revisar), no "push" (no mandamos notificaciones).
Implementar push/email real requiere un cron job (Supabase tiene `pg_cron`)
más un canal de entrega — se aborda como una pieza aparte cuando haga falta.

## Qué quedó afuera del MVP (a propósito)

Chat interno, pagos, delivery, app nativa, sistema de pujas/reservas, carrito. Todo eso es Fase 2+ una vez que haya usuarios reales usando el flujo básico: **publicar → buscar → ver → contactar**.

## Próximos pasos sugeridos

- Probar el flujo completo end-to-end con datos reales del pueblo.
- Cargar vos mismo las primeras 15-20 publicaciones para que la home no arranque vacía.
- Sumar Google OAuth como método de login adicional (Supabase lo soporta nativo, es config, no código).
- Revisar el límite de tamaño/compresión de imágenes antes de subir (hoy se suben tal cual).
- Validar las previews de Open Graph con datos reales antes de empezar a compartir masivamente en grupos de WhatsApp.
- Ver `ARCHITECTURE.md` cuando llegue el momento de negocios/servicios/empleos.
