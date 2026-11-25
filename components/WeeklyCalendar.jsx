'use client'

import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  addDays,
  isSameDay,
  isBefore,
  isAfter,
  startOfDay,
  getDay,
} from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { useClinic } from '@/lib/clinic-context'

export default function WeeklyCalendar({
  locale: propLocale,
  selectedDate,
  onSelectDate,
  currentWeek,
  onChangeWeek,
}) {
  const { settings, locale: ctxLocale } = useClinic()
  const locale = propLocale || ctxLocale

  if (!currentWeek) return null

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 6 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const dateLocale = locale === 'ar' ? ar : enUS

  const workingHours = settings.working_hours || []
  const holidays = settings.holidays || []
  const maxAdvanceDays = Number(settings.booking_rules?.max_advance_days) || 30
  const todayStart = startOfDay(new Date())
  const maxDate = addDays(todayStart, maxAdvanceDays)

  const getDayInfo = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const holiday = holidays.find((h) => h.date === dateStr)
    const rule = workingHours.find((w) => w.dayIndex === getDay(date))
    const isPast = isBefore(date, todayStart)
    const isTooFar = isAfter(date, maxDate)
    const isClosed = !rule || rule.closed
    const available = !isPast && !isTooFar && !isClosed && !holiday
    return { available, rule, holiday }
  }

  const selectedInfo = selectedDate ? getDayInfo(selectedDate) : null

  return (
    <div className="clinic-card rounded-2xl p-3.5 sm:p-4 border clinic-border shadow-card animate-fade-in overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 text-sm clinic-text-secondary">
          <span className="w-6 h-6 rounded-full clinic-accent-bg text-white flex items-center justify-center text-xs font-bold shrink-0">
            1
          </span>
          <span className="font-bold">{locale === 'ar' ? 'اختر اليوم' : 'Choose Day'}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChangeWeek(subWeeks(currentWeek, 1))}
            className="w-8 h-8 rounded-lg clinic-surface border clinic-border clinic-accent-hover active:scale-90 flex items-center justify-center transition shrink-0"
            aria-label="السابق"
          >
            &gt;
          </button>
          <span className="font-bold clinic-accent-text text-[11px] sm:text-xs min-w-[96px] text-center">
            {format(weekStart, 'd MMM', { locale: dateLocale })} -{' '}
            {format(addDays(weekStart, 6), 'd MMM', { locale: dateLocale })}
          </span>
          <button
            type="button"
            onClick={() => onChangeWeek(addWeeks(currentWeek, 1))}
            className="w-8 h-8 rounded-lg clinic-surface border clinic-border clinic-accent-hover active:scale-90 flex items-center justify-center transition shrink-0"
            aria-label="التالي"
          >
            &lt;
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {days.map((day) => {
          const { available, holiday } = getDayInfo(day)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => available && onSelectDate(day)}
              disabled={!available}
              title={holiday ? `إجازة: ${holiday.reason || ''}` : undefined}
              className={`min-w-0 flex flex-col items-center justify-center py-2 px-0.5 rounded-xl border text-center transition active:scale-95 ${
                isSelected
                  ? 'clinic-accent-bg border-transparent text-white shadow-glow'
                  : available
                    ? 'clinic-surface clinic-border clinic-text clinic-accent-hover'
                    : 'clinic-main clinic-border opacity-35 cursor-not-allowed'
              }`}
            >
              <span className="text-[9px] sm:text-[10px] mb-1 opacity-80 truncate w-full px-0.5">
                {format(day, 'EEE', { locale: dateLocale })}
              </span>
              <span className="text-sm sm:text-base font-bold">{format(day, 'd')}</span>
            </button>
          )
        })}
      </div>

      {selectedDate && selectedInfo?.rule && (
        <div className="mt-3 p-3 clinic-main rounded-xl border clinic-border flex items-center gap-2 text-xs clinic-text-muted animate-slide-up">
          <span className="clinic-accent-text">🕒</span>
          <span>
            {locale === 'ar' ? 'مواعيد العيادة يوم ' : 'Clinic hours on '}
            {format(selectedDate, 'EEEE', { locale: dateLocale })}:{' '}
            <strong className="clinic-text" dir="ltr">
              {selectedInfo.rule.start} - {selectedInfo.rule.end}
            </strong>
          </span>
        </div>
      )}
    </div>
  )
}
