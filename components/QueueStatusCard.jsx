'use client'

import { useClinic } from '@/lib/clinic-context'

export default function QueueStatusCard({
  locale: propLocale,
  queueInfo,
  loadingQueue,
  visitType,
  setVisitType,
}) {
  const { settings, locale: ctxLocale } = useClinic()
  const locale = propLocale || ctxLocale
  const rules = settings.booking_rules || {}

  const consultLabel =
    locale === 'ar' ? rules.consultation_label_ar || 'كشف' : rules.consultation_label_en || 'Consultation'
  const followupLabel =
    locale === 'ar' ? rules.followup_label_ar || 'استشارة' : rules.followup_label_en || 'Follow-up'
  const currency = locale === 'ar' ? rules.currency_ar || 'ج.م' : rules.currency_en || 'EGP'

  const percent =
    queueInfo?.maxDailyBookings > 0
      ? Math.min(100, Math.round((queueInfo.bookedCount / queueInfo.maxDailyBookings) * 100))
      : 0

  return (
    <div className="clinic-card rounded-2xl p-4 border clinic-border shadow-card animate-slide-up space-y-4 overflow-hidden">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-sm clinic-text-secondary">
          <span className="w-6 h-6 rounded-full clinic-accent-bg text-white flex items-center justify-center text-xs font-bold shrink-0">
            2
          </span>
          <span className="font-bold">
            {locale === 'ar' ? 'نظام الدور والوقت التقريبي' : 'Queue & Estimated Time'}
          </span>
        </div>

        {queueInfo?.isOpen && !queueInfo.isFull && (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            {locale === 'ar'
              ? `متبقي ${queueInfo.remainingSpots} من ${queueInfo.maxDailyBookings}`
              : `${queueInfo.remainingSpots} / ${queueInfo.maxDailyBookings} left`}
          </span>
        )}
      </div>

      {loadingQueue ? (
        <div className="py-6 flex items-center justify-center gap-2 text-xs clinic-text-muted">
          <div className="w-4 h-4 border-2 clinic-spinner rounded-full animate-spin" />
          <span>جاري حساب الدور والوقت التقريبي...</span>
        </div>
      ) : !queueInfo || !queueInfo.isOpen ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center text-xs text-red-400">
          {queueInfo?.isHoliday
            ? `العيادة في إجازة في هذا اليوم${queueInfo.holidayReason ? ` (${queueInfo.holidayReason})` : ''}`
            : 'العيادة مغلقة في هذا اليوم، يرجى اختيار يوم آخر.'}
        </div>
      ) : queueInfo.isFull ? (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
          <p className="text-xs font-bold text-amber-400">
            اكتمل العدد المسموح به لهذا اليوم ({queueInfo.maxDailyBookings} حجز)
          </p>
          <p className="text-[11px] clinic-text-muted">يرجى اختيار يوم آخر من التقويم بالأعلى.</p>
        </div>
      ) : (
        <>
          {/* Live Queue Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="clinic-surface border clinic-border rounded-xl p-3 text-center min-w-0">
              <span className="block text-[10px] clinic-text-muted truncate">دورك المتوقع</span>
              <span className="block text-xl font-alexandria font-bold clinic-accent-text mt-0.5">
                #{queueInfo.nextQueueNumber}
              </span>
            </div>

            <div className="clinic-surface border clinic-border rounded-xl p-3 text-center min-w-0">
              <span className="block text-[10px] clinic-text-muted truncate">الوقت التقريبي</span>
              <span className="block text-sm sm:text-base font-alexandria font-bold clinic-text mt-1" dir="ltr">
                {queueInfo.estimatedTimeArabic}
              </span>
            </div>

            <div className="clinic-surface border clinic-border rounded-xl p-3 text-center min-w-0">
              <span className="block text-[10px] clinic-text-muted truncate">المنتظرين قبلك</span>
              <span className="block text-xl font-alexandria font-bold clinic-text mt-0.5">
                {queueInfo.waitingAhead}
              </span>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] clinic-text-muted">
              <span>إشغال اليوم: {queueInfo.bookedCount} / {queueInfo.maxDailyBookings}</span>
              <span>متوسط المدة: {queueInfo.avgMinutesPerPatient} دقيقة لكل حالة</span>
            </div>
            <div className="w-full h-2 rounded-full clinic-main overflow-hidden border clinic-border">
              <div
                className="h-full clinic-accent-bg transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Visit Type Toggle */}
          <div className="space-y-1.5 pt-1">
            <span className="block text-[11px] clinic-text-muted">اختر نوع الزيارة</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVisitType(rules.consultation_label_ar || 'كشف')}
                className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-between gap-2 ${
                  visitType === (rules.consultation_label_ar || 'كشف')
                    ? 'clinic-accent-bg border-transparent text-white shadow-glow'
                    : 'clinic-surface clinic-border clinic-text-secondary clinic-accent-hover'
                }`}
              >
                <span>{consultLabel}</span>
                <span className="opacity-90">
                  {rules.consultation_price || 360} {currency}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setVisitType(rules.followup_label_ar || 'استشارة')}
                className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-between gap-2 ${
                  visitType === (rules.followup_label_ar || 'استشارة')
                    ? 'clinic-accent-bg border-transparent text-white shadow-glow'
                    : 'clinic-surface clinic-border clinic-text-secondary clinic-accent-hover'
                }`}
              >
                <span>{followupLabel}</span>
                <span className="opacity-90">
                  {rules.followup_price || 150} {currency}
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
