
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function WhatsAppAdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function checkSession() {
    const response = await fetch('/api/admin/session', {
      cache: 'no-store',
    })

    const result = await response.json()

    setAuthenticated(Boolean(result.authenticated))
    setChecking(false)
  }

  async function loadConversations() {
    const response = await fetch('/api/whatsapp/conversations', {
      cache: 'no-store',
    })

    if (response.status === 401) {
      setAuthenticated(false)
      return
    }

    const result = await response.json()

    if (response.ok) {
      setConversations(result.conversations || [])
    }
  }

  async function loadMessages(conversation) {
    setSelected(conversation)

    const response = await fetch(
      `/api/whatsapp/conversations?conversation_id=${encodeURIComponent(conversation.id)}`,
      { cache: 'no-store' }
    )

    const result = await response.json()

    if (response.ok) {
      setMessages(result.messages || [])

      await fetch('/api/whatsapp/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: conversation.id }),
      }).catch(() => {})
    }
  }

  async function sendMessage(e) {
    e.preventDefault()

    if (!selected || !text.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selected.id,
          text,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'فشل الإرسال')
      }

      setText('')
      await loadMessages(selected)
      await loadConversations()
    } catch (err) {
      setError(err.message)
    }

    setLoading(false)
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin'
  }

  useEffect(() => {
    checkSession()
  }, [])

  useEffect(() => {
    if (!authenticated) return

    loadConversations()

    const interval = setInterval(loadConversations, 5000)

    return () => clearInterval(interval)
  }, [authenticated])

  useEffect(() => {
    if (!selected || !authenticated) return

    const interval = setInterval(() => {
      loadMessages(selected)
    }, 3000)

    return () => clearInterval(interval)
  }, [selected, authenticated])

  if (checking) {
    return (
      <div className="min-h-screen bg-[#1A050A] flex items-center justify-center text-white">
        جاري التحقق...
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#1A050A] flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <p>يجب تسجيل الدخول أولاً</p>
          <Link href="/admin" className="text-pink-400 underline">
            الذهاب إلى لوحة الإدارة
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#1A050A] text-white p-3 sm:p-6"
    >
      <div className="max-w-7xl mx-auto space-y-4">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-pink-300">
              محادثات WhatsApp
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              صندوق رسائل المرضى
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin"
              className="bg-[#3A0D1A] px-3 py-2 rounded-xl text-xs"
            >
              لوحة الإدارة
            </Link>

            <button
              onClick={logout}
              className="bg-red-900/50 px-3 py-2 rounded-xl text-xs"
            >
              خروج
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[75vh]">
          <section className="bg-[#2A0A14] border border-[#5A1D2E] rounded-2xl overflow-hidden">
            <div className="p-3 border-b border-[#5A1D2E] font-bold text-sm">
              المحادثات ({conversations.length})
            </div>

            <div className="divide-y divide-[#5A1D2E] max-h-[70vh] overflow-y-auto">
              {conversations.map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadMessages(item)}
                  className={`w-full text-right p-4 hover:bg-[#3A0D1A] ${
                    selected?.id === item.id ? 'bg-[#3A0D1A]' : ''
                  }`}
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-bold text-sm">
                      {item.patient_name || item.phone}
                    </span>

                    {item.unread_count > 0 && (
                      <span className="bg-green-600 text-white rounded-full px-2 text-xs">
                        {item.unread_count}
                      </span>
                    )}
                  </div>

                  <p dir="ltr" className="text-xs text-gray-400 mt-1 text-right">
                    {item.phone}
                  </p>

                  <p className="text-xs text-gray-400 mt-2 truncate">
                    {item.last_message || 'لا توجد رسائل'}
                  </p>
                </button>
              ))}

              {conversations.length === 0 && (
                <p className="p-5 text-xs text-gray-500 text-center">
                  لا توجد محادثات حتى الآن
                </p>
              )}
            </div>
          </section>

          <section className="md:col-span-2 bg-[#2A0A14] border border-[#5A1D2E] rounded-2xl flex flex-col overflow-hidden">
            {selected ? (
              <>
                <div className="p-4 border-b border-[#5A1D2E]">
                  <h2 className="font-bold">
                    {selected.patient_name || selected.phone}
                  </h2>
                  <p dir="ltr" className="text-xs text-gray-400 text-right">
                    {selected.phone}
                  </p>
                </div>

                <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[55vh]">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.direction === 'outgoing'
                          ? 'justify-start'
                          : 'justify-end'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-sm whitespace-pre-wrap ${
                          message.direction === 'outgoing'
                            ? 'bg-green-900/50'
                            : 'bg-[#3A0D1A]'
                        }`}
                      >
                        {message.content}
                        <div className="text-[10px] text-gray-400 mt-2">
                          {message.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {error && (
                  <p className="text-red-400 text-xs px-4">{error}</p>
                )}

                <form
                  onSubmit={sendMessage}
                  className="p-3 border-t border-[#5A1D2E] flex gap-2"
                >
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="اكتب رسالة..."
                    className="flex-1 min-w-0 bg-[#1A050A] border border-[#5A1D2E] rounded-xl px-3 py-3 text-sm outline-none"
                  />

                  <button
                    disabled={loading || !text.trim()}
                    className="bg-green-700 disabled:opacity-50 px-5 rounded-xl text-sm font-bold"
                  >
                    {loading ? '...' : 'إرسال'}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                اختر محادثة لعرض الرسائل
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
