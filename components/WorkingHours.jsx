'use client'
import { useState, useEffect } from 'react'
import { WORKING_HOURS } from '@/lib/constants'
import { t } from '@/lib/i18n'

export default function WorkingHours({ locale }) {
  const [todayIndex, setTodayIndex] = useState(null)

  useEffect(() => {
    setTodayIndex(new Date().getDay())
  }, [])

  return (
    <div className="bg-[#2A0A14] rounded-xl p-4 border border-[#5A1D2E]">
      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {t(locale, 'workingHours')}
      </h3>

      <ul className="space-y-2 text-xs">
        {WORKING_HOURS.map((day) => {
          const isToday = todayIndex !== null && day.dayIndex === todayIndex
          return (
            <li
              key={day.day}
              className={`flex justify-between items-center py-1 ${
                isToday ? 'text-pink-300 font-bold border-b border-[#5A1D2E] pb-2' : 'text-gray-400'
              }`}
            >
              <span>
                {day.day}
                {isToday ? ' - اليوم' : ''}
              </span>
              {day.closed ? (
                <span className="text-red-400">{t(locale, 'closed')}</span>
              ) : (
                <span dir="ltr">
                  {day.start} - {day.end}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}