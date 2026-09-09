// Netlify Edge Function: sirve meta tags Open Graph dinámicas para cada
// publicación cuando el pedido viene de un bot de redes sociales
// (WhatsApp, Facebook, Twitter/X, etc). Los usuarios reales pasan de largo
// hacia la SPA normal — este archivo NO reemplaza la experiencia de la app,
// solo resuelve el caso puntual del preview al compartir un link.
//
// Requiere estas variables de entorno configuradas en Netlify
// (Site settings > Environment variables):
//   SUPABASE_URL
//   SUPABASE_ANON_KEY
//   APP_NAME (opcional, mismo valor que VITE_APP_NAME)

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

export default async (request, context) => {
  const userAgent = request.headers.get('user-agent') || ''

  // Si no es un bot conocido, dejamos pasar a la SPA normal.
  if (!isSocialBot(userAgent)) {
    return context.next()
  }

  const url = new URL(request.url)
  const slug = url.pathname.replace('/producto/', '').replace(/\/$/, '')
  const appName = Deno.env.get('APP_NAME') || 'Marketplace del Pueblo'
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

  if (!slug || !supabaseUrl || !supabaseAnonKey) {
    return context.next()
  }

  try {
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

    if (!listing) {
      return context.next()
    }

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
    const canonicalUrl = url.toString()

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

    return new Response(html, {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    })
  } catch {
    // Si algo falla, mejor dejar pasar a la SPA que romper la carga.
    return context.next()
  }
}

export const config = {
  path: '/producto/*',
}
