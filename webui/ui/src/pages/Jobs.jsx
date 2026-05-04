import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Layers, RefreshCcw } from 'lucide-react';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3001/api/jobs')
      .then(res => res.json())
      .then(data => {
        setJobs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredJobs = jobs.filter(job => {
    const term = search.toLowerCase();
    const company = (job.empresa || job.company || '').toLowerCase();
    const role = (job.rol || job.role || '').toLowerCase();
    const status = (job.estado || job.status || '').toLowerCase();
    return company.includes(term) || role.includes(term) || status.includes(term);
  });

  const getStatusBadge = (status) => {
    const s = status.toLowerCase();
    if (s.includes('reject') || s.includes('rechazado')) return 'badge-danger';
    if (s.includes('interview') || s.includes('entrevista')) return 'badge-info';
    if (s.includes('offer') || s.includes('oferta')) return 'badge-success';
    if (s.includes('applied') || s.includes('aplicado')) return 'badge-warning';
    return 'badge-neutral';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Jobs Pipeline</h1>
          <p className="subtitle">Manage and track your evaluated applications.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative" style={{ width: '250px' }}>
            <Search className="absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
            <input 
              type="text" 
              className="input" 
              placeholder="Search company, role, status..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/prompt', { state: { autoRunCommand: '/career-ops tracker' } })}
          >
            <RefreshCcw size={18} /> Sync Tracker
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/prompt', { state: { autoRunCommand: '/career-ops batch' } })}
          >
            <Layers size={18} /> Batch Evaluate
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="p-8 text-center text-muted py-12">Loading jobs...</div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Documents</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job, i) => (
                  <tr key={i}>
                    <td className="text-muted">{job['#'] || job.id || i + 1}</td>
                    <td className="text-muted">{job.fecha || job.date || '-'}</td>
                    <td style={{ fontWeight: 500 }}>{job.empresa || job.company}</td>
                    <td>{job.rol || job.role}</td>
                    <td>
                      <span className={`badge ${parseFloat(job.score || '0') >= 4.0 ? 'badge-success' : 'badge-neutral'}`}>
                        {job.score || '-'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(job.estado || job.status || '')}`}>
                        {job.estado || job.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {job.pdf && job.pdf.includes('.pdf') && (
                          <a href="#" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>PDF</a>
                        )}
                        {job.report && (
                          <a href="#" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Report</a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredJobs.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-muted">
                      No jobs found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
