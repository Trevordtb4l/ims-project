import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Clock, Eye, Search } from 'lucide-react'
import api from '@/api/axios'

const mockPending = [
  { id: 1, student_id: 1, student_name: 'Trevor Andeh', company_name: 'TechNova Cameroon', week_number: 4, activities: 'Worked on the backend authentication module using Django REST Framework. Implemented JWT token refresh logic and wrote unit tests for all auth endpoints.', submitted_at: '2026-03-20T10:30:00Z', review_status: 'pending', avatar: 'TA' },
  { id: 2, student_id: 2, student_name: 'Mulema Haaris', company_name: 'DataFlow Inc', week_number: 7, activities: 'Completed the database schema migration and optimized slow queries. Reduced average query time from 2.3s to 0.4s using proper indexing strategies.', submitted_at: '2026-03-19T14:15:00Z', review_status: 'pending', avatar: 'MH' },
  { id: 3, student_id: 4, student_name: 'Austine Mbah', company_name: 'CloudBase Ltd', week_number: 9, activities: 'Deployed the staging environment on AWS EC2 and configured auto-scaling. Set up CloudWatch monitoring and alerts for the production pipeline.', submitted_at: '2026-03-18T09:00:00Z', review_status: 'pending', avatar: 'AM' },
]

const mockReviewed = [
  { id: 4, student_id: 3, student_name: 'Frankline Neba', company_name: 'CreativeHub', week_number: 2, activities: 'Completed UI wireframes for the main dashboard and presented to the design team.', submitted_at: '2026-03-15T11:00:00Z', review_status: 'approved', supervisor_comment: 'Excellent work on the wireframes.', reviewed_at: '2026-03-16T09:00:00Z', avatar: 'FN' },
  { id: 5, student_id: 5, student_name: 'Epie Samuel', company_name: 'MobileSoft', week_number: 6, activities: 'Built the push notification system for iOS and Android using Firebase Cloud Messaging.', submitted_at: '2026-03-10T13:00:00Z', review_status: 'needs_revision', supervisor_comment: 'Please provide more detail on the implementation approach.', reviewed_at: '2026-03-11T10:00:00Z', avatar: 'ES' },
]

function isApproved(status) {
  return status === 'approved'
}

