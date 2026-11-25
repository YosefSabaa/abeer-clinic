'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useClinic } from '@/lib/clinic-context'
import {
  getAdminDashboardData,
  upsertPatientAdmin,
  updateAppointmentStatus,
  createManualAppointment,
  addMedicalRecord,
  deleteMedicalRecord,
} from '@/lib/booking'
import AdminShell from '@/components/admin/AdminShell'
import TodayView from '@/components/admin/TodayView'
import CalendarView from '@/components/admin/CalendarView'
import PatientsView from '@/components/admin/PatientsView'
import MedicalRecordsView from '@/components/admin/MedicalRecordsView'
import SettingsHub from '@/components/admin/SettingsHub'
import PatientMedicalModal from '@/components/admin/PatientMedicalModal'
import InvoiceModal from '@/components/admin/InvoiceModal'
import ConsultationsView from '@/components/admin/ConsultationsView'

export default function AdminDashboardPage() {
  const { settings, setSettings, refreshSettings, locale, setLocale, theme, setTheme, mounted } =
    useClinic()

  const [sessionInfo, setSessionInfo] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [phoneInput, setPhoneInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')

  const [activeSection, setActiveSection] = useState('today')
  const [data, setData] = useState({ patients: [], appointments: [], medicalRecords: [] })
  const [consultations, setConsultations] = useState([])
  const [consultationsWarning, setConsultationsWarning] = useState(null)
  const [adminSettings, setAdminSettings] = useState(null)
  const [dbWarning, setDbWarning] = useState(null)
  const [whatsappConfigured, setWhatsappConfigured] = useState(false)
  const [loading, setLoading] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [invoiceAppointment, setInvoiceAppointment] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((text, type = 'success') => {
    setToast({ text, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const loadAllAdminData = useCallback(async () => {
    setLoading(true)
    try {
      const [dashRes, settingsRes, consRes] = await Promise.all([
        getAdminDashboardData(),
        fetch('/api/admin/settings', { cache: 'no-store' }).then((r) => r.json()),
        fetch('/api/consultations', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ consultations: [] })),
      ])
      setConsultations(consRes?.consultations || [])
      setConsultationsWarning(consRes?.dbWarning || null)

      setData(dashRes)
      if (settingsRes?.settings) {
        setAdminSettings(settingsRes.settings)
        setSettings((prev) => ({ ...prev, ...settingsRes.settings }))
      }
      setDbWarning(settingsRes?.dbWarning || null)
      setWhatsappConfigured(Boolean(settingsRes?.whatsappConfigured))
    } catch (err) {
      showToast(err.message || 'تعذر تحميل بيانات لوحة التحكم', 'error')
    } finally {
      setLoading(false)
    }
  }, [setSettings, showToast])

  useEffect(() => {
    fetch('/api/admin/session', { cache: 'no-store' })
      .then((res) => res.json())
      .then(async (res) => {
        if (res.authenticated) {
          setSessionInfo(res)
          await loadAllAdminData()
        }
      })
      .catch(() => setSessionInfo(null))
      .finally(() => setCheckingSession(false))
  }, [loadAllAdminData])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput, password: passwordInput }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'بيانات الدخول غير صحيحة')
      setSessionInfo({ authenticated: true, ...result })
      setPasswordInput('')
      await loadAllAdminData()
    } catch (err) {
      setLoginError(err.message || 'تعذر تسجيل الدخول')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    setSessionInfo(null)
    setActiveSection('today')
  }

  const handleSaveSettings = async (nextSettings) => {
    setSavingSettings(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextSettings),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'فشل حفظ الإعدادات')
      setAdminSettings(result.settings)
      setSettings((prev) => ({ ...prev, ...result.settings }))
      setDbWarning(null)
      await refreshSettings()
      showToast('تم حفظ الإعدادات وتحديث الموقع بنجاح')
      return true
    } catch (err) {
      showToast(err.message, 'error')
      return false
    } finally {
      setSavingSettings(false)
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status)
      showToast('تم تحديث حالة الحجز')
      await loadAllAdminData()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleCreateManual = async (payload) => {
    try {
      await createManualAppointment(payload)
      showToast('تم تسجيل الحجز في الدور بنجاح')
      await loadAllAdminData()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleSavePatient = async (payload) => {
    try {
      await upsertPatientAdmin(payload)
      showToast('تم حفظ بيانات المريض')
      await loadAllAdminData()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleAddRecord = async (payload) => {
    try {
      await addMedicalRecord(payload)
      showToast('تم حفظ الكشف والروشتة في سجل المريض')
      await loadAllAdminData()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleReplyConsultation = async (id, doctor_reply) => {
    try {
      const res = await fetch('/api/consultations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, doctor_reply }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'فشل إرسال الرد')
      showToast('تم إرسال الرد للمريض بنجاح')
      await loadAllAdminData()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleDeleteConsultation = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه الاستشارة؟')) return
    try {
      const res = await fetch(`/api/consultations?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('تعذر الحذف')
      showToast('تم حذف الاستشارة')
      await loadAllAdminData()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleDeleteRecord = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا السجل المرضي؟')) return
    try {
      await deleteMedicalRecord(id)
      showToast('تم حذف السجل')
      await loadAllAdminData()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const todayCount = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    return data.appointments.filter(
      (a) => a.appointment_date === todayStr && a.status === 'confirmed'
    ).length
  }, [data.appointments])

  if (!mounted || checkingSession) {
    return (
      <div className="min-h-screen clinic-main flex items-center justify-center">
        <div className="w-8 h-8 border-2 clinic-spinner rounded-full animate-spin" />
      </div>
    )
  }

  if (!sessionInfo?.authenticated) {
    return (
      <div className="min-h-screen clinic-main flex items-center justify-center p-4">
        <div className="max-w-sm w-full clinic-card border clinic-border rounded-2xl p-6 shadow-card space-y-5">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl clinic-accent-bg text-white flex items-center justify-center mx-auto shadow-glow">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-lg font-alexandria font-bold clinic-text">
              {settings?.clinic_contact?.clinic_name_ar || settings?.doctor_profile?.name_ar || 'لوحة إدارة العيادة'}
            </h1>
            <p className="text-xs clinic-text-muted">
              تسجيل دخول الطبيب أو موظف الاستقبال
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-[11px] clinic-text-muted mb-1">رقم الهاتف</label>
              <input
                type="tel"
                required
                dir="ltr"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="01000000000"
                autoFocus
                className="w-full clinic-surface border clinic-border rounded-xl p-3 text-sm clinic-text outline-none text-left"
              />
            </div>

            <div>
              <label className="block text-[11px] clinic-text-muted mb-1">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  dir="ltr"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full clinic-surface border clinic-border rounded-xl p-3 pe-14 text-sm clinic-text outline-none text-left"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] clinic-text-muted hover:clinic-text"
                >
                  {showPassword ? 'إخفاء' : 'إظهار'}
                </button>
              </div>
            </div>

            {loginError && <p className="text-xs text-red-400 text-center">{loginError}</p>}

            <button
              type="submit"
              className="w-full clinic-accent-bg text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition shadow-glow"
            >
              دخول لوحة التحكم
            </button>
          </form>
        </div>
      </div>
    )
  }

  const effectiveSettings = adminSettings || settings

  return (
    <>
      {toast && (
        <div
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg border no-print ${
            toast.type === 'error'
              ? 'bg-red-950 text-red-200 border-red-700'
              : 'bg-emerald-950 text-emerald-200 border-emerald-700'
          }`}
        >
          {toast.text}
        </div>
      )}

      <AdminShell
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        todayCount={todayCount}
        pendingConsultationsCount={consultations.filter((c) => c.status !== 'replied').length}
        locale={locale}
        setLocale={setLocale}
        theme={theme}
        setTheme={setTheme}
        settings={effectiveSettings}
        sessionInfo={sessionInfo}
        onLogout={handleLogout}
      >
        {activeSection === 'today' && (
          <TodayView
            appointments={data.appointments}
            settings={effectiveSettings}
            locale={locale}
            onStatusChange={handleStatusChange}
            onOpenMedicalFile={setSelectedPatient}
            onOpenInvoice={setInvoiceAppointment}
            onCreateManualAppointment={handleCreateManual}
            onRefresh={loadAllAdminData}
            loading={loading}
          />
        )}

        {activeSection === 'calendar' && (
          <CalendarView
            appointments={data.appointments}
            settings={effectiveSettings}
            locale={locale}
            onStatusChange={handleStatusChange}
            onOpenMedicalFile={setSelectedPatient}
            onOpenInvoice={setInvoiceAppointment}
            onCreateManualAppointment={handleCreateManual}
          />
        )}

        {activeSection === 'patients' && (
          <PatientsView
            patients={data.patients}
            appointments={data.appointments}
            medicalRecords={data.medicalRecords}
            locale={locale}
            onSavePatient={handleSavePatient}
            onOpenMedicalFile={setSelectedPatient}
          />
        )}

        {activeSection === 'records' && (
          <MedicalRecordsView
            medicalRecords={data.medicalRecords}
            patients={data.patients}
            settings={effectiveSettings}
            locale={locale}
            onDeleteRecord={handleDeleteRecord}
            onOpenMedicalFile={setSelectedPatient}
          />
        )}

        {activeSection === 'consultations' && (
          <ConsultationsView
            consultations={consultations}
            dbWarning={consultationsWarning}
            locale={locale}
            onReply={handleReplyConsultation}
            onDelete={handleDeleteConsultation}
            onOpenMedicalFile={setSelectedPatient}
            onRefresh={loadAllAdminData}
            loading={loading}
          />
        )}

        {activeSection === 'settings' && (
          <SettingsHub
            settings={effectiveSettings}
            onSaveSettings={handleSaveSettings}
            saving={savingSettings}
            dbWarning={dbWarning}
            whatsappConfigured={whatsappConfigured}
            locale={locale}
          />
        )}
      </AdminShell>

      {selectedPatient && (
        <PatientMedicalModal
          patient={selectedPatient}
          medicalRecords={data.medicalRecords}
          settings={effectiveSettings}
          onClose={() => setSelectedPatient(null)}
          onAddRecord={handleAddRecord}
          onDeleteRecord={handleDeleteRecord}
        />
      )}

      {invoiceAppointment && (
        <InvoiceModal
          appointment={invoiceAppointment}
          settings={effectiveSettings}
          onClose={() => setInvoiceAppointment(null)}
        />
      )}
    </>
  )
}
