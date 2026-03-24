import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { useToast } from '@/components/Toast.jsx';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  BookOpen,
  Award,
  Clock,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';

const LOGBOOK_STATUS = {
  pending: { bg: '#4a5a00', text: '#CFFF00', label: 'Pending' },
  approved: { bg: '#14532d', text: '#22c55e', label: 'Approved' },
  needs_revision: { bg: '#450a0a', text: '#ef4444', label: 'Needs Revision' },
};

const INTERNSHIP_STATUS = {
  active: { bg: '#14532d', text: '#22c55e', label: 'Active' },
  completed: { bg: '#4a5a00', text: '#CFFF00', label: 'Completed' },
  pending: { bg: '#4a5a00', text: '#CFFF00', label: 'Pending' },
};

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

function computeProgress(start, end) {
  if (!start || !end) return 45;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const now = Date.now();
  if (now >= e) return 100;
  if (now <= s) return 0;
  return Math.round(((now - s) / (e - s)) * 100);
}

export default function StudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [internship, setInternship] = useState(null);
  const [logbooks, setLogbooks] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [evalForm, setEvalForm] = useState({ score: '', performance: 'Good', comments: '' });
  const [commentModal, setCommentModal] = useState({ open: false, logbookId: null, action: null });
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchLogbooks = async () => {
    try {
      const { data } = await api.get(`/logbooks/?student=${studentId}`);
      setLogbooks(Array.isArray(data) ? data : data.results ?? []);
    } catch {
      /* silent */
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [stuRes, intRes, lbRes, evalRes] = await Promise.allSettled([
          api.get(`/students/${studentId}/`),
          api.get(`/internships/?student=${studentId}`),
          api.get(`/logbooks/?student=${studentId}`),
          api.get(`/evaluations/?student=${studentId}`),
        ]);

        if (stuRes.status === 'fulfilled') setStudent(stuRes.value.data);
        if (intRes.status === 'fulfilled') {
          const arr = Array.isArray(intRes.value.data)
            ? intRes.value.data
            : intRes.value.data.results ?? [];
          if (arr.length > 0) setInternship(arr[0]);
        }
        if (lbRes.status === 'fulfilled') {
          const arr = Array.isArray(lbRes.value.data)
            ? lbRes.value.data
            : lbRes.value.data.results ?? [];
          setLogbooks(arr);
        }
        if (evalRes.status === 'fulfilled') {
          const arr = Array.isArray(evalRes.value.data)
            ? evalRes.value.data
            : evalRes.value.data.results ?? [];
          if (arr.length > 0) {
            const ev = arr[0];
            setEvaluation(ev);
            setEvalForm({
              score: ev.score?.toString() ?? '',
              performance: ev.performance ?? 'Good',
              comments: ev.comments ?? '',
            });
          }
        }
      } catch {
        toast('Failed to load student data', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [studentId, toast]);

  const handleApprove = async (logbookId) => {
    setActionLoading(true);
    try {
      await api.patch(`/logbooks/${logbookId}/`, {
        review_status: 'approved',
        supervisor_comment: '',
      });
      toast('Logbook approved');
      await fetchLogbooks();
    } catch {
      toast('Failed to approve logbook', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (logbookId) => {
    setCommentModal({ open: true, logbookId, action: 'needs_revision' });
    setComment('');
  };

  const confirmReject = async () => {
    if (!commentModal.logbookId) return;
    setActionLoading(true);
    try {
      await api.patch(`/logbooks/${commentModal.logbookId}/`, {
        review_status: 'needs_revision',
        supervisor_comment: comment,
      });
      toast('Logbook rejected');
      setCommentModal({ open: false, logbookId: null, action: null });
      setComment('');
      await fetchLogbooks();
    } catch {
      toast('Failed to reject logbook', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEvalSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      student: studentId,
      internship: internship?.id,
      score: Number(evalForm.score),
      performance: evalForm.performance,
      comments: evalForm.comments,
    };
    try {
      if (evaluation) {
        await api.patch(`/evaluations/${evaluation.id}/`, payload);
        toast('Evaluation updated');
      } else {
        const { data } = await api.post('/evaluations/', payload);
        setEvaluation(data);
        toast('Evaluation submitted');
      }
    } catch {
      toast('Failed to save evaluation', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen px-6 pb-6 md:px-10 md:pb-10" style={{ backgroundColor: '#0f0f0f' }}>
        <div className="space-y-6 max-w-5xl mx-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl h-40"
              style={{ backgroundColor: '#2a2a2a' }}
            />
          ))}
        </div>
      </div>
    );
  }

  const fullName = student
    ? `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim() || 'Unknown'
    : 'Unknown';

  const progress = internship ? computeProgress(internship.start_date, internship.end_date) : 45;

  return (
    <div className="min-h-screen px-6 pb-6 md:px-10 md:pb-10" style={{ backgroundColor: '#0f0f0f' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate('/supervisor/students')}
          className="flex items-center gap-2 text-sm transition-colors hover:text-white"
          style={{ color: '#888888' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </button>

        {/* ── 1. Student Profile ── */}
        {student && (
          <div className="rounded-2xl p-6 border" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <div className="flex items-center gap-5 mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shrink-0"
                style={{ backgroundColor: '#CFFF00', color: '#000' }}
              >
                {getInitials(fullName)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{fullName}</h1>
                <span
                  className="inline-block mt-1 text-sm rounded-full px-3 py-0.5"
                  style={{ backgroundColor: '#2a2a2a', color: '#ffffff' }}
                >
                  {student.matricule ?? student.registration_number ?? ''}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem icon={<User className="h-4 w-4" />} label="Program" value={student.program ?? '—'} />
              <InfoItem icon={<Briefcase className="h-4 w-4" />} label="Department" value={student.department ?? '—'} />
              <InfoItem icon={<Mail className="h-4 w-4" />} label="Email" value={student.email ?? '—'} />
              <InfoItem icon={<Phone className="h-4 w-4" />} label="Phone" value={student.phone ?? student.phone_number ?? '—'} />
              <InfoItem
                icon={<Calendar className="h-4 w-4" />}
                label="Registration Date"
                value={formatDate(student.created_at ?? student.date_joined)}
              />
            </div>
          </div>
        )}

        {/* ── 2. Active Internship ── */}
        {internship && (
          <div className="rounded-2xl p-6 border" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5" style={{ color: '#CFFF00' }} />
              <h2 className="text-lg font-bold text-white">Active Internship</h2>
            </div>

            <div className="space-y-3 mb-5">
              <p className="text-white font-bold">{internship.company_name ?? internship.company ?? '—'}</p>
              {(internship.role ?? internship.title) && (
                <p className="text-sm" style={{ color: '#888888' }}>
                  {internship.role ?? internship.title}
                </p>
              )}
              <div className="flex gap-6 text-sm" style={{ color: '#888888' }}>
                <span>Start: {formatDate(internship.start_date)}</span>
                <span>End: {formatDate(internship.end_date)}</span>
              </div>
              <span
                className="inline-block text-xs font-medium px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: (INTERNSHIP_STATUS[internship.status] ?? INTERNSHIP_STATUS.active).bg,
                  color: (INTERNSHIP_STATUS[internship.status] ?? INTERNSHIP_STATUS.active).text,
                }}
              >
                {(INTERNSHIP_STATUS[internship.status] ?? INTERNSHIP_STATUS.active).label}
              </span>
            </div>

            <div className="h-3 rounded-full" style={{ backgroundColor: '#2a2a2a' }}>
              <div
                className="h-3 rounded-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: '#CFFF00' }}
              />
            </div>
            <p className="text-sm mt-2" style={{ color: '#888888' }}>
              {progress}% Complete
            </p>
          </div>
        )}

        {/* ── 3. Logbook Submissions ── */}
        <div className="rounded-2xl p-6 border" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5" style={{ color: '#CFFF00' }} />
            <h2 className="text-lg font-bold text-white">Logbook Submissions</h2>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full ml-2"
              style={{ backgroundColor: '#2a2a2a', color: '#ffffff' }}
            >
              {logbooks.length}
            </span>
          </div>

          {logbooks.length === 0 ? (
            <p className="text-sm py-10 text-center" style={{ color: '#888888' }}>
              No logbook submissions yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    {['Week', 'Activities', 'Submitted', 'Status', 'Comment', 'Actions'].map((c) => (
                      <th key={c} className="pb-3 text-xs uppercase font-medium" style={{ color: '#888888' }}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logbooks.map((lb) => {
                    const st = LOGBOOK_STATUS[lb.review_status] ?? LOGBOOK_STATUS.pending;
                    return (
                      <tr key={lb.id} className="border-t" style={{ borderColor: '#2a2a2a' }}>
                        <td className="py-3 pr-4 text-sm text-white">
                          {lb.week ?? lb.week_number ?? '—'}
                        </td>
                        <td className="py-3 pr-4 text-sm" style={{ color: '#888888' }}>
                          {(lb.activities ?? lb.description ?? '').slice(0, 60)}
                          {(lb.activities ?? lb.description ?? '').length > 60 ? '…' : ''}
                        </td>
                        <td className="py-3 pr-4 text-sm" style={{ color: '#888888' }}>
                          {formatDate(lb.submitted_at ?? lb.created_at)}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: st.bg, color: st.text }}
                          >
                            {st.label}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs max-w-[120px] truncate" style={{ color: '#888888' }}>
                          {lb.supervisor_comment || '—'}
                        </td>
                        <td className="py-3">
                          {(lb.review_status === 'pending' || !lb.review_status) && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleApprove(lb.id)}
                                className="rounded-xl px-3 py-1.5 text-sm font-medium border transition-colors disabled:opacity-50"
                                style={{
                                  backgroundColor: 'rgba(20,83,45,0.2)',
                                  color: '#22c55e',
                                  borderColor: 'rgba(34,197,94,0.3)',
                                }}
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => openRejectModal(lb.id)}
                                className="rounded-xl px-3 py-1.5 text-sm font-medium border transition-colors disabled:opacity-50"
                                style={{
                                  backgroundColor: 'rgba(69,10,10,0.2)',
                                  color: '#ef4444',
                                  borderColor: 'rgba(239,68,68,0.3)',
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── 4. Evaluation Form ── */}
        <div className="rounded-2xl p-6 border" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5" style={{ color: '#CFFF00' }} />
            <h2 className="text-lg font-bold text-white">Student Evaluation</h2>
          </div>

          {evaluation && (
            <p className="text-xs mb-4" style={{ color: '#888888' }}>
              Update existing evaluation
            </p>
          )}

          <form onSubmit={handleEvalSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">Overall Score (0–100)</label>
              <input
                type="number"
                min={0}
                max={100}
                required
                value={evalForm.score}
                onChange={(e) => setEvalForm((f) => ({ ...f, score: e.target.value }))}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border"
                style={{ backgroundColor: '#2a2a2a', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1.5">Performance</label>
              <select
                value={evalForm.performance}
                onChange={(e) => setEvalForm((f) => ({ ...f, performance: e.target.value }))}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border appearance-none"
                style={{ backgroundColor: '#2a2a2a', borderColor: '#2a2a2a', color: '#ffffff' }}
              >
                {['Excellent', 'Good', 'Average', 'Poor'].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1.5">Comments</label>
              <textarea
                rows={4}
                value={evalForm.comments}
                onChange={(e) => setEvalForm((f) => ({ ...f, comments: e.target.value }))}
                placeholder="Enter your evaluation comments..."
                className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none border"
                style={{ backgroundColor: '#2a2a2a', borderColor: '#2a2a2a', color: '#ffffff' }}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl py-2.5 px-6 text-sm font-bold transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#CFFF00', color: '#000' }}
            >
              {saving ? 'Saving...' : evaluation ? 'Update Evaluation' : 'Submit Evaluation'}
            </button>
          </form>
        </div>
      </div>

      {/* ── Comment modal ── */}
      {commentModal.open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div
            className="rounded-2xl p-6 border w-full max-w-md"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
          >
            <h3 className="text-lg font-bold text-white mb-4">Reject Logbook</h3>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none border"
              style={{ backgroundColor: '#2a2a2a', borderColor: '#2a2a2a', color: '#ffffff' }}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setCommentModal({ open: false, logbookId: null, action: null });
                  setComment('');
                }}
                className="rounded-xl px-4 py-2 text-sm font-medium"
                style={{ color: '#888888' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={confirmReject}
                className="rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-50"
                style={{ backgroundColor: '#CFFF00', color: '#000' }}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5" style={{ color: '#888888' }}>
        {icon}
      </div>
      <div>
        <p className="text-xs" style={{ color: '#888888' }}>
          {label}
        </p>
        <p className="text-sm text-white">{value}</p>
      </div>
    </div>
  );
}
