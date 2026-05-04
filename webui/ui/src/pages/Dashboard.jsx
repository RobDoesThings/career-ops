import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Clock, CheckCircle, Search, Play, SearchCode } from 'lucide-react';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [pipeline, setPipeline] = useState({ pendientes: [], procesadas: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3001/api/jobs').then(res => res.json()),
      fetch('http://localhost:3001/api/pipeline').then(res => res.json())
    ]).then(([jobsData, pipelineData]) => {
      setJobs(jobsData || []);
      setPipeline(pipelineData || { pendientes: [], procesadas: [] });
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-muted">Loading metrics...</div>;

  const totalProcessed = jobs.length;
  const pendingUrls = pipeline.pendientes.length;
  // Let's assume high score is >= 4.0
  const topMatches = jobs.filter(j => {
    const score = parseFloat(j.score || '0');
    return score >= 4.0;
  }).length;
  const interviewing = jobs.filter(j => 
    (j.estado || j.status || '').toLowerCase().includes('interview') ||
    (j.estado || j.status || '').toLowerCase().includes('entrevista')
  ).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">Overview of your AI-powered job search pipeline.</p>
        </div>
        <div className="flex gap-4">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/prompt', { state: { autoRunCommand: '/career-ops scan' } })}
          >
            <SearchCode size={18} /> Scan Portals
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 mb-8">
        <div className="glass-panel stat-card">
          <div className="flex justify-between items-center text-primary mb-2">
            <Briefcase size={24} />
          </div>
          <div className="stat-value">{totalProcessed}</div>
          <div className="stat-label">Jobs Processed</div>
        </div>
        <div className="glass-panel stat-card">
          <div className="flex justify-between items-center text-warning mb-2">
            <Clock size={24} />
          </div>
          <div className="stat-value">{pendingUrls}</div>
          <div className="stat-label">Pending Links</div>
        </div>
        <div className="glass-panel stat-card">
          <div className="flex justify-between items-center text-success mb-2">
            <CheckCircle size={24} />
          </div>
          <div className="stat-value">{topMatches}</div>
          <div className="stat-label">Top Matches (&gt;=4.0)</div>
        </div>
        <div className="glass-panel stat-card">
          <div className="flex justify-between items-center text-info mb-2">
            <Search size={24} />
          </div>
          <div className="stat-value">{interviewing}</div>
          <div className="stat-label">Interviews</div>
        </div>
      </div>

      <div className="grid grid-cols-2">
        <div className="glass-panel">
          <h2>Recent Applications</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {jobs.slice(-5).reverse().map((job, i) => (
                  <tr key={i}>
                    <td><span className="font-medium">{job.empresa || job.company}</span></td>
                    <td><span className="text-muted">{job.rol || job.role}</span></td>
                    <td>
                      <span className={`badge ${parseFloat(job.score || '0') >= 4.0 ? 'badge-success' : 'badge-neutral'}`}>
                        {job.score || '-'}
                      </span>
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center text-muted py-8">No jobs processed yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel">
          <div className="flex justify-between items-center mb-4">
            <h2 style={{ marginBottom: 0 }}>Pending Links</h2>
            <button 
              className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              onClick={() => navigate('/prompt', { state: { autoRunCommand: '/career-ops pipeline' } })}
            >
              <Play size={16} /> Process Pipeline
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {pipeline.pendientes.slice(0, 5).map((item, i) => (
              <div key={i} className="flex justify-between items-center p-4 border border-white/5 rounded-lg bg-white/5">
                <div>
                  <div style={{ fontWeight: 500 }}>{item.company || 'Unknown Company'}</div>
                  <div className="text-muted" style={{ fontSize: '0.9rem' }}>{item.role || 'Unknown Role'}</div>
                </div>
                <div className="flex gap-2">
                  <a href={item.url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    View
                  </a>
                  <button 
                    className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    onClick={() => navigate('/prompt', { state: { autoRunCommand: `/career-ops "${item.url}"` } })}
                  >
                    Evaluate
                  </button>
                </div>
              </div>
            ))}
            {pipeline.pendientes.length === 0 && (
               <div className="text-center text-muted py-8 border border-white/5 rounded-lg bg-white/5">
                 Inbox is empty. Great job!
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
