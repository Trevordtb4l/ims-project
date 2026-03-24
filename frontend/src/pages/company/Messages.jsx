import { useState, useRef, useEffect } from 'react'
import { Search, Send, ChevronLeft, MessageSquare } from 'lucide-react'

const initialConversations = [
  { id: 1, name: 'Trevor Andeh', role: 'Software Engineering Intern', avatar: 'TA', lastMessage: 'Thank you for the opportunity!', time: '2:30 PM', unread: 2, online: true },
  { id: 2, name: 'Mulema Haaris', role: 'Backend Developer Intern', avatar: 'MH', lastMessage: 'I will complete the task by Friday.', time: '1:45 PM', unread: 1, online: true },
  { id: 3, name: 'Frankline Neba', role: 'UI/UX Design Intern', avatar: 'FN', lastMessage: 'The designs are ready for review.', time: '12:30 PM', unread: 0, online: false },
  { id: 4, name: 'Austine Mbah', role: 'Data Analyst Intern', avatar: 'AM', lastMessage: 'Can we schedule a meeting tomorrow?', time: '11:15 AM', unread: 3, online: true },
  { id: 5, name: 'Epie Samuel', role: 'Mobile Developer Intern', avatar: 'ES', lastMessage: 'The app build is ready for testing.', time: '10:00 AM', unread: 0, online: false },
  { id: 6, name: 'Lamine Yamal', role: 'Frontend Developer Intern', avatar: 'LY', lastMessage: 'I submitted my weekly logbook.', time: '9:30 AM', unread: 1, online: true },
  { id: 7, name: 'Alice Johnson', role: 'Product Manager Intern', avatar: 'AJ', lastMessage: 'When does the internship start?', time: 'Yesterday', unread: 0, online: false },
  { id: 8, name: 'Bob Smith', role: 'DevOps Intern', avatar: 'BS', lastMessage: 'I have submitted my logbook.', time: 'Yesterday', unread: 1, online: true },
  { id: 9, name: 'Chloe Martin', role: 'Cybersecurity Intern', avatar: 'CM', lastMessage: 'The security audit report is done.', time: 'Yesterday', unread: 0, online: false },
  { id: 10, name: 'David Okonkwo', role: 'Machine Learning Intern', avatar: 'DO', lastMessage: 'Model accuracy is now at 94%.', time: 'Mon', unread: 0, online: false },
  { id: 11, name: 'Emma Wilson', role: 'Content Marketing Intern', avatar: 'EW', lastMessage: 'Blog post is ready for publishing.', time: 'Mon', unread: 2, online: true },
  { id: 12, name: 'Felix Nguema', role: 'Cloud Engineering Intern', avatar: 'FN', lastMessage: 'AWS setup is complete.', time: 'Mon', unread: 0, online: false },
  { id: 13, name: 'Grace Tabi', role: 'QA Testing Intern', avatar: 'GT', lastMessage: 'Found 3 bugs in the latest build.', time: 'Sun', unread: 1, online: false },
  { id: 14, name: 'Henry Bate', role: 'Database Intern', avatar: 'HB', lastMessage: 'Database migration successful.', time: 'Sun', unread: 0, online: false },
  { id: 15, name: 'Iris Fomum', role: 'Graphic Design Intern', avatar: 'IF', lastMessage: 'Logo redesign attached.', time: 'Sat', unread: 0, online: true },
  { id: 16, name: 'James Eko', role: 'Network Engineering Intern', avatar: 'JE', lastMessage: 'Network configuration updated.', time: 'Sat', unread: 0, online: false },
  { id: 17, name: 'Karen Ndi', role: 'HR Intern', avatar: 'KN', lastMessage: 'Onboarding documents sent.', time: 'Fri', unread: 0, online: false },
  { id: 18, name: 'Leo Ngwa', role: 'Finance Intern', avatar: 'LN', lastMessage: 'Q1 report is ready.', time: 'Fri', unread: 0, online: true },
  { id: 19, name: 'Maya Sone', role: 'Research Intern', avatar: 'MS', lastMessage: 'Research paper draft submitted.', time: 'Thu', unread: 0, online: false },
]

