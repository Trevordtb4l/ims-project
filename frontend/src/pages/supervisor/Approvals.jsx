import { useState, useEffect, useCallback } from 'react'
import { Check, X, Clock, FileText, MessageSquare, User } from 'lucide-react'
import api from '@/api/axios'
import { useToast } from '@/components/Toast.jsx'

function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border p-5 animate-pulse" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full" style={{ backgroundColor: '#2a2a2a' }} />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded" style={{ backgroundColor: '#2a2a2a' }} />
          <div className="h-3 w-20 rounded" style={{ backgroundColor: '#2a2a2a' }} />
        </div>
      </div>
      <div className="h-3 w-full rounded mb-2" style={{ backgroundColor: '#2a2a2a' }} />
      <div className="h-3 w-3/4 rounded mb-4" style={{ backgroundColor: '#2a2a2a' }} />
      <div className="border-t my-3" style={{ borderColor: '#2a2a2a' }} />
      <div className="flex gap-2">
        <div className="h-9 w-24 rounded-xl" style={{ backgroundColor: '#2a2a2a' }} />
        <div className="h-9 w-24 rounded-xl" style={{ backgroundColor: '#2a2a2a' }} />
      </div>
    </div>
  )
}

export default function Approvals() {
  const [activeTab, setActiveTab] = useState('pending')
  const [pendingLogbooks, setPendingLogbooks] = useState([])
  const [reviewedLogbooks, setReviewedLogbooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentModal, setCommentModal] = useState({ open: false, logbookId: null, action: null })
  const [comment, setComment] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const { toast } = useToast()

  const fetchLogbooks = useCallback(async () => {
    setLoading(true)

    try {
      const res = await api.get('/logbooks/?review_status=pending')
      const data = res.data
      setPendingLogbooks(Array.isArray(data) ? data : data.results || [])
    } catch {
      setPendingLogbooks([])
    }

    try {
      const res = await api.get('/logbooks/?review_status=approved')
      const data = res.data
      setReviewedLogbooks(Array.isArray(data) ? data : data.results || [])
    } catch {
      setReviewedLogbooks([])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchLogbooks()
  }, [fetchLogbooks])

  const handleApprove = async (id) => {
    try {
      setActionLoading(true)
      await api.patch(`/logbooks/${id}/`, { review_status: 'approved', supervisor_comment: '' })
      toast('Logbook approved')
      fetchLogbooks()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to approve logbook', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    try {
      setActionLoading(true)
      await api.patch(`/logbooks/${commentModal.logbookId}/`, {
        review_status: 'needs_revision',
        supervisor_comment: comment,
      })
      setCommentModal({ open: false, logbookId: null, action: null })
      setComment('')
      toast('Logbook rejected')
      fetchLogbooks()
    } catch (err) {
      toast(err.response?.data?.detail || 'Failed to reject logbook', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0f0f0f' }}>
      <h1 className="text-2xl font-bold text-white mb-6">Logbook Approvals</h1>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className="flex items-center transition-colors"
          style={
            activeTab === 'pending'
              ? { backgroundColor: '#CFFF00', color: '#000', fontWeight: 700, borderRadius: 12, padding: '10px 20px' }
              : { backgroundColor: '#1a1a1a', color: '#888888', border: '1px solid #2a2a2a', borderRadius: 12, padding: '10px 20px' }
          }
          onMouseEnter={(e) => {
            if (activeTab !== 'pending') e.currentTarget.style.borderColor = '#CFFF00'
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'pending') e.currentTarget.style.borderColor = '#2a2a2a'
          }}
        >
          Pending
          {pendingLogbooks.length > 0 && (
            <span
              className="text-xs rounded-full px-2 ml-1 font-semibold"
              style={{ backgroundColor: '#CFFF00', color: '#000' }}
            >
              {pendingLogbooks.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('reviewed')}
          className="transition-colors"
          style={
            activeTab === 'reviewed'
              ? { backgroundColor: '#CFFF00', color: '#000', fontWeight: 700, borderRadius: 12, padding: '10px 20px' }
              : { backgroundColor: '#1a1a1a', color: '#888888', border: '1px solid #2a2a2a', borderRadius: 12, padding: '10px 20px' }
          }
          onMouseEnter={(e) => {
            if (activeTab !== 'reviewed') e.currentTarget.style.borderColor = '#CFFF00'
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'reviewed') e.currentTarget.style.borderColor = '#2a2a2a'
          }}
        >
          Reviewed
        </button>
      </div>

      {/* Pending tab */}
      {activeTab === 'pending' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : pendingLogbooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Clock className="mb-3" size={40} style={{ color: '#888888' }} />
              <p style={{ color: '#888888' }} className="text-sm">No pending approvals</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingLogbooks.map((logbook) => (
                <div
                  key={logbook.id}
                  className="rounded-2xl border p-5"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{ backgroundColor: '#CFFF00', color: '#000' }}
                    >
                      {getInitials(logbook.student_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold text-sm">{logbook.student_name}</span>
                        <span
                          className="rounded-full px-2 py-0.5 text-xs"
                          style={{ backgroundColor: '#2a2a2a', color: '#888888' }}
                        >
                          Logbook Week {logbook.week_number}
                        </span>
                      </div>
                      {logbook.company_name && (
                        <p className="text-xs mt-0.5" style={{ color: '#888888' }}>
                          {logbook.company_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-xs mb-2" style={{ color: '#888888' }}>
                    Submitted: {formatDate(logbook.submitted_at)}
                  </p>

                  {logbook.activities && (
                    <p className="text-sm mb-1 line-clamp-3" style={{ color: '#888888' }}>
                      {logbook.activities.length > 120
                        ? logbook.activities.slice(0, 120) + '…'
                        : logbook.activities}
                    </p>
                  )}

                  <div className="border-t my-3" style={{ borderColor: '#2a2a2a' }} />

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(logbook.id)}
                      disabled={actionLoading}
                      className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-50"
                      style={{ backgroundColor: '#14532d', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}
                    >
                      <Check size={14} />
                      Approve
                    </button>
                    <button
                      onClick={() => setCommentModal({ open: true, logbookId: logbook.id, action: 'needs_revision' })}
                      className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-opacity"
                      style={{ backgroundColor: '#450a0a', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                    >
                      <X size={14} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Reviewed tab */}
      {activeTab === 'reviewed' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : reviewedLogbooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <FileText className="mb-3" size={40} style={{ color: '#888888' }} />
              <p style={{ color: '#888888' }} className="text-sm">No reviewed logbooks yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviewedLogbooks.map((logbook) => (
                <div
                  key={logbook.id}
                  className="rounded-2xl border p-5"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{ backgroundColor: '#CFFF00', color: '#000' }}
                    >
                      {getInitials(logbook.student_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold text-sm">{logbook.student_name}</span>
                        <span
                          className="rounded-full px-2 py-0.5 text-xs"
                          style={{ backgroundColor: '#2a2a2a', color: '#888888' }}
                        >
                          Logbook Week {logbook.week_number}
                        </span>
                      </div>
                      {logbook.company_name && (
                        <p className="text-xs mt-0.5" style={{ color: '#888888' }}>
                          {logbook.company_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-xs mb-3" style={{ color: '#888888' }}>
                    Submitted: {formatDate(logbook.submitted_at)}
                  </p>

                  {logbook.activities && (
                    <p className="text-sm mb-1 line-clamp-3" style={{ color: '#888888' }}>
                      {logbook.activities.length > 120
                        ? logbook.activities.slice(0, 120) + '…'
                        : logbook.activities}
                    </p>
                  )}

                  <div className="border-t my-3" style={{ borderColor: '#2a2a2a' }} />

                  <div className="flex items-center justify-between">
                    <span
                      className="rounded-xl px-3 py-1 text-xs font-semibold"
                      style={
                        logbook.review_status === 'approved'
                          ? { backgroundColor: '#14532d', color: '#22c55e' }
                          : { backgroundColor: '#450a0a', color: '#ef4444' }
                      }
                    >
                      {logbook.review_status === 'approved' ? 'Approved' : 'Needs Revision'}
                    </span>
                    {logbook.reviewed_at && (
                      <span className="text-xs" style={{ color: '#888888' }}>
                        Reviewed: {formatDate(logbook.reviewed_at)}
                      </span>
                    )}
                  </div>

                  {logbook.supervisor_comment && (
                    <div className="rounded-xl p-3 mt-3 flex items-start gap-2" style={{ backgroundColor: '#2a2a2a' }}>
                      <MessageSquare size={14} className="shrink-0 mt-0.5" style={{ color: '#888888' }} />
                      <p className="text-sm text-white">{logbook.supervisor_comment}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Comment modal */}
      {commentModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={() => {
            if (!actionLoading) {
              setCommentModal({ open: false, logbookId: null, action: null })
              setComment('')
            }
          }}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-md border"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-white mb-1">Reject Logbook</h2>
            <p className="text-sm mb-4" style={{ color: '#888888' }}>
              Add a comment explaining why
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your feedback..."
              className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              style={{
                backgroundColor: '#2a2a2a',
                border: '1px solid #2a2a2a',
                minHeight: 100,
              }}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setCommentModal({ open: false, logbookId: null, action: null })
                  setComment('')
                }}
                disabled={actionLoading}
                className="rounded-xl px-4 py-2.5 text-sm text-white transition-opacity disabled:opacity-50"
                style={{ border: '1px solid #2a2a2a' }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-opacity disabled:opacity-50"
                style={{ backgroundColor: '#ef4444' }}
              >
                {actionLoading ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
