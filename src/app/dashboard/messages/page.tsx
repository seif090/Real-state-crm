"use client"

import { useState } from "react"
import { 
  Search, 
  Send, 
  User, 
  Sparkles,
  CheckCheck,
  Phone,
  Video,
  Info
} from "lucide-react"

const contacts = [
  { id: "1", name: "محمد علي", lastMsg: "بكم سعر الشقة في رويال؟", time: "10:30 ص", unread: 2, status: "online" },
  { id: "2", name: "سارة محمود", lastMsg: "تمام، شكراً جزيلاً", time: "أمس", unread: 0, status: "offline" },
  { id: "3", name: "أحمد حسن", lastMsg: "أريد حجز موعد للمعاينة", time: "الإثنين", unread: 0, status: "online" },
]

const messages = [
  { id: "1", text: "أهلاً بك، كيف يمكنني مساعدتك؟", time: "10:25 ص", isMe: true },
  { id: "2", text: "كنت أبحث عن أسعار الشقق في مشروع رويال ريزيدنس بالتجمع", time: "10:28 ص", isMe: false },
  { id: "3", text: "بالطبع، الوحدات المتاحة تبدأ من 3.5 مليون جنيه.", time: "10:29 ص", isMe: true },
  { id: "4", text: "هل يوجد مساحات أكبر من 150 متر؟", time: "10:30 ص", isMe: false },
]

export default function MessagesPage() {
  const [activeContact, setActiveContact] = useState(contacts[0])
  const [testMsg, setTestMsg] = useState("")
  const [isSimulating, setIsSimulating] = useState(false)

  const handleSimulate = () => {
    setIsSimulating(true)
    // Simulate AI thinking
    setTimeout(() => {
      setIsSimulating(false)
      setTestMsg("")
      alert("تمت محاكاة وصول رسالة جديدة بنجاح! تحقق من لوحة التحكم لرؤية تقييم العميل الجديد.")
    }, 1500)
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 340px', 
      height: 'calc(100vh - 120px)',
      gap: '0',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      border: '1px solid var(--border)'
    }}>
      
      {/* Chat Window (Left in RTL) */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.01)' }}>
        {/* ... Chat Header ... */}
        <header style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glass)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--primary-glow)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <User size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem' }}>{activeContact.name}</h3>
              <span style={{ fontSize: '0.75rem', color: activeContact.status === 'online' ? 'var(--primary)' : 'var(--muted)' }}>
                {activeContact.status === 'online' ? 'متصل الآن' : 'غير متصل'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', color: 'var(--muted)' }}>
            <Phone size={20} cursor="pointer" />
            <Video size={20} cursor="pointer" />
            <Info size={20} cursor="pointer" />
          </div>
        </header>

        {/* Message List */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ 
              alignSelf: msg.isMe ? 'flex-start' : 'flex-end', 
              maxWidth: '70%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.isMe ? 'flex-start' : 'flex-end'
            }}>
              <div style={{ 
                padding: '12px 18px', 
                borderRadius: msg.isMe ? '20px 20px 20px 4px' : '20px 20px 4px 20px',
                background: msg.isMe ? 'var(--primary)' : 'var(--glass)',
                color: msg.isMe ? '#000' : 'var(--foreground)',
                fontSize: '0.95rem'
              }}>
                {msg.text}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {msg.time}
                {msg.isMe && <CheckCheck size={14} color="var(--primary)" />}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <footer style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', background: 'var(--background)' }}>
          <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
             {/* AI Suggestion Chip */}
             <div className="glass" style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: '1px solid var(--accent)' }}>
                <Sparkles size={14} color="var(--accent)" />
                <span style={{ color: 'var(--accent)' }}>اقتراح ذكي: نعم، لدينا مساحات تبدأ من 180 متر</span>
             </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="اكتب رسالة..." 
              style={{ flex: 1, padding: '12px 16px', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '24px', color: 'var(--foreground)', outline: 'none' }}
            />
            <button className="btn btn-primary" style={{ padding: '10px', borderRadius: '50%' }}>
              <Send size={20} />
            </button>
          </div>
        </footer>
      </div>

      {/* Contacts List (Right in RTL) */}
      <div style={{ borderRight: '1px solid var(--border)', background: 'var(--glass)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px' }}>
          {/* Simulation Tool */}
          <div className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid var(--primary-glow)' }}>
            <h4 style={{ fontSize: '0.85rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="var(--primary)" />
              محاكي رسائل واتساب (تجربة AI)
            </h4>
            <input 
              type="text" 
              placeholder="أدخل رسالة كعميل..." 
              value={testMsg}
              onChange={(e) => setTestMsg(e.target.value)}
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: '8px', color: 'var(--foreground)', width: '100%', marginBottom: '8px', outline: 'none', fontSize: '0.85rem' }}
            />
            <button 
              onClick={handleSimulate}
              disabled={isSimulating || !testMsg}
              className="btn btn-primary" 
              style={{ width: '100%', fontSize: '0.8rem', padding: '8px' }}
            >
              {isSimulating ? "جاري المعالجة..." : "إرسال كعميل"}
            </button>
          </div>

          <div className="glass" style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <Search size={18} color="var(--muted)" />
            <input 
              type="text" 
              placeholder="البحث في الرسائل..." 
              style={{ background: 'transparent', border: 'none', color: 'var(--foreground)', outline: 'none', width: '100%' }}
            />
          </div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>المحادثات</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {contacts.map((contact) => (
              <div 
                key={contact.id} 
                onClick={() => setActiveContact(contact)}
                style={{ 
                  padding: '12px', 
                  borderRadius: 'var(--radius-md)', 
                  cursor: 'pointer',
                  background: activeContact.id === contact.id ? 'var(--primary-glow)' : 'transparent',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: activeContact.id === contact.id ? 'var(--primary)' : 'inherit' }}>{contact.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{contact.time}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                    {contact.lastMsg}
                  </p>
                  {contact.unread > 0 && (
                    <span style={{ background: 'var(--primary)', color: '#000', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