export default function Approvals() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('pending')
  const [pendingList, setPendingList] = useState(mockPending)
  const [reviewedList, setReviewedList] = useState(mockReviewed)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [rejectingId, setRejectingId] = useState(null)
  const [comment, setComment] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const [r1, r2, r3] = await Promise.allSettled([
          api.get('/logbooks/?review_status=pending'),
          api.get('/logbooks/?review_status=approved'),
          api.get('/logbooks/?review_status=needs_revision'),
        ])
        if (r1.status === 'fulfilled') {
          const data = r1.value.data?.results || r1.value.data || []
          if (Array.isArray(data) && data.length > 0) setPendingList(data)
        }
        const approved = r2.status === 'fulfilled' ? r2.value.data?.results || r2.value.data || [] : []
        const needsRev = r3.status === 'fulfilled' ? r3.value.data?.results || r3.value.data || [] : []
        const merged = [...(Array.isArray(approved) ? approved : []), ...(Array.isArray(needsRev) ? needsRev : [])]
        if (merged.length > 0) {
          merged.sort((a, b) => {
            const ta = a.reviewed_at ? new Date(a.reviewed_at).getTime() : 0
            const tb = b.reviewed_at ? new Date(b.reviewed_at).getTime() : 0
            return tb - ta
          })
          setReviewedList(merged)
        }
      } catch (err) {
        console.log('Using mock data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchApprovals()
  }, [])

  const handleApprove = async (id) => {
    try {
      await api.patch(`/logbooks/${id}/`, { review_status: 'approved', supervisor_comment: 'Approved' })
      const item = pendingList.find((p) => p.id === id)
      setPendingList((prev) => prev.filter((p) => p.id !== id))
      setReviewedList((prev) => [
        ...prev,
        {
          ...item,
          review_status: 'approved',
          reviewed_at: new Date().toISOString(),
          supervisor_comment: 'Approved',
        },
      ])
    } catch (err) {
      console.log('Approve error:', err.response?.data)
    }
  }

  const handleReject = async (id) => {
    try {
      await api.patch(`/logbooks/${id}/`, {
        review_status: 'needs_revision',
        supervisor_comment: comment,
      })
      const item = pendingList.find((p) => p.id === id)
      setPendingList((prev) => prev.filter((p) => p.id !== id))
      setReviewedList((prev) => [
        ...prev,
        {
          ...item,
          review_status: 'needs_revision',
          supervisor_comment: comment,
          reviewed_at: new Date().toISOString(),
        },
      ])
      setRejectingId(null)
      setComment('')
    } catch (err) {
      console.log('Reject error:', err.response?.data)
    }
  }

  const currentList = activeTab === 'pending' ? pendingList : reviewedList
  const filteredList = currentList.filter((item) => {
    const name = item.student_name || ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>Approvals</h1>
          <p style={{ fontSize: '0.875rem', color: '#888888' }}>Review and approve student logbook submissions</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ padding: '8px 16px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }} />
            <span style={{ fontSize: '0.813rem', color: '#ffffff', fontWeight: '600' }}>{pendingList.length} Pending</span>
          </div>
          <div style={{ padding: '8px 16px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%' }} />
            <span style={{ fontSize: '0.813rem', color: '#ffffff', fontWeight: '600' }}>{reviewedList.length} Reviewed</span>
          </div>
        </div>
      </div>

      {/* Tabs + Search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '4px', padding: '6px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '14px' }}>
          {[
            { key: 'pending', label: 'Pending', count: pendingList.length },
            { key: 'reviewed', label: 'Reviewed', count: reviewedList.length },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '10px',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                backgroundColor: activeTab === tab.key ? '#CFFF00' : 'transparent',
                color: activeTab === tab.key ? '#000000' : '#888888',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
              <span
                style={{
                  padding: '1px 8px',
                  borderRadius: '999px',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  backgroundColor: activeTab === tab.key ? 'rgba(0,0,0,0.2)' : '#2a2a2a',
                  color: activeTab === tab.key ? '#000000' : '#888888',
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', minWidth: '280px', flex: '1 1 200px', maxWidth: '380px' }}>
          <Search size={15} style={{ color: '#888888', flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name..."
            style={{ background: 'none', border: 'none', outline: 'none', color: '#ffffff', fontSize: '0.875rem', width: '100%' }}
          />
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#888888' }}>Loading approvals...</div>
      ) : filteredList.length === 0 ? (
        <div style={{ padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={28} style={{ color: '#888888' }} />
          </div>
          <p style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff' }}>
            {activeTab === 'pending' ? 'No pending approvals' : 'No reviewed submissions'}
          </p>
          <p style={{ fontSize: '0.875rem', color: '#888888' }}>
            {activeTab === 'pending' ? 'All logbooks have been reviewed' : 'You have not reviewed any logbooks yet'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredList.map((item) => (
            <div
              key={item.id}
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '20px', transition: 'border-color 0.2s' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3a3a3a'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2a2a2a'
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: '#CFFF00',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '0.813rem',
                      color: '#000',
                      flexShrink: 0,
                    }}
                  >
                    {item.avatar || item.student_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff', marginBottom: '2px' }}>{item.student_name}</p>
                    <p style={{ fontSize: '0.813rem', color: '#888888' }}>
                      {item.company_name} · Week {item.week_number}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#888888' }}>
                    {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                  </span>
                  {activeTab === 'reviewed' && (
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: isApproved(item.review_status) ? '#14532d' : '#450a0a',
                        color: isApproved(item.review_status) ? '#22c55e' : '#ef4444',
                      }}
                    >
                      {isApproved(item.review_status) ? '✓ Approved' : '✗ Needs revision'}
                    </span>
                  )}
                </div>
              </div>

              {/* Activities */}
              <div style={{ backgroundColor: '#0f0f0f', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#888888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Activities</p>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#cccccc',
                    lineHeight: '1.6',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: expandedId === item.id ? 'unset' : 3,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {item.activities}
                </p>
                {item.activities?.length > 150 && (
                  <button
                    type="button"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    style={{ marginTop: '6px', background: 'none', border: 'none', color: '#CFFF00', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                  >
                    {expandedId === item.id ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>

              {/* Supervisor comment (reviewed) */}
              {item.supervisor_comment && activeTab === 'reviewed' && (
                <div style={{ padding: '12px 14px', backgroundColor: '#0f0f0f', borderRadius: '10px', borderLeft: '3px solid #CFFF00', marginBottom: '16px' }}>
                  <p style={{ fontSize: '0.75rem', color: '#888888', marginBottom: '4px' }}>Supervisor Comment</p>
                  <p style={{ fontSize: '0.875rem', color: '#ffffff' }}>{item.supervisor_comment}</p>
                </div>
              )}

              {/* Actions (pending only) */}
              {activeTab === 'pending' && (
                <>
                  {rejectingId === item.id ? (
                    <div>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment explaining the rejection..."
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          backgroundColor: '#0f0f0f',
                          border: '1px solid #2a2a2a',
                          borderRadius: '10px',
                          color: '#ffffff',
                          fontSize: '0.875rem',
                          outline: 'none',
                          resize: 'none',
                          marginBottom: '10px',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#ef4444'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#2a2a2a'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectingId(null)
                            setComment('')
                          }}
                          style={{
                            flex: 1,
                            padding: '10px',
                            backgroundColor: 'transparent',
                            border: '1px solid #2a2a2a',
                            borderRadius: '10px',
                            color: '#888888',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                        <button type="button" onClick={() => handleReject(item.id)} style={{ flex: 1, padding: '10px', backgroundColor: '#450a0a', border: '1px solid #ef4444', borderRadius: '10px', color: '#ef4444', fontSize: '0.875rem', fontWeight: '700', cursor: 'pointer' }}>
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => navigate(`/supervisor/students/${item.student_id ?? ''}`)}
                        disabled={!item.student_id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '10px 18px',
                          backgroundColor: 'transparent',
                          border: '1px solid #2a2a2a',
                          borderRadius: '10px',
                          color: '#ffffff',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: item.student_id ? 'pointer' : 'not-allowed',
                          opacity: item.student_id ? 1 : 0.5,
                        }}
                        onMouseEnter={(e) => {
                          if (item.student_id) e.currentTarget.style.borderColor = '#CFFF00'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#2a2a2a'
                        }}
                      >
                        <Eye size={15} /> View Profile
                      </button>
                      <button type="button" onClick={() => handleApprove(item.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: '#14532d', border: '1px solid #22c55e', borderRadius: '10px', color: '#22c55e', fontSize: '0.875rem', fontWeight: '700', cursor: 'pointer', minWidth: '120px' }}>
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button type="button" onClick={() => setRejectingId(item.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: '#450a0a', border: '1px solid #ef4444', borderRadius: '10px', color: '#ef4444', fontSize: '0.875rem', fontWeight: '700', cursor: 'pointer', minWidth: '120px' }}>
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
