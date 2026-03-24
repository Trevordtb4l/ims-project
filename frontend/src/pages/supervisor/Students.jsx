import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext.jsx';
import { useToast } from '@/components/Toast.jsx';
import {
  Search,
  X,
  ChevronRight,
  Check,
  AlertTriangle,
  Clock,
  MoreVertical,
  User,
} from 'lucide-react';

const STATUS_STYLES = {
  on_track: { bg: '#14532d', text: '#22c55e', label: 'On Track', bar: '#22c55e' },
  review: { bg: '#4a5a00', text: '#CFFF00', label: 'Review', bar: '#CFFF00' },
  delayed: { bg: '#450a0a', text: '#ef4444', label: 'Delayed', bar: '#ef4444' },
};

const LOGBOOK_STATUS = {
  pending: { bg: '#4a5a00', text: '#CFFF00', label: 'Pending' },
  approved: { bg: '#14532d', text: '#22c55e', label: 'Approved' },
  needs_revision: { bg: '#450a0a', text: '#ef4444', label: 'Needs Revision' },
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

function mockStatus(index) {
  const statuses = ['on_track', 'review', 'delayed'];
  return statuses[index % statuses.length];
}

function mockProgress(index) {
  return 65 + ((index * 7) % 26);
}

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

export default function Students() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [studentLogbooks, setStudentLogbooks] = useState([]);
  const [loadingLogbooks, setLoadingLogbooks] = useState(false);
  const [commentModal, setCommentModal] = useState({ open: false, logbookId: null, action: null });
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/students/');
        setStudents(Array.isArray(data) ? data : data.results ?? []);
      } catch {
        toast('Failed to load students', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const fetchLogbooks = useCallback(
    async (studentId) => {
      setLoadingLogbooks(true);
      try {
        const { data } = await api.get(`/logbooks/?student=${studentId}`);
        setStudentLogbooks(Array.isArray(data) ? data : data.results ?? []);
      } catch {
        toast('Failed to load logbooks', 'error');
      } finally {
        setLoadingLogbooks(false);
      }
    },
    [toast],
  );

  const openSlideOver = useCallback(
    (student) => {
      setSelectedStudent(student);
      setSlideOverOpen(true);
      fetchLogbooks(student.id);
    },
    [fetchLogbooks],
  );

  const closeSlideOver = () => {
    setSlideOverOpen(false);
    setSelectedStudent(null);
    setStudentLogbooks([]);
  };

  const handleApprove = async (logbookId) => {
    setActionLoading(true);
    try {
      await api.patch(`/logbooks/${logbookId}/`, {
        review_status: 'approved',
        supervisor_comment: '',
      });
      toast('Logbook approved');
      if (selectedStudent) fetchLogbooks(selectedStudent.id);
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

  const confirmComment = async () => {
    if (!commentModal.logbookId) return;
    setActionLoading(true);
    try {
      await api.patch(`/logbooks/${commentModal.logbookId}/`, {
        review_status: commentModal.action,
        supervisor_comment: comment,
      });
      toast('Logbook rejected');
      setCommentModal({ open: false, logbookId: null, action: null });
      setComment('');
      if (selectedStudent) fetchLogbooks(selectedStudent.id);
    } catch {
      toast('Failed to reject logbook', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = students.filter((s) => {
    const name = `${s.first_name ?? ''} ${s.last_name ?? ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const COLS = ['Student', 'Program', 'Company', 'Start Date', 'Progress', 'Status', 'Actions'];

  return (
    <div className="min-h-screen px-6 pb-6 md:px-10 md:pb-10" style={{ backgroundColor: '#0f0f0f' }}>
      {/* ── Main card ── */}
      <div className="rounded-2xl p-6 border" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-white">Assigned Students</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#888888' }} />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm rounded-xl border outline-none w-64"
              style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a', color: '#ffffff' }}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl h-12" style={{ backgroundColor: '#2a2a2a' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center py-16 text-sm" style={{ color: '#888888' }}>
            No students assigned
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  {COLS.map((c) => (
                    <th key={c} className="pb-3 text-xs uppercase font-medium" style={{ color: '#888888' }}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, idx) => {
                  const status = s.status ?? mockStatus(idx);
                  const progress = s.progress ?? mockProgress(idx);
                  const style = STATUS_STYLES[status] ?? STATUS_STYLES.on_track;
                  const fullName = `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim() || 'Unknown';

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => openSlideOver(s)}
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ backgroundColor: '#CFFF00', color: '#000' }}
                          >
                            {getInitials(fullName)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{fullName}</p>
                            <p className="text-xs" style={{ color: '#888888' }}>
                              {s.matricule ?? s.registration_number ?? ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-sm" style={{ color: '#888888' }}>
                        {s.program ?? '—'}
                      </td>
                      <td className="py-3 pr-4 text-sm" style={{ color: '#888888' }}>
                        {s.company_name || 'Not assigned'}
                      </td>
                      <td className="py-3 pr-4 text-sm" style={{ color: '#888888' }}>
                        {formatDate(s.start_date)}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="w-24 h-2 rounded-full" style={{ backgroundColor: '#2a2a2a' }}>
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{ width: `${progress}%`, backgroundColor: style.bar }}
                          />
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className="text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: style.bg, color: style.text }}
                        >
                          {style.label}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            openSlideOver(s);
                          }}
                        >
                          <MoreVertical className="h-4 w-4" style={{ color: '#888888' }} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Slide-over ── */}
      {slideOverOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-30" onClick={closeSlideOver} />
          <div
            className="fixed top-0 right-0 h-full w-[480px] z-40 border-l shadow-2xl overflow-y-auto transition-transform"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#2a2a2a' }}>
              <h3 className="text-lg font-bold text-white">
                {selectedStudent
                  ? `${selectedStudent.first_name ?? ''} ${selectedStudent.last_name ?? ''}`.trim()
                  : ''}
              </h3>
              <button
                type="button"
                onClick={closeSlideOver}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile card */}
              {selectedStudent && (
                <div className="rounded-2xl p-6 border" style={{ backgroundColor: '#0f0f0f', borderColor: '#2a2a2a' }}>
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shrink-0"
                      style={{ backgroundColor: '#CFFF00', color: '#000' }}
                    >
                      {getInitials(
                        `${selectedStudent.first_name ?? ''} ${selectedStudent.last_name ?? ''}`,
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">
                        {`${selectedStudent.first_name ?? ''} ${selectedStudent.last_name ?? ''}`.trim()}
                      </p>
                      <p className="text-xs" style={{ color: '#888888' }}>
                        {selectedStudent.matricule ?? selectedStudent.registration_number ?? ''}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: '#888888' }}>Program</span>
                      <span className="text-white">{selectedStudent.program ?? '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: '#888888' }}>Department</span>
                      <span className="text-white">{selectedStudent.department ?? '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: '#888888' }}>Email</span>
                      <span className="text-white">{selectedStudent.email ?? '—'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Internship info */}
              {selectedStudent?.company_name && (
                <div className="rounded-2xl p-6 border" style={{ backgroundColor: '#0f0f0f', borderColor: '#2a2a2a' }}>
                  <p className="text-sm font-medium text-white mb-2">Internship</p>
                  <p className="text-sm text-white font-bold">{selectedStudent.company_name}</p>
                  <span
                    className="inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: STATUS_STYLES[selectedStudent.status ?? 'on_track'].bg,
                      color: STATUS_STYLES[selectedStudent.status ?? 'on_track'].text,
                    }}
                  >
                    {STATUS_STYLES[selectedStudent.status ?? 'on_track'].label}
                  </span>
                </div>
              )}

              {/* Logbooks */}
              <div>
                <p className="text-sm font-bold text-white mb-3">Logbook Entries</p>

                {loadingLogbooks ? (
                  <div className="flex items-center justify-center py-8">
                    <div
                      className="w-6 h-6 border-2 rounded-full animate-spin"
                      style={{ borderColor: '#2a2a2a', borderTopColor: '#CFFF00' }}
                    />
                  </div>
                ) : studentLogbooks.length === 0 ? (
                  <p className="text-sm py-6 text-center" style={{ color: '#888888' }}>
                    No logbook entries yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {studentLogbooks.map((lb) => {
                      const st = LOGBOOK_STATUS[lb.review_status] ?? LOGBOOK_STATUS.pending;
                      return (
                        <div
                          key={lb.id}
                          className="rounded-2xl p-4 border"
                          style={{ backgroundColor: '#0f0f0f', borderColor: '#2a2a2a' }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-sm font-medium text-white">
                              Week {lb.week ?? lb.week_number ?? '—'}
                            </p>
                            <span
                              className="text-xs font-medium px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: st.bg, color: st.text }}
                            >
                              {st.label}
                            </span>
                          </div>
                          <p className="text-xs mb-2" style={{ color: '#888888' }}>
                            {(lb.activities ?? lb.description ?? '').slice(0, 80)}
                            {(lb.activities ?? lb.description ?? '').length > 80 ? '…' : ''}
                          </p>
                          <p className="text-xs mb-3" style={{ color: '#888888' }}>
                            Submitted: {formatDate(lb.submitted_at ?? lb.created_at)}
                          </p>

                          {lb.supervisor_comment && (
                            <p className="text-xs italic mb-3" style={{ color: '#888888' }}>
                              "{lb.supervisor_comment}"
                            </p>
                          )}

                          {(lb.review_status === 'pending' || !lb.review_status) && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleApprove(lb.id)}
                                className="rounded-xl px-3 py-1 text-sm font-medium transition-colors disabled:opacity-50"
                                style={{ backgroundColor: '#14532d', color: '#22c55e' }}
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => openRejectModal(lb.id)}
                                className="rounded-xl px-3 py-1 text-sm font-medium transition-colors disabled:opacity-50"
                                style={{ backgroundColor: '#450a0a', color: '#ef4444' }}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* View full profile button */}
              {selectedStudent && (
                <button
                  type="button"
                  onClick={() => navigate(`/supervisor/students/${selectedStudent.id}`)}
                  className="w-full rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                  style={{ backgroundColor: '#CFFF00', color: '#000' }}
                >
                  View Full Profile
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Comment modal ── */}
      {commentModal.open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div
            className="rounded-2xl p-6 border w-full max-w-md"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
          >
            <h3 className="text-lg font-bold text-white mb-4">Add Comment</h3>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your comment..."
              className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none border"
              style={{ backgroundColor: '#2a2a2a', borderColor: '#2a2a2a', color: '#ffffff' }}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setCommentModal({ open: false, logbookId: null, action: null })}
                className="rounded-xl px-4 py-2 text-sm font-medium transition-colors"
                style={{ color: '#888888' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={confirmComment}
                className="rounded-xl px-4 py-2 text-sm font-bold transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#CFFF00', color: '#000' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
