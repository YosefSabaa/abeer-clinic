
'use client';

import { useCallback, useEffect, useState } from 'react';

export default function WhatsAppInboxPage() {
  const [authenticated, setAuthenticated] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const loadConversations = useCallback(async () => {
    const response = await fetch('/api/whatsapp/conversations', {
      cache: 'no-store',
    });

    if (response.status === 401) {
      setAuthenticated(false);
      return;
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'تعذر تحميل المحادثات');
    }

    setAuthenticated(true);
    setConversations(result.conversations || []);
  }, []);

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;

    const response = await fetch(
      `/api/whatsapp/conversations?conversation_id=${encodeURIComponent(conversationId)}`,
      { cache: 'no-store' }
    );

    if (response.status === 401) {
      setAuthenticated(false);
      return;
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'تعذر تحميل الرسائل');
    }

    setMessages(result.messages || []);
  }, []);

  useEffect(() => {
    fetch('/api/admin/session')
      .then((res) => res.json())
      .then(async (data) => {
        setAuthenticated(data.authenticated);

        if (data.authenticated) {
          await loadConversations();
        }
      })
      .catch(() => setAuthenticated(false))
      .finally(() => setLoading(false));
  }, [loadConversations]);

  useEffect(() => {
    if (!authenticated) return;

    const timer = setInterval(() => {
      loadConversations().catch(() => {});
    }, 5000);

    return () => clearInterval(timer);
  }, [authenticated, loadConversations]);

  useEffect(() => {
    if (!selected?.id) return;

    loadMessages(selected.id).catch((err) => {
      setError(err.message);
    });

    const timer = setInterval(() => {
      loadMessages(selected.id).catch(() => {});
    }, 3000);

    return () => clearInterval(timer);
  }, [selected?.id, loadMessages]);

  async function openConversation(conversation) {
    setSelected(conversation);
    setError('');

    await loadMessages(conversation.id);
    await loadConversations();
  }

  async function sendMessage(event) {
    event.preventDefault();

    if (!selected || !text.trim() || sending) return;

    setSending(true);
    setError('');

    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: selected.id,
          text: text.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'فشل إرسال الرسالة');
      }

      setText('');

      await loadMessages(selected.id);
      await loadConversations();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (loading || authenticated === null) {
    return (
      <main className="min-h-screen bg-[#10090D] text-white grid place-items-center">
        جاري التحقق من الدخول...
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[#10090D] text-white grid place-items-center p-6">
        <div className="text-center">
          <p className="mb-4">يجب تسجيل الدخول أولًا.</p>
          <a href="/admin" className="text-pink-400 underline">
            الانتقال إلى لوحة الإدارة
          </a>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#10090D] text-white p-3 md:p-6"
    >
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold">WhatsApp العيادة</h1>
            <p className="text-sm text-gray-400 mt-1">
              إدارة محادثات المرضى
            </p>
          </div>

          <a
            href="/admin"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm"
          >
            لوحة الإدارة
          </a>
        </header>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
          <aside className="rounded-2xl border border-white/10 bg-[#1B1118] overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-bold">المحادثات</h2>
              <p className="text-xs text-gray-400 mt-1">
                {conversations.length} محادثة
              </p>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => openConversation(conversation)}
                  className={`w-full text-right p-4 border-b border-white/5 hover:bg-white/5 ${
                    selected?.id === conversation.id ? 'bg-white/10' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold truncate">
                      {conversation.patient_name || conversation.phone}
                    </span>

                    {conversation.unread_count > 0 && (
                      <span className="rounded-full bg-green-600 px-2 py-1 text-xs">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-400 truncate mt-2">
                    {conversation.last_message || 'لا توجد رسائل'}
                  </p>

                  <p className="text-xs text-gray-500 mt-1" dir="ltr">
                    {conversation.phone}
                  </p>
                </button>
              ))}

              {conversations.length === 0 && (
                <p className="p-6 text-center text-gray-400 text-sm">
                  لا توجد محادثات حتى الآن
                </p>
              )}
            </div>
          </aside>

          <section className="rounded-2xl border border-white/10 bg-[#1B1118] min-h-[70vh] flex flex-col">
            {!selected ? (
              <div className="flex-1 grid place-items-center text-gray-400">
                اختر محادثة لعرض الرسائل
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-white/10">
                  <h2 className="font-bold">
                    {selected.patient_name || selected.phone}
                  </h2>
                  <p className="text-sm text-gray-400" dir="ltr">
                    {selected.phone}
                  </p>
                </div>

                <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[60vh]">
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
                        className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                          message.direction === 'outgoing'
                            ? 'bg-[#245C43] text-white'
                            : 'bg-[#30232D] text-white'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>

                        <div className="flex items-center gap-2 mt-2 text-[10px] text-white/60">
                          <span>
                            {new Date(message.created_at).toLocaleString('ar-EG')}
                          </span>
                          {message.direction === 'outgoing' && (
                            <span>{message.status}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={sendMessage}
                  className="p-3 border-t border-white/10 flex gap-2"
                >
                  <input
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="اكتب ردك..."
                    className="flex-1 min-w-0 rounded-xl bg-[#30232D] border border-white/10 px-4 py-3 outline-none"
                  />

                  <button
                    type="submit"
                    disabled={sending || !text.trim()}
                    className="rounded-xl bg-green-700 px-5 py-3 font-bold disabled:opacity-40"
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
  );
}
