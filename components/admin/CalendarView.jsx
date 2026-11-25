'use client'

import { useMemo, useState } from 'react'
import {
 format,
 startOfMonth,
 endOfMonth,
 startOfWeek,
 endOfWeek,
 addDays,
 addMonths,
 subMonths,
 isSameMonth,
 isSameDay,
} from 'date-fns'
import { ar, enUS } from 'date-fns/locale'

const WEEKDAYS_AR = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
const WEEKDAYS_EN = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']

export default function CalendarView({
 appointments = [],
 settings,
 locale,
 onStatusChange,
 onOpenMedicalFile,
  onOpenInvoice,
 onCreateManualAppointment,
}) {
 const [currentMonth, setCurrentMonth] = useState(new Date())
 const [selectedDate, setSelectedDate] = useState(new Date())
 const [showAdd, setShowAdd] = useState(false)
 const [form, setForm] = useState({ name: '', phone: '', time: '19:00', visitType: 'كشف' })

 const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')

 const countsByDate = useMemo(() => {
 const map = {}
 for (const apt of appointments) {
 if (apt.status === 'cancelled') continue
 map[apt.appointment_date] = (map[apt.appointment_date] || 0) + 1
 }
 return map
 }, [appointments])

 const holidayMap = useMemo(() => {
 const map = {}
 for (const h of settings?.holidays || []) {
 map[h.date] = h.reason || 'إجازة'
 }
 return map
 }, [settings?.holidays])

 const calendarDays = useMemo(() => {
 const monthStart = startOfMonth(currentMonth)
 const monthEnd = endOfMonth(currentMonth)
 const gridStart = startOfWeek(monthStart, { weekStartsOn: 6 })
 const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 6 })
 const days = []
 let d = gridStart
 while (d <= gridEnd) {
 days.push(d)
 d = addDays(d, 1)
 }
 return days
 }, [currentMonth])

 const dayAppointments = useMemo(() => {
 return appointments
 .filter((a) => a.appointment_date === selectedDateStr)
 .sort((a, b) => String(a.appointment_time).localeCompare(String(b.appointment_time)))
 }, [appointments, selectedDateStr])

 const handleQuickAdd = async (e) => {
 e.preventDefault()
 await onCreateManualAppointment({
 ...form,
 date: selectedDateStr,
 })
 setForm({ name: '', phone: '', time: '19:00', visitType: 'كشف' })
 setShowAdd(false)
 }

 return (
 <div className="space-y-5">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <h1 className="text-xl sm:text-2xl font-alexandria font-bold clinic-text">
 {locale === 'ar' ? 'التقويم والمواعيد' : 'Appointments Calendar'}
 </h1>
 <p className="text-xs clinic-text-muted mt-0.5">
 {locale === 'ar'
 ? 'استعرض جميع الحجوزات شهريًا وأدر مواعيد كل يوم بسهولة.'
 : 'Browse monthly bookings and manage each day schedule.'}
 </p>
 </div>

 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
 className="w-9 h-9 rounded-xl clinic-card border clinic-border hover:clinic-surface flex items-center justify-center font-bold"
 >
 ›
 </button>
 <span className="px-4 py-2 rounded-xl clinic-card border clinic-border text-xs font-bold min-w-[140px] text-center">
 {format(currentMonth, 'MMMM yyyy', { locale: locale === 'ar' ? ar : enUS })}
 </span>
 <button
 type="button"
 onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
 className="w-9 h-9 rounded-xl clinic-card border clinic-border hover:clinic-surface flex items-center justify-center font-bold"
 >
 ‹
 </button>
 <button
 type="button"
 onClick={() => {
 const now = new Date()
 setCurrentMonth(now)
 setSelectedDate(now)
 }}
 className="px-3 py-2 rounded-xl clinic-surface border clinic-border text-xs font-bold clinic-accent-hover"
 >
 {locale === 'ar' ? 'اليوم' : 'Today'}
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
 {/* Monthly Grid */}
 <div className="lg:col-span-2 clinic-card border clinic-border rounded-2xl p-4">
 <div className="grid grid-cols-7 gap-1.5 mb-2">
 {(locale === 'ar' ? WEEKDAYS_AR : WEEKDAYS_EN).map((dayName) => (
 <div key={dayName} className="text-center text-[11px] font-bold clinic-text-muted py-1.5">
 {dayName}
 </div>
 ))}
 </div>

 <div className="grid grid-cols-7 gap-1.5">
 {calendarDays.map((day) => {
 const key = format(day, 'yyyy-MM-dd')
 const inMonth = isSameMonth(day, currentMonth)
 const isSelected = isSameDay(day, selectedDate)
 const isToday = isSameDay(day, new Date())
 const count = countsByDate[key] || 0
 const isHoliday = Boolean(holidayMap[key])

 return (
 <button
 key={key}
 type="button"
 onClick={() => setSelectedDate(day)}
 className={`min-h-[68px] p-2 rounded-xl border text-start flex flex-col justify-between transition ${
 isSelected
 ? 'clinic-accent-bg text-white border-transparent shadow-glow'
 : inMonth
 ? 'clinic-surface clinic-border clinic-accent-hover clinic-text'
 : 'opacity-35 clinic-main clinic-border clinic-text-muted'
 }`}
 >
 <div className="flex items-center justify-between w-full">
 <span
 className={`text-xs font-bold ${
 isToday && !isSelected ? 'clinic-accent-text underline' : ''
 }`}
 >
 {format(day, 'd')}
 </span>
 {isHoliday && (
 <span className="w-2 h-2 rounded-full bg-red-400" title={holidayMap[key]} />
 )}
 </div>

 {count > 0 && (
 <span
 className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md w-fit ${
 isSelected
 ? 'bg-white/20 text-white'
 : 'clinic-accent-soft'
 }`}
 >
 {count} {locale === 'ar' ? 'حجز' : 'apt'}
 </span>
 )}
 </button>
 )
 })}
 </div>
 </div>

 {/* Selected Day Details */}
 <div className="clinic-card border clinic-border rounded-2xl p-4 flex flex-col gap-3">
 <div className="flex items-center justify-between border-b clinic-border pb-3">
 <div>
 <h2 className="font-bold text-sm clinic-text">
 {format(selectedDate, 'EEEE، d MMMM', { locale: locale === 'ar' ? ar : enUS })}
 </h2>
 <p className="text-[11px] clinic-text-muted">
 {holidayMap[selectedDateStr]
 ? `إجازة: ${holidayMap[selectedDateStr]}`
 : `${dayAppointments.length} حجوزات`}
 </p>
 </div>
 <button
 type="button"
 onClick={() => setShowAdd(!showAdd)}
 className="clinic-accent-bg text-white px-3 py-1.5 rounded-xl text-[11px] font-bold"
 >
 {showAdd ? 'إغلاق' : '+ حجز'}
 </button>
 </div>

 {showAdd && (
 <form onSubmit={handleQuickAdd} className="clinic-surface border clinic-border rounded-xl p-3 space-y-2">
 <input
 type="text"
 required
 placeholder="اسم المريض"
 value={form.name}
 onChange={(e) => setForm({ ...form, name: e.target.value })}
 className="w-full clinic-card border clinic-border rounded-lg p-2 text-xs outline-none"
 />
 <div className="grid grid-cols-2 gap-2">
 <input
 type="tel"
 required
 dir="ltr"
 placeholder="010XXXXXXXX"
 value={form.phone}
 onChange={(e) => setForm({ ...form, phone: e.target.value })}
 className="w-full clinic-card border clinic-border rounded-lg p-2 text-xs outline-none"
 />
 <input
 type="time"
 required
 value={form.time}
 onChange={(e) => setForm({ ...form, time: e.target.value })}
 className="w-full clinic-card border clinic-border rounded-lg p-2 text-xs outline-none"
 />
 </div>
 <button type="submit" className="w-full clinic-accent-bg text-white py-2 rounded-lg text-xs font-bold">
 حفظ الحجز
 </button>
 </form>
 )}

 <div className="space-y-2.5 overflow-y-auto max-h-[460px]">
 {dayAppointments.length === 0 ? (
 <p className="text-xs clinic-text-muted text-center py-8">
 لا توجد مواعيد في هذا اليوم.
 </p>
 ) : (
 dayAppointments.map((apt) => (
 <div
 key={apt.id}
 className="clinic-surface border clinic-border rounded-xl p-3 space-y-2"
 >
 <div className="flex items-center justify-between gap-2">
 <span className="font-bold text-xs clinic-text">#{apt.queue_number || ''} {apt.patient_name}</span>
 <span className="text-[11px] font-bold clinic-accent-text" dir="ltr">
 {String(apt.appointment_time).slice(0, 5)}
 </span>
 </div>
 <div className="flex items-center justify-between text-[11px] clinic-text-muted">
 <span dir="ltr">{apt.patient_phone}</span>
 <span>
 {apt.status === 'completed'
 ? '✓ تم الكشف'
 : apt.status === 'cancelled'
 ? '✕ ملغي'
 : '● مؤكد'}
 </span>
 </div>
 <div className="flex gap-1.5 pt-1">
 <button
 type="button"
 onClick={() => {
 onStatusChange(apt.id, 'completed')
 onOpenMedicalFile({ name: apt.patient_name, phone: apt.patient_phone })
 }}
 className="flex-1 bg-emerald-600/80 hover:bg-emerald-600 text-white py-1.5 rounded-lg text-[11px] font-bold"
 >
 كشف + روشتة
 </button>
 {apt.status !== 'cancelled' && (
 <button
 type="button"
 onClick={() => onStatusChange(apt.id, 'cancelled')}
 className="bg-red-500/15 hover:bg-red-500/25 text-red-400 px-2.5 py-1.5 rounded-lg text-[11px] font-bold"
 >
 إلغاء
 </button>
 )}
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 </div>
 )
}
