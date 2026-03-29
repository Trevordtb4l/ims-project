import { useEffect, useState } from 'react';
import { Briefcase, MapPin, Search, Calendar, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle, X, Eye } from 'lucide-react';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext.jsx';
import { useToast } from '@/components/Toast.jsx';

const C = {
  bg: '#0f0f0f', card: '#1a1a1a', accent: '#CFFF00',
  white: '#ffffff', muted: '#888888', border: '#2a2a2a', olive: '#4a5a00',
};

const STATUS_MAP = {
  pending:     { bg: '#4a5a00', color: '#CFFF00', label: 'Pending', icon: Clock },
  approved:    { bg: '#14532d', color: '#22c55e', label: 'Accepted', icon: CheckCircle },
  rejected:    { bg: '#450a0a', color: '#ef4444', label: 'Rejected', icon: XCircle },
  interview:   { bg: '#1e3a5f', color: '#60a5fa', label: 'Interview', icon: AlertCircle },
  shortlisted: { bg: '#14532d', color: '#22c55e', label: 'Shortlisted', icon: CheckCircle },
  withdrawn:   { bg: '#2a2a2a', color: '#888888', label: 'Withdrawn', icon: XCircle },
};

const MOCK_APPS = [
  { id: 1, company_name: 'Orange Cameroon', internship_title: 'Software Engineering Internship', applied_at: '2026-01-03', status: 'approved' },
  { id: 2, company_name: 'MTN Cameroon', internship_title: 'Network Engineering Internship', applied_at: '2026-01-05', status: 'interview' },
  { id: 3, company_name: 'Digitaria Cameroon', internship_title: 'Backend Development Internship', applied_at: '2026-01-08', status: 'pending' },
  { id: 4, company_name: 'Camtel', internship_title: 'Systems Administration Internship', applied_at: '2025-12-20', status: 'rejected' },
];

