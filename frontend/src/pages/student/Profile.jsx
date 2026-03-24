import { useEffect, useState } from 'react';
import {
  User, Edit, Save, Briefcase, FileText, Calendar,
  CheckCircle, AlertTriangle, Mail, Phone, MapPin, GraduationCap,
} from 'lucide-react';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext.jsx';
import { useToast } from '@/components/Toast.jsx';

function Skeleton({ className = '', style = {} }) {
  return (
    <div
      className={`animate-pulse rounded-2xl ${className}`}
      style={{ background: '#2a2a2a', ...style }}
    />
  );
}

function Field({ label, value }) {
  return (
    <div>
      <span
        className="block text-xs font-medium uppercase tracking-wide"
        style={{ color: '#888888' }}
      >
        {label}
      </span>
      <span className="mt-1 block text-sm text-white">{value || '—'}</span>
    </div>
  );
}

function EditableField({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label
        className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
        style={{ color: '#888888' }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border-0 px-4 py-2.5 text-sm text-white outline-none"
        style={{ background: '#2a2a2a' }}
      />
    </div>
  );
}

const STATUS_STYLES = {
  active:    { background: '#14532d', color: '#22c55e' },
  completed: { background: '#1e3a5f', color: '#60a5fa' },
  pending:   { background: '#4a5a00', color: '#CFFF00' },
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [student, setStudent] = useState(null);
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingAcademic, setEditingAcademic] = useState(false);

  const [personalForm, setPersonalForm] = useState({});
  const [academicForm, setAcademicForm] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [studentRes, internshipRes] = await Promise.all([
        api.get('/students/'),
        api.get('/internships/').catch(() => ({ data: [] })),
      ]);

      const students = Array.isArray(studentRes.data)
        ? studentRes.data
        : studentRes.data.results ?? [];
      const s = students[0] || null;
      setStudent(s);

      if (s) {
        setPersonalForm({
          first_name: s.user?.first_name || s.first_name || '',
          last_name: s.user?.last_name || s.last_name || '',
          phone_number: s.phone_number || s.user?.phone_number || '',
          date_of_birth: s.date_of_birth || '',
          address: s.address || '',
        });
        setAcademicForm({
          year_of_study: s.year_of_study || '',
          gpa: s.gpa || '',
        });
      }

      const internships = Array.isArray(internshipRes.data)
        ? internshipRes.data
        : internshipRes.data.results ?? [];
      const active = internships.find(
        (i) => i.status === 'active' || i.status === 'in_progress'
      );
      setInternship(active || internships[0] || null);
    } catch {
      toast('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSavePersonal = async () => {
    if (!student) return;
    setSaving(true);
    try {
      await api.patch(`/students/${student.id}/`, {
        date_of_birth: personalForm.date_of_birth || undefined,
        address: personalForm.address || undefined,
        phone_number: personalForm.phone_number || undefined,
        user: {
          first_name: personalForm.first_name,
          last_name: personalForm.last_name,
        },
      });
      toast('Profile updated');
      setEditingPersonal(false);
      await fetchData();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        Object.values(err.response?.data ?? {})?.[0]?.[0] ||
        'Failed to update profile';
      toast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAcademic = async () => {
    if (!student) return;
    setSaving(true);
    try {
      await api.patch(`/students/${student.id}/`, {
        year_of_study: academicForm.year_of_study || undefined,
        gpa: academicForm.gpa || undefined,
      });
      toast('Profile updated');
      setEditingAcademic(false);
      await fetchData();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        Object.values(err.response?.data ?? {})?.[0]?.[0] ||
        'Failed to update profile';
      toast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    const fn = student?.user?.first_name || student?.first_name || user?.first_name || '';
    const ln = student?.user?.last_name || student?.last_name || user?.last_name || '';
    return `${fn.charAt(0)}${ln.charAt(0)}`.toUpperCase() || 'S';
  };

  const displayName = () => {
    const fn = student?.user?.first_name || student?.first_name || user?.first_name || '';
    const ln = student?.user?.last_name || student?.last_name || user?.last_name || '';
    return `${fn} ${ln}`.trim() || 'Student';
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6" style={{ minHeight: '100vh', background: '#0f0f0f' }}>
        <Skeleton style={{ height: 120 }} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton style={{ height: 300 }} />
          <Skeleton style={{ height: 300 }} />
        </div>
        <Skeleton style={{ height: 140 }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" style={{ minHeight: '100vh', background: '#0f0f0f' }}>
      {/* Profile Header */}
      <div
        className="flex flex-col items-start gap-5 rounded-2xl border p-6 sm:flex-row sm:items-center"
        style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold"
          style={{ background: '#CFFF00', color: '#000' }}
        >
          {getInitials()}
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{displayName()}</h1>
          <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm" style={{ color: '#888888' }}>
            {student?.matricule && (
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" /> {student.matricule}
              </span>
            )}
            {(student?.program || student?.department) && (
              <span>
                {student.program}
                {student.program && student.department ? ' · ' : ''}
                {student.department}
              </span>
            )}
            {(student?.user?.email || user?.email) && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {student?.user?.email || user?.email}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setEditingPersonal(!editingPersonal)}
          className="rounded-xl border px-4 py-2 text-sm font-medium text-white transition"
          style={{ borderColor: '#2a2a2a' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#CFFF00')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
        >
          <span className="flex items-center gap-2">
            <Edit className="h-4 w-4" /> Edit Profile
          </span>
        </button>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <div
          className="rounded-2xl border p-6"
          style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5" style={{ color: '#CFFF00' }} />
              <h2 className="text-lg font-bold text-white">Personal Information</h2>
            </div>
            {!editingPersonal && (
              <button
                onClick={() => setEditingPersonal(true)}
                className="text-sm font-medium transition hover:opacity-80"
                style={{ color: '#CFFF00' }}
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
          </div>

          {editingPersonal ? (
            <div className="space-y-4">
              <EditableField
                label="First Name"
                value={personalForm.first_name}
                onChange={(v) => setPersonalForm({ ...personalForm, first_name: v })}
              />
              <EditableField
                label="Last Name"
                value={personalForm.last_name}
                onChange={(v) => setPersonalForm({ ...personalForm, last_name: v })}
              />
              <EditableField
                label="Phone Number"
                value={personalForm.phone_number}
                onChange={(v) => setPersonalForm({ ...personalForm, phone_number: v })}
              />
              <EditableField
                label="Date of Birth"
                type="date"
                value={personalForm.date_of_birth}
                onChange={(v) => setPersonalForm({ ...personalForm, date_of_birth: v })}
              />
              <EditableField
                label="Address"
                value={personalForm.address}
                onChange={(v) => setPersonalForm({ ...personalForm, address: v })}
              />
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSavePersonal}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-black transition disabled:opacity-50"
                  style={{ background: '#CFFF00' }}
                >
                  <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditingPersonal(false)}
                  className="rounded-xl border px-5 py-2.5 text-sm font-medium text-white"
                  style={{ borderColor: '#2a2a2a' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Field
                label="First Name"
                value={student?.user?.first_name || student?.first_name}
              />
              <Field
                label="Last Name"
                value={student?.user?.last_name || student?.last_name}
              />
              <Field
                label="Phone Number"
                value={student?.phone_number || student?.user?.phone_number}
              />
              <Field label="Date of Birth" value={formatDate(student?.date_of_birth)} />
              <Field label="Address" value={student?.address} />
            </div>
          )}
        </div>

        {/* Academic Information */}
        <div className="space-y-6">
          <div
            className="rounded-2xl border p-6"
            style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5" style={{ color: '#CFFF00' }} />
                <h2 className="text-lg font-bold text-white">Academic Information</h2>
              </div>
              {!editingAcademic && (
                <button
                  onClick={() => setEditingAcademic(true)}
                  className="text-sm font-medium transition hover:opacity-80"
                  style={{ color: '#CFFF00' }}
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
            </div>

            {editingAcademic ? (
              <div className="space-y-4">
                <Field label="University ID" value={student?.matricule} />
                <Field label="Department" value={student?.department} />
                <Field label="Program" value={student?.program} />
                <EditableField
                  label="Year of Study"
                  value={academicForm.year_of_study}
                  onChange={(v) => setAcademicForm({ ...academicForm, year_of_study: v })}
                />
                <EditableField
                  label="GPA"
                  value={academicForm.gpa}
                  onChange={(v) => setAcademicForm({ ...academicForm, gpa: v })}
                />
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSaveAcademic}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-black transition disabled:opacity-50"
                    style={{ background: '#CFFF00' }}
                  >
                    <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditingAcademic(false)}
                    className="rounded-xl border px-5 py-2.5 text-sm font-medium text-white"
                    style={{ borderColor: '#2a2a2a' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Field label="University ID" value={student?.matricule} />
                <Field label="Department" value={student?.department} />
                <Field label="Program" value={student?.program} />
                <Field label="Year of Study" value={student?.year_of_study} />
                <Field label="GPA" value={student?.gpa} />
              </div>
            )}
          </div>

          {/* Documents Sub-card */}
          <div
            className="rounded-2xl border p-6"
            style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5" style={{ color: '#CFFF00' }} />
              <h3 className="text-base font-bold text-white">Documents</h3>
            </div>
            <div className="mt-4 flex items-center gap-3">
              {student?.cv || student?.cv_url ? (
                <>
                  <CheckCircle className="h-5 w-5" style={{ color: '#22c55e' }} />
                  <span className="text-sm text-white">CV uploaded</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5" style={{ color: '#ef4444' }} />
                  <span className="text-sm" style={{ color: '#888888' }}>
                    No CV uploaded
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Internship Summary */}
      <div
        className="rounded-2xl border p-6"
        style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}
      >
        <div className="mb-5 flex items-center gap-3">
          <Briefcase className="h-5 w-5" style={{ color: '#CFFF00' }} />
          <h2 className="text-lg font-bold text-white">Internship Summary</h2>
        </div>

        {internship ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Company" value={internship.company_name} />
              <Field label="Role" value={internship.title} />
              <Field label="Supervisor" value={internship.supervisor_name} />
              <Field
                label="Duration"
                value={`${formatDate(internship.start_date)} — ${formatDate(internship.end_date)}`}
              />
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-medium uppercase tracking-wide" style={{ color: '#888888' }}>
                Status
              </span>
              <span
                className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                style={STATUS_STYLES[internship.status] || STATUS_STYLES.pending}
              >
                {internship.status}
              </span>
            </div>

            {/* Progress bar */}
            {internship.start_date && internship.end_date && (
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs" style={{ color: '#888888' }}>
                  <span>Progress</span>
                  <span>
                    {Math.min(
                      100,
                      Math.max(
                        0,
                        Math.round(
                          ((Date.now() - new Date(internship.start_date).getTime()) /
                            (new Date(internship.end_date).getTime() -
                              new Date(internship.start_date).getTime())) *
                            100
                        )
                      )
                    )}
                    %
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full" style={{ background: '#2a2a2a' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      background: '#CFFF00',
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          Math.round(
                            ((Date.now() - new Date(internship.start_date).getTime()) /
                              (new Date(internship.end_date).getTime() -
                                new Date(internship.start_date).getTime())) *
                              100
                          )
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm" style={{ color: '#888888' }}>
            No active internship
          </p>
        )}
      </div>
    </div>
  );
}
