import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { useBusinessCategories } from '../hooks/useBusinessCategories'
import { generateUniqueSlug } from '../utils/slug'
import { StoreIcon } from '../components/ui/Icons'
import './BusinessForm.css'

// existingBusiness: si viene, el formulario edita en vez de crear.
export default function BusinessForm({ existingBusiness }) {
  const { user, loading: authLoading } = useAuth()
  const { categories } = useBusinessCategories()
  const navigate = useNavigate()
  const isEdit = Boolean(existingBusiness)

  const [name, setName] = useState(existingBusiness?.name || '')
  const [categoryId, setCategoryId] = useState(existingBusiness?.category_id || '')
  const [description, setDescription] = useState(existingBusiness?.description || '')
  const [address, setAddress] = useState(existingBusiness?.address || '')
  const [whatsapp, setWhatsapp] = useState(existingBusiness?.whatsapp || '')
  const [hours, setHours] = useState(existingBusiness?.hours || '')
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(existingBusiness?.logo_url || null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!authLoading && !user) {
    navigate(`/ingresar?next=${isEdit ? `/negocios/${existingBusiness.slug}/editar` : '/negocios/publicar'}`)
    return null
  }

  function handleLogoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!name.trim() || !categoryId || !whatsapp.trim()) {
      setError('Completá al menos el nombre, la categoría y el WhatsApp.')
      return
    }

    setSubmitting(true)

    try {
      let logoUrl = existingBusiness?.logo_url || null

      if (logoFile) {
        const ext = logoFile.name.split('.').pop()
        const path = `${user.id}/logo-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage.from('business-logos').upload(path, logoFile)
        if (uploadError) throw uploadError
        const { data: publicUrl } = supabase.storage.from('business-logos').getPublicUrl(path)
        logoUrl = publicUrl.publicUrl
      }

      const payload = {
        name: name.trim(),
        category_id: Number(categoryId),
        description: description.trim(),
        address: address.trim(),
        whatsapp: whatsapp.trim(),
        hours: hours.trim(),
        logo_url: logoUrl,
      }

      if (isEdit) {
        const { error: updateError } = await supabase
          .from('businesses')
          .update(payload)
          .eq('id', existingBusiness.id)
        if (updateError) throw updateError
        navigate(`/negocio/${existingBusiness.slug}`)
      } else {
        const slug = generateUniqueSlug(name)
        const { error: insertError } = await supabase.from('businesses').insert({
          ...payload,
          slug,
          owner_id: user.id,
        })
        if (insertError) throw insertError
        navigate(`/negocio/${slug}`)
      }
    } catch (err) {
      setError('Ocurrió un error al guardar. Intentá de nuevo.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container business-form-page">
      <h1>{isEdit ? 'Editar negocio' : 'Sumar mi negocio'}</h1>

      <form onSubmit={handleSubmit} className="business-form">
        <div className="business-logo-upload">
          <div className="business-logo-upload-preview">
            {logoPreview ? <img src={logoPreview} alt="" /> : <StoreIcon size={28} />}
          </div>
          <label className="btn btn-outline">
            {logoPreview ? 'Cambiar logo' : 'Subir logo'}
            <input type="file" accept="image/*" hidden onChange={handleLogoChange} />
          </label>
        </div>

        <div className="form-field">
          <label>Nombre del negocio *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Ferretería El Tornillo" required />
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
          <label>Descripción</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contá qué ofrece tu negocio..."
          />
        </div>

        <div className="form-field">
          <label>Dirección</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ej: San Martín 450" />
        </div>

        <div className="form-field">
          <label>WhatsApp de contacto *</label>
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Ej: 3854123456" required />
        </div>

        <div className="form-field">
          <label>Horarios</label>
          <input
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="Ej: Lun a Vie 9-13 y 17-21, Sáb 9-13"
          />
        </div>

        {error && <p className="business-form-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Publicar negocio'}
        </button>
      </form>
    </div>
  )
}
