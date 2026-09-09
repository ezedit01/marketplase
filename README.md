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

## 6. Deploy en Netlify

1. Subí el proyecto a un repo de GitHub.
2. En Netlify: **Add new site > Import an existing project**.
3. Netlify va a detectar automáticamente `netlify.toml` (build command, publish dir, redirects de la SPA y la edge function de Open Graph ya están configurados ahí).
4. Agregá las variables de entorno en **Site settings > Environment variables**:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_NAME`, `VITE_APP_BY`, `VITE_APP_TAGLINE` (para el build de la app)
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `APP_NAME` (mismos valores, sin el prefijo `VITE_` — los necesita la edge function de previews, que corre en un runtime separado del build de Vite y no tiene acceso a las variables `VITE_*`)

### Verificar que las previews de WhatsApp/Facebook funcionen

Una vez deployado, probá una URL de producto en el [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) (funciona también para validar cómo la va a leer WhatsApp, que usa el mismo sistema de crawler). Si no aparece la preview esperada, revisá los logs de la edge function `og-listing` en el dashboard de Netlify.

## Estructura del proyecto

```
src/
  components/
    layout/       Header, BottomNav, Footer
    listing/      ListingCard, CategoryPills, ReportModal, FavoriteButton
    ui/           Icons.jsx (set de íconos SVG)
  pages/
    Home, Search, ListingDetail, CreateListing, Auth, Profile, Favorites
    Admin/        Dashboard, AdminListings, AdminUsers, AdminCategories, AdminReports
  hooks/          useAuth, useListings, useCategories, useFavorites
  lib/            supabaseClient.js
  utils/          slug.js, whatsapp.js
supabase/
  schema.sql                              Schema inicial (MVP)
  migrations/002_favorites_and_alerts.sql Favoritos + preparación de alertas
netlify/
  edge-functions/og-listing.js  Previews de Open Graph para WhatsApp/Facebook/etc
netlify.toml                    Config de build, redirects SPA y edge function
ARCHITECTURE.md                 Cómo la base actual se prepara para negocios/servicios/etc.
```

## Qué quedó afuera del MVP (a propósito)

Chat interno, pagos, delivery, app nativa, sistema de pujas/reservas, carrito. Todo eso es Fase 2+ una vez que haya usuarios reales usando el flujo básico: **publicar → buscar → ver → contactar**.

## Próximos pasos sugeridos

- Probar el flujo completo end-to-end con datos reales del pueblo.
- Cargar vos mismo las primeras 15-20 publicaciones para que la home no arranque vacía.
- Sumar Google OAuth como método de login adicional (Supabase lo soporta nativo, es config, no código).
- Revisar el límite de tamaño/compresión de imágenes antes de subir (hoy se suben tal cual).
- Validar las previews de Open Graph con datos reales antes de empezar a compartir masivamente en grupos de WhatsApp.
- Ver `ARCHITECTURE.md` cuando llegue el momento de negocios/servicios/empleos.
