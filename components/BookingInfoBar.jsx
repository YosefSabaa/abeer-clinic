'use client'
import { t } from '@/lib/i18n'

export default function BookingInfoBar({ locale }) {
  return (
    <div className="bg-[#2A0A14] rounded-xl p-3 border border-[#5A1D2E] flex flex-wrap items-center justify-center gap-3 text-xs">
      <span className="flex items-center gap-1.5 text-gray-300">
        <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        {t(locale, 'consultation')}
      </span>
      <span className="text-gray-600">·</span>
      <span className="flex items-center gap-1.5 text-gray-300">
        <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        {t(locale, 'duration')}
      </span>
      <span className="text-gray-600">·</span>
      <span className="flex items-center gap-1.5 text-gray-300">
        <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>
        {t(locale, 'price')}
      </span>
      <span className="text-gray-600">·</span>
      <span className="flex items-center gap-1.5 text-green-400">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
        {t(locale, 'noAccount')}
      </span>
    </div>
  )
}