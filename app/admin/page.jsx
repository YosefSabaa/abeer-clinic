'use client'
import { useState, useEffect, useMemo } from 'react'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import Footer from '@/components/Footer'
import {
  getAdminDashboardData,
  upsertPatientAdmin,
  updateAppointmentStatus,
  addMedicalRecord,
  deleteMedicalRecord,
} from '@/lib/booking'

export default function AdminDashboardPage() {
  const [locale, setLocale] = useState('ar')
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')

  const [data, setData] = useState({ patients: [], appointments: [], medicalRecords: [] })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('patients')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [toast, setToast] = useState(null)

  const [showPatientForm, setShowPatientForm] = useState(false)
  const [patientForm, setPatientForm] = useState({
    name: '',
    phone: '',
    age: '',
    age_unit: 'years',
    marital_status: '',
    chronic_notes: '',
  })

  const [selectedPatient, setSelectedPatient] = useState(null)
  const [recordForm, setRecordForm] = useState({
    patient_phone: '',
    patient_name: '',
    visit_date: new Date().toISOString().split('T')[0],
    symptoms: '',
    diagnosis: '',
    prescription: '',
    notes: '',
    next_visit: '',
  })

  const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '1234'

  const showNotification = (text, type = 'success') => {
    setToast({ text, type })
    setTimeout(() => setToast(null), 3500)
  }

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const res = await getAdminDashboardData()
      setData(res)
    } catch (err) {
      showNotification(err.message || 'فشل تحميل البيانات', 'error')
    }
    setLoading(false)
  }

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale')
    if (savedLocale === 'ar' || savedLocale === 'en') setLocale(savedLocale)

    if (sessionStorage.getItem('admin_auth') === 'true') {
      setIsAuthenticated(true)
      loadDashboard()
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('locale', locale)
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  }, [locale, mounted])

  const handlePinSubmit = (e) => {
    e.preventDefault()
    if (pinInput === ADMIN_PIN) {
      sessionStorage.setItem('admin_auth', 'true')
      setIsAuthenticated(true)
      setPinError('')
      loadDashboard()
    } else {
      setPinError('رمز الدخول غير صحيح')
    }
  }

  const handleSavePatient = async (e) => {
    e.preventDefault()
    try {
      await upsertPatientAdmin(patientForm)
      showNotification('تم حفظ بيانات المريض بنجاح')
      setPatientForm({ name: '', phone: '', age: '', age_unit: 'years', marital_status: '', chronic_notes: '' })
      setShowPatientForm(false)
      await loadDashboard()
    } catch (err) {
      showNotification(err.message, 'error')
    }
  }

  const handleEditPatientClick = (patient) => {
    setPatientForm({
      name: patient.name || '',
      phone: patient.phone || '',
      age: patient.age || '',
      age_unit: patient.age_unit || 'years',
      marital_status: patient.marital_status || '',
      chronic_notes: patient.chronic_notes || '',
    })
    setShowPatientForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openPatientMedicalFile = (patient) => {
    setSelectedPatient(patient)
    setRecordForm({
      patient_phone: patient.phone,
      patient_name: patient.name,
      visit_date: new Date().toISOString().split('T')[0],
      symptoms: '',
      diagnosis: '',
      prescription: '',
      notes: '',
      next_visit: '',
    })
  }

  const handleAddRecord = async (e) => {
    e.preventDefault()
    try {
      await addMedicalRecord(recordForm)
      showNotification('تم إضافة الكشف والروشتة إلى التاريخ المرضي')
      setRecordForm((prev) => ({
        ...prev,
        symptoms: '',
        diagnosis: '',
        prescription: '',
        notes: '',
        next_visit: '',
      }))
      await loadDashboard()
    } catch (err) {
      showNotification(err.message, 'error')
    }
  }

  const handleDeleteRecord = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا السجل المرضي؟')) return
    try {
      await deleteMedicalRecord(id)
      showNotification('تم حذف السجل')
      await loadDashboard()
    } catch (err) {
      showNotification(err.message, 'error')
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateAppointmentStatus(id, newStatus)
      showNotification('تم تحديث حالة الحجز')
      await loadDashboard()
    } catch (err) {
      showNotification(err.message, 'error')
    }
  }

  const filteredPatients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return data.patients
    return data.patients.filter(
      (p) => p.name?.toLowerCase().includes(q) || p.phone?.includes(q)
    )
  }, [data.patients, searchQuery])

  const filteredAppointments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return data.appointments.filter((a) => {
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter
      const matchesQuery =
        !q || a.patient_name?.toLowerCase().includes(q) || a.patient_phone?.includes(q)
      return matchesStatus && matchesQuery
    })
  }, [data.appointments, searchQuery, statusFilter])

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return data.medicalRecords
    return data.medicalRecords.filter(
      (r) =>
        r.patient_name?.toLowerCase().includes(q) ||
        r.patient_phone?.includes(q) ||
        r.diagnosis?.toLowerCase().includes(q)
    )
  }, [data.medicalRecords, searchQuery])

  const stats = useMemo(() => {
    return {
      totalPatients: data.patients.length,
      confirmedAppointments: data.appointments.filter((a) => a.status === 'confirmed').length,
      completedAppointments: data.appointments.filter((a) => a.status === 'completed').length,
      totalRecords: data.medicalRecords.length,
    }
  }, [data])

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

      {toast && (
        <div
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg border animate-slide-up ${
            toast.type === 'error'
              ? 'bg-red-950 text-red-300 border-red-700'
              : 'bg-green-950 text-green-300 border-green-700'
          }`}
        >
          {toast.text}
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {!isAuthenticated ? (
          <div className="max-w-sm mx-auto bg-[#2A0A14] rounded-2xl p-6 border border-[#5A1D2E] shadow-card">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-lg font-alexandria font-bold text-center text-white mb-1">
              لوحة تحكم العيادة
            </h1>
            <p className="text-xs text-gray-400 text-center mb-5">
              أدخل رمز الإدارة للمتابعة (الافتراضي: 1234)
            </p>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className="w-full text-center tracking-widest text-lg bg-[#3A0D1A] border border-[#5A1D2E] rounded-xl p-3 text-white focus:border-purple-500 outline-none"
              />
              {pinError && <p className="text-xs text-red-400 text-center">{pinError}</p>}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition"
              >
                دخول لوحة التحكم
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-alexandria font-bold text-white">
                  إدارة المرضى والعيادة
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  دكتورة عبير الدالي — متابعة الحجوزات والسجلات الطبية
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setPatientForm({ name: '', phone: '', age: '', age_unit: 'years', marital_status: '', chronic_notes: '' })
                    setShowPatientForm(!showPatientForm)
                  }}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition shadow-glow"
                >
                  {showPatientForm ? 'إغلاق النموذج' : '+ إضافة / تعديل مريض'}
                </button>
                <button
                  onClick={loadDashboard}
                  disabled={loading}
                  className="bg-[#2A0A14] hover:bg-[#3A0D1A] border border-[#5A1D2E] text-gray-200 px-3.5 py-2.5 rounded-xl text-xs font-bold transition"
                >
                  {loading ? '...' : 'تحديث'}
                </button>
              </div>
            </div>

            {showPatientForm && (
              <form
                onSubmit={handleSavePatient}
                className="bg-[#2A0A14] rounded-2xl p-5 border border-pink-500/40 shadow-card space-y-4 animate-slide-up"
              >
                <h2 className="font-bold text-sm text-pink-300">بيانات ملف المريض</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">اسم المريض *</label>
                    <input
                      type="text"
                      required
                      value={patientForm.name}
                      onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                      className="w-full bg-[#3A0D1A] border border-[#5A1D2E] rounded-xl p-2.5 text-sm text-white outline-none focus:border-pink-500"
                      placeholder="الاسم الكامل"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">رقم الهاتف *</label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={patientForm.phone}
                      onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                      className="w-full bg-[#3A0D1A] border border-[#5A1D2E] rounded-xl p-2.5 text-sm text-white outline-none focus:border-pink-500"
                      placeholder="010XXXXXXXX"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">السن</label>
                      <input
                        type="number"
                        value={patientForm.age}
                        onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                        className="w-full bg-[#3A0D1A] border border-[#5A1D2E] rounded-xl p-2.5 text-sm text-white outline-none focus:border-pink-500"
                        placeholder="السن"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">الحالة الاجتماعية</label>
                      <select
                        value={patientForm.marital_status}
                        onChange={(e) => setPatientForm({ ...patientForm, marital_status: e.target.value })}
                        className="w-full bg-[#3A0D1A] border border-[#5A1D2E] rounded-xl p-2.5 text-sm text-white outline-none focus:border-pink-500"
                      >
                        <option value="">غير محدد</option>
                        <option value="married">متزوجة</option>
                        <option value="single">آنسة</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">ملاحظات طبية عامة / أمراض مزمنة / حساسية</label>
                  <input
                    type="text"
                    value={patientForm.chronic_notes}
                    onChange={(e) => setPatientForm({ ...patientForm, chronic_notes: e.target.value })}
                    className="w-full bg-[#3A0D1A] border border-[#5A1D2E] rounded-xl p-2.5 text-sm text-white outline-none focus:border-pink-500"
                    placeholder="مثال: حساسية من البنسلين، متابعة حمل..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPatientForm(false)}
                    className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:bg-[#3A0D1A]"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2 rounded-xl text-xs font-bold"
                  >
                    حفظ البيانات
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#2A0A14] p-4 rounded-2xl border border-[#5A1D2E]">
                <span className="text-xs text-gray-400">إجمالي المرضى</span>
                <p className="text-2xl font-alexandria font-bold text-white mt-1">{stats.totalPatients}</p>
              </div>
              <div className="bg-[#2A0A14] p-4 rounded-2xl border border-[#5A1D2E]">
                <span className="text-xs text-gray-400">حجوزات مؤكدة</span>
                <p className="text-2xl font-alexandria font-bold text-pink-400 mt-1">{stats.confirmedAppointments}</p>
              </div>
              <div className="bg-[#2A0A14] p-4 rounded-2xl border border-[#5A1D2E]">
                <span className="text-xs text-gray-400">كشوفات مكتملة</span>
                <p className="text-2xl font-alexandria font-bold text-green-400 mt-1">{stats.completedAppointments}</p>
              </div>
              <div className="bg-[#2A0A14] p-4 rounded-2xl border border-[#5A1D2E]">
                <span className="text-xs text-gray-400">السجلات الطبية</span>
                <p className="text-2xl font-alexandria font-bold text-purple-400 mt-1">{stats.totalRecords}</p>
              </div>
            </div>

            <div className="bg-[#2A0A14] p-4 rounded-2xl border border-[#5A1D2E] space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('patients')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      activeTab === 'patients' ? 'bg-pink-600 text-white' : 'bg-[#3A0D1A] text-gray-300'
                    }`}
                  >
                    المرضى ({data.patients.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      activeTab === 'appointments' ? 'bg-pink-600 text-white' : 'bg-[#3A0D1A] text-gray-300'
                    }`}
                  >
                    الحجوزات ({data.appointments.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('records')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      activeTab === 'records' ? 'bg-pink-600 text-white' : 'bg-[#3A0D1A] text-gray-300'
                    }`}
                  >
                    التاريخ المرضي ({data.medicalRecords.length})
                  </button>
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالاسم أو رقم الهاتف..."
                  className="bg-[#3A0D1A] border border-[#5A1D2E] rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-pink-500 sm:w-64"
                />
              </div>

              {activeTab === 'appointments' && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-[#5A1D2E]/50">
                  {[
                    { id: 'all', label: 'الكل' },
                    { id: 'confirmed', label: 'مؤكد' },
                    { id: 'completed', label: 'تم الكشف' },
                    { id: 'cancelled', label: 'ملغي' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setStatusFilter(f.id)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                        statusFilter === f.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-[#1A050A] text-gray-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {activeTab === 'patients' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPatients.length === 0 ? (
                  <div className="col-span-full bg-[#2A0A14] rounded-2xl p-8 border border-[#5A1D2E] text-center text-xs text-gray-400">
                    لا يوجد مرضى مطابقون لبحثك.
                  </div>
                ) : (
                  filteredPatients.map((patient) => {
                    const patientRecordsCount = data.medicalRecords.filter(
                      (r) => r.patient_phone === patient.phone
                    ).length
                    const patientAppointmentsCount = data.appointments.filter(
                      (a) => a.patient_phone === patient.phone
                    ).length

                    return (
                      <div
                        key={patient.id}
                        className="bg-[#2A0A14] rounded-2xl p-4 border border-[#5A1D2E] flex flex-col justify-between gap-3 hover:border-pink-500/40 transition"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-base text-white">{patient.name}</h3>
                              <p className="text-xs text-pink-300 mt-0.5" dir="ltr">
                                {patient.phone}
                              </p>
                            </div>
                            <div className="flex gap-1.5 text-[10px]">
                              <span className="bg-[#3A0D1A] px-2 py-1 rounded-lg text-gray-300">
                                {patientAppointmentsCount} حجز
                              </span>
                              <span className="bg-purple-900/40 border border-purple-700/40 px-2 py-1 rounded-lg text-purple-200">
                                {patientRecordsCount} كشف
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-2.5 text-[11px] text-gray-400">
                            {patient.age && (
                              <span>• السن: {patient.age} {patient.age_unit === 'months' ? 'شهر' : 'سنة'}</span>
                            )}
                            {patient.marital_status && (
                              <span>• {patient.marital_status === 'married' ? 'متزوجة' : 'آنسة'}</span>
                            )}
                          </div>

                          {patient.chronic_notes && (
                            <p className="mt-2 text-xs bg-[#1A050A] p-2 rounded-lg text-pink-200 border border-[#5A1D2E]/60">
                              {patient.chronic_notes}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#5A1D2E]/60">
                          <button
                            onClick={() => openPatientMedicalFile(patient)}
                            className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-2 px-3 rounded-xl text-xs font-bold hover:opacity-90 transition"
                          >
                            الملف الطبي وإضافة كشف
                          </button>
                          <button
                            onClick={() => handleEditPatientClick(patient)}
                            className="bg-[#3A0D1A] hover:bg-[#5A1D2E] text-gray-200 py-2 px-3 rounded-xl text-xs font-bold transition"
                          >
                            تعديل
                          </button>
                          <a
                            href={`https://wa.me/2${patient.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-900/40 hover:bg-green-800/60 text-green-300 border border-green-800/60 py-2 px-3 rounded-xl text-xs font-bold transition"
                          >
                            واتساب
                          </a>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="space-y-3">
                {filteredAppointments.length === 0 ? (
                  <div className="bg-[#2A0A14] rounded-2xl p-8 border border-[#5A1D2E] text-center text-xs text-gray-400">
                    لا توجد حجوزات مطابقة.
                  </div>
                ) : (
                  filteredAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="bg-[#2A0A14] rounded-2xl p-4 border border-[#5A1D2E] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-white">{apt.patient_name}</span>
                          <span className="text-xs text-pink-300" dir="ltr">({apt.patient_phone})</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              apt.status === 'completed'
                                ? 'bg-green-900/40 text-green-400'
                                : apt.status === 'cancelled'
                                  ? 'bg-red-900/40 text-red-400'
                                  : 'bg-pink-900/40 text-pink-300'
                            }`}
                          >
                            {apt.status === 'completed' ? 'تم الكشف' : apt.status === 'cancelled' ? 'ملغي' : 'مؤكد'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          التاريخ: <strong className="text-gray-200">{apt.appointment_date}</strong> • الساعة:{' '}
                          <strong className="text-gray-200" dir="ltr">{apt.appointment_time}</strong>
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => {
                            handleStatusChange(apt.id, 'completed')
                            openPatientMedicalFile({ name: apt.patient_name, phone: apt.patient_phone })
                          }}
                          className="bg-green-700/80 hover:bg-green-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition"
                        >
                          تم الكشف + روشتة
                        </button>
                        {apt.status !== 'confirmed' && (
                          <button
                            onClick={() => handleStatusChange(apt.id, 'confirmed')}
                            className="bg-[#3A0D1A] hover:bg-[#5A1D2E] text-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold transition"
                          >
                            تأكيد
                          </button>
                        )}
                        {apt.status !== 'cancelled' && (
                          <button
                            onClick={() => handleStatusChange(apt.id, 'cancelled')}
                            className="bg-red-950/60 hover:bg-red-900/60 text-red-300 px-3 py-1.5 rounded-xl text-xs font-bold transition"
                          >
                            إلغاء
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'records' && (
              <div className="space-y-3">
                {filteredRecords.length === 0 ? (
                  <div className="bg-[#2A0A14] rounded-2xl p-8 border border-[#5A1D2E] text-center text-xs text-gray-400">
                    لا توجد سجلات طبية مسجلة بعد. افتح ملف أي مريض لإضافة كشف جديد.
                  </div>
                ) : (
                  filteredRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-[#2A0A14] rounded-2xl p-4 border border-[#5A1D2E] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-sm text-white">{rec.patient_name || rec.patient_phone}</span>
                          <span className="text-xs text-gray-400 mr-2">• {rec.visit_date}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteRecord(rec.id)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          حذف
                        </button>
                      </div>
                      <p className="text-xs text-pink-300 font-bold">التشخيص: {rec.diagnosis}</p>
                      {rec.prescription && (
                        <p className="text-xs text-gray-300 bg-[#1A050A] p-2.5 rounded-xl whitespace-pre-line">
                          {rec.prescription}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {selectedPatient && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#2A0A14] border border-[#5A1D2E] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#5A1D2E] pb-3">
                <div>
                  <h2 className="font-alexandria font-bold text-lg text-white">
                    الملف الطبي: {selectedPatient.name}
                  </h2>
                  <p className="text-xs text-pink-300" dir="ltr">{selectedPatient.phone}</p>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="w-8 h-8 rounded-xl bg-[#3A0D1A] hover:bg-[#5A1D2E] text-white flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddRecord} className="bg-[#1A050A] p-4 rounded-xl border border-[#5A1D2E] space-y-3">
                <h3 className="text-xs font-bold text-pink-400">+ تسجيل كشف / روشتة جديدة</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">تاريخ الزيارة</label>
                    <input
                      type="date"
                      required
                      value={recordForm.visit_date}
                      onChange={(e) => setRecordForm({ ...recordForm, visit_date: e.target.value })}
                      className="w-full bg-[#2A0A14] border border-[#5A1D2E] rounded-xl p-2.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">موعد المتابعة القادم (اختياري)</label>
                    <input
                      type="date"
                      value={recordForm.next_visit}
                      onChange={(e) => setRecordForm({ ...recordForm, next_visit: e.target.value })}
                      className="w-full bg-[#2A0A14] border border-[#5A1D2E] rounded-xl p-2.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">التشخيص *</label>
                  <input
                    type="text"
                    required
                    value={recordForm.diagnosis}
                    onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                    placeholder="اكتب التشخيص الطبي..."
                    className="w-full bg-[#2A0A14] border border-[#5A1D2E] rounded-xl p-2.5 text-xs text-white outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">الأعراض والشكوى</label>
                  <input
                    type="text"
                    value={recordForm.symptoms}
                    onChange={(e) => setRecordForm({ ...recordForm, symptoms: e.target.value })}
                    placeholder="الأعراض التي يشتكي منها المريض..."
                    className="w-full bg-[#2A0A14] border border-[#5A1D2E] rounded-xl p-2.5 text-xs text-white outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">الروشتة والعلاج</label>
                  <textarea
                    rows={3}
                    value={recordForm.prescription}
                    onChange={(e) => setRecordForm({ ...recordForm, prescription: e.target.value })}
                    placeholder="اكتب أسماء الأدوية والجرعات..."
                    className="w-full bg-[#2A0A14] border border-[#5A1D2E] rounded-xl p-2.5 text-xs text-white outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">ملاحظات وتعليمات</label>
                  <input
                    type="text"
                    value={recordForm.notes}
                    onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                    placeholder="تحاليل مطلوبة أو تعليمات عامة..."
                    className="w-full bg-[#2A0A14] border border-[#5A1D2E] rounded-xl p-2.5 text-xs text-white outline-none focus:border-pink-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition"
                >
                  حفظ الكشف في سجل المريض
                </button>
              </form>

              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-gray-300">السجل المرضي السابق:</h3>
                {data.medicalRecords.filter((r) => r.patient_phone === selectedPatient.phone).length === 0 ? (
                  <p className="text-xs text-gray-500">لا توجد زيارات سابقة مسجلة لهذا المريض.</p>
                ) : (
                  data.medicalRecords
                    .filter((r) => r.patient_phone === selectedPatient.phone)
                    .map((rec) => (
                      <div key={rec.id} className="bg-[#1A050A] p-3.5 rounded-xl border border-[#5A1D2E] text-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-pink-300">{rec.visit_date}</span>
                          <button
                            onClick={() => handleDeleteRecord(rec.id)}
                            className="text-red-400 hover:underline text-[11px]"
                          >
                            حذف
                          </button>
                        </div>
                        <p className="text-white font-bold">التشخيص: {rec.diagnosis}</p>
                        {rec.symptoms && <p className="text-gray-400">الأعراض: {rec.symptoms}</p>}
                        {rec.prescription && (
                          <p className="text-gray-200 bg-[#2A0A14] p-2 rounded-lg whitespace-pre-line">
                            {rec.prescription}
                          </p>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        <Footer locale={locale} />
      </main>
      <BottomNav />
    </div>
  )
}