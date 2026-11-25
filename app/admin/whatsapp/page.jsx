'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function getMessageStatus(status) {
  const statuses = {
    accepted: {
      label: 'تم قبول الطلب من Meta — بانتظار تأكيد التسليم',
      color: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
      icon: '◷',
    },
    sent: {
      label: 'تم الإرسال — ننتظر تأكيد التسليم',
      color: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
      icon: '✓',
    },
    delivered: {
      label: 'تم التسليم إلى جهاز المريض',
      color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
      icon: '✓✓',
    },
    read: {
      label: 'تمت القراءة',
      color: 'text-sky-300 bg-sky-500/10 border-sky-500/20',
      icon: '✓✓',
    },
    failed: {
      label: 'فشل إرسال الرسالة',
      color: 'text-red-300 bg-red-500/10 border-red-500/20',
      icon: '!',
    },
    pending: {
      label: 'بانتظار الإرسال',
      color: 'clinic-text-muted clinic-surface clinic-border',
      icon: '◷',
    },
  }

  return (
    statuses[status] || {
      label: status || 'غير محددة',
      color: 'clinic-text-muted clinic-surface clinic-border',
      icon: '?',
    }
  )
}

function MessageStatus({ message }) {
  const status = getMessageStatus(message.status)
  return (
    <div className="mt-2 space-y-1.5">
      <div className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[10px] ${status.color}`}>
        <span>{status.icon}</span>
        <span>{status.label}</span>
      </div>

      {message.status === 'failed' && (
        <div className="rounded-lg border border-red-500/25 bg-red-950/40 p-2.5 text-[11px] space-y-0.5 text-red-200">
          <p className="font-bold text-red-300">تفاصيل الخطأ:</p>
          {message.error_code && <p>الرمز: {message.error_code}</p>}
          {message.error_message && <p>{message.error_message}</p>}
          {message.error_details && <p className="opacity-80">{message.error_details}</p>}
        </div>
      )}
    </div>
  )
}

function WhatsAppInboxInner() {
  const searchParams = useSearchParams()
  const targetPhone = searchParams.get('phone') || ''
  const targetName = searchParams.get('name') || ''
  const autoOpenedRef = useRef(false)

  const [authenticated, setAuthenticated] = useState(null)
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [sendNotice, setSendNotice] = useState('')

  const loadConversations = useCallback(async () => {
    const response = await fetch('/api/whatsapp/conversations', { cache: 'no-store' })
    if (response.status === 401) {
      setAuthenticated(false)
      return []
    }
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'تعذر تحميل المحادثات')
    setAuthenticated(true)
    const list = result.conversations || []
    setConversations(list)
    return list
  }, [])

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return
    const response = await fetch(
      `/api/whatsapp/conversations?conversation_id=${encodeURIComponent(conversationId)}`,
      { cache: 'no-store' }
    )
    if (response.status === 401) {
      setAuthenticated(false)
      return
    }
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'تعذر تحميل الرسائل')
    setMessages(result.messages || [])
  }, [])

  const openConversation = useCallback(
    async (conversation) => {
      setSelected(conversation)
      setMessages([])
      setError('')
      setSendNotice('')
      try {
        await loadMessages(conversation.id)
        await fetch('/api/whatsapp/mark-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId: conversation.id }),
        })
        await loadConversations()
      } catch (err) {
        setError(err.message)
      }
    },
    [loadConversations, loadMessages]
  )

  useEffect(() => {
    fetch('/api/admin/session', { cache: 'no-store' })
      .then((res) => res.json())
      .then(async (data) => {
        setAuthenticated(Boolean(data.authenticated))
        if (data.authenticated) {
          await loadConversations()
        }
      })
      .catch(() => setAuthenticated(false))
      .finally(() => setLoading(false))
  }, [loadConversations])

  // فتح محادثة المريض تلقائيًا عند القدوم من زر واتساب بجوار كارت المريض
  useEffect(() => {
    if (!authenticated || !targetPhone || autoOpenedRef.current) return
    autoOpenedRef.current = true

    fetch('/api/whatsapp/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: targetPhone, patientName: targetName }),
    })
      .then((res) => res.json())
      .then(async (res) => {
        if (res?.conversation) {
          await openConversation(res.conversation)
        }
      })
      .catch((err) => setError(err.message || 'تعذر فتح محادثة المريض'))
  }, [authenticated, targetPhone, targetName, openConversation])

  useEffect(() => {
    if (!authenticated) return
    const timer = setInterval(() => loadConversations().catch(() => {}), 5000)
    return () => clearInterval(timer)
  }, [authenticated, loadConversations])

  useEffect(() => {
    if (!selected?.id) return
    loadMessages(selected.id).catch((err) => setError(err.message))
    const timer = setInterval(() => loadMessages(selected.id).catch(() => {}), 3000)
    return () => clearInterval(timer)
  }, [selected?.id, loadMessages])

  async function sendMessage(event) {
    event.preventDefault()
    if (!selected || !text.trim() || sending) return
    setSending(true)
    setError('')
    setSendNotice('')
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: selected.id, text: text.trim() }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'فشل إرسال الرسالة')
      setText('')
      setSendNotice(result.message || 'تم إرسال الطلب إلى WhatsApp، ننتظر تأكيد التسليم.')
      await loadMessages(selected.id)
      await loadConversations()
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  if (loading || authenticated === null) {
    return (
      <main className="min-h-screen clinic-main grid place-items-center text-sm">
        جاري التحقق من الجلسة...
      </main>
    )
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen clinic-main grid place-items-center p-6">
        <div className="text-center space-y-3">
          <p className="text-sm">يجب تسجيل الدخول إلى لوحة التحكم أولاً.</p>
          <Link href="/admin" className="inline-block clinic-accent-bg text-white px-5 py-2.5 rounded-xl text-xs font-bold">
            الانتقال إلى لوحة التحكم
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main dir="rtl" className="min-h-screen clinic-main p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <header className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-alexandria font-bold clinic-text">
              واتساب العيادة
            </h1>
            <p className="text-xs clinic-text-muted mt-0.5">
              إدارة محادثات المرضى ومتابعة حالة تسليم الرسائل داخل لوحة التحكم
            </p>
          </div>
          <Link
            href="/admin"
            className="clinic-card border clinic-border hover:clinic-surface px-4 py-2 rounded-xl text-xs font-bold shrink-0"
          >
            ← العودة للوحة التحكم
          </Link>
        </header>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            <strong>خطأ:</strong> {error}
          </div>
        )}

        {sendNotice && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            {sendNotice}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
          <aside className="rounded-2xl border clinic-border clinic-card overflow-hidden">
            <div className="p-4 border-b clinic-border">
              <h2 className="font-bold text-sm">المحادثات ({conversations.length})</h2>
            </div>
            <div className="max-h-[72vh] overflow-y-auto divide-y clinic-border">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => openConversation(conversation)}
                  className={`w-full text-right p-4 hover:clinic-surface transition ${
                    selected?.id === conversation.id ? 'clinic-surface' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs truncate">
                      {conversation.patient_name || conversation.phone}
                    </span>
                    {conversation.unread_count > 0 && (
                      <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs clinic-text-muted truncate mt-1.5">
                    {conversation.last_message || 'لا توجد رسائل بعد'}
                  </p>
                  <p className="text-[11px] clinic-text-muted mt-1" dir="ltr">
                    {conversation.phone}
                  </p>
                </button>
              ))}
              {conversations.length === 0 && (
                <p className="p-8 text-center clinic-text-muted text-xs">لا توجد محادثات حتى الآن</p>
              )}
            </div>
          </aside>

          <section className="rounded-2xl border clinic-border clinic-card min-h-[72vh] flex flex-col">
            {!selected ? (
              <div className="flex-1 grid place-items-center clinic-text-muted text-sm">
                اختر محادثة لعرض الرسائل
              </div>
            ) : (
              <>
                <div className="p-4 border-b clinic-border">
                  <h2 className="font-bold text-sm">{selected.patient_name || selected.phone}</h2>
                  <p className="text-xs clinic-text-muted" dir="ltr">
                    {selected.phone}
                  </p>
                </div>

                <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[58vh]">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.direction === 'outgoing' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs ${
                          message.direction === 'outgoing'
                            ? 'bg-emerald-900/70 text-white'
                            : 'clinic-surface clinic-text border clinic-border'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                        <div className="mt-1.5 text-[10px] opacity-60">
                          {new Date(message.created_at).toLocaleString('ar-EG')}
                        </div>
                        {message.direction === 'outgoing' && <MessageStatus message={message} />}
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <p className="text-center clinic-text-muted text-xs py-10">
                      لا توجد رسائل في هذه المحادثة بعد.
                    </p>
                  )}
                </div>

                <form onSubmit={sendMessage} className="p-3 border-t clinic-border flex gap-2">
                  <input
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="اكتب ردك..."
                    className="flex-1 min-w-0 rounded-xl clinic-surface border clinic-border px-4 py-2.5 text-xs outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sending || !text.trim()}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-bold disabled:opacity-40"
                  >
                    {sending ? 'إرسال...' : 'إرسال'}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

export default function WhatsAppAdminPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen clinic-main grid place-items-center text-sm">
          جاري التحميل...
        </main>
      }
    >
      <WhatsAppInboxInner />
    </Suspense>
  )
}
