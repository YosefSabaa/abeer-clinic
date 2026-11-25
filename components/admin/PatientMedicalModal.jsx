'use client'

import { useState } from 'react'
import Link from 'next/link'
import { addDays, format } from 'date-fns'

const QUICK_DIAGNOSES = [
  'متابعة حمل طبيعي',
  'كشف دوري واطمئنان',
  'متابعة تبويض',
  'التهابات نسائية',
  'تكيس مبايض',
  'تأخر إنجاب',
]

const DOSAGE_OPTIONS = [
  'قرص مرة يوميًا',
  'قرص مرتين يوميًا',
  'قرص 3 مرات يوميًا',
  'كبسولة مرة يوميًا',
  'كبسولة مرتين يوميًا',
  'دهان موضعي مرتين يوميًا',
  'لبوس مهبلي مساءً',
  'عند اللزوم',
]

const DURATION_OPTIONS = [
  'لمدة 5 أيام',
  'لمدة أسبوع',
  'لمدة أسبوعين',
  'لمدة شهر',
  'مستمر حتى المتابعة',
]

function emptyMed() {
  return {
    id: `med-${Date.now()}-${Math.random()}`,
    name: '',
    dosage: 'قرص مرة يوميًا',
    duration: 'لمدة أسبوع',
    timing: 'بعد الأكل',
  }
}

