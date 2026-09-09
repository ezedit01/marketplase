import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { UserIcon, CloseIcon } from '../components/ui/Icons'
import './EditProfile.css'

export default function EditProfile() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [location, setLocation] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [removeAvatar, setRemoveAvatar] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/ingresar?next=/perfil/editar')
      return
    }
    if (profile) {
      setName(profile.name || '')
      setWhatsapp(profile.whatsapp || '')
      setLocation(profile.location || '')
      setAvatarPreview(profile.avatar_url || null)
    }
  }, [profile, authLoading, user, navigate])

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setRemoveAvatar(false)
  }

  function handleRemoveAvatar() {
    setAvatarFile(null)
    setAvatarPreview(null)
    setRemoveAvatar(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('El nombre no puede estar vacío.')
      return
    }

    setSaving(true)

    try {
      let avatarUrl = profile?.avatar_url || null

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `${user.id}/avatar-${Date.now()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile)

        if (uploadError) throw uploadError

        const { data: publicUrl } = supabase.storage.from('avatars').getPublicUrl(path)
        avatarUrl = publicUrl.publicUrl
      } else if (removeAvatar) {
        avatarUrl = null
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: name.trim(),
          whatsapp: whatsapp.trim(),
          location: location.trim(),
          avatar_url: avatarUrl,
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      refreshProfile()
      setSaved(true)
      setTimeout(() => navigate('/perfil'), 900)
    } catch (err) {
      setError('No pudimos guardar los cambios. Intentá de nuevo.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || !profile) return null

  return (
    <div className="container edit-profile-page">
      <Link to="/perfil" className="edit-profile-back">
        ← Mi perfil
      </Link>
      <h1>Editar perfil</h1>

      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div className="avatar-upload">
          <div className="avatar-upload-preview">
            {avatarPreview ? (
              <img src={avatarPreview} alt="" />
            ) : (
              <UserIcon size={32} className="avatar-upload-placeholder" />
            )}
          </div>
          <div className="avatar-upload-actions">
            <label className="btn btn-outline avatar-upload-btn">
              Cambiar foto
              <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
            </label>
            {avatarPreview && (
              <button type="button" className="avatar-upload-remove" onClick={handleRemoveAvatar}>
                <CloseIcon size={14} /> Quitar foto
              </button>
            )}
          </div>
        </div>

        <div className="form-field">
          <label>Nombre *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="form-field">
          <label>WhatsApp</label>
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="Ej: 3854123456"
          />
          <p className="edit-profile-hint">
            Se usa como contacto por defecto cuando publicás. Podés cambiarlo publicación por publicación.
          </p>
        </div>

        <div className="form-field">
          <label>Ubicación / Zona</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ej: Centro" />
        </div>

        {error && <p className="edit-profile-error">{error}</p>}
        {saved && <p className="edit-profile-success">¡Guardado!</p>}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