const initialMessages = {
  1: [
    { id: 1, sender: 'them', text: 'Hello! I just received my acceptance letter.', time: '2:00 PM' },
    { id: 2, sender: 'me', text: 'Welcome aboard Trevor! We are excited to have you.', time: '2:15 PM' },
    { id: 3, sender: 'them', text: 'Thank you for the opportunity!', time: '2:30 PM' },
  ],
  2: [
    { id: 1, sender: 'them', text: 'Hi, I have been working on the authentication module.', time: '1:00 PM' },
    { id: 2, sender: 'me', text: 'Great progress Mulema! How far along are you?', time: '1:20 PM' },
    { id: 3, sender: 'them', text: 'About 80% done. I will complete the task by Friday.', time: '1:45 PM' },
  ],
  3: [
    { id: 1, sender: 'them', text: 'I have finished the wireframes for the dashboard.', time: '11:00 AM' },
    { id: 2, sender: 'me', text: 'Excellent work Frankline! Please share the files.', time: '12:00 PM' },
    { id: 3, sender: 'them', text: 'The designs are ready for review.', time: '12:30 PM' },
  ],
  4: [
    { id: 1, sender: 'them', text: 'Good morning! I have finished the data analysis report.', time: '9:00 AM' },
    { id: 2, sender: 'me', text: 'Good morning Austine! Please send it over.', time: '10:00 AM' },
    { id: 3, sender: 'them', text: 'Can we schedule a meeting tomorrow to discuss findings?', time: '11:15 AM' },
  ],
  5: [
    { id: 1, sender: 'them', text: 'I have implemented the push notifications feature.', time: '9:00 AM' },
    { id: 2, sender: 'me', text: 'Well done Epie! Please write unit tests for it.', time: '9:30 AM' },
    { id: 3, sender: 'them', text: 'The app build is ready for testing.', time: '10:00 AM' },
  ],
  6: [
    { id: 1, sender: 'them', text: 'Hi! I have completed the landing page redesign.', time: '8:30 AM' },
    { id: 2, sender: 'me', text: 'Amazing work Lamine! Looks very professional.', time: '9:00 AM' },
    { id: 3, sender: 'them', text: 'I submitted my weekly logbook as well.', time: '9:30 AM' },
  ],
  7: [{ id: 1, sender: 'them', text: 'When does the internship start?', time: '11:15 AM' }],
  8: [{ id: 1, sender: 'them', text: 'Good morning! I have submitted my logbook.', time: 'Yesterday' }],
  9: [{ id: 1, sender: 'them', text: 'The security audit report is done. Found 2 vulnerabilities.', time: 'Yesterday' }],
  10: [{ id: 1, sender: 'them', text: 'Model accuracy is now at 94% after hyperparameter tuning.', time: 'Mon' }],
  11: [{ id: 1, sender: 'them', text: 'Blog post about our internship program is ready for publishing.', time: 'Mon' }],
  12: [{ id: 1, sender: 'them', text: 'AWS S3 and Lambda setup is complete. Ready for deployment.', time: 'Mon' }],
  13: [{ id: 1, sender: 'them', text: 'Found 3 bugs in the latest build. Will document them now.', time: 'Sun' }],
  14: [{ id: 1, sender: 'them', text: 'Database migration from MySQL to PostgreSQL successful.', time: 'Sun' }],
  15: [{ id: 1, sender: 'them', text: 'Logo redesign is complete. Attached the final files.', time: 'Sat' }],
  16: [{ id: 1, sender: 'them', text: 'Network configuration has been updated as requested.', time: 'Sat' }],
  17: [{ id: 1, sender: 'them', text: 'All onboarding documents have been sent to new interns.', time: 'Fri' }],
  18: [{ id: 1, sender: 'them', text: 'Q1 financial report is ready for your review.', time: 'Fri' }],
  19: [{ id: 1, sender: 'them', text: 'Research paper draft has been submitted for feedback.', time: 'Thu' }],
}

