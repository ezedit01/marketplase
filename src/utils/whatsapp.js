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

// Genera el link para postularse a un empleo por WhatsApp
export function buildWhatsappJobLink(job) {
  const phone = cleanPhoneNumber(job.whatsapp)
  const message = `Hola! Vi el aviso "${job.title}" en ${APP_NAME} y quería postularme.`
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export function buildJobShareText(job, url) {
  return `${job.title}\n${job.location || ''}\n\nVer en ${APP_NAME}:\n${url}`
}

export async function shareJob(job, url) {
  const text = buildJobShareText(job, url)

  if (navigator.share) {
    try {
      await navigator.share({ title: job.title, text, url })
      return true
    } catch {
      return false
    }
  }

  await navigator.clipboard.writeText(text)
  return 'copied'
}

// Genera el link para consultar sobre un evento por WhatsApp
export function buildWhatsappEventLink(event) {
  const phone = cleanPhoneNumber(event.whatsapp)
  const message = `Hola! Vi el evento "${event.title}" en ${APP_NAME} y quería consultar.`
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export function buildEventShareText(event, url) {
  return `${event.title}\n${event.location || ''}\n\nVer en ${APP_NAME}:\n${url}`
}

export async function shareEvent(event, url) {
  const text = buildEventShareText(event, url)

  if (navigator.share) {
    try {
      await navigator.share({ title: event.title, text, url })
      return true
    } catch {
      return false
    }
  }

  await navigator.clipboard.writeText(text)
  return 'copied'
}

// Genera el link para contactar sobre un viaje por WhatsApp
export function buildWhatsappTripLink(trip, destinationName) {
  const phone = cleanPhoneNumber(trip.whatsapp)
  const message = `Hola! Vi tu publicación en ${APP_NAME} sobre el viaje a ${destinationName || 'destino'} del ${trip.trip_date}. Quería consultar por los lugares disponibles.`
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export function buildTripShareText(trip, destinationName, url) {
  return `Viaje a ${destinationName || ''}\n${trip.trip_date}\n\nVer en ${APP_NAME}:\n${url}`
}

export async function shareTrip(trip, destinationName, url) {
  const text = buildTripShareText(trip, destinationName, url)

  if (navigator.share) {
    try {
      await navigator.share({ title: `Viaje a ${destinationName || ''}`, text, url })
      return true
    } catch {
      return false
    }
  }

  await navigator.clipboard.writeText(text)
  return 'copied'
}

// Genera el link para contactar sobre una comisión/encomienda por WhatsApp
export function buildWhatsappErrandLink(errand, title) {
  const phone = cleanPhoneNumber(errand.whatsapp)
  const verb = errand.mode === 'ofrezco' ? 'que ofrecés' : 'que necesitás'
  const message = `Hola! Vi en ${APP_NAME} ${verb}: "${title}". Quería consultarte.`
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export function buildErrandShareText(errand, title, url) {
  return `${title}\n\nVer en ${APP_NAME}:\n${url}`
}

export async function shareErrand(errand, title, url) {
  const text = buildErrandShareText(errand, title, url)

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url })
      return true
    } catch {
      return false
    }
  }

  await navigator.clipboard.writeText(text)
  return 'copied'
}
