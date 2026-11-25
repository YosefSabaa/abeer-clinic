'use client'

import Link from 'next/link'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'

export default function TodayView({
  appointments = [],
  settings,
  locale,
  onStatusChange,
  onOpenMedicalFile,
  onOpenInvoice,
  onCreateManualAppointment,
  onRefresh,
  loading,
}) {
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showManualForm, setShowManualForm] = useState(false)
  const [manualForm, setManualForm] = useState({
    name: '',
    phone: '',
    date: todayStr,
    time: '19:00',
    visitType: settings?.booking_rules?.consultation_label_ar || 'كشف',
  })
  const [submitting, setSubmitting] = useState(false)

  const todayAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.appointment_date === todayStr)
      .sort((a, b) => (Number(a.queue_number) || 999) - (Number(b.queue_number) || 999))
  }, [appointments, todayStr])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return todayAppointments
    return todayAppointments.filter((a) => a.status === statusFilter)
  }, [todayAppointments, statusFilter])

  const maxDaily = Number(settings?.booking_rules?.max_daily_bookings) || 20
  const stats = useMemo(() => {
    const active = todayAppointments.filter((a) => a.status !== 'cancelled').length
    return {
      total: active,
      remaining: Math.max(0, maxDaily - active),
      confirmed: todayAppointments.filter((a) => a.status === 'confirmed').length,
      completed: todayAppointments.filter((a) => a.status === 'completed').length,
      cancelled: todayAppointments.filter((a) => a.status === 'cancelled').length,
    }
  }, [todayAppointments, maxDaily])

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onCreateManualAppointment(manualForm)
      setManualForm({
        name: '',
        phone: '',
        date: todayStr,
        time: '19:00',
        visitType: settings?.booking_rules?.consultation_label_ar || 'كشف',
      })
      setShowManualForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-alexandria font-bold clinic-text">
            {locale === 'ar' ? 'قائمة دور اليوم' : "Today's Queue"}
          </h1>
          <p className="text-xs clinic-text-muted mt-0.5">
            {format(new Date(), 'EEEE، d MMMM yyyy', { locale: locale === 'ar' ? ar : enUS })} ·
            السعة اليومية: {stats.total} / {maxDaily}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowManualForm(!showManualForm)}
            className="clinic-accent-bg text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition shadow-glow"
          >
            {showManualForm ? 'إغلاق النموذج' : '+ إضافة حضور مباشر'}
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="clinic-card border clinic-border hover:clinic-surface px-3.5 py-2.5 rounded-xl text-xs font-bold transition"
          >
            {loading ? '...' : 'تحديث'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="clinic-card border clinic-border rounded-2xl p-4">
          <span className="text-xs clinic-text-muted">إجمالي الدور اليوم</span>
          <p className="text-2xl font-alexandria font-bold clinic-text mt-1">
            {stats.total} <span className="text-xs clinic-text-muted">/ {maxDaily}</span>
          </p>
        </div>
        <div className="clinic-card border clinic-border rounded-2xl p-4">
          <span className="text-xs clinic-text-muted">في الانتظار</span>
          <p className="text-2xl font-alexandria font-bold clinic-accent-text mt-1">{stats.confirmed}</p>
        </div>
        <div className="clinic-card border clinic-border rounded-2xl p-4">
          <span className="text-xs clinic-text-muted">تم الكشف</span>
          <p className="text-2xl font-alexandria font-bold text-emerald-400 mt-1">{stats.completed}</p>
        </div>
        <div className="clinic-card border clinic-border rounded-2xl p-4">
          <span className="text-xs clinic-text-muted">أماكن متبقية</span>
          <p className="text-2xl font-alexandria font-bold clinic-text mt-1">{stats.remaining}</p>
        </div>
      </div>

      {showManualForm && (
        <form
          onSubmit={handleManualSubmit}
          className="clinic-card border clinic-accent-border-soft rounded-2xl p-5 space-y-4 shadow-card"
        >
          <h2 className="text-sm font-bold clinic-accent-text">تسجيل حضور مباشر في الدور</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] clinic-text-muted mb-1">اسم المريض *</label>
              <input
                type="text"
                required
                value={manualForm.name}
                onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none"
                placeholder="الاسم الكامل"
              />
            </div>
            <div>
              <label className="block text-[11px] clinic-text-muted mb-1">رقم الهاتف *</label>
              <input
                type="tel"
                required
                dir="ltr"
                value={manualForm.phone}
                onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none"
                placeholder="010XXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-[11px] clinic-text-muted mb-1">نوع الزيارة</label>
              <select
                value={manualForm.visitType}
                onChange={(e) => setManualForm({ ...manualForm, visitType: e.target.value })}
                className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none"
              >
                <option value={settings?.booking_rules?.consultation_label_ar || 'كشف'}>
                  {settings?.booking_rules?.consultation_label_ar || 'كشف'}
                </option>
                <option value={settings?.booking_rules?.followup_label_ar || 'استشارة'}>
                  {settings?.booking_rules?.followup_label_ar || 'استشارة'}
                </option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="px-4 py-2 rounded-xl text-xs clinic-text-muted"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="clinic-accent-bg text-white px-5 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
            >
              {submitting ? 'جاري الإضافة...' : 'إضافة للدور'}
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: `الكل (${todayAppointments.length})` },
          { id: 'confirmed', label: `في الانتظار (${stats.confirmed})` },
          { id: 'completed', label: `تم الكشف (${stats.completed})` },
          { id: 'cancelled', label: `ملغي (${stats.cancelled})` },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setStatusFilter(f.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
              statusFilter === f.id
                ? 'clinic-accent-bg text-white border-transparent'
                : 'clinic-card clinic-border clinic-text-secondary hover:clinic-surface'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="clinic-card border clinic-border rounded-2xl p-10 text-center space-y-2">
            <p className="text-sm font-bold clinic-text">لا توجد حجوزات مسجلة لهذا اليوم</p>
            <p className="text-xs clinic-text-muted">
              يمكنك إضافة حضور مباشر بالأعلى أو استعراض الأيام القادمة من قسم التقويم.
            </p>
          </div>
        ) : (
          filtered.map((apt, idx) => (
            <div
              key={apt.id}
              className="clinic-card border clinic-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 clinic-accent-hover transition"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-14 h-14 rounded-xl clinic-surface border clinic-border flex flex-col items-center justify-center shrink-0">
                  <span className="text-sm font-alexandria font-bold clinic-accent-text">
                    #{apt.queue_number || idx + 1}
                  </span>
                  <span className="text-[10px] clinic-text-muted" dir="ltr">
                    {String(apt.appointment_time || '').slice(0, 5)}
                  </span>
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm clinic-text">{apt.patient_name}</span>
                    <span className="text-xs clinic-accent-text" dir="ltr">
                      {apt.patient_phone}
                    </span>
                    {apt.booking_code && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg clinic-surface border clinic-border clinic-text-muted" dir="ltr">
                        {apt.booking_code}
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded-full clinic-surface border clinic-border clinic-text-secondary">
                      {apt.slot_type || 'كشف'}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        apt.status === 'completed'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : apt.status === 'cancelled'
                            ? 'bg-red-500/15 text-red-400'
                            : 'clinic-accent-soft'
                      }`}
                    >
                      {apt.status === 'completed'
                        ? 'تم الكشف'
                        : apt.status === 'cancelled'
                          ? 'ملغي'
                          : 'في الدور'}
                    </span>
                  </div>

                  {apt.custom_answers && Object.keys(apt.custom_answers).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {Object.entries(apt.custom_answers).map(([k, v]) =>
                        v ? (
                          <span
                            key={k}
                            className="text-[10px] px-2 py-0.5 rounded-lg clinic-surface clinic-text-muted"
                          >
                            {k}: <strong className="clinic-text">{String(v)}</strong>
                          </span>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenInvoice(apt)}
                  className="clinic-surface border clinic-border clinic-accent-hover px-3 py-1.5 rounded-xl text-xs font-bold transition"
                >
                  🧾 فاتورة
                </button>
                <Link
                  href={`/admin/whatsapp?phone=${encodeURIComponent(apt.patient_phone || '')}&name=${encodeURIComponent(apt.patient_name || '')}`}
                  className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold transition"
                >
                  واتساب
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    onStatusChange(apt.id, 'completed')
                    onOpenMedicalFile({ name: apt.patient_name, phone: apt.patient_phone })
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition"
                >
                  تم الكشف + روشتة
                </button>
                {apt.status !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => onStatusChange(apt.id, 'cancelled')}
                    className="bg-red-500/15 hover:bg-red-500/25 text-red-400 px-3 py-1.5 rounded-xl text-xs font-bold transition"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
