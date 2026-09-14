import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { slugify } from '../../utils/slug'
import { TrashIcon } from '../../components/ui/Icons'

export default function AdminBusinessCategories() {
  const [categories, setCategories] = useState([])
  const [newName, setNewName] = useState('')

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from('business_categories').select('*').order('order_index')
    setCategories(data || [])
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  async function addCategory(e) {
    e.preventDefault()
    if (!newName.trim()) return
    await supabase.from('business_categories').insert({
      name: newName.trim(),
      slug: slugify(newName),
      order_index: categories.length + 1,
    })
    setNewName('')
    fetchCategories()
  }

  async function deleteCategory(id) {
    if (!confirm('¿Eliminar esta categoría?')) return
    await supabase.from('business_categories').delete().eq('id', id)
    fetchCategories()
  }

  return (
    <div>
      <h1>Categorías de negocio</h1>

      <form className="admin-form-row" onSubmit={addCategory}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nueva categoría"
        />
        <button type="submit" className="btn btn-primary">
          Agregar
        </button>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Slug</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.slug}</td>
              <td className="admin-table-actions">
                <button onClick={() => deleteCategory(c.id)}>
                  <TrashIcon size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
