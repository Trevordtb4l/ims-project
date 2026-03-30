import { useState, useRef, useEffect } from 'react'
import { Search, Send } from 'lucide-react'

const C = {
  bg: '#0f0f0f', card: '#1a1a1a', accent: '#CFFF00',
  white: '#ffffff', muted: '#888888', border: '#2a2a2a', olive: '#4a5a00',
}

const CONVERSATIONS = [
  { id: 1, name: 'Dr. Kolle', role: 'Academic Supervisor', avatar: 'DK', lastMessage: 'Your Week 8 logbook has been approved.', time: '10:00 AM', unread: 1, online: true },
  { id: 2, name: 'Orange Cameroon HR', role: 'Company Representative', avatar: 'OC', lastMessage: 'Welcome aboard! Please report on Monday.', time: '9:00 AM', unread: 0, online: true },
  { id: 3, name: 'IMS Coordinator', role: 'Internship Coordinator', avatar: 'IC', lastMessage: 'Your internship placement has been confirmed.', time: 'Yesterday', unread: 0, online: false },
]

const MESSAGES = {
  1: [
    { id: 1, sender: 'them', text: 'Hello Andeh, I have reviewed your Week 5 logbook. Good progress.', time: '9:00 AM' },
    { id: 2, sender: 'me', text: 'Thank you Dr. Kolle! I will keep up the good work.', time: '9:15 AM' },
    { id: 3, sender: 'them', text: 'Make sure to document your API integration work in detail.', time: '9:30 AM' },
    { id: 4, sender: 'me', text: 'Understood. I will add more technical details in my next entry.', time: '9:45 AM' },
    { id: 5, sender: 'them', text: 'Your Week 8 logbook has been approved. Outstanding performance.', time: '10:00 AM' },
  ],
  2: [
    { id: 1, sender: 'them', text: 'Dear Andeh Trevor, your internship application has been accepted.', time: '8:00 AM' },
    { id: 2, sender: 'me', text: 'Thank you so much! I am very excited to join Orange Cameroon.', time: '8:30 AM' },
    { id: 3, sender: 'them', text: 'Welcome aboard! Please report on Monday at 8:00 AM.', time: '9:00 AM' },
  ],
  3: [
    { id: 1, sender: 'them', text: 'Dear Andeh, your internship placement at Orange Cameroon has been confirmed.', time: 'Yesterday' },
    { id: 2, sender: 'me', text: 'Thank you for the placement. I look forward to the experience.', time: 'Yesterday' },
    { id: 3, sender: 'them', text: 'Your internship placement has been confirmed. Best of luck!', time: 'Yesterday' },
  ],
}

export default function StudentMessages() {
  const [conversations, setConversations] = useState(CONVERSATIONS)
  const [selected, setSelected] = useState(CONVERSATIONS[0])
  const [messages, setMessages] = useState([...MESSAGES[1]])
  const [newMessage, setNewMessage] = useState('')
  const [search, setSearch] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const filtered = conversations.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  const handleSelect = (conv) => {
    setSelected(conv)
    setMessages([...(MESSAGES[conv.id] || [])])
    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c))
  }

  const handleSend = () => {
    if (!newMessage.trim()) return
    const msg = {
      id: Date.now(),
      sender: 'me',
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, msg])
    setConversations(prev => prev.map(c => c.id === selected?.id ? { ...c, lastMessage: newMessage.trim(), time: msg.time } : c))
    setNewMessage('')
  }

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', gap: 0, backgroundColor: C.bg }}>

      {/* Sidebar */}
      <div style={{ width: 320, flexShrink: 0, backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '16px 0 0 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 16px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: 10 }}>
            <Search size={15} color={C.muted} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..."
              style={{ background: 'none', border: 'none', outline: 'none', color: C.white, fontSize: '0.875rem', width: '100%' }}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.map(conv => (
            <div
              key={conv.id}
              onClick={() => handleSelect(conv)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', cursor: 'pointer',
                backgroundColor: selected?.id === conv.id ? 'rgba(207,255,0,0.06)' : 'transparent',
                borderLeft: selected?.id === conv.id ? `3px solid ${C.accent}` : '3px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: '#000' }}>
                  {conv.avatar}
                </div>
                {conv.online && <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22c55e', border: `2px solid ${C.card}` }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: C.white, margin: 0 }}>{conv.name}</p>
                  <span style={{ fontSize: '0.72rem', color: C.muted }}>{conv.time}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: C.muted, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.role}</p>
                <p style={{ fontSize: '0.75rem', color: C.muted, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#000', flexShrink: 0 }}>
                  {conv.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: C.card, border: `1px solid ${C.border}`, borderLeft: 'none', borderRadius: '0 16px 16px 0' }}>
        {/* Chat Header */}
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: '#000' }}>
              {selected?.avatar}
            </div>
            {selected?.online && <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22c55e', border: `2px solid ${C.card}` }} />}
          </div>
          <div>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: C.white, margin: 0 }}>{selected?.name}</p>
            <p style={{ fontSize: '0.75rem', color: '#22c55e', margin: 0 }}>
              {selected?.online ? '● Online' : '○ Offline'} · {selected?.role}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '65%', padding: '12px 16px', borderRadius: msg.sender === 'me' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                backgroundColor: msg.sender === 'me' ? C.accent : '#2a2a2a',
                color: msg.sender === 'me' ? '#000' : C.white,
              }}>
                <p style={{ fontSize: '0.875rem', margin: '0 0 4px', lineHeight: 1.5 }}>{msg.text}</p>
                <p style={{ fontSize: '0.7rem', margin: 0, opacity: 0.7, textAlign: 'right' }}>{msg.time}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div style={{ padding: '16px 24px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type a message... (Enter to send)"
            style={{ flex: 1, padding: '12px 16px', backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, color: C.white, fontSize: '0.875rem', outline: 'none' }}
            onFocus={e => e.target.style.borderColor = C.accent}
            onBlur={e => e.target.style.borderColor = C.border}
          />
          <button
            onClick={handleSend}
            style={{ width: 44, height: 44, backgroundColor: C.accent, border: 'none', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Send size={18} color="#000" />
          </button>
        </div>
      </div>
    </div>
  )
}