export default function Messages() {
  const [conversations, setConversations] = useState(initialConversations)
  const [threadMessages, setThreadMessages] = useState(() =>
    Object.fromEntries(Object.entries(initialMessages).map(([k, v]) => [Number(k), v.map((m) => ({ ...m }))]))
  )
  const [selectedConversation, setSelectedConversation] = useState(initialConversations[0])
  const [messages, setMessages] = useState(() => [...initialMessages[1]])
  const [newMessage, setNewMessage] = useState('')
  const [search, setSearch] = useState('')
  const [chatOpen, setChatOpen] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv)
    setMessages(initialMessages[conv.id] || [])
    setChatOpen(true)
    setConversations((prev) => prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c)))
  }

  const handleSend = () => {
    if (!newMessage.trim()) return

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }

    const convId = selectedConversation.id

    setMessages((prev) => [...prev, newMsg])
    setThreadMessages((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] || []), newMsg],
    }))
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId ? { ...c, lastMessage: newMessage.trim(), time: newMsg.time, unread: 0 } : c
      )
    )
    setSelectedConversation((prev) =>
      prev?.id === convId ? { ...prev, lastMessage: newMessage.trim(), time: newMsg.time, unread: 0 } : prev
    )

    setNewMessage('')
  }

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>Messages</h1>
        <p style={{ fontSize: '0.875rem', color: '#888888' }}>Communicate with your interns and applicants</p>
      </div>

      {/* Chat container — fixed height, flex children need minHeight:0 for nested scroll */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 320px) 1fr',
          backgroundColor: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: '16px',
          overflow: 'hidden',
          height: 'calc(100vh - 220px)',
          minHeight: '500px',
        }}
      >
        {/* LEFT — Conversations */}
        <div
          style={{
            borderRight: '1px solid #2a2a2a',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 0,
            overflow: 'hidden',
            backgroundColor: '#1a1a1a',
          }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid #2a2a2a', flexShrink: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                backgroundColor: '#0f0f0f',
                border: '1px solid #2a2a2a',
                borderRadius: '10px',
              }}
            >
              <Search size={14} style={{ color: '#888888', flexShrink: 0 }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '0.813rem',
                  width: '100%',
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: 'scroll', overflowX: 'hidden' }}>
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectConversation(conv)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelectConversation(conv)
                  }
                }}
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #2a2a2a',
                  backgroundColor: selectedConversation?.id === conv.id ? '#0f0f0f' : 'transparent',
                  borderLeft: selectedConversation?.id === conv.id ? '3px solid #CFFF00' : '3px solid transparent',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (selectedConversation?.id !== conv.id) {
                    e.currentTarget.style.backgroundColor = '#111111'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    selectedConversation?.id === conv.id ? '#0f0f0f' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: '#CFFF00',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '0.813rem',
                        color: '#000',
                      }}
                    >
                      {conv.avatar}
                    </div>
                    {conv.online && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '1px',
                          right: '1px',
                          width: '10px',
                          height: '10px',
                          backgroundColor: '#22c55e',
                          borderRadius: '50%',
                          border: '2px solid #1a1a1a',
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <p
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: '700',
                          color: '#ffffff',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '140px',
                        }}
                      >
                        {conv.name}
                      </p>
                      <span style={{ fontSize: '0.7rem', color: '#888888', flexShrink: 0 }}>{conv.time}</span>
                    </div>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: '#888888',
                        marginBottom: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {conv.role}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p
                        style={{
                          fontSize: '0.75rem',
                          color: '#888888',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                          maxWidth: '160px',
                        }}
                      >
                        {conv.lastMessage}
                      </p>
                      {conv.unread > 0 && (
                        <span
                          style={{
                            minWidth: '20px',
                            height: '20px',
                            backgroundColor: '#CFFF00',
                            borderRadius: '999px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            color: '#000',
                            flexShrink: 0,
                            marginLeft: '6px',
                            padding: '0 5px',
                          }}
                        >
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Chat Window */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 0,
            overflow: 'hidden',
            backgroundColor: '#1a1a1a',
          }}
        >
          {!chatOpen ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                minHeight: 0,
                padding: '24px',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: '#0f0f0f',
                  border: '1px solid #2a2a2a',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MessageSquare size={24} style={{ color: '#888888' }} />
              </div>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ffffff', margin: 0 }}>Select a conversation</p>
              <p style={{ fontSize: '0.813rem', color: '#888888', margin: 0, textAlign: 'center' }}>
                Choose from your conversations on the left
              </p>
            </div>
          ) : (
            <>
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #2a2a2a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexShrink: 0,
                  backgroundColor: '#1a1a1a',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#CFFF00',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '0.813rem',
                      color: '#000',
                    }}
                  >
                    {selectedConversation?.avatar}
                  </div>
                  {selectedConversation?.online && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '1px',
                        right: '1px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#22c55e',
                        borderRadius: '50%',
                        border: '2px solid #1a1a1a',
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>{selectedConversation?.name}</p>
                  <p style={{ fontSize: '0.75rem', margin: 0 }}>
                    <span style={{ color: selectedConversation?.online ? '#22c55e' : '#888888' }}>
                      {selectedConversation?.online ? '● Online' : '○ Offline'}
                    </span>
                    <span style={{ color: '#888888' }}> · {selectedConversation?.role}</span>
                  </p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => setChatOpen(false)}
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#0f0f0f',
                      border: '1px solid #2a2a2a',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#888888',
                    }}
                    title="Close chat"
                  >
                    <ChevronLeft size={16} style={{ color: '#888888' }} />
                  </button>
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {messages.map((msg, i) => (
                  <div key={`${msg.id}-${i}`} style={{ display: 'flex', justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start' }}>
                    <div
                      style={{
                        maxWidth: '65%',
                        padding: '10px 14px',
                        borderRadius: msg.sender === 'me' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        backgroundColor: msg.sender === 'me' ? '#CFFF00' : '#0f0f0f',
                        border: msg.sender === 'me' ? 'none' : '1px solid #2a2a2a',
                      }}
                    >
                      <p style={{ fontSize: '0.875rem', color: msg.sender === 'me' ? '#000000' : '#ffffff', lineHeight: '1.5', margin: 0 }}>{msg.text}</p>
                      <p
                        style={{
                          fontSize: '0.7rem',
                          color: msg.sender === 'me' ? '#4a5a00' : '#888888',
                          marginTop: '4px',
                          textAlign: 'right',
                          marginBottom: 0,
                        }}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div
                style={{
                  padding: '16px 20px',
                  borderTop: '1px solid #2a2a2a',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  flexShrink: 0,
                  backgroundColor: '#1a1a1a',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    backgroundColor: '#0f0f0f',
                    border: '1px solid #2a2a2a',
                    borderRadius: '12px',
                    minWidth: 0,
                  }}
                >
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="Type a message... (Enter to send)"
                    style={{
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      width: '100%',
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: newMessage.trim() ? '#CFFF00' : '#2a2a2a',
                    border: 'none',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                >
                  <Send size={20} style={{ color: newMessage.trim() ? '#000000' : '#555555' }} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
