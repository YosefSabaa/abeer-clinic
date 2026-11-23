'use client'
import Link from 'next/link'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { t } from '@/lib/i18n'

export default function BookingSummary({ locale, selectedDate, selectedSlot, form, loading, onSubmit, message }) {
  const dateLocale = locale === 'ar' ? ar : enUS
  const canBook = selectedDate && selectedSlot && form.name.trim().length >= 2 && form.phone.trim().length >= 3

  return (
    <div className="bg-[#2A0A14] rounded-2xl p-4 border border-[#5A1D2E] shadow-card animate-slide-up">
      <h3 className="font-bold text-sm mb-3">{t(locale, 'bookingSummary')}</h3>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between py-1.5 border-b border-[#5A1D2E]/50">
          <span className="text-gray-500">الطبيبة</span>
          <span className="text-gray-300">{t(locale, 'doctorName')}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-[#5A1D2E]/50">
          <span className="text-gray-500">التاريخ</span>
          <span className="text-gray-300">{selectedDate ? format(selectedDate, 'EEEE, d MMMM', { locale: dateLocale }) : '—'}</span>
        </div>
        <div className="flex justify-between py-1.5">
          <span className="text-gray-500">الوقت</span>
          <span className="text-gray-300" dir="ltr">{selectedSlot ? `${selectedSlot.start} - ${selectedSlot.end}` : '—'}</span>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={!canBook || loading}
        className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3.5 rounded-xl font-bold text-sm mt-4 hover:opacity-90 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-glow"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        {loading ? 'جاري الحجز...' : t(locale, 'confirmBooking')}
      </button>

      {!canBook && (
        <p className="text-[10px] text-gray-500 mt-2 text-center">
          {!selectedDate ? 'اختر تاريخاً' : !selectedSlot ? 'اختر وقتاً' : 'أدخل الاسم ورقم الهاتف'}
        </p>
      )}

      {message && (
        <div className={`mt-3 p-3 rounded-xl text-xs animate-slide-up ${message.type === 'success' ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-red-900/50 text-red-400 border border-red-800'}`}>
          <p>{message.text}</p>
          {message.type === 'success' && (
            <Link
              href="/patient"
              className="inline-block mt-2 bg-green-700/60 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-bold transition"
            >
              فتح ملفي الطبي والتاريخ المرضي ←
            </Link>
          )}
        </div>
      )}
    </div>
  )
}