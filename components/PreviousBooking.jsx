'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { normalizePhone } from '@/lib/booking'
import { t } from '@/lib/i18n'

export default function PreviousBooking({ locale }) {
  const [phone, setPhone] = useState('')
  const router = useRouter()

  const handleQuickLogin = (e) => {
    e.preventDefault()
    const clean = normalizePhone(phone)
    if (!clean) return
    localStorage.setItem('patient_phone', clean)
    router.push('/patient')
  }

  return (
    <div className="clinic-card rounded-xl p-4 border clinic-border overflow-hidden">
      <h3 className="font-bold text-sm mb-2 flex items-center gap-2 clinic-text">
        <span className="clinic-accent-text">📄</span>
        {t(locale, 'previousBooking')}
      </h3>
      <p className="text-xs clinic-text-muted mb-3 leading-relaxed">{t(locale, 'previousBookingDesc')}</p>

      <form onSubmit={handleQuickLogin} className="space-y-2">
        <div className="flex gap-1.5 min-w-0" dir="ltr">
          <span className="clinic-surface border clinic-border rounded-lg px-2.5 py-2.5 text-xs clinic-text-muted flex items-center shrink-0">
            +20
          </span>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010XXXXXXXX"
            className="flex-1 min-w-0 w-full clinic-surface border clinic-border rounded-lg p-2.5 clinic-text text-sm outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full clinic-accent-bg text-white py-2.5 rounded-lg text-xs font-bold transition hover:opacity-90"
        >
          {t(locale, 'lookup')}
        </button>
      </form>
    </div>
  )
}
