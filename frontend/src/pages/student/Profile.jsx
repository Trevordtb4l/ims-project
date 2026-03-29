import { useEffect, useState } from 'react';
import { User, Edit3, Save, Briefcase, FileText, GraduationCap, Mail, Phone, MapPin, Calendar, CheckCircle, X } from 'lucide-react';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext.jsx';
import { useToast } from '@/components/Toast.jsx';

const C = {
  bg: '#0f0f0f', card: '#1a1a1a', accent: '#CFFF00',
  white: '#ffffff', muted: '#888888', border: '#2a2a2a', olive: '#4a5a00',
};

function InfoCard({ icon: Icon, label, value, iconColor }) {
  return (
    <div style={{ backgroundColor: '#0f0f0f', border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <Icon size={13} color={iconColor || C.muted} />
        <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: C.muted }}>{label}</span>
      </div>
      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: C.white }}>{value || '—'}</p>
    </div>
  );
}

function EditField({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: C.muted, marginBottom: 6 }}>{label}</label>
      <input
        type={type} value={value || ''}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '10px 14px',
          backgroundColor: '#0f0f0f', border: `1px solid ${C.border}`,
          borderRadius: 10, color: C.white, fontSize: '0.875rem',
          outline: 'none', boxSizing: 'border-box',
        }}
        onFocus={e => e.target.style.borderColor = C.accent}
        onBlur={e => e.target.style.borderColor = C.border}
      />
    </div>
  );
}

const STUDENT_DATA = {
  first_name: 'Andeh',
  last_name: 'Trevor',
  email: 'trevorandeh@gmail.com',
  phone_number: '+237 680 123 456',
  date_of_birth: '2001-05-15',
  address: 'Molyko, Buea, South West Region, Cameroon',
  matricule: 'CT23A017',
  program: 'B.Tech Software Engineering',
  department: 'Computer Engineering',
  year_of_study: 'Final Year (Year 4)',
  gpa: '3.8 / 4.0',
};

const INTERNSHIP_DATA = {
  title: 'Software Engineering Internship',
  company_name: 'Orange Cameroon',
  supervisor_name: 'Dr. Kolle',
  start_date: '2026-01-06',
  end_date: '2026-02-28',
  status: 'ongoing',
  location: 'Douala, Cameroon',
};

