import { useEffect, useRef, useState } from 'react';
import { FileText, Upload, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext.jsx';
import { useToast } from '@/components/Toast.jsx';

const STATUS_STYLES = {
  pending: { background: '#4a5a00', color: '#CFFF00' },
  approved: { background: '#14532d', color: '#22c55e' },
  needs_revision: { background: '#450a0a', color: '#ef4444' },
};

const STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  needs_revision: 'Needs Revision',
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

export default function LogbookPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef(null);

  const [logbooks, setLogbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activities, setActivities] = useState('');
  const [file, setFile] = useState(null);

  const fetchLogbooks = async () => {
    try {
      const { data } = await api.get('/logbooks/');
      setLogbooks(Array.isArray(data) ? data : data.results ?? []);
    } catch {
      toast('Failed to load logbooks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogbooks();
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

      await api.post('/logbooks/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast('Logbook submitted successfully');
      setActivities('');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      await fetchLogbooks();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        Object.values(err.response?.data ?? {})?.[0]?.[0] ||
        'Failed to submit logbook';
      toast(msg, 'error');
    } finally {
      setSubmitting(false);
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

  return (
    <div className="space-y-6 p-6" style={{ minHeight: '100vh', background: '#0f0f0f' }}>
      {/* Submit Form */}
      <div
        className="rounded-2xl border p-6"
        style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        <div className="mb-5 flex items-center gap-3">
          <FileText className="h-5 w-5" style={{ color: '#CFFF00' }} />
          <h2 className="text-lg font-bold text-white">Submit Weekly Logbook</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: '#888888' }}>
              Week Number
            </label>
            <input
              type="text"
              readOnly
              value={loading ? '...' : logbooks.length + 1}
              className="w-full rounded-xl border-0 px-4 py-2.5 text-sm text-white outline-none"
              style={{ background: '#2a2a2a' }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: '#888888' }}>
              Activities
            </label>
            <textarea
              required
              rows={4}
              value={activities}
              onChange={(e) => setActivities(e.target.value)}
              placeholder="Describe your activities this week..."
              className="w-full resize-none rounded-xl border-0 px-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-500"
              style={{ background: '#2a2a2a' }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: '#888888' }}>
              Timesheet (optional)
            </label>
            <div
              className="flex items-center gap-3 rounded-xl border border-dashed p-4"
              style={{ borderColor: '#2a2a2a' }}
            >
              <Upload className="h-5 w-5 shrink-0" style={{ color: '#888888' }} />
              <input
                ref={fileRef}
                type="file"
                onChange={(e) => setFile(e.target.files[0] || null)}
                className="text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-black"
                style={{ color: '#888888' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl px-6 py-2.5 text-sm font-bold text-black transition disabled:opacity-50"
            style={{ background: '#CFFF00' }}
          >
            {submitting ? 'Submitting...' : 'Submit Logbook'}
          </button>
        </form>
      </div>

      {/* Submissions Table */}
      <div
        className="rounded-2xl border p-6"
        style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        <div className="mb-5 flex items-center gap-3">
          <Clock className="h-5 w-5" style={{ color: '#CFFF00' }} />
          <h2 className="text-lg font-bold text-white">My Submissions</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                {['Week', 'Activities', 'Submitted', 'Status', 'Supervisor Comment'].map((h) => (
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
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
              ) : logbooks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm" style={{ color: '#888888' }}>
                    No submissions yet
                  </td>
                </tr>
              ) : (
                logbooks.map((lb) => (
                  <tr key={lb.id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                    <td className="px-4 py-3 text-white">{lb.week_number}</td>
                    <td className="max-w-xs px-4 py-3 text-white">
                      {lb.activities?.length > 60
                        ? lb.activities.slice(0, 60) + '...'
                        : lb.activities}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: '#888888' }}>
                      {formatDate(lb.submitted_at || lb.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                        style={STATUS_STYLES[lb.status] || STATUS_STYLES.pending}
                      >
                        {STATUS_LABELS[lb.status] || lb.status}
                      </span>
                    </td>
                    <td className="max-w-xs px-4 py-3 text-sm" style={{ color: '#888888' }}>
                      {lb.supervisor_comment || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
