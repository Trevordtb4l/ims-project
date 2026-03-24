import { Search, Users } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function Applicants() {
  const navigate = useNavigate()
  const [applicants, setApplicants] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const res = await api.get('/internship-applications/?company=me')
        const data = res.data?.results || res.data || []
        setApplicants(Array.isArray(data) ? data : [])
      } catch (err) {
        console.log('Error:', err.response?.data)
      } finally {
        setLoading(false)
      }
    }
    fetchApplicants()
  }, [])

  const filteredApplicants = applicants.filter((a) => {
    const matchSearch =
      a.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.internship_title?.toLowerCase().includes(search.toLowerCase())
    const s = (a.status || '').toLowerCase()
    if (filter === 'All') return matchSearch
    if (filter === 'Reviewing') return matchSearch && s === 'shortlisted'
    if (filter === 'Accepted') return matchSearch && s === 'approved'
    return matchSearch && s === filter.toLowerCase()
  })

  const getStatusStyle = (status) => {
    const s = (status || '').toLowerCase()
    switch (s) {
      case 'pending':
        return { bg: '#2a2a2a', color: '#888888' }
      case 'reviewing':
      case 'shortlisted':
        return { bg: '#4a5a00', color: '#CFFF00' }
      case 'interview':
        return { bg: '#1e3a5f', color: '#60a5fa' }
      case 'accepted':
      case 'approved':
        return { bg: '#14532d', color: '#22c55e' }
      case 'rejected':
        return { bg: '#450a0a', color: '#ef4444' }
      default:
        return { bg: '#2a2a2a', color: '#888888' }
    }
  }

  const formatStatusLabel = (status) => {
    const s = (status || '').toLowerCase()
    if (s === 'shortlisted') return 'Reviewing'
    if (s === 'approved') return 'Accepted'
    if (!s) return 'Pending'
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>
            Applicants
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#888888' }}>
            Review and manage internship applications
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ padding: '8px 16px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#CFFF00', borderRadius: '50%' }} />
            <span style={{ fontSize: '0.813rem', color: '#ffffff', fontWeight: '600' }}>{applicants.length} Total</span>
          </div>
          <div style={{ padding: '8px 16px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%' }} />
            <span style={{ fontSize: '0.813rem', color: '#ffffff', fontWeight: '600' }}>
              {applicants.filter((a) => a.status === 'pending').length} Pending
            </span>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', minWidth: '280px' }}>
          <Search size={16} style={{ color: '#888888', flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicants..."
            style={{ background: 'none', border: 'none', outline: 'none', color: '#ffffff', fontSize: '0.875rem', width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'Pending', 'Reviewing', 'Interview', 'Accepted', 'Rejected'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.813rem',
                fontWeight: '500',
                cursor: 'pointer',
                border: 'none',
                backgroundColor: filter === status ? '#CFFF00' : '#1a1a1a',
                color: filter === status ? '#000000' : '#888888',
                transition: 'all 0.2s',
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#888888' }}>Loading applicants...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                {['CANDIDATE', 'ROLE APPLIED', 'DATE', 'STATUS', 'ACTIONS'].map((h) => (
                  <th key={h} style={{ padding: '16px 20px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#888888', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.length > 0 ? (
                filteredApplicants.map((applicant, i) => {
                  const statusStyle = getStatusStyle(applicant.status)
                  const appliedRaw = applicant.applied_at || applicant.applied_date || applicant.created_at
                  return (
                    <tr
                      key={applicant.id}
                      style={{
                        borderBottom: i < filteredApplicants.length - 1 ? '1px solid #2a2a2a' : 'none',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#0f0f0f'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#CFFF00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.875rem', color: '#000', flexShrink: 0 }}>
                            {applicant.student_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'NA'}
                          </div>
                          <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#ffffff', marginBottom: '2px' }}>
                              {applicant.student_name || 'Unknown'}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#888888' }}>{applicant.student_email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <p style={{ fontSize: '0.875rem', color: '#ffffff', marginBottom: '2px' }}>{applicant.internship_title || 'N/A'}</p>
                        <p style={{ fontSize: '0.75rem', color: '#888888' }}>ID: #{applicant.id}</p>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <p style={{ fontSize: '0.875rem', color: '#888888' }}>
                          {appliedRaw
                            ? new Date(appliedRaw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'N/A'}
                        </p>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                          {formatStatusLabel(applicant.status)}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/company/applicants/${applicant.id}`)
                          }}
                          style={{ padding: '6px 16px', backgroundColor: 'transparent', border: '1px solid #CFFF00', borderRadius: '8px', color: '#CFFF00', fontSize: '0.813rem', fontWeight: '600', cursor: 'pointer' }}
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '56px', height: '56px', backgroundColor: '#0f0f0f', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={24} style={{ color: '#888888' }} />
                      </div>
                      <p style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff' }}>No applicants yet</p>
                      <p style={{ fontSize: '0.875rem', color: '#888888' }}>Applications will appear here once students apply</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
