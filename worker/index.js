// Worker de Cloudflare (modelo "Workers con static assets", no Pages
// clásico). Reemplaza tanto al _redirects como a la vieja carpeta
// functions/ — acá vive toda la lógica de servidor del sitio.
//
// Qué hace:
// 1. Para cualquier ruta que NO sea /producto/*, delega directo a los
//    archivos estáticos (env.ASSETS.fetch). El modo SPA (index.html para
//    rutas desconocidas) ya está resuelto por "not_found_handling" en
//    wrangler.jsonc, así que no hay que reimplementarlo acá.
// 2. Para /producto/*, si quien pide la página es un bot de redes sociales
//    (WhatsApp, Facebook, Twitter/X, etc), le devolvemos HTML con las meta
//    tags Open Graph de esa publicación puntual (para que la preview al
//    compartir el link muestre foto, título y precio). Para cualquier otro
//    visitante, pasa de largo a los archivos estáticos como siempre.
//
// Variables de entorno necesarias (Cloudflare dashboard > Settings >
// Variables and Secrets, en el Worker):
//   SUPABASE_URL
//   SUPABASE_ANON_KEY
//   APP_NAME (opcional)

const BOT_USER_AGENTS = [
  'facebookexternalhit',
  'facebookcatalog',
  'whatsapp',
  'twitterbot',
  'slackbot',
  'telegrambot',
  'linkedinbot',
  'discordbot',
  'pinterest',
  'redditbot',
  'vkshare',
  'skypeuripreview',
  'googlebot',
  'bingbot',
]

function isSocialBot(userAgent) {
  if (!userAgent) return false
  const ua = userAgent.toLowerCase()
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot))
}

function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function truncate(str = '', max = 160) {
  if (str.length <= max) return str
  return str.slice(0, max - 1).trimEnd() + '…'
}

async function buildOgResponse(request, slug, env) {
  const appName = env.APP_NAME || 'PUNTO'
  const supabaseUrl = env.SUPABASE_URL
  const supabaseAnonKey = env.SUPABASE_ANON_KEY

  if (!slug || !supabaseUrl || !supabaseAnonKey) return null

  const query = new URLSearchParams({
    slug: `eq.${slug}`,
    select: 'title,description,price,location,listing_images(url,is_main)',
    limit: '1',
  })

  const res = await fetch(`${supabaseUrl}/rest/v1/listings?${query}`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  })

  const rows = await res.json()
  const listing = Array.isArray(rows) ? rows[0] : null
  if (!listing) return null

  const priceText = listing.price
    ? `$${Number(listing.price).toLocaleString('es-AR')}`
    : 'Consultar precio'

  const mainImage =
    listing.listing_images?.find((img) => img.is_main)?.url ||
    listing.listing_images?.[0]?.url ||
    ''

  const title = `${listing.title} — ${priceText} | ${appName}`
  const description = truncate(
    listing.description
      ? `${listing.description} ${listing.location ? `· ${listing.location}` : ''}`
      : `${priceText}${listing.location ? ` · ${listing.location}` : ''}`
  )
  const canonicalUrl = request.url

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta name="description" content="${escapeHtml(description)}" />

  <meta property="og:type" content="product" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="og:site_name" content="${escapeHtml(appName)}" />
  ${mainImage ? `<meta property="og:image" content="${escapeHtml(mainImage)}" />` : ''}

  <meta name="twitter:card" content="${mainImage ? 'summary_large_image' : 'summary'}" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  ${mainImage ? `<meta name="twitter:image" content="${escapeHtml(mainImage)}" />` : ''}
</head>
<body>
  <p>${escapeHtml(listing.title)} — ${escapeHtml(priceText)}</p>
  <a href="${escapeHtml(canonicalUrl)}">Ver publicación en ${escapeHtml(appName)}</a>
</body>
</html>`

  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } })
}

async function buildSitemap(request, env) {
  const supabaseUrl = env.SUPABASE_URL
  const supabaseAnonKey = env.SUPABASE_ANON_KEY
  const origin = new URL(request.url).origin

  const staticUrls = [`${origin}/`, `${origin}/buscar`]

  let listingUrls = []
  let debugComment = ''

  if (!supabaseUrl || !supabaseAnonKey) {
    debugComment = '<!-- No se encontraron SUPABASE_URL / SUPABASE_ANON_KEY en las variables de runtime del Worker -->'
  } else {
    try {
      const query = new URLSearchParams({
        status: 'eq.active',
        select: 'slug,updated_at',
        order: 'created_at.desc',
        limit: '2000',
      })
      const res = await fetch(`${supabaseUrl}/rest/v1/listings?${query}`, {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
      })

      if (!res.ok) {
        const body = await res.text()
        debugComment = `<!-- Supabase respondió ${res.status}: ${escapeHtml(body.slice(0, 300))} -->`
      } else {
        const rows = await res.json()
        if (Array.isArray(rows)) {
          listingUrls = rows.map((l) => ({
            loc: `${origin}/producto/${l.slug}`,
            lastmod: l.updated_at ? l.updated_at.slice(0, 10) : undefined,
          }))
          if (listingUrls.length === 0) {
            debugComment = '<!-- Supabase respondió OK pero sin publicaciones activas -->'
          }
        } else {
          debugComment = `<!-- Respuesta inesperada de Supabase: ${escapeHtml(JSON.stringify(rows).slice(0, 300))} -->`
        }
      }
    } catch (err) {
      debugComment = `<!-- Error al consultar Supabase: ${escapeHtml(String(err))} -->`
    }
  }

  const staticEntries = staticUrls.map((loc) => `  <url><loc>${loc}</loc></url>`).join('\n')
  const listingEntries = listingUrls
    .map((l) => `  <url><loc>${l.loc}</loc>${l.lastmod ? `<lastmod>${l.lastmod}</lastmod>` : ''}</url>`)
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${listingEntries}
${debugComment}
</urlset>`

  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/sitemap.xml') {
      return buildSitemap(request, env)
    }

    if (url.pathname.startsWith('/producto/')) {
      const userAgent = request.headers.get('user-agent') || ''
      if (isSocialBot(userAgent)) {
        const slug = url.pathname.replace('/producto/', '').replace(/\/$/, '')
        try {
          const ogResponse = await buildOgResponse(request, slug, env)
          if (ogResponse) return ogResponse
        } catch {
          // si algo falla, mejor seguir a la SPA que romper la carga
        }
      }
    }

    return env.ASSETS.fetch(request)
  },
}
