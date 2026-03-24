import { useEffect, useState } from 'react';
import { Briefcase, MapPin, Search, Calendar, Tag } from 'lucide-react';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext.jsx';
import { useToast } from '@/components/Toast.jsx';

const APP_STATUS_STYLES = {
  pending:     { background: '#4a5a00', color: '#CFFF00', label: 'Pending' },
  approved:    { background: '#14532d', color: '#22c55e', label: 'Accepted' },
  rejected:    { background: '#450a0a', color: '#ef4444', label: 'Rejected' },
  interview:   { background: '#1e3a5f', color: '#60a5fa', label: 'Interview' },
  shortlisted: { background: '#14532d', color: '#22c55e', label: 'Shortlisted' },
  withdrawn:   { background: '#2a2a2a', color: '#888888', label: 'Withdrawn' },
};

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 animate-pulse rounded" style={{ background: '#2a2a2a' }} />
        </td>
      ))}
    </tr>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl p-5" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
      <div className="mb-3 h-5 w-2/3 rounded" style={{ background: '#2a2a2a' }} />
      <div className="mb-2 h-4 w-1/2 rounded" style={{ background: '#2a2a2a' }} />
      <div className="mb-4 h-4 w-1/3 rounded" style={{ background: '#2a2a2a' }} />
      <div className="h-9 w-28 rounded-xl" style={{ background: '#2a2a2a' }} />
    </div>
  );
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('my');
  const [myApps, setMyApps] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingInternships, setLoadingInternships] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [search, setSearch] = useState('');

  const fetchMyApps = async () => {
    try {
      const { data } = await api.get('/internship-applications/');
      setMyApps(Array.isArray(data) ? data : data.results ?? []);
    } catch {
      toast('Failed to load applications', 'error');
    } finally {
      setLoadingApps(false);
    }
  };

  const fetchInternships = async () => {
    try {
      const { data } = await api.get('/internships/?status=open');
      setInternships(Array.isArray(data) ? data : data.results ?? []);
    } catch {
      toast('Failed to load internships', 'error');
    } finally {
      setLoadingInternships(false);
    }
  };

  useEffect(() => {
    fetchMyApps();
    fetchInternships();
  }, []);

  const appliedIds = new Set(myApps.map((a) => a.internship));

  const handleApply = async (internship) => {
    setApplyingId(internship.id);
    try {
      await api.post('/internship-applications/', {
        internship: internship.id,
        company: internship.company,
      });
      toast('Application submitted successfully');
      await fetchMyApps();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        Object.values(err.response?.data ?? {})?.[0]?.[0] ||
        'Failed to apply';
      toast(msg, 'error');
    } finally {
      setApplyingId(null);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredInternships = internships.filter((i) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (i.title || '').toLowerCase().includes(q) ||
      (i.company_name || '').toLowerCase().includes(q)
    );
  });

  const tabs = [
    { key: 'my', label: 'My Applications' },
    { key: 'browse', label: 'Browse Internships' },
  ];

  return (
    <div className="space-y-6 p-6" style={{ minHeight: '100vh', background: '#0f0f0f' }}>
      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold transition"
            style={
              activeTab === tab.key
                ? { background: '#CFFF00', color: '#000' }
                : { background: '#1a1a1a', color: '#888888', border: '1px solid #2a2a2a' }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* My Applications Tab */}
      {activeTab === 'my' && (
        <div
          className="rounded-2xl border p-6"
          style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <div className="mb-5 flex items-center gap-3">
            <Briefcase className="h-5 w-5" style={{ color: '#CFFF00' }} />
            <h2 className="text-lg font-bold text-white">My Applications</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                  {['Company', 'Role', 'Date Applied', 'Status', 'Action'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: '#888888' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingApps ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                ) : myApps.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm" style={{ color: '#888888' }}>
                      No applications yet
                    </td>
                  </tr>
                ) : (
                  myApps.map((app) => {
                    const st = APP_STATUS_STYLES[app.status] || APP_STATUS_STYLES.pending;
                    return (
                      <tr key={app.id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                        <td className="px-4 py-3 font-medium text-white">
                          {app.company_name || '—'}
                        </td>
                        <td className="px-4 py-3 text-white">
                          {app.internship_title || 'Internship'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: '#888888' }}>
                          {formatDate(app.applied_at || app.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                            style={{ background: st.background, color: st.color }}
                          >
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {app.status === 'pending' && (
                            <button
                              className="rounded-lg px-3 py-1 text-xs font-semibold transition hover:opacity-80"
                              style={{ background: '#450a0a', color: '#ef4444' }}
                              onClick={async () => {
                                try {
                                  await api.patch(`/internship-applications/${app.id}/`, {
                                    status: 'withdrawn',
                                  });
                                  toast('Application withdrawn');
                                  fetchMyApps();
                                } catch {
                                  toast('Failed to withdraw', 'error');
                                }
                              }}
                            >
                              Withdraw
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Browse Internships Tab */}
      {activeTab === 'browse' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: '#888888' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or company..."
              className="w-full rounded-xl border py-2.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-500"
              style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}
            />
          </div>

          {loadingInternships ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredInternships.length === 0 ? (
            <div
              className="rounded-2xl border p-12 text-center text-sm"
              style={{ background: '#1a1a1a', borderColor: '#2a2a2a', color: '#888888' }}
            >
              No internships found
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredInternships.map((internship) => {
                const alreadyApplied = appliedIds.has(internship.id);
                return (
                  <div
                    key={internship.id}
                    className="rounded-2xl border p-5"
                    style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}
                  >
                    <h3 className="text-base font-bold text-white">
                      {internship.company_name}
                    </h3>
                    <p className="mt-1 text-sm" style={{ color: '#888888' }}>
                      {internship.title}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs" style={{ color: '#888888' }}>
                      {internship.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {internship.location}
                        </span>
                      )}
                      {internship.work_type && (
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ background: '#2a2a2a', color: '#ffffff' }}
                        >
                          {internship.work_type}
                        </span>
                      )}
                    </div>

                    {internship.tags?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {internship.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="rounded-full px-2 py-0.5 text-xs"
                            style={{ background: '#2a2a2a', color: '#ffffff' }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {(internship.start_date || internship.end_date) && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs" style={{ color: '#888888' }}>
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(internship.start_date)} — {formatDate(internship.end_date)}
                      </div>
                    )}

                    <div className="mt-4">
                      {alreadyApplied ? (
                        <button
                          disabled
                          className="rounded-xl px-5 py-2 text-sm font-bold"
                          style={{ background: '#4a5a00', color: '#CFFF00', opacity: 0.7 }}
                        >
                          Applied
                        </button>
                      ) : (
                        <button
                          disabled={applyingId === internship.id}
                          onClick={() => handleApply(internship)}
                          className="rounded-xl px-5 py-2 text-sm font-bold text-black transition hover:opacity-90 disabled:opacity-50"
                          style={{ background: '#CFFF00' }}
                        >
                          {applyingId === internship.id ? 'Applying...' : 'Apply Now'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
