'use client'

import { t } from '@/lib/i18n'

export default function TimeSlotSelector({ locale, slots, selectedSlot, onSelectSlot }) {
 return (
 <div className="clinic-card rounded-2xl p-4 border clinic-border shadow-card animate-slide-up">
 <div className="flex items-center gap-2 text-sm clinic-text-secondary mb-3">
 <span className="w-6 h-6 rounded-full clinic-accent-bg text-white flex items-center justify-center text-xs font-bold">
 2
 </span>
 <span className="font-bold">{t(locale, 'chooseTime')}</span>
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
 {slots.map((slot) => {
 const isSelected = selectedSlot?.id === slot.id
 return (
 <button
 key={slot.id}
 type="button"
 onClick={() => slot.available && onSelectSlot(slot)}
 disabled={!slot.available}
 className={`p-2.5 rounded-xl border text-xs transition active:scale-95 ${
 isSelected
 ? 'clinic-accent-bg border-transparent text-white shadow-glow'
 : slot.available
 ? 'clinic-surface clinic-border clinic-text clinic-accent-hover'
 : 'clinic-main clinic-border opacity-35 cursor-not-allowed line-through'
 }`}
 >
 <div className="font-bold">{slot.type}</div>
 <div className="text-[10px] opacity-80 mt-0.5" dir="ltr">
 {slot.start} - {slot.end}
 </div>
 </button>
 )
 })}
 {slots.length === 0 && (
 <div className="col-span-full text-center text-xs clinic-text-muted py-6">
 لا توجد مواعيد متاحة في هذا اليوم
 </div>
 )}
 </div>
 </div>
 )
}
