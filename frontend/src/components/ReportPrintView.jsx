import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import api from '@/api/axios'

const SKILLS = [
  'Django & Python Development',
  'REST API Design & Integration',
  'React.js & Tailwind CSS',
  'PostgreSQL Database Management',
  'Git & Version Control',
  'Unit & Integration Testing',
  'Technical Documentation',
  'Agile & Team Collaboration',
]

function fmtDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function fmtSubmitted(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function getDay() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export default function ReportPrintView({ reportId, onClose }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const reportsRes = await api.get('/reports/')
        const reportsList = Array.isArray(reportsRes.data) ? reportsRes.data : reportsRes.data?.results || []
        const report = reportsList.find((r) => r.id === reportId)
        if (!report) throw new Error('Report not found')

        const [intRes, stuRes, lbRes] = await Promise.all([
          api.get(`/internships/${report.internship}/`),
          api.get(`/students/${report.student}/`),
          api.get('/logbooks/', { params: { internship: report.internship } }),
        ])

        const internship = intRes.data
        const student = stuRes.data
        const rawLogbooks = Array.isArray(lbRes.data) ? lbRes.data : lbRes.data?.results || []
        const logbooks = [...rawLogbooks].sort((a, b) => a.week_number - b.week_number)

        const approved = logbooks.filter((l) => l.review_status === 'approved').length
        const pending = logbooks.filter((l) => l.review_status === 'pending').length
        const compliance = logbooks.length ? Math.round((approved / logbooks.length) * 100) : 0

        setData({
          report,
          internship,
          student,
          logbooks,
          approved,
          pending,
          compliance,
          totalWeeks: logbooks.length,
        })
      } catch (e) {
        setError(e.message)
      }
    }
    load()
  }, [reportId])

  useEffect(() => {
    if (!data) return
    const timer = setTimeout(() => {
      window.print()
      onClose()
    }, 800)
    return () => clearTimeout(timer)
  }, [data, onClose])

  if (error) return null
  if (!data) return null

  const { report, internship, student, logbooks, approved, pending, compliance, totalWeeks } = data
  const studentName = `${student.user_first_name} ${student.user_last_name}`.trim()
  const refNum = `IMS-${new Date().getFullYear()}-${String(report.id).padStart(4, '0')}`
  const grade = (report.grade || '').trim() || '—'

  const css = `
    html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Arial', sans-serif; font-size: 11px; color: #1a1a1a; background: #fff; }
    
    #rp-root { width: 210mm; margin: 0 auto; background: #fff; }

    .banner {
      background: #003366;
      color: #fff;
      text-align: center;
      padding: 11px 16px;
      font-size: 10.5px;
      font-weight: 900;
      letter-spacing: 3px;
      text-transform: uppercase;
      border-bottom: 3px solid #CFFF00;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px 12px;
      border-bottom: 3px solid #003366;
    }
    .header-logo { width: 64px; height: 64px; object-fit: contain; }
    .header-center { text-align: center; flex: 1; padding: 0 16px; }
    .header-center .uni { font-size: 15px; font-weight: 900; color: #003366; letter-spacing: 1px; text-transform: uppercase; }
    .header-center .college { font-size: 9px; color: #555; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }
    .header-center .title { font-size: 20px; font-weight: 900; color: #003366; text-transform: uppercase; letter-spacing: 1px; margin: 6px 0 4px; font-family: Georgia, serif; }
    .header-center .sub1 { font-size: 9px; color: #444; }
    .header-center .sub2 { font-size: 10px; font-weight: 700; color: #1a1a1a; margin-top: 3px; }
    .header-center .gendate { font-size: 9px; color: #777; margin-top: 2px; }
    .ref-badge {
      display: inline-block;
      margin-top: 8px;
      background: #003366;
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      padding: 4px 14px;
      border-radius: 20px;
      letter-spacing: 1px;
    }

    .section { padding: 16px 24px 8px; }
    .section.section-skills { margin-bottom: 16px; }
    .section-label {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #003366;
      border-bottom: 1.5px solid #003366;
      padding-bottom: 5px;
      margin-bottom: 12px;
    }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .info-card {
      border: 1px solid #dde3ed;
      border-radius: 6px;
      padding: 10px 14px;
      background: #f8fafc;
    }
    .info-card .label {
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #7a8aaa;
      margin-bottom: 4px;
    }
    .info-card .value {
      font-size: 12px;
      font-weight: 600;
      color: #0f172a;
    }

    .att-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 10px; }
    .att-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .att-card {
      border: 1px solid #dde3ed;
      border-radius: 6px;
      padding: 14px 10px;
      text-align: center;
      background: #f8fafc;
    }
    .att-card .att-val { font-size: 22px; font-weight: 900; color: #003366; }
    .att-card .att-lbl { font-size: 8px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #7a8aaa; margin-top: 4px; }

    .skills-wrap { display: flex; flex-wrap: wrap; gap: 8px; padding: 4px 0; }
    .skill-pill {
      background: #eef3fb;
      border: 1.5px solid #003366;
      color: #003366;
      border-radius: 20px;
      padding: 5px 14px;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.5px;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }

    .lb-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
    .lb-table thead tr { background: #003366; color: #fff; }
    .lb-table thead th {
      padding: 9px 10px;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      text-align: left;
    }
    .lb-table tbody tr:nth-child(even) { background: #f4f7fb; }
    .lb-table tbody tr:nth-child(odd) { background: #fff; }
    .lb-table tbody td {
      padding: 9px 10px;
      font-size: 9.5px;
      color: #1a1a1a;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
      line-height: 1.5;
    }
    .lb-table .week-cell { font-weight: 800; color: #003366; text-align: center; width: 36px; }
    .status-approved {
      display: inline-block;
      background: #dcfce7;
      color: #166534;
      border-radius: 10px;
      padding: 2px 10px;
      font-size: 8.5px;
      font-weight: 700;
    }
    .status-pending {
      display: inline-block;
      background: #fef9c3;
      color: #854d0e;
      border-radius: 10px;
      padding: 2px 10px;
      font-size: 8.5px;
      font-weight: 700;
    }

    .grade-section { padding: 16px 24px; }
    .grade-box {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #0f172a;
      color: #fff;
      font-size: 56px;
      font-weight: 900;
      width: 100px;
      height: 100px;
      border-radius: 12px;
      font-family: Georgia, serif;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
    }
    .grade-label { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; color: #555; text-transform: uppercase; margin-top: 8px; }

    .sig-section { padding: 16px 24px 20px; }
    .sig-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 24px; }
    .sig-card { text-align: center; }
    .sig-line { border-top: 1.5px dashed #003366; padding-top: 8px; margin-bottom: 4px; }
    .sig-name { font-size: 11px; font-weight: 800; color: #0f172a; }
    .sig-role { font-size: 9px; color: #666; margin-top: 2px; }
    .sig-date { font-size: 9px; color: #888; margin-top: 6px; }

    .footer {
      border-top: 2px solid #003366;
      display: grid;
      grid-template-columns: 1fr 1fr;
      padding: 12px 24px;
      margin-top: 8px;
    }
    .footer-left { font-size: 8.5px; color: #555; line-height: 1.7; }
    .footer-right { font-size: 8.5px; color: #555; text-align: right; line-height: 1.7; }

    @media print {
      .skill-pill {
        background: #eef3fb !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .att-card {
        background: #f8fafc !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .info-card {
        background: #f8fafc !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      * { 
        -webkit-print-color-adjust: exact !important; 
        print-color-adjust: exact !important; 
        color-adjust: exact !important;
      }
      @page { size: A4; margin: 0; }
      html, body { margin: 0 !important; padding: 0 !important; }
      body > *:not(#rp-overlay) { display: none !important; }
      #rp-overlay { position: static !important; background: #fff !important; }
      #rp-root { width: 100% !important; }
      .page-break { page-break-before: always; }
    }
  `

  return createPortal(
    <div
      id="rp-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#fff',
        overflow: 'auto',
      }}
    >
      <style>{css}</style>
      <div id="rp-root">

        {/* CONFIDENTIAL BANNER */}
        <div className="banner">
          🔒 &nbsp; CONFIDENTIAL — FOR OFFICIAL USE ONLY — UNIVERSITY OF BUEA IMS
        </div>

        {/* HEADER */}
        <div className="header">
          <img src="/cot-logo.png" alt="COT" className="header-logo" />
          <div className="header-center">
            <div className="uni">University of Buea</div>
            <div className="college">College of Technology — Molyko, Buea</div>
            <div className="title">Student Internship Report</div>
            <div className="sub1">Internship Management System (IMS) — Confidential Report</div>
            <div className="sub2">{internship.title}</div>
            <div className="gendate">Generated on {getDay()}</div>
            <div><span className="ref-badge">REF: {refNum}</span></div>
          </div>
          <img src="/ub-logo.png" alt="UB" className="header-logo" />
        </div>

        {/* STUDENT INFORMATION */}
        <div className="section">
          <div className="section-label">Student Information</div>
          <div className="info-grid">
            <div className="info-card"><div className="label">Full Name</div><div className="value">{studentName}</div></div>
            <div className="info-card"><div className="label">Matricule</div><div className="value">{student.matricule}</div></div>
            <div className="info-card"><div className="label">Program</div><div className="value">{student.program}</div></div>
            <div className="info-card"><div className="label">Email</div><div className="value">trevorandeh@gmail.com</div></div>
          </div>
        </div>

        {/* COMPANY & INTERNSHIP DETAILS */}
        <div className="section">
          <div className="section-label">Company &amp; Internship Details</div>
          <div className="info-grid">
            <div className="info-card"><div className="label">Company Name</div><div className="value">{internship.company_name}</div></div>
            <div className="info-card"><div className="label">Supervisor</div><div className="value">{internship.supervisor_name}</div></div>
            <div className="info-card"><div className="label">Start Date</div><div className="value">{fmtDate(internship.start_date)}</div></div>
            <div className="info-card"><div className="label">End Date</div><div className="value">{fmtDate(internship.end_date)}</div></div>
            <div className="info-card"><div className="label">Report Type</div><div className="value">{internship.title}</div></div>
            <div className="info-card"><div className="label">Submitted Date</div><div className="value">{fmtSubmitted(internship.created_at)}</div></div>
          </div>
        </div>

        {/* ATTENDANCE */}
        <div className="section">
          <div className="section-label">Attendance Record</div>
          <div className="att-grid">
            <div className="att-card"><div className="att-val">{totalWeeks}</div><div className="att-lbl">Weeks Logged</div></div>
            <div className="att-card"><div className="att-val">{approved}</div><div className="att-lbl">Approved</div></div>
            <div className="att-card"><div className="att-val">{pending}</div><div className="att-lbl">Pending</div></div>
            <div className="att-card"><div className="att-val">{compliance}%</div><div className="att-lbl">Compliance</div></div>
          </div>
          <div className="att-grid-3">
            <div className="att-card"><div className="att-val">35</div><div className="att-lbl">Days Present</div></div>
            <div className="att-card"><div className="att-val">5</div><div className="att-lbl">Days Absent</div></div>
            <div className="att-card"><div className="att-val">40</div><div className="att-lbl">Total Working Days</div></div>
          </div>
        </div>

        {/* SKILLS */}
        <div className="section section-skills">
          <div className="section-label">Skills Developed During Internship</div>
          <div className="skills-wrap">
            {SKILLS.map((s) => <span key={s} className="skill-pill">{s}</span>)}
          </div>
        </div>

        {/* PAGE BREAK */}
        <div className="page-break" />

        {/* LOGBOOK */}
        <div className="section">
          <div className="section-label">Weekly Logbook Summary</div>
          <table className="lb-table">
            <thead>
              <tr>
                <th style={{ width: '36px' }}>Week</th>
                <th style={{ width: '42%' }}>Activities Summary</th>
                <th style={{ width: '80px' }}>Status</th>
                <th>Supervisor Comment</th>
              </tr>
            </thead>
            <tbody>
              {logbooks.map((lb) => (
                <tr key={lb.id}>
                  <td className="week-cell">{lb.week_number}</td>
                  <td>{lb.activities}</td>
                  <td>
                    <span className={lb.review_status === 'approved' ? 'status-approved' : 'status-pending'}>
                      {lb.review_status === 'approved' ? 'Approved' : lb.review_status === 'needs_revision' ? 'Needs Revision' : 'Pending'}
                    </span>
                  </td>
                  <td>{lb.supervisor_comment || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FINAL ASSESSMENT */}
        <div className="grade-section">
          <div className="section-label">Final Assessment</div>
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <div className="grade-box">{grade}</div>
            <div className="grade-label">Final Grade Awarded</div>
          </div>
        </div>

        {/* SIGNATURES */}
        <div className="sig-section">
          <div className="section-label">Signatures &amp; Authorization</div>
          <div className="sig-grid">
            <div className="sig-card">
              <div className="sig-line" />
              <div className="sig-name">{studentName}</div>
              <div className="sig-role">Student</div>
              <div className="sig-date">Date: _______________</div>
            </div>
            <div className="sig-card">
              <div className="sig-line" />
              <div className="sig-name">{internship.supervisor_name}</div>
              <div className="sig-role">Academic Supervisor</div>
              <div className="sig-date">Date: _______________</div>
            </div>
            <div className="sig-card">
              <div className="sig-line" />
              <div className="sig-name">Company Representative</div>
              <div className="sig-role">Company Supervisor</div>
              <div className="sig-date">Date: _______________</div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="footer">
          <div className="footer-left">
            Internship Management System — University of Buea<br />
            College of Technology, Molyko, Buea, Cameroon
          </div>
          <div className="footer-right">
            © {new Date().getFullYear()} IMS Portal. All rights reserved.<br />
            This document is computer generated and valid without signature.
          </div>
        </div>

      </div>
    </div>,
    document.body,
  )
}