const MOCK_INTERNSHIPS = [
  { id: 10, company_name: 'MTN Cameroon', title: 'Frontend Developer Intern', location: 'Douala, Cameroon', work_type: 'On-site', tags: ['React', 'JavaScript', 'CSS'], start_date: '2026-04-01', end_date: '2026-06-30' },
  { id: 11, company_name: 'Orange Cameroon', title: 'Backend Engineer Intern', location: 'Yaoundé, Cameroon', work_type: 'Hybrid', tags: ['Django', 'Python', 'REST API'], start_date: '2026-04-01', end_date: '2026-06-30' },
  { id: 12, company_name: 'Afriland First Bank', title: 'Data Analyst Intern', location: 'Douala, Cameroon', work_type: 'On-site', tags: ['Python', 'SQL', 'Excel'], start_date: '2026-05-01', end_date: '2026-07-31' },
  { id: 13, company_name: 'Express Union', title: 'Mobile Developer Intern', location: 'Bafoussam, Cameroon', work_type: 'On-site', tags: ['Flutter', 'Dart', 'Firebase'], start_date: '2026-04-15', end_date: '2026-07-15' },
  { id: 14, company_name: 'Nexttel Cameroon', title: 'Network Security Intern', location: 'Douala, Cameroon', work_type: 'On-site', tags: ['Linux', 'Cisco', 'Networking'], start_date: '2026-05-01', end_date: '2026-07-31' },
  { id: 15, company_name: 'Campost', title: 'Full Stack Developer Intern', location: 'Yaoundé, Cameroon', work_type: 'Remote', tags: ['Node.js', 'React', 'MongoDB'], start_date: '2026-04-01', end_date: '2026-06-30' },
];

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  const Icon = s.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 12px', borderRadius: 999,
      backgroundColor: s.bg, color: s.color,
      fontSize: '0.75rem', fontWeight: 700,
    }}>
      <Icon size={11} />
      {s.label}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ApplicationsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('my');
  const [myApps, setMyApps] = useState(MOCK_APPS);
  const [internships, setInternships] = useState(MOCK_INTERNSHIPS);
  const [loadingApps, setLoadingApps] = useState(false);
  const [applyingId, setApplyingId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/internship-applications/');
        const real = Array.isArray(data) ? data : data.results ?? [];
        if (real.length > 0) setMyApps(real);
      } catch {}
      try {
        const { data } = await api.get('/internships/?status=open');
        const real = Array.isArray(data) ? data : data.results ?? [];
        const mockWithoutReal = MOCK_INTERNSHIPS.filter(m => !real.find(r => r.id === m.id))
        setInternships([...real, ...mockWithoutReal].slice(0, 6))
      } catch {
        setInternships(MOCK_INTERNSHIPS)
      }
    }
    load();
  }, []);

  const appliedIds = new Set(myApps.map(a => a.internship));

  const handleApply = async (internship) => {
    setApplyingId(internship.id);
    try {
      await api.post('/internship-applications/', { internship: internship.id, company: internship.company });
      toast('Application submitted successfully');
      const { data } = await api.get('/internship-applications/');
      const real = Array.isArray(data) ? data : data.results ?? [];
      if (real.length > 0) setMyApps(real);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to apply';
      toast(msg, 'error');
    } finally {
      setApplyingId(null);
    }
  };

  const filteredInternships = internships.filter(i => {
    const q = search.toLowerCase();
    return !q || (i.title || '').toLowerCase().includes(q) || (i.company_name || '').toLowerCase().includes(q);
  });

  const tabs = [
    { key: 'my', label: 'My Applications', count: myApps.length },
    { key: 'browse', label: 'Browse Internships', count: MOCK_INTERNSHIPS.length },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, padding: '28px 32px' }}>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Applied', value: myApps.length, color: C.white },
          { label: 'Accepted', value: myApps.filter(a => a.status === 'approved').length, color: '#22c55e' },
          { label: 'Pending', value: myApps.filter(a => a.status === 'pending').length, color: C.accent },
          { label: 'Interview', value: myApps.filter(a => a.status === 'interview').length, color: '#60a5fa' },
        ].map(s => (
          <div key={s.label} style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 24px' }}>
            <p style={{ fontSize: '0.75rem', color: C.muted, marginBottom: 8, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</p>
            <p style={{ fontSize: '2rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: `1px solid ${C.border}`, paddingBottom: 0 }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '10px 20px', borderRadius: '10px 10px 0 0',
            fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
            border: 'none', borderBottom: activeTab === tab.key ? `2px solid ${C.accent}` : '2px solid transparent',
            backgroundColor: activeTab === tab.key ? 'rgba(207,255,0,0.08)' : 'transparent',
            color: activeTab === tab.key ? C.accent : C.muted,
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {tab.label}
            <span style={{
              padding: '1px 8px', borderRadius: 999,
              backgroundColor: activeTab === tab.key ? C.accent : C.border,
              color: activeTab === tab.key ? '#000' : C.muted,
              fontSize: '0.7rem', fontWeight: 800,
            }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* My Applications Tab */}
      {activeTab === 'my' && (
        <div style={{
          backgroundColor: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          overflow: 'hidden',
          marginTop: 8,
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f0f0f' }}>
                  {['Company', 'Role', 'Date Applied', 'Status', 'Action'].map(h => (
                    <th key={h} style={{
                      padding: '12px 20px', textAlign: 'left',
                      fontSize: '0.7rem', fontWeight: 700,
                      letterSpacing: '1.5px', textTransform: 'uppercase',
                      color: C.muted, borderBottom: `1px solid ${C.border}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myApps.map((app, i) => (
                  <tr key={app.id} style={{
                    borderBottom: i < myApps.length - 1 ? `1px solid ${C.border}` : 'none',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0f0f0f'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          backgroundColor: C.olive, display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: '0.85rem', color: C.accent, flexShrink: 0,
                        }}>{app.company_name?.[0]}</div>
                        <span style={{ fontWeight: 600, color: C.white, fontSize: '0.875rem' }}>{app.company_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', color: C.muted, fontSize: '0.875rem' }}>{app.internship_title || 'Internship'}</td>
                    <td style={{ padding: '16px 20px', color: C.muted, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{formatDate(app.applied_at)}</td>
                    <td style={{ padding: '16px 20px' }}><StatusBadge status={app.status} /></td>
                    <td style={{ padding: '16px 20px' }}>
                      {app.status === 'pending' && (
                        <button
                          onClick={async () => {
                            try {
                              await api.patch(`/internship-applications/${app.id}/`, { status: 'withdrawn' });
                            } catch {}
                            setMyApps(prev => prev.map(a => a.id === app.id ? { ...a, status: 'withdrawn' } : a));
                            toast('Application withdrawn');
                          }}
                          style={{
                            padding: '6px 16px', backgroundColor: 'transparent',
                            border: '1px solid #ef4444', borderRadius: 8,
                            color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 5,
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#450a0a'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        ><X size={12} /> Withdraw</button>
                      )}
                      {app.status === 'interview' && (
                        <button
                          onClick={() => toast('Interview details will be sent to your email shortly')}
                          style={{
                            padding: '6px 16px', backgroundColor: '#1e3a5f',
                            border: '1px solid #60a5fa', borderRadius: 8,
                            color: '#60a5fa', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a3355'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1e3a5f'}
                        ><Eye size={12} /> View Details</button>
                      )}
                      {app.status === 'approved' && (
                        <span style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 600 }}>✓ Offer Received</span>
                      )}
                      {app.status === 'rejected' && (
                        <span style={{ fontSize: '0.8rem', color: '#888888' }}>—</span>
                      )}
                      {app.status === 'withdrawn' && (
                        <span style={{ fontSize: '0.8rem', color: '#888888' }}>Withdrawn</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Browse Internships Tab */}
      {activeTab === 'browse' && (
        <div>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or company..."
              style={{
                width: '100%', paddingLeft: 40, paddingRight: 16, paddingTop: 11, paddingBottom: 11,
                backgroundColor: C.card, border: `1px solid ${C.border}`,
                borderRadius: 12, color: C.white, fontSize: '0.875rem', outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {filteredInternships.map(internship => {
              const alreadyApplied = appliedIds.has(internship.id);
              return (
                <div key={internship.id} style={{
                  backgroundColor: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 20, padding: 24, transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        backgroundColor: C.olive, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '1rem', color: C.accent, flexShrink: 0,
                      }}>{internship.company_name?.[0]}</div>
                      <div>
                        <p style={{ fontWeight: 800, color: C.white, fontSize: '0.95rem', marginBottom: 2 }}>{internship.company_name}</p>
                        <p style={{ color: C.muted, fontSize: '0.8rem' }}>{internship.title}</p>
                      </div>
                    </div>
                    <span style={{
                      padding: '3px 10px', borderRadius: 999,
                      backgroundColor: internship.work_type === 'Remote' ? '#1e3a5f' : C.olive,
                      color: internship.work_type === 'Remote' ? '#60a5fa' : C.accent,
                      fontSize: '0.72rem', fontWeight: 700,
                      textTransform: 'capitalize',
                    }}>{internship.work_type}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12 }}>
                    <MapPin size={12} color={C.muted} />
                    <span style={{ fontSize: '0.8rem', color: C.muted }}>{internship.location}</span>
                  </div>
                  {internship.tags?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                      {internship.tags.map((tag, i) => (
                        <span key={i} style={{
                          padding: '3px 10px', borderRadius: 999,
                          backgroundColor: '#2a2a2a', color: C.white,
                          fontSize: '0.72rem', fontWeight: 600,
                        }}>{tag}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 16 }}>
                    <Calendar size={12} color={C.muted} />
                    <span style={{ fontSize: '0.8rem', color: C.muted }}>{formatDate(internship.start_date)} — {formatDate(internship.end_date)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {alreadyApplied ? (
                      <span style={{
                        padding: '8px 20px', borderRadius: 10,
                        backgroundColor: C.olive, color: C.accent,
                        fontSize: '0.8rem', fontWeight: 700,
                      }}>✓ Applied</span>
                    ) : (
                      <button
                        disabled={applyingId === internship.id}
                        onClick={() => handleApply(internship)}
                        style={{
                          padding: '9px 24px', borderRadius: 10,
                          backgroundColor: C.accent, border: 'none',
                          color: '#000', fontSize: '0.875rem', fontWeight: 800,
                          cursor: 'pointer', opacity: applyingId === internship.id ? 0.7 : 1,
                        }}
                      >{applyingId === internship.id ? 'Applying...' : 'Apply Now'}</button>
                    )}
                    <button style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      backgroundColor: 'transparent', border: 'none',
                      color: C.muted, fontSize: '0.8rem', cursor: 'pointer',
                    }}>
                      View Details <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
