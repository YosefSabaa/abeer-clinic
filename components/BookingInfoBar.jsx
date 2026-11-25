'use client'

import { useClinic } from '@/lib/clinic-context'
import { t } from '@/lib/i18n'

export default function BookingInfoBar({ locale: propLocale }) {
  const { settings, locale: ctxLocale } = useClinic()
  const locale = propLocale || ctxLocale
  const rules = settings.booking_rules || {}

  const visitLabel =
    locale === 'ar' ? rules.consultation_label_ar || 'كشف' : rules.consultation_label_en || 'Consultation'
  const maxDaily = Number(rules.max_daily_bookings) || 20
  const priceLabel =
    locale === 'ar'
      ? `${rules.consultation_price || 360} ${rules.currency_ar || 'ج.م'}`
      : `${rules.consultation_price || 360} ${rules.currency_en || 'EGP'}`

  return (
    <div className="clinic-card rounded-xl p-3 border clinic-border flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs overflow-hidden">
      <span className="flex items-center gap-1.5 clinic-text-secondary">
        <span className="clinic-accent-text">🩺</span>
        {visitLabel}
      </span>
      <span className="clinic-text-muted">·</span>
      <span className="flex items-center gap-1.5 clinic-text-secondary">
        <span className="clinic-accent-text">🎟️</span>
        {locale === 'ar' ? `بأسبقية الدور (حد أقصى ${maxDaily} يوميًا)` : `Queue system (max ${maxDaily}/day)`}
      </span>
      <span className="clinic-text-muted">·</span>
      <span className="flex items-center gap-1.5 clinic-text-secondary font-bold">
        <span className="clinic-accent-text">💳</span>
        {priceLabel}
      </span>
      <span className="clinic-text-muted">·</span>
      <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
        <span>✓</span>
        {t(locale, 'noAccount')}
      </span>
    </div>
  )
}
