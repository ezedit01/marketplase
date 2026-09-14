# Arquitectura y preparación para crecer

Este documento explica cómo la base actual (Marketplace, Etapa 1) queda preparada
para las etapas futuras descriptas en la visión del proyecto, sin necesidad de
reescribir lo que ya funciona.

## Principio general

`listings` (publicaciones de compra/venta) es y va a seguir siendo una entidad
independiente. Las futuras secciones (negocios, servicios, empleos, eventos,
promociones) **no se van a modelar como columnas nuevas en `listings`** — cada
una va a tener su propia tabla, con su propio ciclo de vida, y van a compartir
solamente lo que realmente tiene sentido compartir: `profiles` y `categories`.

Esto evita el error típico de ir agregando columnas nullable a una tabla hasta
que se vuelve inmanejable.

## Cómo se conecta cada etapa futura con lo que ya existe

### Etapa 3 — Negocios ✅ implementada

`businesses` es una tabla separada de `listings`, tal como estaba planeado —
no comparten filas, cada una tiene su propio ciclo de vida y su propia
taxonomía de categorías (`business_categories`, distinta de `categories` que
usan los productos). `SellerProfile.jsx` (perfil de vendedor particular) y
`BusinessDetail.jsx` (perfil de negocio) terminaron siendo páginas
independientes en vez de compartir código — en la práctica el contenido
difiere lo suficiente (horarios, dirección, WhatsApp de negocio vs. grid de
publicaciones de un particular) como para que forzar un componente común no
valiera la pena. `BusinessForm.jsx` sí se reutiliza entre crear y editar.

**Lo que quedó afuera a propósito, para una iteración futura si hace
falta:** vincular publicaciones del marketplace a un negocio
(`listings.business_id`), catálogo de productos propio del negocio, y el
campo `profiles.account_type` (`'particular'` | `'negocio'`) — hoy cualquier
usuario logueado puede crear un negocio sin que cambie su perfil de
comprador/vendedor particular. Se agregan cuando haya una razón concreta de
un usuario real, no antes.

### Etapa 4 — Servicios

Nueva tabla `services` (independiente de `listings`, porque un servicio no
tiene "stock" ni se marca como vendido — se marca disponible/no disponible).
Reutiliza `categories` con un `type` nuevo (`'producto'` | `'servicio'`) o una
tabla de categorías separada si conviene más — se decide en el momento, no
condiciona nada de lo ya construido.

### Etapa 5 — Empleos, eventos, promociones

Mismo patrón: tablas nuevas (`jobs`, `events`, `promotions`), cada una con su
propio dueño (`profiles` o `businesses`) y su propio ciclo de vida. Ninguna
depende de tocar `listings`.

### Favoritos (ya implementado en esta etapa)

`favorites` es una tabla puente (`user_id`, `listing_id`). El mismo patrón se
puede reutilizar para favoritos de negocios/servicios más adelante agregando
`business_id` o `service_id` nullable, o creando tablas puente separadas
(`business_favorites`) si el volumen lo justifica.

### Alertas de búsqueda (preparado, no implementado)

Tabla `search_alerts` ya creada (ver `supabase/migrations/002_favorites_and_alerts.sql`)
pero sin UI ni lógica de disparo todavía. Cuando se implemente el feature
completo, va a necesitar:

- Un cron job (Supabase tiene `pg_cron`, disponible en el free tier) que
  corra periódicamente y compare `listings` creados recientemente contra
  las alertas activas.
- Un mecanismo de notificación: la opción más barata y coherente con "WhatsApp
  como canal principal" (sección 6 del documento de visión) sería enviar la
  alerta como link de WhatsApp al vendedor... pero acá el destinatario es el
  usuario que buscó, no el vendedor. Para notificar al usuario buscador hace
  falta un canal propio: push notifications (vía PWA/service worker, gratis)
  o email (Supabase tiene SMTP built-in limitado, o Resend free tier). Se
  define cuando se aborde esta etapa.

### Publicaciones destacadas (ya preparado desde el MVP)

`listings.featured` y `listings.favorites_count` ya existen. El día que se
monetice, solo hace falta agregar una tabla `featured_purchases` (quién pagó,
cuándo vence) y un cron/edge function que desactive `featured` cuando venza —
no requiere tocar el modelo de `listings`.

### Multi-localidad (Etapa 7 — replicar en otros pueblos)

Hoy no hay ningún campo de "localidad" a nivel plataforma (el `location` de
cada listing es texto libre, tipo "Centro" o "Barrio Norte" dentro del mismo
pueblo). Cuando se aborde multi-localidad, la forma correcta es agregar una
tabla `towns` (o `locations`) y una FK `town_id` en `profiles` y `listings`,
filtrando todo por localidad del usuario. Es un cambio de una sola columna
propagada a las tablas existentes — no requiere reestructurar nada.

## Resumen

Ninguna de las expansiones futuras necesita romper o migrar pesadamente lo que
ya está en producción. El costo de "no construir todo ahora" es cero en
términos de arquitectura, que era justamente el objetivo del punto 4 de la
visión actualizada.
