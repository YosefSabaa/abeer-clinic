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
    <div className="bg-[#2A0A14] rounded-xl p-4 border border-[#5A1D2E]">
      <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
        <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {t(locale, 'previousBooking')}
      </h3>
      <p className="text-xs text-gray-400 mb-3">{t(locale, 'previousBookingDesc')}</p>

      <form onSubmit={handleQuickLogin} className="flex gap-2" dir="ltr">
        <span className="bg-[#3A0D1A] border border-[#5A1D2E] rounded-lg px-3 py-2.5 text-xs text-gray-400 flex items-center">EG +20</span>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="010XXXXXXXX"
          className="flex-1 bg-[#3A0D1A] border border-[#5A1D2E] rounded-lg p-2.5 text-white text-sm focus:ring-1 focus:ring-pink-500 outline-none"
        />
        <button
          type="submit"
          className="bg-pink-600 hover:bg-pink-700 text-white px-3.5 rounded-lg text-xs font-bold transition whitespace-nowrap"
        >
          {t(locale, 'lookup')}
        </button>
      </form>
    </div>
  )
}