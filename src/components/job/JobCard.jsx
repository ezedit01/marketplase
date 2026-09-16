import { Link } from 'react-router-dom'
import { BriefcaseIcon, MapPinIcon } from '../ui/Icons'
import { employmentTypeLabel } from '../../utils/jobs'
import './JobCard.css'

export default function JobCard({ job, categoryName }) {
  return (
    <Link to={`/empleo/${job.slug}`} className="job-card">
      <div className="job-card-icon">
        <BriefcaseIcon size={20} />
      </div>
      <div className="job-card-body">
        <h3 className="job-card-title">{job.title}</h3>
        <div className="job-card-meta">
          {categoryName && <span>{categoryName}</span>}
          {job.employment_type && <span>{employmentTypeLabel(job.employment_type)}</span>}
        </div>
        {job.location && (
          <p className="job-card-location">
            <MapPinIcon size={12} />
            {job.location}
          </p>
        )}
      </div>
      {job.status === 'closed' && <span className="job-card-closed">Cubierto</span>}
      {job.featured && job.status !== 'closed' && <span className="job-card-featured">Destacado</span>}
    </Link>
  )
}
