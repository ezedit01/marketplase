import { Link } from 'react-router-dom'
import { useCategories } from '../../hooks/useCategories'
import './CategoryPills.css'

export default function CategoryPills() {
  const { categories, loading } = useCategories()

  if (loading) return null

  return (
    <div className="category-pills">
      {categories.map((cat) => (
        <Link key={cat.id} to={`/buscar?categoria=${cat.slug}`} className="category-pill">
          {cat.name}
        </Link>
      ))}
    </div>
  )
}
