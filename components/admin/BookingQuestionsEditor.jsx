'use client'

const QUESTION_TYPES = [
 { value: 'select', label_ar: 'اختيار متعدد', label_en: 'Multiple Choice' },
 { value: 'number', label_ar: 'رقم', label_en: 'Number' },
 { value: 'text', label_ar: 'نص قصير', label_en: 'Short Text' },
 { value: 'textarea', label_ar: 'نص طويل', label_en: 'Long Text' },
 { value: 'yes_no', label_ar: 'نعم / لا', label_en: 'Yes / No' },
]

export default function BookingQuestionsEditor({ questions = [], onChange, locale = 'ar' }) {
 const updateQuestion = (index, patch) => {
 const next = questions.map((q, i) => (i === index ? { ...q, ...patch } : q))
 onChange(next)
 }

 const moveQuestion = (index, direction) => {
 const target = index + direction
 if (target < 0 || target >= questions.length) return
 const next = [...questions]
 const [item] = next.splice(index, 1)
 next.splice(target, 0, item)
 onChange(next)
 }

 const removeQuestion = (index) => {
 onChange(questions.filter((_, i) => i !== index))
 }

 const addQuestion = () => {
 const id = `q-${Date.now()}`
 onChange([
 ...questions,
 {
 id,
 field_key: id,
 type: 'text',
 label_ar: '',
 label_en: '',
 hint_ar: '',
 hint_en: '',
 required: false,
 options: [],
 },
 ])
 }

 const addOption = (qIndex) => {
 const q = questions[qIndex]
 const nextOptions = [
 ...(q.options || []),
 { id: `opt-${Date.now()}`, value: `opt_${Date.now()}`, label_ar: '', label_en: '' },
 ]
 updateQuestion(qIndex, { options: nextOptions })
 }

 const updateOption = (qIndex, optIndex, patch) => {
 const q = questions[qIndex]
 const nextOptions = (q.options || []).map((opt, i) =>
 i === optIndex ? { ...opt, ...patch } : opt
 )
 updateQuestion(qIndex, { options: nextOptions })
 }

 const removeOption = (qIndex, optIndex) => {
 const q = questions[qIndex]
 updateQuestion(qIndex, {
 options: (q.options || []).filter((_, i) => i !== optIndex),
 })
 }

 return (
 <div className="space-y-4">
 <div>
 <h2 className="text-lg font-alexandria font-bold clinic-text">
 {locale === 'ar' ? 'أسئلة الحجز' : 'Booking Questions'}
 </h2>
 <p className="text-xs clinic-text-muted mt-0.5">
 {locale === 'ar'
 ? 'أسئلة بتظهر للمريض وهو بيحجز.'
 : 'Questions shown to patients while booking.'}
 </p>
 </div>

 <div className="space-y-4">
 {questions.map((q, qIdx) => (
 <div
 key={q.id || qIdx}
 className="clinic-main border clinic-border rounded-2xl p-4 sm:p-5 space-y-4"
 >
 {/* Card Top Controls matching screenshot */}
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div className="flex items-center gap-2.5">
 <span className="w-6 h-6 rounded-full clinic-surface border clinic-border text-xs font-bold flex items-center justify-center clinic-text">
 {qIdx + 1}
 </span>

 <select
 value={q.type}
 onChange={(e) => {
 const nextType = e.target.value
 updateQuestion(qIdx, {
 type: nextType,
 options:
 nextType === 'select' && (!q.options || q.options.length === 0)
 ? [
 { id: `opt-${Date.now()}-1`, value: 'opt1', label_ar: '', label_en: '' },
 { id: `opt-${Date.now()}-2`, value: 'opt2', label_ar: '', label_en: '' },
 ]
 : q.options || [],
 })
 }}
 className="clinic-surface border clinic-border rounded-xl px-3 py-2 text-xs font-bold clinic-text outline-none min-w-[140px]"
 >
 {QUESTION_TYPES.map((qt) => (
 <option key={qt.value} value={qt.value}>
 {locale === 'ar' ? qt.label_ar : qt.label_en}
 </option>
 ))}
 </select>
 </div>

 <div className="flex items-center gap-1.5">
 <button
 type="button"
 onClick={() => moveQuestion(qIdx, -1)}
 disabled={qIdx === 0}
 title="نقل لأعلى"
 className="w-8 h-8 rounded-lg clinic-surface border clinic-border flex items-center justify-center text-xs disabled:opacity-30 clinic-accent-hover transition"
 >
 ↑
 </button>
 <button
 type="button"
 onClick={() => moveQuestion(qIdx, 1)}
 disabled={qIdx === questions.length - 1}
 title="نقل لأسفل"
 className="w-8 h-8 rounded-lg clinic-surface border clinic-border flex items-center justify-center text-xs disabled:opacity-30 clinic-accent-hover transition"
 >
 ↓
 </button>
 <button
 type="button"
 onClick={() => removeQuestion(qIdx)}
 title="حذف السؤال"
 className="w-8 h-8 rounded-lg clinic-surface border clinic-border hover:border-red-500/50 text-red-400 flex items-center justify-center transition"
 >
 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
 </svg>
 </button>
 </div>
 </div>

 {/* Question Labels (Arabic + Optional English) */}
 <div className="space-y-1.5">
 <span className="text-xs font-bold clinic-text">السؤال</span>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-[10px] clinic-text-muted mb-1">عربي</label>
 <input
 type="text"
 value={q.label_ar || ''}
 onChange={(e) => updateQuestion(qIdx, { label_ar: e.target.value })}
 placeholder="مثال: الحالة الاجتماعية"
 className="w-full clinic-surface border clinic-border rounded-xl px-3.5 py-2.5 text-xs clinic-text outline-none "
 />
 </div>
 <div>
 <label className="block text-[10px] clinic-text-muted mb-1">English · اختياري</label>
 <input
 type="text"
 dir="ltr"
 value={q.label_en || ''}
 onChange={(e) => updateQuestion(qIdx, { label_en: e.target.value })}
 placeholder="Visit reason"
 className="w-full clinic-surface border clinic-border rounded-xl px-3.5 py-2.5 text-xs clinic-text outline-none text-left"
 />
 </div>
 </div>
 </div>

 {/* Options Editor for Multiple Choice */}
 {q.type === 'select' ? (
 <div className="space-y-2.5">
 <span className="text-xs font-bold clinic-text">الاختيارات</span>

 <div className="space-y-2.5">
 {(q.options || []).map((opt, optIdx) => (
 <div key={opt.id || optIdx} className="flex items-end gap-2">
 <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
 <div>
 <label className="block text-[10px] clinic-text-muted mb-1">عربي</label>
 <input
 type="text"
 value={opt.label_ar || ''}
 onChange={(e) =>
 updateOption(qIdx, optIdx, {
 label_ar: e.target.value,
 value: opt.value || e.target.value,
 })
 }
 placeholder="آنسة / مدام"
 className="w-full clinic-surface border clinic-border rounded-xl px-3.5 py-2.5 text-xs clinic-text outline-none "
 />
 </div>
 <div>
 <label className="block text-[10px] clinic-text-muted mb-1">English · اختياري</label>
 <input
 type="text"
 dir="ltr"
 value={opt.label_en || ''}
 onChange={(e) => updateOption(qIdx, optIdx, { label_en: e.target.value })}
 placeholder="Follow-up"
 className="w-full clinic-surface border clinic-border rounded-xl px-3.5 py-2.5 text-xs clinic-text outline-none text-left"
 />
 </div>
 </div>

 <button
 type="button"
 onClick={() => removeOption(qIdx, optIdx)}
 className="w-9 h-10 rounded-xl clinic-surface border clinic-border hover:border-red-500/50 text-red-400 flex items-center justify-center shrink-0"
 title="حذف الاختيار"
 >
 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
 </svg>
 </button>
 </div>
 ))}
 </div>

 <button
 type="button"
 onClick={() => addOption(qIdx)}
 className="w-full py-2.5 rounded-xl border border-dashed clinic-border clinic-accent-hover text-xs font-bold clinic-text-secondary hover:clinic-text transition"
 >
 + ضيف اختيار
 </button>
 </div>
 ) : (
 /* Optional Hint for non-select questions */
 <div className="space-y-1.5">
 <span className="text-[11px] clinic-text-muted">تلميح للمريض · اختياري</span>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <input
 type="text"
 value={q.hint_ar || ''}
 onChange={(e) => updateQuestion(qIdx, { hint_ar: e.target.value })}
 placeholder="تلميح يظهر داخل الخانة (عربي)"
 className="w-full clinic-surface border clinic-border rounded-xl px-3.5 py-2 text-xs clinic-text outline-none "
 />
 <input
 type="text"
 dir="ltr"
 value={q.hint_en || ''}
 onChange={(e) => updateQuestion(qIdx, { hint_en: e.target.value })}
 placeholder="Optional hint (English)"
 className="w-full clinic-surface border clinic-border rounded-xl px-3.5 py-2 text-xs clinic-text outline-none text-left"
 />
 </div>
 </div>
 )}

 {/* Required Switch Row matching screenshot */}
 <div className="flex items-center justify-between pt-2 border-t clinic-border">
 <span className="text-xs font-bold clinic-text">إجباري</span>
 <button
 type="button"
 role="switch"
 aria-checked={Boolean(q.required)}
 onClick={() => updateQuestion(qIdx, { required: !q.required })}
 className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
 q.required ? 'clinic-accent-solid' : 'clinic-surface border clinic-border'
 }`}
 >
 <span
 className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
 q.required ? '-translate-x-6' : '-translate-x-1'
 }`}
 />
 </button>
 </div>
 </div>
 ))}
 </div>

 <button
 type="button"
 onClick={addQuestion}
 className="w-full py-3 rounded-2xl border border-dashed clinic-border clinic-accent-hover text-xs font-bold clinic-accent-text hover:clinic-surface transition"
 >
 + إضافة سؤال جديد
 </button>
 </div>
 )
}
