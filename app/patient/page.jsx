'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import Footer from '@/components/Footer'
import { loginPatientByPhone, normalizePhone } from '@/lib/booking'

export default function PatientPortalPage() {
  const [locale, setLocale] = useState('ar')
  const [mounted, setMounted] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sessionData, setSessionData] = useState(null)
  const [activeTab, setActiveTab] = useState('records')

  const fetchPatientData = async (rawPhone, optionalName = '') => {
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
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تحميل الملف الطبي')
    }
    setLoading(false)
  }

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale')
    if (savedLocale === 'ar' || savedLocale === 'en') setLocale(savedLocale)

    const savedPhone = localStorage.getItem('patient_phone')
    const savedName = localStorage.getItem('patient_name') || ''
    if (savedPhone) {
      setPhoneInput(savedPhone)
      fetchPatientData(savedPhone, savedName)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('locale', locale)
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  }, [locale, mounted])

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-900/40 text-green-400 border border-green-800">تم الكشف</span>
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-900/40 text-red-400 border border-red-800">ملغي</span>
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-pink-900/40 text-pink-300 border border-pink-700/50">مؤكد</span>
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#1A050A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1A050A] text-gray-200 pb-24 sm:pb-10">
      <Header locale={locale} setLocale={setLocale} />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {!sessionData ? (
          <div className="max-w-md mx-auto bg-[#2A0A14] rounded-2xl p-6 border border-[#5A1D2E] shadow-card animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white mx-auto mb-4 shadow-glow">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

            <h1 className="text-xl font-alexandria font-bold text-center text-white mb-1">
              ملفي الطبي
            </h1>
            <p className="text-xs text-gray-400 text-center mb-6">
              أدخل رقم هاتفك مباشرة لمشاهدة مواعيدك وتاريخك المرضي مع د. عبير الدالي (بدون رمز تحقق)
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">رقم الهاتف *</label>
                <div className="flex gap-2" dir="ltr">
                  <span className="bg-[#3A0D1A] border border-[#5A1D2E] rounded-xl px-3 text-xs text-gray-400 flex items-center">
                    EG +20
                  </span>
                  <input
                    type="tel"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="flex-1 bg-[#3A0D1A] border border-[#5A1D2E] rounded-xl p-3 text-white text-sm focus:border-pink-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">الاسم (اختياري للمريض الجديد)</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="الاسم بالكامل"
                  className="w-full bg-[#3A0D1A] border border-[#5A1D2E] rounded-xl p-3 text-white text-sm focus:border-pink-500 outline-none transition"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-900/40 border border-red-800 text-red-300 text-xs">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition disabled:opacity-50 shadow-glow"
              >
                {loading ? 'جاري فتح الملف...' : 'دخول إلى ملفي الطبي'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-gradient-to-br from-[#3A0D1A] to-[#2A0A14] rounded-2xl p-5 border border-[#5A1D2E] shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-pink-600/20 border border-pink-500/40 flex items-center justify-center text-pink-300 font-alexandria font-bold text-xl">
                    {sessionData.patient?.name?.charAt(0) || 'م'}
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-alexandria font-bold text-white">
                      {sessionData.patient?.name}
                    </h1>
                    <p className="text-xs text-gray-400 mt-0.5" dir="ltr">
                      {sessionData.patient?.phone}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
                      {sessionData.patient?.age && (
                        <span className="bg-[#1A050A] px-2.5 py-0.5 rounded-full border border-[#5A1D2E] text-gray-300">
                          السن: {sessionData.patient.age} {sessionData.patient.age_unit === 'months' ? 'شهر' : 'سنة'}
                        </span>
                      )}
                      {sessionData.patient?.marital_status && (
                        <span className="bg-[#1A050A] px-2.5 py-0.5 rounded-full border border-[#5A1D2E] text-gray-300">
                          {sessionData.patient.marital_status === 'married' ? 'متزوجة' : 'آنسة'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/booking"
                    className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition"
                  >
                    + حجز موعد جديد
                  </Link>
                  <button
                    onClick={() => fetchPatientData(sessionData.patient.phone)}
                    className="bg-[#3A0D1A] hover:bg-[#5A1D2E] text-gray-200 px-3 py-2 rounded-xl text-xs font-bold border border-[#5A1D2E] transition"
                  >
                    تحديث
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-[#1A050A] hover:bg-red-950/60 text-red-400 px-3 py-2 rounded-xl text-xs font-bold border border-red-900/40 transition"
                  >
                    تغيير الرقم
                  </button>
                </div>
              </div>

              {sessionData.patient?.chronic_notes && (
                <div className="mt-4 p-3 rounded-xl bg-[#1A050A] border border-pink-500/20 text-xs text-pink-200">
                  <span className="font-bold text-pink-400">ملاحظات طبية عامة: </span>
                  {sessionData.patient.chronic_notes}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 bg-[#2A0A14] p-1.5 rounded-2xl border border-[#5A1D2E]">
              <button
                onClick={() => setActiveTab('records')}
                className={`py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'records'
                    ? 'bg-pink-600 text-white shadow-glow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                التاريخ المرضي والروشتات ({sessionData.medicalRecords.length})
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'appointments'
                    ? 'bg-pink-600 text-white shadow-glow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                سجل الحجوزات ({sessionData.appointments.length})
              </button>
            </div>

            {activeTab === 'records' ? (
              <div className="space-y-3">
                {sessionData.medicalRecords.length === 0 ? (
                  <div className="bg-[#2A0A14] rounded-2xl p-8 border border-[#5A1D2E] text-center">
                    <p className="text-sm text-gray-300 font-bold mb-1">لا يوجد سجل مرضي مسجل بعد</p>
                    <p className="text-xs text-gray-500">
                      ستظهر هنا التشخيصات والروشتات الطبية فور تسجيلها من قِبل دكتورة عبير الدالي.
                    </p>
                  </div>
                ) : (
                  sessionData.medicalRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-[#2A0A14] rounded-2xl p-5 border border-[#5A1D2E] shadow-card space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#5A1D2E]/60 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                          <span className="font-bold text-sm text-white">زيارة بتاريخ: {rec.visit_date}</span>
                        </div>
                        {rec.next_visit && (
                          <span className="text-[11px] bg-purple-900/40 text-purple-300 border border-purple-700/50 px-2.5 py-1 rounded-full font-bold">
                            موعد المتابعة القادم: {rec.next_visit}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-[#1A050A] p-3 rounded-xl border border-[#5A1D2E]/50">
                          <span className="text-gray-500 block mb-1">التشخيص:</span>
                          <p className="text-white font-bold leading-relaxed">{rec.diagnosis}</p>
                        </div>

                        {rec.symptoms && (
                          <div className="bg-[#1A050A] p-3 rounded-xl border border-[#5A1D2E]/50">
                            <span className="text-gray-500 block mb-1">الشكوى / الأعراض:</span>
                            <p className="text-gray-300 leading-relaxed">{rec.symptoms}</p>
                          </div>
                        )}
                      </div>

                      {rec.prescription && (
                        <div className="bg-[#3A0D1A] p-3.5 rounded-xl border border-pink-500/30 text-xs">
                          <span className="text-pink-400 font-bold block mb-1.5">الروشتة والعلاج الموصوف:</span>
                          <p className="text-gray-200 whitespace-pre-line leading-relaxed">{rec.prescription}</p>
                        </div>
                      )}

                      {rec.notes && (
                        <p className="text-xs text-gray-400 pt-1">
                          <span className="text-gray-500 font-bold">تعليمات إضافية: </span>
                          {rec.notes}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {sessionData.appointments.length === 0 ? (
                  <div className="bg-[#2A0A14] rounded-2xl p-8 border border-[#5A1D2E] text-center">
                    <p className="text-sm text-gray-300 font-bold mb-2">لا توجد حجوزات مسجلة لهذا الرقم</p>
                    <Link
                      href="/booking"
                      className="inline-block bg-pink-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
                    >
                      احجز موعدك الآن
                    </Link>
                  </div>
                ) : (
                  sessionData.appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="bg-[#2A0A14] rounded-2xl p-4 border border-[#5A1D2E] flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-white">{apt.appointment_date}</span>
                          <span className="text-xs text-pink-300 bg-[#3A0D1A] px-2 py-0.5 rounded-lg" dir="ltr">
                            {apt.appointment_time}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          نوع الزيارة: {apt.slot_type || 'كشف'} • الاسم المسجل: {apt.patient_name}
                        </p>
                      </div>
                      {getStatusBadge(apt.status)}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <Footer locale={locale} />
      </main>
      <BottomNav />
    </div>
  )
}