'use client'

import { useClinic } from '@/lib/clinic-context'
import { t } from '@/lib/i18n'

export default function PatientForm({ locale: propLocale, form, setForm }) {
  const { settings, locale: ctxLocale } = useClinic()
  const locale = propLocale || ctxLocale
  const questions = settings.booking_questions || []

  const setCustomAnswer = (question, value) => {
    const labelKey = question.label_ar || question.id
    const nextCustom = { ...(form.customAnswers || {}), [labelKey]: value }

    const patch = { customAnswers: nextCustom }
    if (question.field_key === 'maritalStatus') {
      patch.maritalStatus = value
    } else if (question.field_key === 'age') {
      patch.age = value
    }
    setForm((prev) => ({ ...prev, ...patch }))
  }

  const getCustomValue = (question) => {
    const labelKey = question.label_ar || question.id
    if (form.customAnswers && form.customAnswers[labelKey] !== undefined) {
      return form.customAnswers[labelKey]
    }
    if (question.field_key === 'maritalStatus') return form.maritalStatus || ''
    if (question.field_key === 'age') return form.age || ''
    return ''
  }

  return (
    <div className="clinic-card rounded-2xl p-4 border clinic-border shadow-card animate-slide-up overflow-hidden">
      <div className="flex items-center gap-2 text-sm clinic-text-secondary mb-4">
        <span className="w-6 h-6 rounded-full clinic-accent-bg text-white flex items-center justify-center text-xs font-bold shrink-0">
          3
        </span>
        <span className="font-bold">{t(locale, 'patientInfo')}</span>
      </div>

      <div className="space-y-3.5">
        <div>
          <label className="block text-[11px] clinic-text-muted mb-1.5">
            {t(locale, 'patientName')} *
          </label>
          <input
            type="text"
            required
            className="w-full min-w-0 clinic-surface border clinic-border rounded-xl p-3 clinic-text text-sm outline-none transition"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={locale === 'ar' ? 'الاسم الكامل' : 'Full name'}
          />
        </div>

        <div>
          <label className="block text-[11px] clinic-text-muted mb-1.5">
            {t(locale, 'patientPhone')} *
          </label>
          <div className="flex gap-2 min-w-0" dir="ltr">
            <span className="clinic-surface border clinic-border rounded-xl px-3 text-xs sm:text-sm clinic-text-muted flex items-center shrink-0">
              EG +20
            </span>
            <input
              type="tel"
              required
              className="flex-1 min-w-0 w-full clinic-surface border clinic-border rounded-xl p-3 clinic-text text-sm outline-none transition"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="01XXXXXXXXX"
            />
          </div>
        </div>

        {questions.length > 0 && (
          <div className="space-y-3.5 pt-3 border-t clinic-border">
            {questions.map((q) => {
              const label =
                locale === 'ar' ? q.label_ar || q.label_en : q.label_en || q.label_ar
              const hint = locale === 'ar' ? q.hint_ar : q.hint_en || q.hint_ar
              const val = getCustomValue(q)

              return (
                <div key={q.id} className="min-w-0">
                  <label className="block text-[11px] clinic-text-muted mb-1.5">
                    {label} {q.required ? <span className="clinic-accent-text">*</span> : ''}
                  </label>

                  {q.type === 'select' && (
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                      {(q.options || []).map((opt) => {
                        const optLabel =
                          locale === 'ar'
                            ? opt.label_ar || opt.label_en
                            : opt.label_en || opt.label_ar
                        const optValue = opt.value || opt.label_ar
                        const isSelected = val === optValue || val === opt.label_ar
                        return (
                          <button
                            key={opt.id || optValue}
                            type="button"
                            onClick={() => setCustomAnswer(q, optValue)}
                            className={`sm:flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border transition active:scale-95 truncate ${
                              isSelected
                                ? 'clinic-accent-bg border-transparent text-white shadow-glow'
                                : 'clinic-surface clinic-border clinic-text-secondary clinic-accent-hover'
                            }`}
                          >
                            {optLabel}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {q.type === 'yes_no' && (
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { v: 'نعم', l: locale === 'ar' ? 'نعم' : 'Yes' },
                        { v: 'لا', l: locale === 'ar' ? 'لا' : 'No' },
                      ].map((opt) => (
                        <button
                          key={opt.v}
                          type="button"
                          onClick={() => setCustomAnswer(q, opt.v)}
                          className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                            val === opt.v
                              ? 'clinic-accent-bg border-transparent text-white'
                              : 'clinic-surface clinic-border clinic-text-secondary'
                          }`}
                        >
                          {opt.l}
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type === 'number' && (
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={val}
                      onChange={(e) => setCustomAnswer(q, e.target.value)}
                      placeholder={hint || label}
                      className="w-full min-w-0 clinic-surface border clinic-border rounded-xl p-3 clinic-text text-sm outline-none transition"
                    />
                  )}

                  {q.type === 'text' && (
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => setCustomAnswer(q, e.target.value)}
                      placeholder={hint || label}
                      className="w-full min-w-0 clinic-surface border clinic-border rounded-xl p-3 clinic-text text-sm outline-none transition"
                    />
                  )}

                  {q.type === 'textarea' && (
                    <textarea
                      rows={2}
                      value={val}
                      onChange={(e) => setCustomAnswer(q, e.target.value)}
                      placeholder={hint || label}
                      className="w-full min-w-0 clinic-surface border clinic-border rounded-xl p-3 clinic-text text-sm outline-none transition"
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