export default function PatientMedicalModal({
  patient,
  medicalRecords = [],
  settings,
  onClose,
  onAddRecord,
  onDeleteRecord,
}) {
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const [mobileTab, setMobileTab] = useState('write')
  const [visitDate, setVisitDate] = useState(todayStr)
  const [nextVisit, setNextVisit] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [meds, setMeds] = useState([emptyMed()])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [printingRec, setPrintingRec] = useState(null)

  const patientRecords = medicalRecords.filter((r) => r.patient_phone === patient.phone)
  const doc = settings?.doctor_profile || {}
  const contact = settings?.clinic_contact || {}

  const updateMed = (id, patch) => {
    setMeds((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }

  const removeMed = (id) => {
    setMeds((prev) => (prev.length > 1 ? prev.filter((m) => m.id !== id) : [emptyMed()]))
  }

  const buildPrescriptionText = () => {
    return meds
      .filter((m) => m.name.trim())
      .map(
        (m, i) =>
          `${i + 1}. ${m.name.trim()} — ${m.dosage}${m.timing ? ` (${m.timing})` : ''}${m.duration ? ` — ${m.duration}` : ''}`
      )
      .join('\n')
  }

  const setQuickFollowup = (days) => {
    setNextVisit(format(addDays(new Date(), days), 'yyyy-MM-dd'))
  }

  const handleSave = async (e, andPrint = false) => {
    e?.preventDefault()
    if (!diagnosis.trim()) return
    setSaving(true)
    const prescriptionText = buildPrescriptionText()
    const payload = {
      patient_phone: patient.phone,
      patient_name: patient.name,
      visit_date: visitDate,
      symptoms: symptoms.trim(),
      diagnosis: diagnosis.trim(),
      prescription: prescriptionText,
      notes: notes.trim(),
      next_visit: nextVisit || null,
    }
    try {
      await onAddRecord(payload)
      if (andPrint) {
        setPrintingRec(payload)
        setTimeout(() => window.print(), 150)
      }
      setSymptoms('')
      setDiagnosis('')
      setMeds([emptyMed()])
      setNotes('')
      setNextVisit('')
    } finally {
      setSaving(false)
    }
  }

  const handlePrintRecord = (rec) => {
    setPrintingRec(rec)
    setTimeout(() => window.print(), 150)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-2 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-5xl my-2 sm:my-4 space-y-4">
        {/* Printable Official Prescription Sheet */}
        {printingRec && (
          <div className="bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
            <div className="h-2.5 clinic-accent-bg w-full" />
            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-alexandria font-bold text-slate-900">
                    {doc.name_ar || 'دكتورة عبير الدالي'}
                  </h2>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">{doc.title_ar}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{contact.address_ar}</p>
                </div>
                <div className="text-end text-xs space-y-1">
                  <span className="inline-block px-3 py-1 rounded-full bg-slate-100 font-bold text-slate-700">
                    روشتة طبية
                  </span>
                  <p className="text-slate-600">
                    التاريخ: <strong dir="ltr">{printingRec.visit_date}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => setPrintingRec(null)}
                    className="no-print text-red-600 hover:underline text-[11px] font-bold block ms-auto pt-1"
                  >
                    إغلاق معاينة الطباعة ✕
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">اسم المريض</span>
                  <strong className="text-slate-900">{patient.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">رقم الهاتف</span>
                  <strong className="text-slate-900" dir="ltr">{patient.phone}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">السن</span>
                  <strong className="text-slate-900">
                    {patient.age ? `${patient.age} ${patient.age_unit === 'months' ? 'شهر' : 'سنة'}` : '—'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">التشخيص</span>
                  <strong className="text-slate-900">{printingRec.diagnosis}</strong>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5 min-h-[190px] space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="text-2xl font-serif font-bold clinic-accent-text">℞</span>
                  <span className="text-xs font-bold text-slate-700">العلاج الموصوف والجرعات</span>
                </div>
                {printingRec.prescription ? (
                  <ul className="space-y-2.5 text-sm leading-7 text-slate-800">
                    {printingRec.prescription
                      .split('\n')
                      .filter(Boolean)
                      .map((line, i) => (
                        <li key={i} className="pb-2 border-b border-dashed border-slate-100 last:border-0">
                          {line}
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">لا توجد أدوية مسجلة.</p>
                )}
              </div>

              {printingRec.notes && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700">
                  <strong className="text-slate-900">التحاليل والتعليمات: </strong>
                  {printingRec.notes}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs text-slate-500">
                <div>
                  {printingRec.next_visit && (
                    <span>
                      موعد المتابعة القادم: <strong className="text-slate-900" dir="ltr">{printingRec.next_visit}</strong>
                    </span>
                  )}
                </div>
                <div className="text-end">
                  <p className="font-bold text-slate-700">توقيع الطبيبة</p>
                  <div className="border-b border-dashed border-slate-300 w-36 mt-4" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Clinical Workspace Modal (hidden on print) */}
        <div className="clinic-card border clinic-border rounded-3xl overflow-hidden shadow-2xl no-print">
          {/* Patient Summary Top Bar */}
          <div className="clinic-surface border-b clinic-border p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl clinic-accent-bg text-white flex items-center justify-center font-alexandria font-bold text-lg shrink-0 shadow-glow">
                {(patient.name || 'م').charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-alexandria font-bold text-base sm:text-lg clinic-text truncate">
                    {patient.name}
                  </h2>
                  {patient.age && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full clinic-card border clinic-border clinic-text-secondary">
                      {patient.age} {patient.age_unit === 'months' ? 'شهر' : 'سنة'}
                    </span>
                  )}
                  {patient.marital_status && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full clinic-card border clinic-border clinic-text-secondary">
                      {patient.marital_status === 'married' ? 'مدام' : 'آنسة'}
                    </span>
                  )}
                </div>
                <p className="text-xs clinic-accent-text mt-0.5" dir="ltr">
                  {patient.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/admin/whatsapp?phone=${encodeURIComponent(patient.phone || '')}&name=${encodeURIComponent(patient.name || '')}`}
                className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 px-3.5 py-2 rounded-xl text-xs font-bold transition"
              >
                💬 واتساب
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl clinic-card border clinic-border hover:border-red-500/50 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Chronic Notes Alert Banner */}
          {patient.chronic_notes && (
            <div className="mx-4 sm:mx-5 mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>
                <strong>تنبيه طبي مهم:</strong> {patient.chronic_notes}
              </span>
            </div>
          )}

          {/* Mobile Tab Switcher */}
          <div className="grid grid-cols-2 gap-2 p-4 pb-0 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileTab('write')}
              className={`py-2.5 rounded-xl text-xs font-bold transition ${
                mobileTab === 'write'
                  ? 'clinic-accent-bg text-white'
                  : 'clinic-surface clinic-text-muted'
              }`}
            >
              ✍️ كتابة كشف وروشتة
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('history')}
              className={`py-2.5 rounded-xl text-xs font-bold transition ${
                mobileTab === 'history'
                  ? 'clinic-accent-bg text-white'
                  : 'clinic-surface clinic-text-muted'
              }`}
            >
              📋 السجل السابق ({patientRecords.length})
            </button>
          </div>

          {/* 2-Column Clinical Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-5">
            {/* Right Column: Structured Consultation & Rx Builder */}
            <form
              onSubmit={(e) => handleSave(e, false)}
              className={`lg:col-span-7 space-y-4 ${mobileTab === 'history' ? 'hidden lg:block' : ''}`}
            >
              {/* Section 1: Visit Dates */}
              <div className="clinic-main border clinic-border rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-bold clinic-accent-text flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full clinic-accent-bg text-white inline-flex items-center justify-center text-[10px]">
                    1
                  </span>
                  تاريخ الكشف والمتابعة
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] clinic-text-muted mb-1">تاريخ الزيارة</label>
                    <input
                      type="date"
                      required
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full clinic-card border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] clinic-text-muted mb-1">موعد المتابعة القادم</label>
                    <input
                      type="date"
                      value={nextVisit}
                      onChange={(e) => setNextVisit(e.target.value)}
                      className="w-full clinic-card border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] clinic-text-muted">متابعة سريعة:</span>
                  {[
                    { label: '+ أسبوع', days: 7 },
                    { label: '+ أسبوعين', days: 14 },
                    { label: '+ شهر', days: 30 },
                  ].map((q) => (
                    <button
                      key={q.days}
                      type="button"
                      onClick={() => setQuickFollowup(q.days)}
                      className="px-2.5 py-1 rounded-lg clinic-surface border clinic-border clinic-accent-hover text-[11px] font-bold transition"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 2: Diagnosis & Symptoms */}
              <div className="clinic-main border clinic-border rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-bold clinic-accent-text flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full clinic-accent-bg text-white inline-flex items-center justify-center text-[10px]">
                    2
                  </span>
                  الشكوى والتشخيص الطبي
                </h3>

                <div>
                  <label className="block text-[11px] clinic-text-muted mb-1">التشخيص *</label>
                  <input
                    type="text"
                    required
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="اكتبي التشخيص الطبي هنا..."
                    className="w-full clinic-card border clinic-border rounded-xl p-3 text-sm clinic-text outline-none"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {QUICK_DIAGNOSES.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDiagnosis(d)}
                        className="px-2.5 py-1 rounded-lg clinic-surface border clinic-border clinic-accent-hover text-[11px] clinic-text-secondary transition"
                      >
                        + {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] clinic-text-muted mb-1">الشكوى والأعراض (اختياري)</label>
                  <input
                    type="text"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="مثال: صداع، إرهاق، ألم أسفل البطن..."
                    className="w-full clinic-card border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none"
                  />
                </div>
              </div>

              {/* Section 3: Structured Prescription Builder (Rx) */}
              <div className="clinic-main border clinic-border rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold clinic-accent-text flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full clinic-accent-bg text-white inline-flex items-center justify-center text-[10px]">
                      3
                    </span>
                    ℞ الروشتة والأدوية
                  </h3>
                  <button
                    type="button"
                    onClick={() => setMeds((prev) => [...prev, emptyMed()])}
                    className="clinic-accent-soft border px-3 py-1 rounded-lg text-[11px] font-bold"
                  >
                    + إضافة دواء
                  </button>
                </div>

                <div className="space-y-3">
                  {meds.map((med, idx) => (
                    <div
                      key={med.id}
                      className="clinic-card border clinic-border rounded-xl p-3 space-y-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg clinic-surface text-[11px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) => updateMed(med.id, { name: e.target.value })}
                          placeholder="اسم الدواء والتركيز (مثال: Folic Acid 5mg)"
                          className="flex-1 min-w-0 clinic-surface border clinic-border rounded-lg px-3 py-2 text-xs clinic-text outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeMed(med.id)}
                          className="w-8 h-8 rounded-lg clinic-surface text-red-400 hover:bg-red-500/15 flex items-center justify-center text-xs shrink-0"
                          title="حذف الدواء"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <select
                          value={med.dosage}
                          onChange={(e) => updateMed(med.id, { dosage: e.target.value })}
                          className="clinic-surface border clinic-border rounded-lg p-2 text-[11px] clinic-text outline-none"
                        >
                          {DOSAGE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>

                        <select
                          value={med.duration}
                          onChange={(e) => updateMed(med.id, { duration: e.target.value })}
                          className="clinic-surface border clinic-border rounded-lg p-2 text-[11px] clinic-text outline-none"
                        >
                          {DURATION_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>

                        <input
                          type="text"
                          value={med.timing}
                          onChange={(e) => updateMed(med.id, { timing: e.target.value })}
                          placeholder="التوقيت (بعد الأكل)"
                          className="clinic-surface border clinic-border rounded-lg px-2.5 py-2 text-[11px] clinic-text outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] clinic-text-muted mb-1">
                    تحاليل / أشعة مطلوبة وتعليمات للمريضة
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="مثال: صورة دم كاملة CBC، راحة تامة، شرب سوائل بكثرة..."
                    className="w-full clinic-card border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="submit"
                  disabled={saving || !diagnosis.trim()}
                  className="clinic-accent-bg text-white py-3 rounded-xl text-xs font-bold hover:opacity-90 transition disabled:opacity-40 shadow-glow"
                >
                  {saving ? 'جاري الحفظ...' : '✓ حفظ الكشف والروشتة'}
                </button>
                <button
                  type="button"
                  disabled={saving || !diagnosis.trim()}
                  onClick={(e) => handleSave(e, true)}
                  className="clinic-surface border clinic-border clinic-accent-hover py-3 rounded-xl text-xs font-bold clinic-text transition disabled:opacity-40"
                >
                  🖨 حفظ وطباعة الروشتة فورًا
                </button>
              </div>
            </form>

            {/* Left Column: Medical History Timeline */}
            <div
              className={`lg:col-span-5 space-y-3 ${mobileTab === 'write' ? 'hidden lg:block' : ''}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold clinic-text">
                  السجل المرضي السابق ({patientRecords.length})
                </h3>
              </div>

              <div className="space-y-3 max-h-[68vh] overflow-y-auto pe-1">
                {patientRecords.length === 0 ? (
                  <div className="clinic-main border clinic-border rounded-2xl p-8 text-center space-y-1.5">
                    <p className="text-xs font-bold clinic-text">لا توجد زيارات سابقة</p>
                    <p className="text-[11px] clinic-text-muted">
                      عند حفظ أول كشف ستظهر هنا جميع الروشتات السابقة مرتبة بالتاريخ.
                    </p>
                  </div>
                ) : (
                  patientRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className="clinic-main border clinic-border rounded-2xl p-4 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2 border-b clinic-border pb-2">
                        <span className="text-xs font-bold clinic-accent-text" dir="ltr">
                          📅 {rec.visit_date}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handlePrintRecord(rec)}
                            className="px-2.5 py-1 rounded-lg clinic-surface border clinic-border text-[11px] font-bold hover:opacity-85"
                          >
                            🖨 طباعة
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteRecord(rec.id)}
                            className="text-red-400 hover:underline text-[11px]"
                          >
                            حذف
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] clinic-text-muted block">التشخيص</span>
                        <p className="text-xs font-bold clinic-text">{rec.diagnosis}</p>
                      </div>

                      {rec.symptoms && (
                        <p className="text-[11px] clinic-text-muted">
                          <strong>الشكوى:</strong> {rec.symptoms}
                        </p>
                      )}

                      {rec.prescription && (
                        <div className="clinic-card border clinic-border rounded-xl p-3 space-y-1.5">
                          <span className="text-[10px] font-bold clinic-accent-text block">
                            ℞ العلاج الموصوف:
                          </span>
                          <ul className="space-y-1 text-xs clinic-text-secondary leading-relaxed">
                            {rec.prescription
                              .split('\n')
                              .filter(Boolean)
                              .map((line, i) => (
                                <li key={i}>{line}</li>
                              ))}
                          </ul>
                        </div>
                      )}

                      {rec.notes && (
                        <p className="text-[11px] clinic-text-muted">
                          <strong>تعليمات:</strong> {rec.notes}
                        </p>
                      )}

                      {rec.next_visit && (
                        <span className="inline-block text-[10px] px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 font-bold">
                          موعد المتابعة: {rec.next_visit}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
