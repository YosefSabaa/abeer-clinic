'use client'

import { useState, useEffect } from 'react'
import { useClinic } from '@/lib/clinic-context'
import { t } from '@/lib/i18n'

export default function WorkingHours({ locale: propLocale }) {
 const { settings, locale: ctxLocale } = useClinic()
 const locale = propLocale || ctxLocale
 const [todayIndex, setTodayIndex] = useState(null)

 useEffect(() => {
 setTodayIndex(new Date().getDay())
 }, [])

 return (
 <div className="clinic-card rounded-xl p-4 border clinic-border">
 <h3 className="font-bold text-sm mb-3 flex items-center gap-2 clinic-text">
 <svg className="w-4 h-4 clinic-accent-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 {t(locale, 'workingHours')}
 </h3>

 <ul className="space-y-2 text-xs">
 {(settings.working_hours || []).map((day) => {
 const isToday = todayIndex !== null && day.dayIndex === todayIndex
 return (
 <li
 key={day.dayIndex}
 className={`flex justify-between items-center py-1 ${
 isToday
 ? 'clinic-accent-text font-bold border-b clinic-border pb-2'
 : 'clinic-text-muted'
 }`}
 >
 <span>
 {locale === 'ar' ? day.day_ar : day.day_en}
 {isToday ? (locale === 'ar' ? ' - اليوم' : ' - Today') : ''}
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
