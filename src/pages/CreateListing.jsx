import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { useCategories } from '../hooks/useCategories'
import { generateUniqueSlug } from '../utils/slug'
import { ImageIcon, CloseIcon } from '../components/ui/Icons'
import './CreateListing.css'

const MAX_IMAGES = 6

export default function CreateListing() {
  const { user, profile, loading: authLoading } = useAuth()
  const { categories } = useCategories()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [condition, setCondition] = useState('used')
  const [whatsapp, setWhatsapp] = useState('')
  const [location, setLocation] = useState('')
  const [images, setImages] = useState([]) // { file, preview }
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (profile) {
      setWhatsapp(profile.whatsapp || '')
      setLocation(profile.location || '')
    }
  }, [profile])

  if (!authLoading && !user) {
    navigate('/ingresar?next=/publicar')
    return null
  }

  function handleImageChange(e) {
    const files = Array.from(e.target.files).slice(0, MAX_IMAGES - images.length)
    const newImages = files.map((file) => ({ file, preview: URL.createObjectURL(file) }))
    setImages((prev) => [...prev, ...newImages].slice(0, MAX_IMAGES))
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!title.trim() || !categoryId) {
      setError('Completá al menos el título y la categoría.')
      return
    }

    setSubmitting(true)

    try {
      // Guardamos/actualizamos los datos del vendedor en su perfil
      await supabase.from('profiles').update({ whatsapp, location }).eq('id', user.id)

      const slug = generateUniqueSlug(title)

      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          title: title.trim(),
          slug,
          description: description.trim(),
          price: price ? Number(price) : null,
          category_id: Number(categoryId),
          condition,
          location: location.trim(),
        })
        .select()
        .single()

      if (listingError) throw listingError

      // Subir imágenes a Storage y guardar referencias
      for (let i = 0; i < images.length; i++) {
        const { file } = images[i]
        const ext = file.name.split('.').pop()
        const path = `${user.id}/${listing.id}/${i}-${Date.now()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('listings-images')
          .upload(path, file)

        if (uploadError) continue

        const { data: publicUrl } = supabase.storage.from('listings-images').getPublicUrl(path)

        await supabase.from('listing_images').insert({
          listing_id: listing.id,
          url: publicUrl.publicUrl,
          is_main: i === 0,
          order_index: i,
        })
      }

      navigate(`/producto/${slug}`)
    } catch (err) {
      setError('Ocurrió un error al publicar. Intentá de nuevo.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container create-listing">
      <h1>Publicar producto</h1>

      <form onSubmit={handleSubmit} className="create-listing-form">
        <section>
          <label>Imágenes</label>
          <div className="image-upload-grid">
            {images.map((img, i) => (
              <div key={i} className="image-upload-item">
                <img src={img.preview} alt="" />
                <button type="button" onClick={() => removeImage(i)}>
                  <CloseIcon size={14} />
                </button>
                {i === 0 && <span className="image-upload-main-tag">Principal</span>}
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <label className="image-upload-add">
                <ImageIcon size={22} />
                <span>Agregar foto</span>
                <input type="file" accept="image/*" multiple hidden onChange={handleImageChange} />
              </label>
            )}
          </div>
        </section>

        <section className="form-grid">
          <div className="form-field">
            <label>Título *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Bicicleta rodado 26" required />
          </div>

          <div className="form-field">
            <label>Precio</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
          </div>

          <div className="form-field">
            <label>Categoría *</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              <option value="">Seleccionar</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Estado</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)}>
              <option value="used">Usado</option>
              <option value="new">Nuevo</option>
            </select>
          </div>

          <div className="form-field form-field-full">
            <label>Descripción</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contá detalles del producto: estado, características, motivo de venta..."
            />
          </div>
        </section>

        <section className="form-grid">
          <div className="form-field">
            <label>WhatsApp de contacto *</label>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Ej: 3854123456"
              required
            />
          </div>
          <div className="form-field">
            <label>Ubicación / Zona</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ej: Centro" />
          </div>
        </section>

        {error && <p className="create-listing-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Publicando...' : 'Publicar'}
        </button>
      </form>
    </div>
  )
}
