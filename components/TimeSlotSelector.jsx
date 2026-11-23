'use client'
import { t } from '@/lib/i18n'

export default function TimeSlotSelector({ locale, slots, selectedSlot, onSelectSlot }) {
  return (
    <div className="bg-[#2A0A14] rounded-2xl p-4 border border-[#5A1D2E] shadow-card animate-slide-up">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
        <span className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center text-xs font-bold">2</span>
        <span>{t(locale, 'chooseTime')}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {slots.map((slot) => {
          const isSelected = selectedSlot?.id === slot.id
          return (
            <button
              key={slot.id}
              onClick={() => slot.available && onSelectSlot(slot)}
              disabled={!slot.available}
              className={`p-2.5 rounded-xl border text-xs transition active:scale-95 ${
                isSelected
                  ? 'bg-pink-600 border-pink-500 text-white shadow-glow'
                  : slot.available
                    ? 'bg-[#3A0D1A] border-[#5A1D2E] text-gray-300 hover:bg-[#4A1D2A]'
                    : 'bg-[#1A050A] border-[#2A0A14] text-gray-700 cursor-not-allowed line-through'
              }`}
            >
              <div className="font-bold">{slot.type}</div>
              <div className="text-[10px] opacity-80 mt-0.5" dir="ltr">{slot.start} - {slot.end}</div>
            </button>
          )
        })}
        {slots.length === 0 && (
          <div className="col-span-full text-center text-xs text-gray-500 py-6">لا توجد مواعيد متاحة</div>
        )}
      </div>
    </div>
  )
}