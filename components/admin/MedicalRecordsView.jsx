'use client'

import { useMemo, useState } from 'react'

export default function MedicalRecordsView({
 medicalRecords = [],
 patients = [],
 settings,
 locale,
 onDeleteRecord,
 onOpenMedicalFile,
}) {
 const [searchQuery, setSearchQuery] = useState('')
 const [printingRecord, setPrintingRecord] = useState(null)

 const filtered = useMemo(() => {
 const q = searchQuery.trim().toLowerCase()
 if (!q) return medicalRecords
 return medicalRecords.filter(
 (r) =>
 r.patient_name?.toLowerCase().includes(q) ||
 r.patient_phone?.includes(q) ||
 r.diagnosis?.toLowerCase().includes(q) ||
 r.prescription?.toLowerCase().includes(q)
 )
 }, [medicalRecords, searchQuery])

 const handlePrint = (rec) => {
 setPrintingRecord(rec)
 setTimeout(() => {
 window.print()
 }, 150)
 }

 return (
 <div className="space-y-5">
 <div className="flex flex-wrap items-center justify-between gap-3 no-print">
 <div>
 <h1 className="text-xl sm:text-2xl font-alexandria font-bold clinic-text">
 {locale === 'ar' ? 'سجل الكشف والروشتات' : 'Consultation & Prescription Log'}
 </h1>
 <p className="text-xs clinic-text-muted mt-0.5">
 {medicalRecords.length} {locale === 'ar' ? 'كشف مسجل' : 'recorded visits'}
 </p>
 </div>

 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="ابحث بالمريض أو التشخيص أو الدواء..."
 className="w-full sm:w-72 clinic-card border clinic-border rounded-xl px-3.5 py-2.5 text-xs clinic-text outline-none "
 />
 </div>

 {/* Printable Prescription Preview Banner */}
 {printingRecord && (
 <div className="bg-white text-black rounded-2xl p-6 border-2 clinic-accent-border space-y-4">
 <div className="flex items-start justify-between border-b-2 clinic-accent-border pb-3">
 <div>
 <h2 className="text-lg font-bold clinic-accent-text">
 {settings?.doctor_profile?.name_ar || 'دكتورة عبير الدالي'}
 </h2>
 <p className="text-xs text-gray-700">
 {settings?.doctor_profile?.title_ar}
 </p>
 </div>
 <div className="text-end text-xs text-gray-600">
 <p>التاريخ: {printingRecord.visit_date}</p>
 <button
 type="button"
 onClick={() => setPrintingRecord(null)}
 className="no-print mt-1 text-red-600 underline text-[11px]"
 >
 إغلاق المعاينة
 </button>
 </div>
 </div>

 <div className="text-sm space-y-1">
 <p>
 <strong>المريض:</strong> {printingRecord.patient_name || printingRecord.patient_phone}
 </p>
 <p>
 <strong>التشخيص:</strong> {printingRecord.diagnosis}
 </p>
 </div>

 <div className="border border-gray-300 rounded-xl p-4 min-h-[140px]">
 <p className="text-xs font-bold clinic-accent-text mb-2">Rx / العلاج الموصوف:</p>
 <p className="whitespace-pre-line text-sm leading-7">{printingRecord.prescription || '—'}</p>
 </div>

 {printingRecord.notes && (
 <p className="text-xs text-gray-700">
 <strong>ملاحظات:</strong> {printingRecord.notes}
 </p>
 )}

 <div className="border-t border-gray-200 pt-2 text-[11px] text-gray-500 flex justify-between">
 <span>{settings?.clinic_contact?.address_ar}</span>
 <span dir="ltr">{settings?.clinic_contact?.phone}</span>
 </div>
 </div>
 )}

 <div className="space-y-3 no-print">
 {filtered.length === 0 ? (
 <div className="clinic-card border clinic-border rounded-2xl p-10 text-center text-xs clinic-text-muted">
 لا توجد سجلات كشف مطابقة. افتح ملف أي مريض لإضافة كشف جديد.
 </div>
 ) : (
 filtered.map((rec) => {
 const patientObj = patients.find((p) => p.phone === rec.patient_phone) || {
 name: rec.patient_name || rec.patient_phone,
 phone: rec.patient_phone,
 }
 return (
 <div key={rec.id} className="clinic-card border clinic-border rounded-2xl p-4 space-y-2.5">
 <div className="flex flex-wrap items-center justify-between gap-2">
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => onOpenMedicalFile(patientObj)}
 className="font-bold text-sm clinic-text hover:opacity-80 transition"
 >
 {rec.patient_name || rec.patient_phone}
 </button>
 <span className="text-xs clinic-text-muted">• {rec.visit_date}</span>
 {rec.next_visit && (
 <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-bold">
 متابعة: {rec.next_visit}
 </span>
 )}
 </div>

 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => handlePrint(rec)}
 className="clinic-surface border clinic-border clinic-accent-hover px-3 py-1 rounded-lg text-xs font-bold"
 >
 طباعة روشتة
 </button>
 <button
 type="button"
 onClick={() => onDeleteRecord(rec.id)}
 className="text-xs text-red-400 hover:underline px-2 py-1"
 >
 حذف
 </button>
 </div>
 </div>

 <p className="text-xs clinic-accent-text font-bold">التشخيص: {rec.diagnosis}</p>
 {rec.symptoms && (
 <p className="text-xs clinic-text-muted">الشكوى: {rec.symptoms}</p>
 )}
 {rec.prescription && (
 <p className="text-xs clinic-surface border clinic-border p-3 rounded-xl whitespace-pre-line clinic-text-secondary">
 {rec.prescription}
 </p>
 )}
 </div>
 )
 })
 )}
 </div>
 </div>
 )
}
