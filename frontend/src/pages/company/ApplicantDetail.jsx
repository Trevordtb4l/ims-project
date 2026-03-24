import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { useToast } from '@/components/Toast.jsx';
import {
  ArrowLeft,
  Mail,
  GraduationCap,
  Calendar,
  Download,
  UserCheck,
  CalendarClock,
  XCircle,
  Briefcase,
  FileText,
  Loader2,
} from 'lucide-react';

const STATUS_STYLES = {
  pending: { bg: '#4a5a00', color: '#CFFF00', label: 'Pending' },
  shortlisted: { bg: '#14532d', color: '#22c55e', label: 'Shortlisted' },
  interview: { bg: '#1e3a5f', color: '#60a5fa', label: 'Interview' },
  approved: { bg: '#14532d', color: '#22c55e', label: 'Accepted' },
  accepted: { bg: '#14532d', color: '#22c55e', label: 'Accepted' },
  rejected: { bg: '#450a0a', color: '#ef4444', label: 'Rejected' },
};

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export default function ApplicantDetail() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    api
      .get(`/internship-applications/${applicationId}/`)
      .then((res) => setApplication(res.data))
      .catch(() => {
        toast('Failed to load applicant details', 'error');
        navigate(-1);
      })
      .finally(() => setLoading(false));
  }, [applicationId]);

  const handleAction = async (newStatus) => {
    setActionLoading(newStatus);
    try {
      await api.patch(`/internship-applications/${applicationId}/`, { status: newStatus });
      setApplication((prev) => ({ ...prev, status: newStatus }));
      toast(`Status updated to ${newStatus}`);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        (typeof err.response?.data === 'string' && err.response.data) ||
        'Failed to update status';
      toast(msg, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadCV = async () => {
    try {
      const res = await api.get(`/internship-applications/${applicationId}/cv/`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cv-${applicationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast('CV not available', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#0f0f0f' }}>
        <div className="space-y-4">
          <div className="h-6 w-40 rounded-lg animate-pulse" style={{ backgroundColor: '#2a2a2a' }} />
          <div className="rounded-2xl p-6 border animate-pulse" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full" style={{ backgroundColor: '#2a2a2a' }} />
              <div className="space-y-2 flex-1">
                <div className="h-6 w-48 rounded-lg" style={{ backgroundColor: '#2a2a2a' }} />
                <div className="h-4 w-32 rounded-lg" style={{ backgroundColor: '#2a2a2a' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-5 rounded-lg" style={{ backgroundColor: '#2a2a2a' }} />
              ))}
            </div>
          </div>
          <div className="rounded-2xl p-6 border animate-pulse" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
            <div className="h-6 w-48 rounded-lg mb-4" style={{ backgroundColor: '#2a2a2a' }} />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-5 rounded-lg" style={{ backgroundColor: '#2a2a2a' }} />
              ))}
            </div>
          </div>
          <div className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: '#2a2a2a' }} />
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 flex-1 rounded-xl animate-pulse" style={{ backgroundColor: '#2a2a2a' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!application) return null;

  const status = STATUS_STYLES[application.status] || STATUS_STYLES.pending;

  return (
    <div style={{ backgroundColor: '#0f0f0f' }}>
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate('/company/applicants')}
          className="flex items-center gap-2 text-sm cursor-pointer mb-6 transition-colors"
          style={{ color: '#888888' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#888888')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Applicants
        </button>

        {/* Student Profile Card */}
        <div className="rounded-2xl p-6 border" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
              style={{ backgroundColor: '#CFFF00', color: '#000000' }}
            >
              {getInitials(application.student_name)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{application.student_name}</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 flex-shrink-0" style={{ color: '#888888' }} />
              <span className="text-sm text-white">{application.student_email || '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 flex-shrink-0" style={{ color: '#888888' }} />
              <span className="text-sm text-white">{application.student_university || 'University of Buea'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: '#888888' }}>Matricule:</span>
              <span className="text-sm text-white">{application.student_matricule || '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: '#888888' }}>Program:</span>
              <span className="text-sm text-white">{application.student_program || '—'}</span>
            </div>
          </div>
        </div>

        {/* Application Details Card */}
        <div className="rounded-2xl p-6 border mt-4" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5" style={{ color: '#CFFF00' }} />
            <h3 className="text-lg font-bold text-white">Application Details</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs mb-1" style={{ color: '#888888' }}>Role Applied</p>
              <p className="text-sm text-white font-medium">{application.internship_title || 'Internship'}</p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: '#888888' }}>Date Applied</p>
              <p className="text-sm text-white font-medium">
                {application.applied_at
                  ? new Date(application.applied_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: '#888888' }}>Current Status</p>
              <span
                className="inline-block text-xs font-semibold px-3 py-1 rounded-full"
                style={{ backgroundColor: status.bg, color: status.color }}
              >
                {status.label}
              </span>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: '#888888' }}>Application ID</p>
              <p className="text-sm text-white font-medium">{application.id}</p>
            </div>
          </div>
        </div>

        {/* CV Download */}
        <button
          type="button"
          onClick={handleDownloadCV}
          className="w-full mt-4 rounded-xl px-4 py-3 flex items-center gap-3 border cursor-pointer transition-colors"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#CFFF00')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#4a5a00' }}
          >
            <FileText className="w-5 h-5" style={{ color: '#CFFF00' }} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white font-medium text-sm">Download CV</p>
            <p className="text-xs" style={{ color: '#888888' }}>Resume document</p>
          </div>
          <Download className="w-5 h-5" style={{ color: '#888888' }} />
        </button>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            disabled={!!actionLoading}
            onClick={() => handleAction('shortlisted')}
            className="flex items-center gap-2 font-bold rounded-xl px-6 py-3 border-2 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#CFFF00', color: '#CFFF00' }}
          >
            {actionLoading === 'shortlisted' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <UserCheck className="w-5 h-5" />
            )}
            Shortlist
          </button>

          <button
            type="button"
            disabled={!!actionLoading}
            onClick={() => handleAction('interview')}
            className="flex items-center gap-2 font-bold rounded-xl px-6 py-3 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#CFFF00', color: '#000000' }}
          >
            {actionLoading === 'interview' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CalendarClock className="w-5 h-5" />
            )}
            Schedule Interview
          </button>

          <button
            type="button"
            disabled={!!actionLoading}
            onClick={() => handleAction('rejected')}
            className="flex items-center gap-2 font-bold rounded-xl px-6 py-3 border transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#450a0a', borderColor: '#ef4444', color: '#ef4444' }}
          >
            {actionLoading === 'rejected' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            Reject
          </button>
        </div>
      </div>
  );
}