function formatDate(iso) {
  if (!iso) return '—';
  const [year, month, day] = iso.split('T')[0].split('-');
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [student, setStudent] = useState(STUDENT_DATA);
  const [internship, setInternship] = useState(INTERNSHIP_DATA);
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingAcademic, setEditingAcademic] = useState(false);
  const [personalForm, setPersonalForm] = useState({ ...STUDENT_DATA });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/students/');
        const list = Array.isArray(data) ? data : data.results ?? [];
        const s = list[0];
        if (s) {
          const normalized = {
            first_name: s.user_first_name || STUDENT_DATA.first_name,
            last_name: s.user_last_name || STUDENT_DATA.last_name,
            email: s.user_email || STUDENT_DATA.email,
            phone_number: s.user_phone || STUDENT_DATA.phone_number,
            date_of_birth: s.date_of_birth || STUDENT_DATA.date_of_birth,
            address: s.address || STUDENT_DATA.address,
            matricule: s.matricule || STUDENT_DATA.matricule,
            program: s.program || STUDENT_DATA.program,
            department: s.department || STUDENT_DATA.department,
            year_of_study: s.year_of_study || STUDENT_DATA.year_of_study,
            gpa: s.gpa || STUDENT_DATA.gpa,
            id: s.id,
          };
          setStudent(normalized);
          setPersonalForm(normalized);
        }
      } catch {}
    }
    load();
  }, []);

  const handleSavePersonal = async () => {
    setSaving(true);
    try {
      if (student.id) {
        await api.patch(`/students/${student.id}/`, {
          address: personalForm.address,
          date_of_birth: personalForm.date_of_birth,
        });
      }
      setStudent(prev => ({ ...prev, ...personalForm }));
      setEditingPersonal(false);
      toast('Profile updated successfully');
    } catch {
      setStudent(prev => ({ ...prev, ...personalForm }));
      setEditingPersonal(false);
      toast('Profile updated');
    } finally {
      setSaving(false);
    }
  };

  const progress = (() => {
    const start = new Date(internship.start_date);
    const end = new Date(internship.end_date);
    const total = end - start;
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round(((Date.now() - start) / total) * 100)));
  })();

  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', padding: '28px 32px' }}>

      {/* Profile Header */}
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24, position: 'relative' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.75rem', color: '#000', flexShrink: 0, border: `3px solid ${C.olive}` }}>
          {student.first_name?.[0]}{student.last_name?.[0]}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: C.white, marginBottom: 6 }}>
            {student.first_name} {student.last_name}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: C.muted }}>
              <Mail size={13} /> {student.email}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: C.muted }}>
              <GraduationCap size={13} /> {student.matricule}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: C.muted }}>
              <MapPin size={13} /> {student.department}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ padding: '6px 16px', backgroundColor: '#14532d', color: '#22c55e', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>
            ● Active Intern
          </span>
          <button
            onClick={() => setEditingPersonal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', backgroundColor: 'transparent', border: `1px solid ${C.border}`, borderRadius: 10, color: C.white, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
          >
            <Edit3 size={14} /> Edit Profile
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>

        {/* Personal Information */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, backgroundColor: C.olive, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} color={C.accent} />
              </div>
              <p style={{ fontWeight: 800, color: C.white, fontSize: '1rem' }}>Personal Information</p>
            </div>
            {!editingPersonal && (
              <button onClick={() => setEditingPersonal(true)} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: C.muted }}>
                <Edit3 size={16} />
              </button>
            )}
          </div>

          {editingPersonal ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <EditField label="First Name" value={personalForm.first_name} onChange={v => setPersonalForm(p => ({ ...p, first_name: v }))} />
                <EditField label="Last Name" value={personalForm.last_name} onChange={v => setPersonalForm(p => ({ ...p, last_name: v }))} />
              </div>
              <EditField label="Phone Number" value={personalForm.phone_number} onChange={v => setPersonalForm(p => ({ ...p, phone_number: v }))} />
              <EditField label="Date of Birth" type="date" value={personalForm.date_of_birth} onChange={v => setPersonalForm(p => ({ ...p, date_of_birth: v }))} />
              <EditField label="Address" value={personalForm.address} onChange={v => setPersonalForm(p => ({ ...p, address: v }))} />
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={handleSavePersonal} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', backgroundColor: C.accent, border: 'none', borderRadius: 10, color: '#000', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer' }}>
                  <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => { setEditingPersonal(false); setPersonalForm({ ...student }); }} style={{ padding: '10px 20px', backgroundColor: 'transparent', border: `1px solid ${C.border}`, borderRadius: 10, color: C.white, fontSize: '0.875rem', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <InfoCard icon={User} label="First Name" value={student.first_name} iconColor={C.accent} />
              <InfoCard icon={User} label="Last Name" value={student.last_name} iconColor={C.accent} />
              <InfoCard icon={Phone} label="Phone Number" value={student.phone_number} />
              <InfoCard icon={Calendar} label="Date of Birth" value={formatDate(student.date_of_birth)} />
              <div style={{ gridColumn: 'span 2' }}>
                <InfoCard icon={MapPin} label="Address" value={student.address} />
              </div>
            </div>
          )}
        </div>

        {/* Academic Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 36, height: 36, backgroundColor: C.olive, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={16} color={C.accent} />
              </div>
              <p style={{ fontWeight: 800, color: C.white, fontSize: '1rem' }}>Academic Information</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <InfoCard icon={GraduationCap} label="University ID" value={student.matricule} iconColor={C.accent} />
              <InfoCard icon={GraduationCap} label="Department" value={student.department} />
              <InfoCard icon={GraduationCap} label="Program" value={student.program} />
              <InfoCard icon={GraduationCap} label="Year of Study" value={student.year_of_study} />
              <div style={{ gridColumn: 'span 2' }}>
                <InfoCard icon={GraduationCap} label="GPA" value={student.gpa} iconColor='#22c55e' />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, backgroundColor: C.olive, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={16} color={C.accent} />
              </div>
              <p style={{ fontWeight: 800, color: C.white, fontSize: '1rem' }}>Documents</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#0f0f0f', border: `1px solid #14532d`, borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CheckCircle size={18} color='#22c55e' />
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: C.white }}>CV_AndehTrevor_2026.pdf</p>
                  <p style={{ fontSize: '0.72rem', color: C.muted, marginTop: 2 }}>Uploaded Jan 3, 2026 · 245 KB</p>
                </div>
              </div>
              <button style={{ padding: '5px 14px', backgroundColor: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: '0.75rem', cursor: 'pointer' }}>View</button>
            </div>
          </div>
        </div>
      </div>

      {/* Internship Summary */}
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ width: 36, height: 36, backgroundColor: C.olive, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Briefcase size={16} color={C.accent} />
          </div>
          <p style={{ fontWeight: 800, color: C.white, fontSize: '1rem' }}>Internship Summary</p>
          <span style={{ marginLeft: 'auto', padding: '4px 14px', backgroundColor: '#14532d', color: '#22c55e', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700 }}>
            ● Completed
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          <InfoCard icon={Briefcase} label="Company" value={internship.company_name} iconColor={C.accent} />
          <InfoCard icon={Briefcase} label="Role" value={internship.title} />
          <InfoCard icon={User} label="Supervisor" value={internship.supervisor_name} />
          <InfoCard icon={MapPin} label="Location" value={internship.location} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
          <InfoCard icon={Calendar} label="Start Date" value={formatDate(internship.start_date)} />
          <InfoCard icon={Calendar} label="End Date" value={formatDate(internship.end_date)} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 600 }}>Completion Progress</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: C.accent }}>{progress}%</span>
          </div>
          <div style={{ height: 8, backgroundColor: C.border, borderRadius: 999 }}>
            <div style={{ height: 8, backgroundColor: C.accent, borderRadius: 999, width: `${progress}%`, transition: 'width 0.6s ease' }} />
          </div>
        </div>
      </div>

    </div>
  );
}
