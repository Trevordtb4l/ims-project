import { useEffect, useRef, useState } from 'react';
import { FileText, Upload, Clock, CheckCircle, AlertTriangle, BookOpen, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import api from '@/api/axios';
import { useToast } from '@/components/Toast.jsx';

const C = {
  bg: '#0f0f0f', card: '#1a1a1a', accent: '#CFFF00',
  white: '#ffffff', muted: '#888888', border: '#2a2a2a', olive: '#4a5a00',
};

const STATUS_MAP = {
  pending: { bg: '#4a5a00', color: '#CFFF00', label: 'Pending', icon: Clock },
  approved: { bg: '#14532d', color: '#22c55e', label: 'Approved', icon: CheckCircle },
  needs_revision: { bg: '#450a0a', color: '#ef4444', label: 'Needs Revision', icon: AlertTriangle },
};

const MOCK_LOGBOOKS = [
  { id: 4, week_number: 1, activities: 'Completed company onboarding and orientation. Set up development environment including Python, Django, Node.js and PostgreSQL. Reviewed existing codebase and internal documentation.', submitted_at: '2026-01-10T10:00:00Z', review_status: 'approved', supervisor_comment: 'Excellent start. Shows strong initiative and technical readiness.' },
  { id: 5, week_number: 2, activities: 'Attended daily standup meetings. Fixed 3 frontend UI bugs on the customer portal. Studied REST API architecture. Wrote first API endpoint for user profile retrieval.', submitted_at: '2026-01-17T10:00:00Z', review_status: 'approved', supervisor_comment: 'Good progress. Communication in team meetings is improving.' },
  { id: 6, week_number: 3, activities: 'Implemented responsive dashboard UI improvements using React and Tailwind CSS. Wrote unit tests for 4 components. Resolved 2 cross-browser compatibility issues.', submitted_at: '2026-01-24T10:00:00Z', review_status: 'approved', supervisor_comment: 'Strong technical execution. Code quality is notable for an intern.' },
  { id: 7, week_number: 4, activities: 'Debugged and resolved critical REST API integration issues between frontend and backend. Collaborated with senior backend engineer on database query optimization.', submitted_at: '2026-01-31T10:00:00Z', review_status: 'approved', supervisor_comment: 'Problem-solving approach is methodical and effective.' },
  { id: 8, week_number: 5, activities: 'Designed and built a new internal reporting module from scratch. Created PDF export functionality using ReportLab. Presented progress to team lead and incorporated feedback.', submitted_at: '2026-02-07T10:00:00Z', review_status: 'approved', supervisor_comment: 'Impressive initiative. Presentation skills are excellent.' },
  { id: 9, week_number: 6, activities: 'Refactored the JWT authentication flow to improve token refresh handling. Reviewed and approved 3 pull requests from peers. Wrote technical documentation for authentication module.', submitted_at: '2026-02-14T10:00:00Z', review_status: 'approved', supervisor_comment: 'Demonstrates solid understanding of security best practices.' },
  { id: 10, week_number: 7, activities: 'Integrated third-party SMS notification API into the platform. Wrote comprehensive integration tests. Fixed 5 bugs identified during QA testing cycle.', submitted_at: '2026-02-21T10:00:00Z', review_status: 'approved', supervisor_comment: 'Handles complex third-party integrations confidently.' },
  { id: 11, week_number: 8, activities: 'Conducted final user testing sessions with 6 participants. Compiled feedback report. Completed full project documentation and handover notes for the team.', submitted_at: '2026-02-28T10:00:00Z', review_status: 'approved', supervisor_comment: 'Outstanding performance throughout the internship. A highly capable engineer.' },
];

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  const Icon = s.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 12px', borderRadius: 999,
      backgroundColor: s.bg, color: s.color,
      fontSize: '0.72rem', fontWeight: 700,
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

export default function LogbookPage() {
  const { toast } = useToast();
  const fileRef = useRef(null);
  const [logbooks, setLogbooks] = useState(MOCK_LOGBOOKS);
  const [submitting, setSubmitting] = useState(false);
  const [activities, setActivities] = useState('');
  const [file, setFile] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/logbooks/');
        const real = Array.isArray(data) ? data : data.results ?? [];
        if (real.length > 0) setLogbooks(real);
      } catch {}
    }
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activities.trim()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('week_number', logbooks.length + 1);
      formData.append('activities', activities);
      if (file) formData.append('file', file);
      await api.post('/logbooks/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast('Logbook submitted successfully');
      setActivities('');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      const { data } = await api.get('/logbooks/');
      const real = Array.isArray(data) ? data : data.results ?? [];
      if (real.length > 0) setLogbooks(real);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to submit logbook';
      toast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const approved = logbooks.filter(l => l.review_status === 'approved').length;
  const pending = logbooks.filter(l => l.review_status === 'pending').length;
  const needsRevision = logbooks.filter(l => l.review_status === 'needs_revision').length;
  const nextWeek = logbooks.length + 1;

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', padding: '28px 32px' }}>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Submitted', value: logbooks.length, color: C.white },
          { label: 'Approved', value: approved, color: '#22c55e' },
          { label: 'Pending Review', value: pending, color: C.accent },
          { label: 'Needs Revision', value: needsRevision, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 24px' }}>
            <p style={{ fontSize: '0.7rem', color: C.muted, marginBottom: 8, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>{s.label}</p>
            <p style={{ fontSize: '2rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} color={C.accent} />
            <p style={{ fontWeight: 700, color: C.white, fontSize: '0.9rem' }}>Internship Progress</p>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: C.accent }}>{logbooks.length} of 8 weeks completed</span>
        </div>
        <div style={{ height: 8, backgroundColor: C.border, borderRadius: 999 }}>
          <div style={{ height: 8, backgroundColor: C.accent, borderRadius: 999, width: `${(logbooks.length / 8) * 100}%`, transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: '0.75rem', color: C.muted }}>Week 1</span>
          <span style={{ fontSize: '0.75rem', color: C.muted }}>Week 8</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 24 }}>

        {/* Submit Form */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28, height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: 40, height: 40, backgroundColor: C.olive, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} color={C.accent} />
            </div>
            <div>
              <p style={{ fontWeight: 800, color: C.white, fontSize: '1rem' }}>Submit Weekly Logbook</p>
              <p style={{ fontSize: '0.75rem', color: C.muted }}>Week {nextWeek} entry</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Week Number */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>
                Week Number
              </label>
              <div style={{ padding: '11px 16px', backgroundColor: '#0f0f0f', border: `1px solid ${C.border}`, borderRadius: 10, color: C.accent, fontSize: '0.875rem', fontWeight: 800 }}>
                Week {nextWeek}
              </div>
            </div>

            {/* Activities */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>
                Activities This Week
              </label>
              <textarea
                required
                rows={6}
                value={activities}
                onChange={e => setActivities(e.target.value)}
                placeholder="Describe your activities, tasks completed, and skills learned this week..."
                style={{
                  width: '100%', padding: '12px 16px',
                  backgroundColor: '#0f0f0f', border: `1px solid ${C.border}`,
                  borderRadius: 10, color: C.white, fontSize: '0.875rem',
                  outline: 'none', resize: 'vertical', lineHeight: 1.6,
                  boxSizing: 'border-box', fontFamily: 'inherit',
                }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.border}
              />
              <p style={{ fontSize: '0.72rem', color: C.muted, marginTop: 6 }}>
                {activities.length} characters — be detailed and specific
              </p>
            </div>

            {/* File Upload */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>
                Timesheet <span style={{ color: '#555', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <div
                style={{
                  padding: '16px', backgroundColor: '#0f0f0f',
                  border: `1px dashed ${file ? C.accent : C.border}`,
                  borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                  transition: 'border-color 0.2s',
                }}
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={20} color={file ? C.accent : C.muted} style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '0.8rem', color: file ? C.accent : C.muted, fontWeight: 600 }}>
                  {file ? file.name : 'Click to upload timesheet'}
                </p>
                <p style={{ fontSize: '0.72rem', color: '#555', marginTop: 4 }}>PDF, PNG, JPG up to 10MB</p>
                <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0] || null)} />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !activities.trim()}
              style={{
                width: '100%', padding: '13px',
                backgroundColor: submitting || !activities.trim() ? '#4a5a00' : C.accent,
                border: 'none', borderRadius: 12,
                color: '#000', fontSize: '0.875rem', fontWeight: 800,
                cursor: submitting || !activities.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {submitting ? 'Submitting...' : `Submit Week ${nextWeek} Logbook`}
            </button>
          </form>
        </div>

        {/* Submissions Table */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Clock size={18} color={C.accent} />
              <p style={{ fontWeight: 800, color: C.white, fontSize: '1rem' }}>My Submissions</p>
            </div>
            <span style={{ fontSize: '0.75rem', color: C.muted }}>{logbooks.length} entries</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f0f0f' }}>
                  {['Week', 'Activities', 'Submitted', 'Status', 'Comment', ''].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontSize: '0.7rem', fontWeight: 700,
                      letterSpacing: '1.5px', textTransform: 'uppercase',
                      color: C.muted, borderBottom: `1px solid ${C.border}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logbooks.map((lb, i) => (
                  <>
                    <tr key={lb.id} style={{
                      borderBottom: `1px solid ${C.border}`,
                      transition: 'background-color 0.15s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0f0f0f'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: C.olive, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: C.accent, fontSize: '0.85rem' }}>
                          {lb.week_number}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: C.muted, fontSize: '0.82rem', maxWidth: 200 }}>
                        {(lb.activities || '').slice(0, 55)}{lb.activities?.length > 55 ? '...' : ''}
                      </td>
                      <td style={{ padding: '14px 16px', color: C.muted, fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                        {formatDate(lb.submitted_at)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={lb.review_status || lb.status} />
                      </td>
                      <td style={{ padding: '14px 16px', color: C.muted, fontSize: '0.82rem', maxWidth: 160 }}>
                        {(lb.supervisor_comment || '—').slice(0, 40)}{lb.supervisor_comment?.length > 40 ? '...' : ''}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => setExpandedId(expandedId === lb.id ? null : lb.id)}
                          style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: C.muted }}
                        >
                          {expandedId === lb.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </td>
                    </tr>
                    {expandedId === lb.id && (
                      <tr key={`${lb.id}-expanded`} style={{ backgroundColor: '#0f0f0f' }}>
                        <td colSpan={6} style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                              <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>Full Activities</p>
                              <p style={{ fontSize: '0.85rem', color: C.white, lineHeight: 1.7 }}>{lb.activities}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>Supervisor Comment</p>
                              <p style={{ fontSize: '0.85rem', color: C.white, lineHeight: 1.7 }}>{lb.supervisor_comment || '—'}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
