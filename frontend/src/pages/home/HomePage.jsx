import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  LineChart,
  Mail,
  MapPin,
  Phone,
  Star,
} from 'lucide-react'

const features = [
  { icon: Briefcase, title: 'Smart Placement', desc: 'AI-powered matching connects students with the right companies based on skills, interests, and academic performance.' },
  { icon: LineChart, title: 'Real-time Tracking', desc: 'Monitor every stage of the internship lifecycle — from application to final evaluation — in one dashboard.' },
  { icon: BookOpen, title: 'Digital Logbook', desc: 'Students submit weekly logs, supervisors review with one click, and coordinators track compliance automatically.' },
  { icon: ClipboardCheck, title: 'Evaluation System', desc: 'Structured rubrics let supervisors score interns fairly while generating grade-ready reports for coordinators.' },
]

const steps = [
  { num: 1, label: 'Register', desc: 'Create an account with your university credentials' },
  { num: 2, label: 'Apply', desc: 'Browse open positions and submit applications' },
  { num: 3, label: 'Track', desc: 'Log activities, upload reports, and get feedback' },
  { num: 4, label: 'Graduate', desc: 'Complete your internship with a verified evaluation' },
]

export function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: '#0f0f0f', color: '#fff' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b backdrop-blur-md" style={{ borderColor: '#2a2a2a', background: 'rgba(15,15,15,0.85)' }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-white">
            <GraduationCap className="h-6 w-6" style={{ color: '#CFFF00' }} />
            IMS Portal
          </Link>
          <div className="hidden items-center gap-8 text-sm md:flex" style={{ color: '#888888' }}>
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-white">How it Works</a>
            <a href="#contact" className="transition-colors hover:text-white">Contact</a>
          </div>
          <Link
            to="/login"
            className="rounded-xl px-5 py-2 text-sm font-bold transition-all hover:brightness-90"
            style={{ background: '#CFFF00', color: '#000' }}
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-24 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium" style={{ borderColor: '#2a2a2a', color: '#CFFF00' }}>
          <Star className="h-3 w-3" /> Trusted by 500+ students
        </div>
        <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
          Your Internship Journey,{' '}
          <span style={{ color: '#CFFF00' }}>Simplified</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg" style={{ color: '#888888' }}>
          From application to evaluation — one platform that connects students, supervisors, coordinators, and companies seamlessly.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold transition-all hover:brightness-90"
            style={{ background: '#CFFF00', color: '#000' }}
          >
            Register Now <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl border px-7 py-3.5 text-sm font-semibold text-white transition-all hover:border-[#CFFF00]"
            style={{ borderColor: '#2a2a2a' }}
          >
            Faculty Login <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold">
          Everything You Need to{' '}
          <span style={{ color: '#CFFF00' }}>Succeed</span>
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-sm" style={{ color: '#888888' }}>
          A complete suite of tools designed for every stakeholder in the internship process.
        </p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <article
              key={f.title}
              className="group rounded-2xl border p-6 transition-all duration-200 hover:border-[#CFFF00]/40"
              style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}
            >
              <div className="mb-4 inline-flex rounded-xl p-2.5" style={{ background: '#4a5a00' }}>
                <f.icon className="h-5 w-5" style={{ color: '#CFFF00' }} />
              </div>
              <h3 className="mb-2 text-base font-bold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#888888' }}>{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold">
          How It <span style={{ color: '#CFFF00' }}>Works</span>
        </h2>
        <div className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-[12%] right-[12%] top-7 hidden h-0.5 lg:block" style={{ background: '#2a2a2a' }} />
          {steps.map((s) => (
            <div key={s.num} className="relative text-center">
              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold"
                style={{ background: '#CFFF00', color: '#000' }}
              >
                {s.num}
              </div>
              <h4 className="mt-4 text-base font-bold text-white">{s.label}</h4>
              <p className="mt-2 text-sm" style={{ color: '#888888' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-2xl border p-10 text-center md:p-14" style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <h2 className="text-3xl font-bold">Ready to Streamline Your Internships?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: '#888888' }}>
            Join hundreds of students, supervisors, and companies already using IMS Portal.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="rounded-xl px-7 py-3 text-sm font-bold transition-all hover:brightness-90"
              style={{ background: '#CFFF00', color: '#000' }}
            >
              Get Started Free
            </Link>
            <a
              href="#contact"
              className="rounded-xl border px-7 py-3 text-sm font-semibold text-white transition-all hover:border-[#CFFF00]"
              style={{ borderColor: '#2a2a2a' }}
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t" style={{ borderColor: '#2a2a2a' }}>
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold">
              <GraduationCap className="h-5 w-5" style={{ color: '#CFFF00' }} />
              IMS Portal
            </div>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: '#888888' }}>
              Simplifying internship management for the College of Technology, University of Buea.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide" style={{ color: '#888888' }}>Platform</h4>
            <ul className="space-y-2 text-sm" style={{ color: '#888888' }}>
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white">How it Works</a></li>
              <li><Link to="/register" className="hover:text-white">Register</Link></li>
              <li><Link to="/login" className="hover:text-white">Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide" style={{ color: '#888888' }}>Support</h4>
            <ul className="space-y-2 text-sm" style={{ color: '#888888' }}>
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">Documentation</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide" style={{ color: '#888888' }}>Contact</h4>
            <ul className="space-y-2.5 text-sm" style={{ color: '#888888' }}>
              <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" style={{ color: '#CFFF00' }} /> ims@ubuea.cm</li>
              <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" style={{ color: '#CFFF00' }} /> +237 650 000 000</li>
              <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" style={{ color: '#CFFF00' }} /> Buea, Cameroon</li>
            </ul>
          </div>
        </div>
        <div className="border-t py-6 text-center text-xs" style={{ borderColor: '#2a2a2a', color: '#888888' }}>
          &copy; {new Date().getFullYear()} IMS Portal. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
