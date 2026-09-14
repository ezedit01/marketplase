const APP_NAME = import.meta.env.VITE_APP_NAME || 'PUNTO'

// Limpia el número para que quede solo con dígitos (formato internacional sin +)
function cleanPhoneNumber(phone) {
  return (phone || '').replace(/\D/g, '')
}

// Genera el link para contactar al vendedor por WhatsApp
export function buildWhatsappContactLink(listing) {
  const phone = cleanPhoneNumber(listing.seller_whatsapp)
  const message = `Hola! Vi tu publicación "${listing.title}" en ${APP_NAME} y estoy interesado.`
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

// Genera el texto para compartir una publicación (botón "Compartir")
export function buildShareText(listing, url) {
  const priceText = listing.price
    ? `$${Number(listing.price).toLocaleString('es-AR')}`
    : 'Consultar precio'

  return `${listing.title}\n${priceText}\n${listing.location || ''}\n\nVer publicación:\n${url}`
}

export async function shareListing(listing, url) {
  const text = buildShareText(listing, url)

  if (navigator.share) {
    try {
      await navigator.share({ title: listing.title, text, url })
      return true
    } catch {
      // usuario canceló el share nativo, no hacemos nada
      return false
    }
  }

  // Fallback: copiar al portapapeles
  await navigator.clipboard.writeText(text)
  return 'copied'
}

// Genera el link para contactar a un negocio por WhatsApp
export function buildWhatsappBusinessLink(business) {
  const phone = cleanPhoneNumber(business.whatsapp)
  const message = `Hola! Vi tu negocio "${business.name}" en ${APP_NAME} y quería hacerte una consulta.`
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export function buildBusinessShareText(business, url) {
  return `${business.name}\n${business.address || ''}\n\nVer en ${APP_NAME}:\n${url}`
}

export async function shareBusiness(business, url) {
  const text = buildBusinessShareText(business, url)

  if (navigator.share) {
    try {
      await navigator.share({ title: business.name, text, url })
      return true
    } catch {
      return false
    }
  }

  await navigator.clipboard.writeText(text)
  return 'copied'
}

// Genera el link para contactar a un prestador de servicio por WhatsApp
export function buildWhatsappServiceLink(service) {
  const phone = cleanPhoneNumber(service.whatsapp)
  const message = `Hola! Vi "${service.title}" en ${APP_NAME} y quería consultarte.`
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export function buildServiceShareText(service, url) {
  return `${service.title}\n${service.location || ''}\n\nVer en ${APP_NAME}:\n${url}`
}

export async function shareService(service, url) {
  const text = buildServiceShareText(service, url)

  if (navigator.share) {
    try {
      await navigator.share({ title: service.title, text, url })
      return true
    } catch {
      return false
    }
  }

  await navigator.clipboard.writeText(text)
  return 'copied'
}
