'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useClinic } from '@/lib/clinic-context'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import Footer from '@/components/Footer'
import BookingTicketModal from '@/components/BookingTicketModal'
import { loginPatientByPhone, normalizePhone } from '@/lib/booking'

export default function PatientPortalPage() {
  const { settings, locale, setLocale, mounted } = useClinic()
  const [phoneInput, setPhoneInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sessionData, setSessionData] = useState(null)
  const [activeTab, setActiveTab] = useState('records')
  const [consultationsList, setConsultationsList] = useState([])
  const [activeTicket, setActiveTicket] = useState(null)
  const [printingRec, setPrintingRec] = useState(null)

  const doc = settings.doctor_profile || {}
  const contact = settings.clinic_contact || {}
  const rules = settings.booking_rules || {}

  const doctorName =
    locale === 'ar'
      ? doc.name_ar || 'دكتورة عبير الدالي'
      : doc.name_en || 'Dr. Abeer El-Dali'

  const fetchPatientData = useCallback(async (rawPhone, optionalName = '') => {
    const clean = normalizePhone(rawPhone)
    if (!clean) {
      setError('يرجى إدخال رقم الهاتف')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await loginPatientByPhone(clean, optionalName)
      localStorage.setItem('patient_phone', clean)
      if (result.patient?.name) {
        localStorage.setItem('patient_name', result.patient.name)
      }
      setSessionData(result)
      fetch(`/api/consultations?phone=${encodeURIComponent(clean)}`, { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => setConsultationsList(d?.consultations || []))
        .catch(() => setConsultationsList([]))
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تحميل الملف الطبي')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const savedPhone = localStorage.getItem('patient_phone')
    const savedName = localStorage.getItem('patient_name') || ''
    if (savedPhone) {
      setPhoneInput(savedPhone)
      fetchPatientData(savedPhone, savedName)
    }
  }, [fetchPatientData])

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    fetchPatientData(phoneInput, nameInput)
  }

  const handleLogout = () => {
    localStorage.removeItem('patient_phone')
    localStorage.removeItem('patient_name')
    setSessionData(null)
    setPhoneInput('')
    setNameInput('')
    setError('')
  }

  const upcomingAppointment = useMemo(() => {
    if (!sessionData?.appointments) return null
    const today = new Date().toISOString().slice(0, 10)
    return (
      sessionData.appointments.find(
        (a) => a.status === 'confirmed' && a.appointment_date >= today
      ) || null
    )
  }, [sessionData])

  const openTicketForApt = (apt) => {
    const isFollowup = apt.slot_type === (rules.followup_label_ar || 'استشارة')
    const price = isFollowup ? rules.followup_price || 150 : rules.consultation_price || 360
    setActiveTicket({
      id: apt.id,
      bookingCode: apt.booking_code || `CL-${String(apt.appointment_date).replace(/-/g, '')}-${String(apt.queue_number || 1).padStart(3, '0')}`,
      queueNumber: apt.queue_number || 1,
      waitingAhead: Math.max(0, (apt.queue_number || 1) - 1),
      date: apt.appointment_date,
      estimatedTime: String(apt.appointment_time || '').slice(0, 5),
      estimatedTimeArabic: String(apt.appointment_time || '').slice(0, 5),
      patientName: apt.patient_name || sessionData?.patient?.name,
      patientPhone: apt.patient_phone || sessionData?.patient?.phone,
      visitType: apt.slot_type || 'كشف',
      priceLabel: `${price} ${rules.currency_ar || 'ج.م'}`,
      doctorName,
      clinicName: contact.clinic_name_ar || doctorName,
      clinicAddress: contact.address_ar || '',
      clinicPhone: contact.phone || '',
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            تم الكشف
          </span>
        )
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
            ملغي
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold clinic-accent-soft border">
            مؤكد في الدور
          </span>
        )
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen clinic-main flex items-center justify-center">
        <div className="w-8 h-8 border-2 clinic-spinner rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen clinic-main pb-24 sm:pb-10 overflow-x-hidden">
      <Header locale={locale} setLocale={setLocale} />

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-6 space-y-5">
        {/* Printable Prescription Sheet for Patient */}
        {printingRec && (
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-alexandria font-bold text-slate-900">{doctorName}</h2>
                <p className="text-xs text-slate-600">{doc.title_ar}</p>
                <p className="text-[11px] text-slate-500 mt-1">{contact.address_ar}</p>
              </div>
              <div className="text-end text-xs">
                <p className="font-bold">التاريخ: {printingRec.visit_date}</p>
                <button
                  type="button"
                  onClick={() => setPrintingRec(null)}
                  className="no-print text-red-600 underline text-[11px] mt-1"
                >
                  إغلاق المعاينة ✕
                </button>
              </div>
            </div>
            <div className="text-xs space-y-1">
              <p><strong>المريض:</strong> {sessionData?.patient?.name}</p>
              <p><strong>التشخيص:</strong> {printingRec.diagnosis}</p>
            </div>
            <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
              <p className="text-sm font-bold clinic-accent-text">℞ العلاج الموصوف:</p>
              <p className="whitespace-pre-line text-sm leading-7 text-slate-800">
                {printingRec.prescription || '—'}
              </p>
            </div>
            {printingRec.notes && (
              <p className="text-xs text-slate-700"><strong>تعليمات:</strong> {printingRec.notes}</p>
            )}
          </div>
        )}

        {!sessionData ? (
          <div className="max-w-md mx-auto clinic-card rounded-3xl p-6 sm:p-7 border clinic-border shadow-card animate-fade-in space-y-5">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl clinic-accent-bg flex items-center justify-center text-white mx-auto shadow-glow">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-alexandria font-bold clinic-text">ملفي الطبي</h1>
              <p className="text-xs clinic-text-muted leading-relaxed">
                أدخل رقم هاتفك مباشرة لمشاهدة أدوارك المحجوزة، تذكرة QR، والروشتات الطبية مع {doctorName}
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs clinic-text-muted mb-1.5">رقم الهاتف *</label>
                <div className="flex gap-2 min-w-0" dir="ltr">
                  <span className="clinic-surface border clinic-border rounded-xl px-3 text-xs clinic-text-muted flex items-center shrink-0">
                    EG +20
                  </span>
                  <input
                    type="tel"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="flex-1 min-w-0 w-full clinic-surface border clinic-border rounded-xl p-3 clinic-text text-sm outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs clinic-text-muted mb-1.5">
                  الاسم (اختياري للمريض الجديد)
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="الاسم بالكامل"
                  className="w-full clinic-surface border clinic-border rounded-xl p-3 clinic-text text-sm outline-none transition"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full clinic-accent-bg text-white py-3.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition disabled:opacity-50 shadow-glow"
              >
                {loading ? 'جاري فتح الملف...' : 'دخول إلى ملفي الطبي'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in no-print">
            {/* Patient Hero Card */}
            <div className="clinic-card rounded-3xl p-5 sm:p-6 border clinic-border shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-16 rounded-2xl clinic-accent-bg text-white flex items-center justify-center font-alexandria font-bold text-2xl shrink-0 shadow-glow">
                    {sessionData.patient?.name?.charAt(0) || 'م'}
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl font-alexandria font-bold clinic-text truncate">
                      {sessionData.patient?.name}
                    </h1>
                    <p className="text-xs clinic-accent-text mt-0.5" dir="ltr">
                      {sessionData.patient?.phone}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
                      {sessionData.patient?.age && (
                        <span className="clinic-surface px-2.5 py-0.5 rounded-full border clinic-border clinic-text-secondary">
                          السن: {sessionData.patient.age}{' '}
                          {sessionData.patient.age_unit === 'months' ? 'شهر' : 'سنة'}
                        </span>
                      )}
                      {sessionData.patient?.marital_status && (
                        <span className="clinic-surface px-2.5 py-0.5 rounded-full border clinic-border clinic-text-secondary">
                          {sessionData.patient.marital_status === 'married' ? 'مدام' : 'آنسة'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <Link
                    href="/booking"
                    className="clinic-accent-bg text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition shadow-glow"
                  >
                    + حجز دور جديد
                  </Link>
                  <button
                    type="button"
                    onClick={() => fetchPatientData(sessionData.patient.phone)}
                    className="clinic-surface border clinic-border clinic-accent-hover px-3.5 py-2.5 rounded-xl text-xs font-bold transition"
                  >
                    تحديث
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="bg-red-500/15 hover:bg-red-500/25 text-red-400 px-3.5 py-2.5 rounded-xl text-xs font-bold transition"
                  >
                    تغيير الرقم
                  </button>
                </div>
              </div>

              {/* Quick Stats Strip */}
              <div className="grid grid-cols-3 gap-2.5 pt-2 border-t clinic-border">
                <div className="clinic-surface border clinic-border rounded-2xl p-3 text-center">
                  <span className="block text-[10px] clinic-text-muted">الروشتات المسجلة</span>
                  <span className="block text-lg font-alexandria font-bold clinic-accent-text">
                    {sessionData.medicalRecords.length}
                  </span>
                </div>
                <div className="clinic-surface border clinic-border rounded-2xl p-3 text-center">
                  <span className="block text-[10px] clinic-text-muted">إجمالي الحجوزات</span>
                  <span className="block text-lg font-alexandria font-bold clinic-text">
                    {sessionData.appointments.length}
                  </span>
                </div>
                <div className="clinic-surface border clinic-border rounded-2xl p-3 text-center">
                  <span className="block text-[10px] clinic-text-muted">آخر زيارة</span>
                  <span className="block text-xs font-bold clinic-text mt-1.5" dir="ltr">
                    {sessionData.medicalRecords[0]?.visit_date || '—'}
                  </span>
                </div>
              </div>

              {sessionData.patient?.chronic_notes && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>
                    <strong>ملاحظات طبية عامة: </strong>
                    {sessionData.patient.chronic_notes}
                  </span>
                </div>
              )}
            </div>

            {/* Active Upcoming Booking Spotlight */}
            {upcomingAppointment && (
              <div className="clinic-card border clinic-accent-border-soft rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-card">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold clinic-accent-text">
                    <span>🎟️</span>
                    <span>لديك حجز قادم مؤكد</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-alexandria font-bold clinic-text">
                      دور #{upcomingAppointment.queue_number || 1}
                    </span>
                    <span className="text-xs clinic-text-secondary">
                      • {upcomingAppointment.appointment_date}
                    </span>
                    <span className="text-xs clinic-surface px-2 py-0.5 rounded-lg" dir="ltr">
                      {String(upcomingAppointment.appointment_time || '').slice(0, 5)}
                    </span>
                  </div>
                  {upcomingAppointment.booking_code && (
                    <p className="text-[11px] font-mono clinic-text-muted" dir="ltr">
                      كود الحجز: {upcomingAppointment.booking_code}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => openTicketForApt(upcomingAppointment)}
                  className="clinic-accent-bg text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-glow hover:opacity-90 transition shrink-0"
                >
                  عرض تذكرة الحجز و QR
                </button>
              </div>
            )}

            {/* Segmented Tabs */}
            <div className="grid grid-cols-3 gap-1.5 clinic-card p-1.5 rounded-2xl border clinic-border">
              <button
                type="button"
                onClick={() => setActiveTab('records')}
                className={`py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'records'
                    ? 'clinic-accent-bg text-white shadow-glow'
                    : 'clinic-text-muted hover:clinic-text'
                }`}
              >
                ℞ الروشتات والتاريخ المرضي ({sessionData.medicalRecords.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('appointments')}
                className={`py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'appointments'
                    ? 'clinic-accent-bg text-white shadow-glow'
                    : 'clinic-text-muted hover:clinic-text'
                }`}
              >
                📅 الحجوزات ({sessionData.appointments.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('consultations')}
                className={`py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'consultations'
                    ? 'clinic-accent-bg text-white shadow-glow'
                    : 'clinic-text-muted hover:clinic-text'
                }`}
              >
                💬 استشاراتي ({consultationsList.length})
              </button>
            </div>

            {activeTab === 'consultations' ? (
              <div className="space-y-3">
                {consultationsList.length === 0 ? (
                  <div className="clinic-card rounded-3xl p-10 border clinic-border text-center space-y-2">
                    <p className="text-sm clinic-text font-bold">لا توجد استشارات مرسلة بعد</p>
                    <p className="text-xs clinic-text-muted">
                      يمكنك إرسال استشارة من أيقونة «اطلب استشارة» في صفحة الحجز وسيظهر رد الدكتورة هنا.
                    </p>
                  </div>
                ) : (
                  consultationsList.map((c) => (
                    <div key={c.id} className="clinic-card rounded-3xl p-5 border clinic-border shadow-card space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b clinic-border pb-2.5">
                        <span className="font-bold text-xs clinic-text">{c.subject || 'استشارة طبية'}</span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                          c.status === 'replied'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-amber-500/15 text-amber-300'
                        }`}>
                          {c.status === 'replied' ? '✓ تم الرد من الدكتورة' : '◷ بانتظار رد الدكتورة'}
                        </span>
                      </div>
                      <div className="clinic-main border clinic-border rounded-xl p-3 text-xs clinic-text-secondary">
                        <span className="block text-[10px] clinic-text-muted mb-1">سؤالك:</span>
                        <p className="whitespace-pre-line leading-relaxed">{c.question}</p>
                      </div>
                      {c.doctor_reply && (
                        <div className="clinic-surface border clinic-accent-border-soft rounded-xl p-3.5 text-xs space-y-1">
                          <span className="block text-[11px] font-bold clinic-accent-text">رد {doctorName}:</span>
                          <p className="clinic-text whitespace-pre-line leading-relaxed">{c.doctor_reply}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : activeTab === 'records' ? (
              <div className="space-y-4">
                {sessionData.medicalRecords.length === 0 ? (
                  <div className="clinic-card rounded-3xl p-10 border clinic-border text-center space-y-2">
                    <p className="text-sm clinic-text font-bold">لا توجد روشتات أو زيارات مسجلة بعد</p>
                    <p className="text-xs clinic-text-muted">
                      ستظهر هنا التشخيصات والروشتات الطبية بشكل منظم فور تسجيلها من قِبل {doctorName}.
                    </p>
                  </div>
                ) : (
                  sessionData.medicalRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className="clinic-card rounded-3xl p-5 border clinic-border shadow-card space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b clinic-border pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full clinic-accent-solid" />
                          <span className="font-bold text-sm clinic-text">
                            زيارة بتاريخ: <span dir="ltr">{rec.visit_date}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {rec.next_visit && (
                            <span className="text-[11px] bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-full font-bold">
                              متابعة: {rec.next_visit}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setPrintingRec(rec)
                              setTimeout(() => window.print(), 150)
                            }}
                            className="clinic-surface border clinic-border clinic-accent-hover px-3 py-1 rounded-xl text-[11px] font-bold"
                          >
                            🖨 طباعة الروشتة
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="clinic-main p-3.5 rounded-2xl border clinic-border">
                          <span className="clinic-text-muted block text-[10px] mb-1">التشخيص الطبي</span>
                          <p className="clinic-text font-bold text-sm leading-relaxed">{rec.diagnosis}</p>
                        </div>

                        {rec.symptoms && (
                          <div className="clinic-main p-3.5 rounded-2xl border clinic-border">
                            <span className="clinic-text-muted block text-[10px] mb-1">الشكوى / الأعراض</span>
                            <p className="clinic-text-secondary leading-relaxed">{rec.symptoms}</p>
                          </div>
                        )}
                      </div>

                      {rec.prescription && (
                        <div className="clinic-surface p-4 rounded-2xl border clinic-border space-y-2">
                          <span className="clinic-accent-text font-bold text-xs flex items-center gap-1.5">
                            <span className="text-base font-serif">℞</span>
                            <span>العلاج الموصوف والجرعات</span>
                          </span>
                          <ul className="space-y-1.5 text-xs sm:text-sm clinic-text leading-relaxed">
                            {rec.prescription
                              .split('\n')
                              .filter(Boolean)
                              .map((line, i) => (
                                <li
                                  key={i}
                                  className="clinic-card border clinic-border rounded-xl px-3 py-2"
                                >
                                  {line}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}

                      {rec.notes && (
                        <div className="clinic-main border clinic-border rounded-xl p-3 text-xs clinic-text-secondary">
                          <strong className="clinic-text">تعليمات وتحاليل إضافية: </strong>
                          {rec.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {sessionData.appointments.length === 0 ? (
                  <div className="clinic-card rounded-3xl p-10 border clinic-border text-center space-y-3">
                    <p className="text-sm clinic-text font-bold">لا توجد حجوزات مسجلة لهذا الرقم</p>
                    <Link
                      href="/booking"
                      className="inline-block clinic-accent-bg text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-glow"
                    >
                      احجز دورك الآن
                    </Link>
                  </div>
                ) : (
                  sessionData.appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="clinic-card rounded-2xl p-4 border clinic-border flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm clinic-text" dir="ltr">
                            {apt.appointment_date}
                          </span>
                          {apt.queue_number && (
                            <span className="text-[11px] clinic-accent-soft border px-2 py-0.5 rounded-lg font-bold">
                              دور #{apt.queue_number}
                            </span>
                          )}
                          <span
                            className="text-xs clinic-accent-text clinic-surface px-2 py-0.5 rounded-lg"
                            dir="ltr"
                          >
                            {String(apt.appointment_time || '').slice(0, 5)}
                          </span>
                          {apt.booking_code && (
                            <span
                              className="text-[10px] font-mono clinic-surface border clinic-border px-2 py-0.5 rounded-lg clinic-text-muted"
                              dir="ltr"
                            >
                              {apt.booking_code}
                            </span>
                          )}
                        </div>
                        <p className="text-xs clinic-text-muted">
                          نوع الزيارة: {apt.slot_type || 'كشف'} • الاسم المسجل: {apt.patient_name}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {apt.status === 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => openTicketForApt(apt)}
                            className="clinic-surface border clinic-border clinic-accent-hover px-3 py-1.5 rounded-xl text-[11px] font-bold"
                          >
                            تذكرة QR
                          </button>
                        )}
                        {getStatusBadge(apt.status)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <Footer locale={locale} />
      </main>

      <BookingTicketModal ticket={activeTicket} onClose={() => setActiveTicket(null)} />
      <BottomNav />
    </div>
  )
}
