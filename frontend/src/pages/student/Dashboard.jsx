import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import api from '@/api/axios';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell,
} from 'recharts';
import {
  Briefcase, Clock, Calendar, FileText, Bell,
  ChevronRight, MapPin, BookOpen, Award,
} from 'lucide-react';

const C = {
  bg: '#0f0f0f',
  card: '#1a1a1a',
  accent: '#CFFF00',
  white: '#ffffff',
  muted: '#888888',
  border: '#2a2a2a',
  olive: '#4a5a00',
};

function IconCircle({ icon: Icon, size = 36 }) {
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0"
      style={{ width: size, height: size, backgroundColor: C.olive }}
    >
      <Icon size={size * 0.45} color={C.accent} />
    </div>
  );
}

function ProgressRing({ percent = 33, size = 80, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="block">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={C.border} strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={C.accent} strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
        fill={C.white} fontSize={14} fontWeight="bold"
      >
        {percent}%
      </text>
    </svg>
  );
}

function SkeletonBlock({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-2xl ${className}`}
      style={{ backgroundColor: C.border }}
    />
  );
}

function Skeleton() {
  return (
    <div className="min-h-screen p-6 space-y-4" style={{ backgroundColor: C.bg }}>
      <SkeletonBlock className="h-12 w-72" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonBlock className="h-48" />
        <SkeletonBlock className="h-48" />
      </div>
      <div className="flex gap-3">
        <SkeletonBlock className="h-20 flex-1" />
        <SkeletonBlock className="h-20 flex-1" />
        <SkeletonBlock className="h-20 flex-1" />
      </div>
      <SkeletonBlock className="h-52" />
      <div className="grid grid-cols-3 gap-4">
        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-24" />
        <SkeletonBlock className="h-24" />
      </div>
      <SkeletonBlock className="h-44" />
      <SkeletonBlock className="h-52" />
    </div>
  );
}

const RECOMMENDED = [
  {
    company: 'TechVentures Inc.',
    role: 'Frontend Developer Intern',
    location: 'Lagos, Nigeria',
    skills: ['React', 'TypeScript', 'Tailwind'],
  },
  {
    company: 'DataPulse Analytics',
    role: 'Data Science Intern',
    location: 'Remote',
    skills: ['Python', 'SQL', 'Pandas'],
  },
];

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
      const safeFetch = async (fn) => { try { return await fn(); } catch { return null; } };

      const [intRes, logRes, appRes, notifRes] = await Promise.all([
        safeFetch(() => api.get('/internships/')),
        safeFetch(() => api.get('/logbooks/')),
        safeFetch(() => api.get('/internship-applications/')),
        safeFetch(() => api.get('/notifications/')),
      ]);

      if (intRes?.data) {
        const list = Array.isArray(intRes.data) ? intRes.data : intRes.data.results || [];
        const active = list.find(
          (i) => i.status === 'ongoing' || i.status === 'active',
        );
        setInternship(active || null);
      }
      if (logRes?.data) {
        setLogbooks(Array.isArray(logRes.data) ? logRes.data : logRes.data.results || []);
      }
      if (appRes?.data) {
        setApplications(Array.isArray(appRes.data) ? appRes.data : appRes.data.results || []);
      }
      if (notifRes?.data) {
        const all = Array.isArray(notifRes.data) ? notifRes.data : notifRes.data.results || [];
        setNotifications(all.slice(0, 3));
      }

      setLoading(false);
    }
    fetchAll();
  }, []);

  if (loading) return <Skeleton />;

  const initials =
    (user?.first_name?.[0] || '') + (user?.last_name?.[0] || '') || '?';

  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const interviewCount = applications.filter((a) => a.status === 'interview').length;

  const computeProgress = () => {
    if (!internship?.start_date || !internship?.end_date) return 33;
    const start = new Date(internship.start_date);
    const end = new Date(internship.end_date);
    const now = new Date();
    const total = end - start;
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round(((now - start) / total) * 100)));
  };
  const percent = computeProgress();

  const currentWeek = () => {
    if (!internship?.start_date) return 1;
    const start = new Date(internship.start_date);
    const diff = Date.now() - start.getTime();
    return Math.max(1, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000)));
  };
  const week = currentWeek();

  const daysRemaining = () => {
    if (!internship?.end_date) return '—';
    const end = new Date(internship.end_date);
    const diff = Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const logbookWeeks = new Set(logbooks.map((l) => l.week || l.week_number));
  const chartData = Array.from({ length: 6 }, (_, i) => ({
    week: `Wk ${i + 1}`,
    value: logbookWeeks.has(i + 1) ? 0.6 : 0.2,
    filled: logbookWeeks.has(i + 1),
  }));

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/mark_all_read/');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch { /* silent */ }
  };

  const stats = [
    {
      icon: Briefcase,
      label: 'Pending Applications',
      value: pendingCount,
      to: '/student/applications',
    },
    {
      icon: Award,
      label: 'Interview Scheduled',
      value: interviewCount,
      to: '/student/applications',
    },
    {
      icon: Clock,
      label: 'Days Remaining',
      value: daysRemaining(),
      to: '/student/logbook',
    },
  ];

  return (
    <div className="min-h-screen p-6 space-y-4" style={{ backgroundColor: C.bg }}>
      {/* 1 — Welcome header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-full font-bold text-sm"
            style={{
              width: 40, height: 40,
              backgroundColor: C.accent, color: '#000',
            }}
          >
            {initials}
          </div>
          <h2 className="text-2xl font-bold" style={{ color: C.white }}>
            Welcome, {user?.first_name || 'Student'}
          </h2>
        </div>
        <span
          className="rounded-full text-xs font-semibold px-3 py-1"
          style={{ backgroundColor: C.olive, color: C.accent }}
        >
          Fall Semester 2026
        </span>
      </div>

      {/* 2 — Hero row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Internship card */}
        <div
          className="rounded-2xl p-6 relative"
          style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
        >
          {internship ? (
            <>
              <span
                className="absolute top-4 right-4 text-xs font-bold rounded-full px-2 py-0.5"
                style={{ backgroundColor: '#14532d', color: '#22c55e' }}
              >
                ACTIVE
              </span>
              <div className="flex items-start gap-5">
                <div className="flex-1 space-y-2">
                  <p className="font-bold text-lg" style={{ color: C.white }}>
                    {internship.company_name || internship.company?.name || 'Company'}
                  </p>
                  <p className="text-sm" style={{ color: C.muted }}>
                    Supervisor: {internship.supervisor_name || internship.supervisor?.name || '—'}
                  </p>
                  <p className="text-sm" style={{ color: C.muted }}>
                    Week {week} of 12
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ProgressRing percent={percent} />
                  <span className="text-xs" style={{ color: C.muted }}>
                    {percent}% Complete
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p style={{ color: C.muted }}>No active internship</p>
            </div>
          )}
        </div>

        {/* Logbook prompt card */}
        <div
          className="rounded-2xl p-6 flex flex-col justify-between"
          style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={18} color={C.accent} />
              <p className="font-bold" style={{ color: C.white }}>Logbook Pending</p>
            </div>
            <p className="text-sm" style={{ color: C.muted }}>
              Your week {week} summary is due tomorrow
            </p>
          </div>
          <button
            onClick={() => navigate('/student/logbook')}
            className="mt-4 self-start font-bold rounded-xl py-2.5 px-5 transition-opacity hover:opacity-90"
            style={{ backgroundColor: C.accent, color: '#000' }}
          >
            Submit Logbook →
          </button>
        </div>
      </div>

      {/* 3 — Stat chips */}
      <div className="flex gap-3 flex-wrap">
        {stats.map((s) => (
          <div
            key={s.label}
            onClick={() => navigate(s.to)}
            className="rounded-2xl px-5 py-3 flex items-center gap-3 flex-1 min-w-[160px] cursor-pointer transition-colors"
            style={{
              backgroundColor: C.card,
              border: `1px solid ${C.border}`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.accent; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; }}
          >
            <IconCircle icon={s.icon} />
            <div>
              <p className="text-xs" style={{ color: C.muted }}>{s.label}</p>
              <p className="text-xl font-bold" style={{ color: C.white }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 4 — Logbook Submission History */}
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
      >
        <p className="font-bold mb-4" style={{ color: C.white }}>
          Logbook Submission History
        </p>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="week"
              tick={{ fill: C.muted, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis domain={[0, 1]} hide />
            <Bar dataKey="value" barSize={32} radius={[4, 4, 0, 0]}>
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={entry.filled ? C.accent : C.border} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 5 — Deadlines */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Calendar, label: 'Next Logbook Due', value: 'Mar 15, 2026' },
          { icon: Clock, label: 'Internship Ends', value: formatDate(internship?.end_date) },
          { icon: FileText, label: 'Report Submission', value: 'Apr 30, 2026' },
        ].map((d) => (
          <div
            key={d.label}
            className="rounded-2xl p-6 flex items-center gap-4"
            style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
          >
            <IconCircle icon={d.icon} />
            <div>
              <p className="text-xs" style={{ color: C.muted }}>{d.label}</p>
              <p className="font-bold" style={{ color: C.accent }}>{d.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 6 — Activity Feed */}
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold" style={{ color: C.white }}>Recent Activity</p>
          <button
            onClick={handleMarkAllRead}
            className="text-sm font-medium hover:underline bg-transparent border-none cursor-pointer"
            style={{ color: C.accent }}
          >
            Mark all read
          </button>
        </div>

        {notifications.length === 0 ? (
          <p className="text-center py-6" style={{ color: C.muted }}>
            No recent activity
          </p>
        ) : (
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <div
                key={n.id || i}
                className="flex items-start gap-3 pl-4"
                style={{ borderLeft: `4px solid ${C.accent}` }}
              >
                <Bell size={16} color={C.accent} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm" style={{ color: C.white }}>
                    {n.message || n.description || 'Notification'}
                  </p>
                  <p className="text-xs" style={{ color: C.muted }}>
                    {n.created_at
                      ? new Date(n.created_at).toLocaleString()
                      : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7 — Recommended Internships */}
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold" style={{ color: C.white }}>Recommended for You</p>
          <button
            onClick={() => navigate('/student/applications')}
            className="text-sm font-medium hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1"
            style={{ color: C.accent }}
          >
            View All <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RECOMMENDED.map((r) => (
            <div
              key={r.company}
              className="rounded-xl p-4"
              style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
            >
              <p className="font-bold" style={{ color: C.white }}>{r.company}</p>
              <p className="text-sm mt-1" style={{ color: C.muted }}>{r.role}</p>
              <div className="flex items-center gap-1 mt-2" style={{ color: C.muted }}>
                <MapPin size={12} />
                <span className="text-xs">{r.location}</span>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {r.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full text-xs px-2 py-0.5"
                    style={{ backgroundColor: C.border, color: C.white }}
                  >
                    {s}
                  </span>
                ))}
              </div>
              <button
                onClick={() => navigate('/student/applications')}
                className="mt-3 text-sm font-medium hover:underline bg-transparent border-none cursor-pointer"
                style={{ color: C.accent }}
              >
                Apply Now →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
