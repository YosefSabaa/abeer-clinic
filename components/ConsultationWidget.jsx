'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useClinic } from '@/lib/clinic-context'

const SUBJECTS = [
  'استفسار عن متابعة حمل',
  'تفسير تحليل أو أشعة',
  'استفسار عن دواء أو جرعة',
  'أعراض طارئة أو استفسار عام',
]

export default function ConsultationWidget() {
  const { settings, locale } = useClinic()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    patient_name: '',
    patient_phone: '',
    age: '',
    subject: SUBJECTS[0],
    question: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!open) return
    const savedName = localStorage.getItem('patient_name') || ''
    const savedPhone = localStorage.getItem('patient_phone') || ''
    setForm((prev) => ({
      ...prev,
      patient_name: prev.patient_name || savedName,
      patient_phone: prev.patient_phone || savedPhone,
    }))
  }, [open])

  const doctorName =
    locale === 'ar'
      ? settings?.doctor_profile?.name_ar || 'الدكتورة'
      : settings?.doctor_profile?.name_en || 'the Doctor'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'تعذر إرسال الاستشارة')

      localStorage.setItem('patient_name', form.patient_name.trim())
      localStorage.setItem('patient_phone', form.patient_phone.trim())
      setSent(true)
      setForm((prev) => ({ ...prev, question: '' }))
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating Consultation Icon Button on Booking Screen */}
      <button
        type="button"
        onClick={() => {
          setSent(false)
          setError('')
          setOpen(true)
        }}
        className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-40 clinic-accent-bg text-white rounded-full shadow-glow px-4 py-3 flex items-center gap-2 hover:scale-105 active:scale-95 transition no-print"
        aria-label="طلب استشارة من الدكتورة"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
        </span>
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span className="text-xs font-bold whitespace-nowrap">
          {locale === 'ar' ? 'اطلب استشارة' : 'Ask Doctor'}
        </span>
      </button>

      {/* Consultation Request Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="clinic-card border clinic-border rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-slide-up">
            <div className="clinic-accent-bg text-white p-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-alexandria font-bold text-base">
                  طلب استشارة من {doctorName}
                </h2>
                <p className="text-[11px] opacity-90 mt-0.5">
                  اكتبي استفسارك وسيتم الرد عليك في أقرب وقت
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="p-5">
              {sent ? (
                <div className="text-center space-y-4 py-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl mx-auto">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-base clinic-text">تم إرسال استشارتك بنجاح!</h3>
                    <p className="text-xs clinic-text-muted leading-relaxed">
                      وصلت استشارتك إلى {doctorName}، ويمكنك متابعة الرد مباشرة داخل صفحة «ملفي الطبي».
                    </p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Link
                      href="/patient"
                      className="flex-1 clinic-accent-bg text-white py-2.5 rounded-xl text-xs font-bold text-center"
                    >
                      متابعة الرد في ملفي الطبي
                    </Link>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="clinic-surface border clinic-border px-4 py-2.5 rounded-xl text-xs font-bold"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] clinic-text-muted mb-1">الاسم بالكامل *</label>
                    <input
                      type="text"
                      required
                      value={form.patient_name}
                      onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
                      placeholder="اكتبي اسمك"
                      className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[11px] clinic-text-muted mb-1">رقم الهاتف *</label>
                      <input
                        type="tel"
                        required
                        dir="ltr"
                        value={form.patient_phone}
                        onChange={(e) => setForm({ ...form, patient_phone: e.target.value })}
                        placeholder="010XXXXXXXX"
                        className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none text-left"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] clinic-text-muted mb-1">السن</label>
                      <input
                        type="number"
                        min="1"
                        max="110"
                        value={form.age}
                        onChange={(e) => setForm({ ...form, age: e.target.value })}
                        placeholder="اختياري"
                        className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] clinic-text-muted mb-1">موضوع الاستشارة</label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none"
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] clinic-text-muted mb-1">تفاصيل الاستشارة *</label>
                    <textarea
                      rows={4}
                      required
                      value={form.question}
                      onChange={(e) => setForm({ ...form, question: e.target.value })}
                      placeholder="اشرحي استفسارك أو الأعراض بوضوح..."
                      className="w-full clinic-surface border clinic-border rounded-xl p-3 text-xs clinic-text outline-none leading-relaxed"
                    />
                  </div>

                  {error && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-2.5">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full clinic-accent-bg text-white py-3 rounded-xl text-xs font-bold hover:opacity-90 transition disabled:opacity-50 shadow-glow"
                  >
                    {submitting ? 'جاري الإرسال...' : 'إرسال الاستشارة للدكتورة'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
