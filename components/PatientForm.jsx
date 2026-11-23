'use client'
import { useState } from 'react'
import { t } from '@/lib/i18n'

export default function PatientForm({ locale, form, setForm }) {
  const [showAdditional, setShowAdditional] = useState(false)

  return (
    <div className="bg-[#2A0A14] rounded-2xl p-4 border border-[#5A1D2E] shadow-card animate-slide-up">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <span className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center text-xs font-bold">3</span>
        <span>{t(locale, 'patientInfo')}</span>
        <span className="text-pink-400 text-[11px]">أدخل البيانات</span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-[11px] text-gray-500 mb-1.5">{t(locale, 'patientName')} *</label>
          <input
            type="text"
            required
            className="w-full bg-[#3A0D1A] border border-[#5A1D2E] rounded-xl p-3 text-white text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 outline-none transition"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="الاسم الكامل"
          />
        </div>

        <div>
          <label className="block text-[11px] text-gray-500 mb-1.5">{t(locale, 'patientPhone')} *</label>
          <div className="flex gap-2" dir="ltr">
            <span className="bg-[#3A0D1A] border border-[#5A1D2E] rounded-xl px-3 text-sm text-gray-400 flex items-center">EG +20</span>
            <input
              type="tel"
              required
              className="flex-1 bg-[#3A0D1A] border border-[#5A1D2E] rounded-xl p-3 text-white text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 outline-none transition"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="1XX XXXX XXXX"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAdditional(!showAdditional)}
          className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300 transition py-1"
        >
          <svg className={`w-3 h-3 transition-transform ${showAdditional ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          {t(locale, 'additionalInfo')}
        </button>

        {showAdditional && (
          <div className="space-y-3 pt-3 border-t border-[#5A1D2E] animate-slide-up">
            <div>
              <label className="block text-[11px] text-gray-500 mb-2">{t(locale, 'maritalStatus')}</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, maritalStatus: 'single' })}
                  className={`flex-1 py-2.5 rounded-xl text-xs border transition active:scale-95 ${form.maritalStatus === 'single' ? 'bg-pink-600 border-pink-500 text-white' : 'bg-[#3A0D1A] border-[#5A1D2E] text-gray-300'}`}
                >
                  {t(locale, 'single')}
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, maritalStatus: 'married' })}
                  className={`flex-1 py-2.5 rounded-xl text-xs border transition active:scale-95 ${form.maritalStatus === 'married' ? 'bg-pink-600 border-pink-500 text-white' : 'bg-[#3A0D1A] border-[#5A1D2E] text-gray-300'}`}
                >
                  {t(locale, 'married')}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-gray-500 mb-1.5">{t(locale, 'age')}</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="120"
                  className="flex-1 bg-[#3A0D1A] border border-[#5A1D2E] rounded-xl p-3 text-white text-sm focus:border-pink-500 outline-none transition"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="السن"
                />
                <select
                  className="bg-[#3A0D1A] border border-[#5A1D2E] rounded-xl p-3 text-white text-sm outline-none focus:border-pink-500"
                  value={form.ageUnit}
                  onChange={(e) => setForm({ ...form, ageUnit: e.target.value })}
                >
                  <option value="years">سنة</option>
                  <option value="months">شهر</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}