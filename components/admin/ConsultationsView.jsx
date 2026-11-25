'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

export default function ConsultationsView({
  consultations = [],
  dbWarning,
  locale = 'ar',
  onReply,
  onDelete,
  onOpenMedicalFile,
  onRefresh,
  loading,
}) {
  const [filter, setFilter] = useState('pending')
  const [search, setSearch] = useState('')
  const [replyDrafts, setReplyDrafts] = useState({})
  const [savingId, setSavingId] = useState(null)

  const stats = useMemo(() => {
    const pending = consultations.filter((c) => c.status !== 'replied').length
    const replied = consultations.filter((c) => c.status === 'replied').length
    return { total: consultations.length, pending, replied }
  }, [consultations])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return consultations.filter((c) => {
      const matchStatus =
        filter === 'all' ||
        (filter === 'pending' && c.status !== 'replied') ||
        (filter === 'replied' && c.status === 'replied')
      const matchQuery =
        !q ||
        c.patient_name?.toLowerCase().includes(q) ||
        c.patient_phone?.includes(q) ||
        c.question?.toLowerCase().includes(q) ||
        c.subject?.toLowerCase().includes(q)
      return matchStatus && matchQuery
    })
  }, [consultations, filter, search])

  const handleSendReply = async (item) => {
    const text = (replyDrafts[item.id] ?? item.doctor_reply ?? '').trim()
    if (!text) return
    setSavingId(item.id)
    try {
      await onReply(item.id, text)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-alexandria font-bold clinic-text">
            {locale === 'ar' ? 'طلبات الاستشارات والرد عليها' : 'Patient Consultations'}
          </h1>
          <p className="text-xs clinic-text-muted mt-0.5">
            استفسارات المرضى المرسلة من صفحة الحجز — يظهر ردك تلقائيًا في «ملفي الطبي» للمريض.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو الهاتف أو السؤال..."
            className="flex-1 sm:w-64 clinic-card border clinic-border rounded-xl px-3.5 py-2.5 text-xs clinic-text outline-none"
          />
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="clinic-card border clinic-border hover:clinic-surface px-3.5 py-2.5 rounded-xl text-xs font-bold shrink-0"
          >
            {loading ? '...' : 'تحديث'}
          </button>
        </div>
      </div>

      {dbWarning && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300">
          {dbWarning}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'pending', label: `بانتظار الرد (${stats.pending})` },
          { id: 'replied', label: `تم الرد (${stats.replied})` },
          { id: 'all', label: `الكل (${stats.total})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
              filter === t.id
                ? 'clinic-accent-bg text-white border-transparent'
                : 'clinic-card clinic-border clinic-text-secondary hover:clinic-surface'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Consultations List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="clinic-card border clinic-border rounded-2xl p-10 text-center space-y-1.5">
            <p className="text-sm font-bold clinic-text">لا توجد استشارات في هذا القسم حاليًا</p>
            <p className="text-xs clinic-text-muted">
              ستظهر هنا أي استشارة يرسلها المرضى من أيقونة «اطلب استشارة» في شاشة الحجز.
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const draftVal = replyDrafts[item.id] ?? item.doctor_reply ?? ''
            const isReplied = item.status === 'replied'

            return (
              <div
                key={item.id}
                className="clinic-card border clinic-border rounded-2xl p-4 sm:p-5 space-y-3.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b clinic-border pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm clinic-text">{item.patient_name}</span>
                      <span className="text-xs clinic-accent-text" dir="ltr">
                        {item.patient_phone}
                      </span>
                      {item.age && (
                        <span className="text-[11px] clinic-surface border clinic-border px-2 py-0.5 rounded-full clinic-text-muted">
                          {item.age} سنة
                        </span>
                      )}
                      <span className="text-[11px] clinic-surface border clinic-border px-2.5 py-0.5 rounded-full clinic-text-secondary font-bold">
                        {item.subject || 'استشارة طبية'}
                      </span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                          isReplied
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-amber-500/15 text-amber-300'
                        }`}
                      >
                        {isReplied ? '✓ تم الرد' : '● بانتظار الرد'}
                      </span>
                    </div>
                    <p className="text-[11px] clinic-text-muted">
                      {new Date(item.created_at).toLocaleString('ar-EG')}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenMedicalFile({
                          name: item.patient_name,
                          phone: item.patient_phone,
                          age: item.age,
                        })
                      }
                      className="clinic-surface border clinic-border clinic-accent-hover px-3 py-1.5 rounded-xl text-[11px] font-bold"
                    >
                      الملف الطبي
                    </button>
                    <Link
                      href={`/admin/whatsapp?phone=${encodeURIComponent(item.patient_phone || '')}&name=${encodeURIComponent(item.patient_name || '')}`}
                      className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 px-3 py-1.5 rounded-xl text-[11px] font-bold"
                    >
                      💬 واتساب
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="text-red-400 hover:underline px-2 py-1 text-[11px]"
                    >
                      حذف
                    </button>
                  </div>
                </div>

                {/* Patient Question */}
                <div className="clinic-main border clinic-border rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] font-bold clinic-text-muted">سؤال المريض:</span>
                  <p className="text-xs sm:text-sm clinic-text whitespace-pre-line leading-relaxed">
                    {item.question}
                  </p>
                </div>

                {/* Doctor Reply Box */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold clinic-accent-text">
                    رد الدكتورة:
                  </label>
                  <textarea
                    rows={3}
                    value={draftVal}
                    onChange={(e) =>
                      setReplyDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    placeholder="اكتبي ردك الطبي للمريضة هنا..."
                    className="w-full clinic-surface border clinic-border rounded-xl p-3 text-xs sm:text-sm clinic-text outline-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between gap-2">
                    {item.replied_at ? (
                      <span className="text-[10px] clinic-text-muted">
                        آخر رد: {new Date(item.replied_at).toLocaleString('ar-EG')}
                      </span>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      disabled={savingId === item.id || !draftVal.trim()}
                      onClick={() => handleSendReply(item)}
                      className="clinic-accent-bg text-white px-5 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition disabled:opacity-40 shadow-glow"
                    >
                      {savingId === item.id
                        ? 'جاري الحفظ...'
                        : isReplied
                          ? 'تحديث الرد'
                          : 'إرسال الرد للمريض'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
