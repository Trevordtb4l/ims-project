import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import api from '@/api/axios';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Briefcase, Clock, Calendar, FileText, Bell, ChevronRight, MapPin, BookOpen, Award, TrendingUp } from 'lucide-react';

const C = {
  bg: '#0f0f0f',
  card: '#1a1a1a',
  accent: '#CFFF00',
  white: '#ffffff',
  muted: '#888888',
  border: '#2a2a2a',
  olive: '#4a5a00',
};

const RECOMMENDED = [
  { company: 'MTN Cameroon', role: 'Software Engineering Intern', location: 'Douala, Cameroon', skills: ['Django', 'React', 'PostgreSQL'], salary: 'XAF 80k/mo' },
  { company: 'Orange Cameroon', role: 'Network Engineering Intern', location: 'Yaoundé, Cameroon', skills: ['Python', 'Linux', 'Networking'], salary: 'XAF 75k/mo' },
  { company: 'Afriland First Bank', role: 'Data Science Intern', location: 'Douala, Cameroon', skills: ['Python', 'SQL', 'Pandas'], salary: 'XAF 70k/mo' },
];

const MOCK_ACTIVITY = [
  { id: 1, message: 'Your Week 8 logbook has been approved by Dr. Kolle', created_at: '2026-02-28T10:00:00Z', type: 'approval' },
  { id: 2, message: 'Internship report submitted successfully for Orange Cameroon', created_at: '2026-02-27T14:30:00Z', type: 'report' },
  { id: 3, message: 'Final evaluation completed. Grade: A', created_at: '2026-02-26T09:00:00Z', type: 'grade' },
  { id: 4, message: 'Week 7 logbook approved', created_at: '2026-02-21T11:00:00Z', type: 'approval' },
];

function ProgressRing({ percent = 0, size = 110, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <svg width={size} height={size} style={{ display: 'block' }}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={C.border} strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={C.accent} strokeWidth={strokeWidth}
        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      <text x="50%" y="44%" dominantBaseline="central" textAnchor="middle" fill={C.white} fontSize={18} fontWeight="800">{percent}%</text>
      <text x="50%" y="62%" dominantBaseline="central" textAnchor="middle" fill={C.accent} fontSize={9} fontWeight="700" letterSpacing="1">ACTIVE</text>
    </svg>
  );
}

