import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  Globe,
  GraduationCap,
  LineChart,
  Mail,
  MapPin,
  Phone,
  Share2,
} from 'lucide-react'

const features = [
  { icon: Briefcase, title: 'Placement', desc: 'Browse and filter approved industry partners to find your perfect match efficiently.' },
  { icon: LineChart, title: 'Tracking', desc: 'Real-time updates on application status, approvals, and document submissions.' },
  { icon: BookOpen, title: 'Digital Logbook', desc: 'Automated weekly reporting tools for students to record their daily activities.' },
  { icon: ClipboardCheck, title: 'Evaluation', desc: 'Simplified grading and feedback forms for industry supervisors and faculty.' },
]

const steps = [
  { num: 1, label: 'Register', desc: 'Students create profiles and upload resumes for approval.' },
  { num: 2, label: 'Apply', desc: 'Search for opportunities and submit applications directly.' },
  { num: 3, label: 'Track & Log', desc: 'Monitor application status and maintain weekly digital logs.' },
  { num: 4, label: 'Evaluate', desc: 'Receive feedback and grading from supervisors on completion.' },
]

const HERO_TEXT = 'Digitally and Efficiently'

export function HomePage() {
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const styleInjected = useRef(false)

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < HERO_TEXT.length) {
        setDisplayText(HERO_TEXT.slice(0, i + 1))
        i++
      } else {
        setIsTyping(false)
        clearInterval(timer)
      }
    }, 80)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (styleInjected.current) return
    styleInjected.current = true
    const style = document.createElement('style')
    style.textContent = `
      @keyframes ims-grow-line { from { transform: scaleX(0) } to { transform: scaleX(1) } }
      @keyframes ims-fade-up  { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
      @keyframes ims-blink     { 0%,100%{opacity:1} 50%{opacity:0} }
    `
    document.head.appendChild(style)
  }, [])

  return (
    <div style={{ background: '#0f0f0f', color: '#ffffff', minHeight: '100vh' }}>
      {/* ── Navbar ── */}
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          background: 'rgba(15,15,15,0.92)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #2a2a2a',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 700, fontSize: 18, textDecoration: 'none' }}>
            <GraduationCap size={24} style={{ color: '#CFFF00' }} />
            IMS Portal
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <a href="#features" style={{ color: '#888', fontSize: 14, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#CFFF00'}
              onMouseLeave={e => e.currentTarget.style.color = '#888'}
            >Features</a>
            <a href="#how-it-works" style={{ color: '#888', fontSize: 14, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#CFFF00'}
              onMouseLeave={e => e.currentTarget.style.color = '#888'}
            >How it Works</a>
            <a href="#contact" style={{ color: '#888', fontSize: 14, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#CFFF00'}
              onMouseLeave={e => e.currentTarget.style.color = '#888'}
            >Contact</a>
          </div>
          <Link to="/login" style={{ background: '#CFFF00', color: '#000', fontWeight: 700, fontSize: 14, padding: '8px 20px', borderRadius: 10, textDecoration: 'none', cursor: 'pointer' }}>
            Login
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ paddingTop: 140, paddingBottom: 80, textAlign: 'center', maxWidth: 1200, margin: '0 auto', padding: '140px 24px 80px' }}>
        <h1 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1px', maxWidth: 700, margin: '0 auto' }}>
          Manage Internships<br />
          <span style={{ color: '#CFFF00' }}>
            {displayText}
            {isTyping && (
              <span style={{ animation: 'ims-blink 0.7s step-end infinite', color: '#CFFF00', fontWeight: 300 }}>|</span>
            )}
          </span>
        </h1>
        <p style={{ color: '#888', fontSize: 16, maxWidth: 520, margin: '20px auto 0', lineHeight: 1.6 }}>
          Streamline the entire internship lifecycle. Connect students, universities, and industry partners in one unified, modern platform.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 32 }}>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#CFFF00', color: '#000', fontWeight: 700, fontSize: 14, padding: '14px 28px', borderRadius: 12, textDecoration: 'none', cursor: 'pointer' }}>
            Register Now <ArrowRight size={16} />
          </Link>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '2px solid #fff', color: '#fff', fontWeight: 600, fontSize: 14, padding: '12px 28px', borderRadius: 12, textDecoration: 'none', background: 'transparent', cursor: 'pointer' }}>
            Faculty Login <ArrowRight size={16} />
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 24, color: '#888', fontSize: 13 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={14} style={{ color: '#CFFF00' }} /> University Approved
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={14} style={{ color: '#CFFF00' }} /> Industry Standard
          </span>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ display: 'inline-block', border: '1px solid #2a2a2a', borderRadius: 999, padding: '4px 14px', fontSize: 12, fontWeight: 600, color: '#CFFF00', marginBottom: 16 }}>
          Key Features
        </div>
        <h2 style={{ fontSize: 30, fontWeight: 700, marginBottom: 8 }}>
          Everything you need to manage internships
        </h2>
        <p style={{ color: '#888', fontSize: 14, maxWidth: 500, marginBottom: 48 }}>
          Our platform provides comprehensive tools tailored for students, faculty, and industry partners to ensure a smooth experience.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {features.map((f) => (
            <div
              key={f.title}
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: 24, cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#CFFF00'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
            >
              <div style={{ background: '#4a5a00', borderRadius: 12, padding: 10, display: 'inline-flex', marginBottom: 16 }}>
                <f.icon size={20} style={{ color: '#CFFF00' }} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ fontSize: 30, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>How It Works</h2>
        <p style={{ color: '#888', fontSize: 14, textAlign: 'center', maxWidth: 500, margin: '0 auto 56px' }}>
          A streamlined process designed to take you from registration to certification with ease.
        </p>
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
          {/* Background track — from center of circle 1 (12.5%) to center of circle 4 (87.5%) */}
          <div style={{ position: 'absolute', top: 24, left: '12.5%', right: '12.5%', height: 2, background: '#2a2a2a', zIndex: 0 }} />
          {/* Animated fill line — scales from left to right within bounds */}
          <div style={{
            position: 'absolute', top: 24, left: '12.5%', right: '12.5%', height: 2, zIndex: 0,
            background: '#CFFF00', transformOrigin: 'left', transform: 'scaleX(0)',
            animation: 'ims-grow-line 2s ease-out 0.5s forwards',
          }} />
          {steps.map((s, i) => (
            <div
              key={s.num}
              style={{
                position: 'relative', zIndex: 1, textAlign: 'center',
                opacity: 0,
                animation: `ims-fade-up 0.6s ease-out ${0.5 + i * 0.5}s forwards`,
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: '50%', border: '2px solid #CFFF00',
                background: '#0f0f0f', color: '#CFFF00', fontWeight: 700, fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
              }}>
                {s.num}
              </div>
              <h4 style={{ fontWeight: 700, fontSize: 16, marginTop: 16 }}>{s.label}</h4>
              <p style={{ color: '#888', fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 20, padding: '60px 40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, marginBottom: 12 }}>Ready to start your journey?</h2>
          <p style={{ color: '#888', fontSize: 14, maxWidth: 440, margin: '0 auto 32px' }}>
            Join thousands of students and companies who are already using the IMS Portal to simplify internship management.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <Link to="/register" style={{ background: '#CFFF00', color: '#000', fontWeight: 700, fontSize: 14, padding: '12px 24px', borderRadius: 10, textDecoration: 'none', cursor: 'pointer' }}>
              Student Registration
            </Link>
            <Link to="/login" style={{ border: '2px solid #fff', color: '#fff', fontWeight: 600, fontSize: 14, padding: '10px 24px', borderRadius: 10, textDecoration: 'none', background: 'transparent', cursor: 'pointer' }}>
              Company Partner Login
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer id="contact" style={{ borderTop: '1px solid #2a2a2a', background: '#111111' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
              <GraduationCap size={20} style={{ color: '#CFFF00' }} />
              IMS Portal
            </div>
            <p style={{ color: '#888', fontSize: 13, lineHeight: 1.7 }}>
              The official Internship Management System designed to bridge the gap between academic learning and professional experience.
            </p>
          </div>
          <div>
            <h4 style={{ color: '#888', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Platform</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { label: 'Features', to: '#features' },
                { label: 'How it Works', to: '#how-it-works' },
                { label: 'Faculty Login', to: '/login' },
                { label: 'Student Portal', to: '/register' },
              ].map(l => (
                <li key={l.label} style={{ marginBottom: 10 }}>
                  {l.to.startsWith('#') ? (
                    <a href={l.to} style={{ color: '#888', fontSize: 13, textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={e => e.currentTarget.style.color = '#888'}
                    >{l.label}</a>
                  ) : (
                    <Link to={l.to} style={{ color: '#888', fontSize: 13, textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={e => e.currentTarget.style.color = '#888'}
                    >{l.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#888', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Support</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Help Center', 'Documentation', 'Contact Support'].map(l => (
                <li key={l} style={{ marginBottom: 10 }}>
                  <a href="#" style={{ color: '#888', fontSize: 13, textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#888'}
                  >{l}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#888', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Contact</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#888', fontSize: 13, marginBottom: 12 }}>
                <Mail size={14} style={{ color: '#CFFF00' }} /> support@university.edu
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#888', fontSize: 13, marginBottom: 12 }}>
                <Phone size={14} style={{ color: '#CFFF00' }} /> +237 651 926 481
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#888', fontSize: 13 }}>
                <MapPin size={14} style={{ color: '#CFFF00' }} /> Molyko, Buea
              </li>
            </ul>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #2a2a2a', maxWidth: 1200, margin: '0 auto', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#888', fontSize: 12 }}>&copy; 2025 University IMS. All rights reserved.</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Globe size={16} style={{ color: '#888', cursor: 'pointer' }} />
            <Share2 size={16} style={{ color: '#888', cursor: 'pointer' }} />
          </div>
        </div>
      </footer>
    </div>
  )
}
