'use client'
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay, isBefore, startOfDay, getDay } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'

export default function WeeklyCalendar({ locale, selectedDate, onSelectDate, currentWeek, onChangeWeek }) {
  if (!currentWeek) return null

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 6 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const dateLocale = locale === 'ar' ? ar : enUS

  const isDayAvailable = (date) => {
    if (getDay(date) === 5) return false
    if (isBefore(date, startOfDay(new Date()))) return false
    return true
  }

  return (
    <div className="bg-[#2A0A14] rounded-2xl p-4 border border-[#5A1D2E] shadow-card animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center text-xs font-bold">1</span>
          <span>اختر اليوم</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => onChangeWeek(subWeeks(currentWeek, 1))} className="w-8 h-8 rounded-lg bg-[#3A0D1A] hover:bg-[#5A1D2E] active:scale-90 flex items-center justify-center transition" aria-label="السابق">&gt;</button>
          <span className="font-bold text-pink-300 text-xs min-w-[110px] text-center">
            {format(weekStart, 'd MMM', { locale: dateLocale })} - {format(addDays(weekStart, 6), 'd MMM yyyy', { locale: dateLocale })}
          </span>
          <button onClick={() => onChangeWeek(addWeeks(currentWeek, 1))} className="w-8 h-8 rounded-lg bg-[#3A0D1A] hover:bg-[#5A1D2E] active:scale-90 flex items-center justify-center transition" aria-label="التالي">&lt;</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const available = isDayAvailable(day)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          return (
            <button
              key={day.toString()}
              onClick={() => available && onSelectDate(day)}
              disabled={!available}
              className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-center transition active:scale-95 ${
                isSelected
                  ? 'bg-pink-600 border-pink-500 text-white shadow-glow'
                  : available
                    ? 'bg-[#3A0D1A] border-[#5A1D2E] text-gray-300 hover:bg-[#4A1D2A] hover:border-pink-500/30'
                    : 'bg-[#1A050A] border-[#2A0A14] text-gray-700 cursor-not-allowed'
              }`}
            >
              <span className="text-[10px] mb-1 opacity-80">{format(day, 'EEE', { locale: dateLocale })}</span>
              <span className="text-base font-bold">{format(day, 'd')}</span>
            </button>
          )
        })}
      </div>

      {selectedDate && (
        <div className="mt-3 p-3 bg-[#1A050A] rounded-xl border border-[#5A1D2E] flex items-center gap-2 text-xs text-gray-400 animate-slide-up">
          <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          دوام {format(selectedDate, 'EEEE', { locale: dateLocale })}: 7:00 م - 11:00 م
        </div>
      )}
    </div>
  )
}