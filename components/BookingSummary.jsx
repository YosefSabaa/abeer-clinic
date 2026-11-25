'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { useClinic } from '@/lib/clinic-context'
import { t } from '@/lib/i18n'

export default function BookingSummary({
  locale: propLocale,
  selectedDate,
  queueInfo,
  visitType,
  form,
  loading,
  onSubmit,
  message,
}) {
  const { settings, locale: ctxLocale } = useClinic()
  const locale = propLocale || ctxLocale
  const dateLocale = locale === 'ar' ? ar : enUS

  const questions = settings.booking_questions || []
  const missingRequiredQuestion = questions.find((q) => {
    if (!q.required) return false
    const key = q.label_ar || q.id
    const v =
      form.customAnswers?.[key] ||
      (q.field_key === 'maritalStatus' ? form.maritalStatus : '') ||
      (q.field_key === 'age' ? form.age : '')
    return !String(v || '').trim()
  })

  const isBookingOpen = settings.doctor_profile?.available_for_booking !== false
  const canBook =
    isBookingOpen &&
    selectedDate &&
    queueInfo?.isOpen &&
    !queueInfo?.isFull &&
    form.name.trim().length >= 2 &&
    form.phone.trim().length >= 9 &&
    !missingRequiredQuestion

  const doctorName =
    locale === 'ar'
      ? settings.doctor_profile?.name_ar
      : settings.doctor_profile?.name_en || settings.doctor_profile?.name_ar

  const notice =
    locale === 'ar'
      ? settings.booking_rules?.booking_notice_ar
      : settings.booking_rules?.booking_notice_en || settings.booking_rules?.booking_notice_ar

  return (
    <div className="clinic-card rounded-2xl p-4 border clinic-border shadow-card animate-slide-up overflow-hidden">
      <h3 className="font-bold text-sm mb-3 clinic-text">{t(locale, 'bookingSummary')}</h3>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between gap-2 py-1.5 border-b clinic-border">
          <span className="clinic-text-muted shrink-0">{locale === 'ar' ? 'الطبيبة' : 'Doctor'}</span>
          <span className="clinic-text font-bold truncate">{doctorName}</span>
        </div>
        <div className="flex justify-between gap-2 py-1.5 border-b clinic-border">
          <span className="clinic-text-muted shrink-0">{locale === 'ar' ? 'التاريخ' : 'Date'}</span>
          <span className="clinic-text">
            {selectedDate ? format(selectedDate, 'EEEE, d MMMM', { locale: dateLocale }) : '—'}
          </span>
        </div>
        <div className="flex justify-between gap-2 py-1.5 border-b clinic-border">
          <span className="clinic-text-muted shrink-0">رقم الدور المتوقع</span>
          <span className="clinic-accent-text font-bold">
            {queueInfo?.nextQueueNumber ? `#${queueInfo.nextQueueNumber}` : '—'}
          </span>
        </div>
        <div className="flex justify-between gap-2 py-1.5 border-b clinic-border">
          <span className="clinic-text-muted shrink-0">الوقت التقريبي للدخول</span>
          <span className="clinic-text font-bold" dir="ltr">
            {queueInfo?.estimatedTimeArabic || '—'}
          </span>
        </div>
        <div className="flex justify-between gap-2 py-1.5">
          <span className="clinic-text-muted shrink-0">نوع الزيارة</span>
          <span className="clinic-text font-bold">{visitType || 'كشف'}</span>
        </div>
      </div>

      {notice && (
        <p className="text-[11px] clinic-text-muted mt-3 clinic-surface border clinic-border rounded-xl px-3 py-2 leading-relaxed">
          {notice}
        </p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canBook || loading}
        className="w-full clinic-accent-bg text-white py-3.5 rounded-xl font-bold text-sm mt-4 hover:opacity-90 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-glow"
      >
        {loading ? 'جاري تأكيد الحجز...' : t(locale, 'confirmBooking')}
      </button>

      {!canBook && (
        <p className="text-[10px] clinic-text-muted mt-2 text-center">
          {!isBookingOpen
            ? 'الحجز متوقف حاليًا من قِبل العيادة'
            : !selectedDate
              ? 'اختر يومًا من التقويم'
              : queueInfo?.isFull
                ? 'اكتمل عدد حجوزات هذا اليوم، اختر يومًا آخر'
                : missingRequiredQuestion
                  ? `يرجى الإجابة على: ${missingRequiredQuestion.label_ar}`
                  : 'أدخل الاسم ورقم الهاتف'}
        </p>
      )}

      {message && (
        <div
          className={`mt-3 p-3 rounded-xl text-xs animate-slide-up ${
            message.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-red-500/15 text-red-400 border border-red-500/30'
          }`}
        >
          <p>{message.text}</p>
          {message.type === 'success' && (
            <Link
              href="/patient"
              className="inline-block mt-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold transition"
            >
              فتح ملفي الطبي والتاريخ المرضي ←
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
