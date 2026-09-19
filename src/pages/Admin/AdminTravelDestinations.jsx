import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { slugify } from '../../utils/slug'
import { TrashIcon } from '../../components/ui/Icons'

export default function AdminTravelDestinations() {
  const [destinations, setDestinations] = useState([])
  const [newName, setNewName] = useState('')

  const fetchDestinations = useCallback(async () => {
    const { data } = await supabase.from('travel_destinations').select('*').order('order_index')
    setDestinations(data || [])
  }, [])

  useEffect(() => {
    fetchDestinations()
  }, [fetchDestinations])

  async function addDestination(e) {
    e.preventDefault()
    if (!newName.trim()) return
    await supabase.from('travel_destinations').insert({
      name: newName.trim(),
      slug: slugify(newName),
      order_index: destinations.length + 1,
    })
    setNewName('')
    fetchDestinations()
  }

  async function deleteDestination(id) {
    if (!confirm('¿Eliminar este destino?')) return
    await supabase.from('travel_destinations').delete().eq('id', id)
    fetchDestinations()
  }

  return (
    <div>
      <h1>Destinos de viaje</h1>

      <form className="admin-form-row" onSubmit={addDestination}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nuevo destino"
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
          {destinations.map((d) => (
            <tr key={d.id}>
              <td>{d.name}</td>
              <td>{d.slug}</td>
              <td className="admin-table-actions">
                <button onClick={() => deleteDestination(d.id)}>
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