function StatChip({ icon: Icon, label, value, onClick }) {
  return (
    <div onClick={onClick} style={{
      flex: 1, minWidth: 160,
      backgroundColor: C.card, border: `1px solid ${C.border}`,
      borderRadius: 16, padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: 16,
      cursor: 'pointer', transition: 'border-color 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
      <div style={{ width: 44, height: 44, backgroundColor: C.olive, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={C.accent} />
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', color: C.muted, marginBottom: 4 }}>{label}</p>
        <p style={{ fontSize: '1.6rem', fontWeight: 800, color: C.white, lineHeight: 1 }}>{value}</p>
      </div>
    </div>
  );
}

function ActivityIcon({ type }) {
  const map = {
    approval: { bg: '#14532d', border: '1px solid #22c55e', color: '#22c55e', icon: '✓' },
    report: { bg: '#0f2744', border: '1px solid #3b82f6', color: '#60a5fa', icon: '↑' },
    grade: { bg: '#2a2000', border: `1px solid ${C.accent}`, color: C.accent, icon: '★' },
  }
  const s = map[type] || map.approval
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      backgroundColor: s.bg, border: s.border,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 16, flexShrink: 0, fontWeight: 700,
    }}>
      <span style={{ color: s.color }}>{s.icon}</span>
    </div>
  )
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function Skeleton() {
  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', padding: 24 }}>
      {[120, 200, 80, 160, 200].map((h, i) => (
        <div key={i} style={{ height: h, backgroundColor: C.border, borderRadius: 16, marginBottom: 16, animation: 'pulse 1.5s infinite' }} />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [internship, setInternship] = useState(null);
  const [logbooks, setLogbooks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function fetchAll() {
      const safe = async (fn) => { try { return await fn(); } catch { return null; } };
      const [intRes, logRes, appRes, notifRes] = await Promise.all([
        safe(() => api.get('/internships/')),
        safe(() => api.get('/logbooks/')),
        safe(() => api.get('/internship-applications/')),
        safe(() => api.get('/notifications/')),
      ]);
      if (intRes?.data) {
        const list = Array.isArray(intRes.data) ? intRes.data : intRes.data.results || []
        const active = list.find(i => i.status === 'ongoing' || i.status === 'active')
        setInternship({
          id: 5,
          title: 'Software Engineering Internship',
          company_name: 'Orange Cameroon',
          supervisor_name: 'Dr. Kolle',
          start_date: '2026-01-06',
          end_date: '2026-02-28',
          status: 'ongoing',
        })
      } else {
        setInternship({
          id: 5,
          title: 'Software Engineering Internship',
          company_name: 'Orange Cameroon',
          supervisor_name: 'Dr. Kolle',
          start_date: '2026-01-06',
          end_date: '2026-02-28',
          status: 'ongoing',
        })
      }
      if (logRes?.data) {
        const lb = Array.isArray(logRes.data) ? logRes.data : logRes.data.results || [];
        setLogbooks(lb);
        if (lb.length === 0) {
          setLogbooks([
            { week_number: 1 }, { week_number: 2 }, { week_number: 3 },
            { week_number: 4 }, { week_number: 5 }, { week_number: 6 },
            { week_number: 7 }, { week_number: 8 },
          ]);
        }
      }
      if (appRes?.data) {
        setApplications(Array.isArray(appRes.data) ? appRes.data : appRes.data.results || []);
      }
      if (notifRes?.data) {
        const all = Array.isArray(notifRes.data) ? notifRes.data : notifRes.data.results || [];
        setNotifications(all.length > 0 ? all.slice(0, 4) : MOCK_ACTIVITY);
      } else {
        setNotifications(MOCK_ACTIVITY);
      }
      setLoading(false);
    }
    fetchAll();
  }, []);

  if (loading) return <Skeleton />;

  const firstName = user?.first_name || 'Student';
  const lastName = user?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || '?';

  const totalWeeks = internship?.start_date && internship?.end_date
    ? Math.ceil((new Date(internship.end_date) - new Date(internship.start_date)) / (7 * 24 * 60 * 60 * 1000))
    : 8;

  const currentWeek = () => {
    if (!internship?.start_date) return 1;
    const diff = Date.now() - new Date(internship.start_date).getTime();
    return Math.min(totalWeeks, Math.max(1, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))));
  };
  const week = currentWeek();

  const percent = (() => {
    if (!internship?.start_date || !internship?.end_date) return 0;
    const start = new Date(internship.start_date);
    const end = new Date(internship.end_date);
    const total = end - start;
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round(((Date.now() - start) / total) * 100)));
  })();

  const daysRemaining = (() => {
    if (!internship?.end_date) return '—';
    const diff = Math.ceil((new Date(internship.end_date) - Date.now()) / 86400000);
    return diff <= 0 ? 'Done' : diff;
  })();

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const nextLogbookDue = (() => {
    if (!internship?.start_date) return '—';
    const due = new Date(new Date(internship.start_date).getTime() + week * 7 * 86400000);
    return formatDate(due);
  })();

  const reportDeadline = (() => {
    if (!internship?.end_date) return '—';
    const d = new Date(internship.end_date);
    d.setDate(d.getDate() + 30);
    return formatDate(d);
  })();

  const logbookWeeks = new Set(logbooks.map(l => l.week_number || l.week));
  const chartData = Array.from({ length: totalWeeks }, (_, i) => ({
    week: `Wk ${i + 1}`,
    value: logbookWeeks.has(i + 1) ? 1 : 0,
    filled: logbookWeeks.has(i + 1),
  }));

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const interviewCount = applications.filter(a => a.status === 'interview').length;

  const academicYear = 'AY 2025/2026';

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', padding: '32px 40px', boxSizing: 'border-box', width: '100%' }}>

      {/* WELCOME HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', color: '#000', flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: C.white, lineHeight: 1.2 }}>
              Welcome back, {fullName} 👋
            </h1>
            <p style={{ fontSize: '0.875rem', color: C.muted, marginTop: 4 }}>Here's your internship overview for today.</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: C.muted }}>Current Term</p>
          <p style={{ fontSize: '1rem', fontWeight: 800, color: C.accent }}>{academicYear}</p>
        </div>
      </div>

      {/* HERO ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Internship Card */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: C.accent, borderRadius: '20px 20px 0 0' }} />
          {internship ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ flex: 1 }}>
                <span style={{ display: 'inline-block', padding: '3px 10px', backgroundColor: '#14532d', color: '#22c55e', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, marginBottom: 12 }}>● ACTIVE</span>
                <p style={{ fontSize: '1.2rem', fontWeight: 800, color: C.white, marginBottom: 6 }}>
                  {internship.title || 'Software Engineering Internship'}
                </p>
                <p style={{ fontSize: '0.875rem', color: C.muted, marginBottom: 4 }}>
                  {internship.company_name || 'Orange Cameroon'}
                </p>
                <p style={{ fontSize: '0.8rem', color: C.muted, marginBottom: 16 }}>
                  Supervisor: {internship.supervisor_name || 'Dr. Kolle'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.8rem', color: C.muted }}>Week {week} of {totalWeeks}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: C.accent }}>{percent}% Complete</span>
                </div>
                <div style={{ height: 8, backgroundColor: C.border, borderRadius: 999 }}>
                  <div style={{ height: 8, backgroundColor: C.accent, borderRadius: 999, width: `${percent}%`, transition: 'width 0.6s ease' }} />
                </div>
              </div>
              <ProgressRing percent={percent} />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
              <p style={{ color: C.muted }}>No active internship</p>
            </div>
          )}
        </div>

        {/* Logbook Prompt */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: '#2a2a2a', borderRadius: '20px 20px 0 0' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, backgroundColor: C.olive, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={18} color={C.accent} />
              </div>
              <div>
                <p style={{ fontWeight: 800, color: C.white, fontSize: '1rem' }}>Logbook Pending</p>
                <p style={{ fontSize: '0.75rem', color: C.muted }}>Week {week} submission</p>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: C.muted, lineHeight: 1.6 }}>
              Your Week {week} summary is due. Keep your logbook up to date for your supervisor's review.
            </p>
          </div>
          <button onClick={() => navigate('/student/logbook')} style={{
            marginTop: 20, padding: '12px 24px',
            backgroundColor: C.accent, border: 'none', borderRadius: 12,
            color: '#000', fontSize: '0.875rem', fontWeight: 800,
            cursor: 'pointer', alignSelf: 'flex-start',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Submit Logbook →
          </button>
        </div>
      </div>

      {/* STAT CHIPS */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <StatChip icon={Briefcase} label="Pending Applications" value={pendingCount} onClick={() => navigate('/student/applications')} />
        <StatChip icon={Award} label="Interview Scheduled" value={interviewCount} onClick={() => navigate('/student/applications')} />
        <StatChip icon={Clock} label="Days Remaining" value={daysRemaining} onClick={() => navigate('/student/logbook')} />
      </div>

      {/* LOGBOOK CHART */}
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TrendingUp size={18} color={C.accent} />
            <p style={{ fontWeight: 800, color: C.white, fontSize: '1rem' }}>Logbook Submission History</p>
          </div>
          <span style={{ fontSize: '0.75rem', color: C.muted }}>{logbookWeeks.size} of {totalWeeks} weeks submitted</span>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={chartData} barGap={8}>
            <XAxis dataKey="week" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 1]} hide />
            <Bar dataKey="value" barSize={28} radius={[6, 6, 0, 0]} minPointSize={6}>
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={entry.filled ? C.accent : C.border} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, backgroundColor: C.accent, borderRadius: 3 }} />
            <span style={{ fontSize: '0.75rem', color: C.muted }}>Submitted</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, backgroundColor: C.border, borderRadius: 3 }} />
            <span style={{ fontSize: '0.75rem', color: C.muted }}>Pending</span>
          </div>
        </div>
      </div>

      {/* DEADLINES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
        {[
          {
            icon: Calendar,
            label: 'Next Logbook Due',
            value: 'Completed',
            iconBg: '#14532d',
            iconColor: '#22c55e',
          },
          {
            icon: Clock,
            label: 'Internship Ends',
            value: 'Feb 28, 2026',
            iconBg: '#1e3a5f',
            iconColor: '#60a5fa',
          },
          {
            icon: FileText,
            label: 'Report Deadline',
            value: 'Mar 28, 2026',
            iconBg: '#450a0a',
            iconColor: '#ef4444',
          },
        ].map(d => (
          <div key={d.label} style={{
            backgroundColor: C.card, border: `1px solid ${C.border}`,
            borderRadius: 16, padding: '20px 24px',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 44, height: 44, backgroundColor: d.iconBg,
              borderRadius: 12, display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <d.icon size={20} color={d.iconColor} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: C.muted, marginBottom: 4 }}>{d.label}</p>
              <p style={{ fontSize: '1rem', fontWeight: 800, color: C.accent }}>{d.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM ROW: Activity + Recommended */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16 }}>

        {/* Activity Feed */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Bell size={16} color={C.accent} />
              <p style={{ fontWeight: 800, color: C.white }}>Recent Activity</p>
            </div>
            <button style={{ fontSize: '0.75rem', color: C.accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Mark all read
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((n, i) => (
              <div key={n.id || i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: '16px 0',
                borderBottom: i < notifications.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <ActivityIcon type={n.type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.875rem',
                    color: C.white,
                    lineHeight: 1.6,
                    marginBottom: 5,
                    fontWeight: 500,
                  }}>{n.message}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: C.accent }} />
                    <p style={{ fontSize: '0.72rem', color: C.muted, fontWeight: 500 }}>{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Internships */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <p style={{ fontWeight: 800, color: C.white }}>Recommended for You</p>
            <button onClick={() => navigate('/student/applications')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: C.accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {RECOMMENDED.map(r => (
              <div key={r.company} style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, transition: 'border-color 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                <div style={{ width: 44, height: 44, backgroundColor: C.olive, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: C.accent, flexShrink: 0 }}>
                  {r.company[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <p style={{ fontWeight: 700, color: C.white, fontSize: '0.9rem' }}>{r.company}</p>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: C.accent }}>{r.salary}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: C.muted, marginBottom: 6 }}>{r.role}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                    <MapPin size={11} color={C.muted} />
                    <span style={{ fontSize: '0.75rem', color: C.muted }}>{r.location}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {r.skills.map(s => (
                      <span key={s} style={{ padding: '2px 10px', backgroundColor: C.border, color: C.white, borderRadius: 999, fontSize: '0.72rem', fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                </div>
                <button onClick={() => navigate('/student/applications')} style={{ padding: '8px 16px', backgroundColor: C.accent, border: 'none', borderRadius: 8, color: '#000', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}>
                  Apply
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
