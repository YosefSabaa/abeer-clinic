'use client'

import Link from 'next/link'

import { useMemo, useState } from 'react'

export default function PatientsView({
 patients = [],
 appointments = [],
 medicalRecords = [],
 locale,
 onSavePatient,
 onOpenMedicalFile,
}) {
 const [searchQuery, setSearchQuery] = useState('')
 const [showForm, setShowForm] = useState(false)
 const [form, setForm] = useState({
 name: '',
 phone: '',
 age: '',
 age_unit: 'years',
 marital_status: '',
 chronic_notes: '',
 })

 const filtered = useMemo(() => {
 const q = searchQuery.trim().toLowerCase()
 if (!q) return patients
 return patients.filter(
 (p) => p.name?.toLowerCase().includes(q) || p.phone?.includes(q)
 )
 }, [patients, searchQuery])

 const handleSubmit = async (e) => {
 e.preventDefault()
 await onSavePatient(form)
 setForm({ name: '', phone: '', age: '', age_unit: 'years', marital_status: '', chronic_notes: '' })
 setShowForm(false)
 }

 const startEdit = (patient) => {
 setForm({
 name: patient.name || '',
 phone: patient.phone || '',
 age: patient.age || '',
 age_unit: patient.age_unit || 'years',
 marital_status: patient.marital_status || '',
 chronic_notes: patient.chronic_notes || '',
 })
 setShowForm(true)
 window.scrollTo({ top: 0, behavior: 'smooth' })
 }

 return (
 <div className="space-y-5">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <h1 className="text-xl sm:text-2xl font-alexandria font-bold clinic-text">
 {locale === 'ar' ? 'المرضى' : 'Patients'}
 </h1>
 <p className="text-xs clinic-text-muted mt-0.5">
 {patients.length} {locale === 'ar' ? 'ملف مريض مسجل في العيادة' : 'registered patients'}
 </p>
 </div>

 <div className="flex items-center gap-2 w-full sm:w-auto">
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder={locale === 'ar' ? 'ابحث بالاسم أو الهاتف...' : 'Search name or phone...'}
 className="flex-1 sm:w-64 clinic-card border clinic-border rounded-xl px-3.5 py-2.5 text-xs clinic-text outline-none "
 />
 <button
 type="button"
 onClick={() => {
 setForm({ name: '', phone: '', age: '', age_unit: 'years', marital_status: '', chronic_notes: '' })
 setShowForm(!showForm)
 }}
 className="clinic-accent-bg text-white px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap shadow-glow"
 >
 {showForm ? 'إغلاق' : '+ مريض جديد'}
 </button>
 </div>
 </div>

 {showForm && (
 <form
 onSubmit={handleSubmit}
 className="clinic-card border clinic-accent-border-soft rounded-2xl p-5 space-y-4 shadow-card"
 >
 <h2 className="font-bold text-sm clinic-accent-text">بيانات ملف المريض</h2>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="block text-[11px] clinic-text-muted mb-1">اسم المريض *</label>
 <input
 type="text"
 required
 value={form.name}
 onChange={(e) => setForm({ ...form, name: e.target.value })}
 className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none "
 placeholder="الاسم الكامل"
 />
 </div>
 <div>
 <label className="block text-[11px] clinic-text-muted mb-1">رقم الهاتف *</label>
 <input
 type="tel"
 required
 dir="ltr"
 value={form.phone}
 onChange={(e) => setForm({ ...form, phone: e.target.value })}
 className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none "
 placeholder="010XXXXXXXX"
 />
 </div>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="block text-[11px] clinic-text-muted mb-1">السن</label>
 <input
 type="number"
 value={form.age}
 onChange={(e) => setForm({ ...form, age: e.target.value })}
 className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none "
 />
 </div>
 <div>
 <label className="block text-[11px] clinic-text-muted mb-1">الحالة</label>
 <select
 value={form.marital_status}
 onChange={(e) => setForm({ ...form, marital_status: e.target.value })}
 className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none "
 >
 <option value="">غير محدد</option>
 <option value="married">مدام</option>
 <option value="single">آنسة</option>
 </select>
 </div>
 </div>
 </div>

 <div>
 <label className="block text-[11px] clinic-text-muted mb-1">ملاحظات طبية عامة / أمراض مزمنة / حساسية</label>
 <input
 type="text"
 value={form.chronic_notes}
 onChange={(e) => setForm({ ...form, chronic_notes: e.target.value })}
 className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none "
 placeholder="مثال: حساسية من البنسلين، متابعة حمل..."
 />
 </div>

 <div className="flex justify-end gap-2">
 <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-xs clinic-text-muted">
 إلغاء
 </button>
 <button type="submit" className="clinic-accent-bg text-white px-5 py-2 rounded-xl text-xs font-bold">
 حفظ البيانات
 </button>
 </div>
 </form>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {filtered.length === 0 ? (
 <div className="col-span-full clinic-card border clinic-border rounded-2xl p-10 text-center text-xs clinic-text-muted">
 لا يوجد مرضى مطابقون لبحثك.
 </div>
 ) : (
 filtered.map((patient) => {
 const recCount = medicalRecords.filter((r) => r.patient_phone === patient.phone).length
 const aptCount = appointments.filter((a) => a.patient_phone === patient.phone).length

 return (
 <div
 key={patient.id}
 className="clinic-card border clinic-border rounded-2xl p-4 flex flex-col justify-between gap-3 hover:clinic-accent-border-soft transition"
 >
 <div>
 <div className="flex items-start justify-between gap-2">
 <div>
 <h3 className="font-bold text-sm clinic-text">{patient.name}</h3>
 <p className="text-xs clinic-accent-text mt-0.5" dir="ltr">
 {patient.phone}
 </p>
 </div>
 <div className="flex gap-1.5 text-[10px]">
 <span className="clinic-surface border clinic-border px-2 py-1 rounded-lg clinic-text-secondary">
 {aptCount} حجز
 </span>
 <span className="bg-purple-500/15 text-purple-400 px-2 py-1 rounded-lg font-bold">
 {recCount} كشف
 </span>
 </div>
 </div>

 <div className="flex flex-wrap gap-2 mt-2 text-[11px] clinic-text-muted">
 {patient.age && (
 <span>
 • السن: {patient.age} {patient.age_unit === 'months' ? 'شهر' : 'سنة'}
 </span>
 )}
 {patient.marital_status && (
 <span>• {patient.marital_status === 'married' ? 'مدام' : 'آنسة'}</span>
 )}
 </div>

 {patient.chronic_notes && (
 <p className="mt-2 text-xs clinic-surface border clinic-border p-2.5 rounded-xl clinic-text-secondary">
 {patient.chronic_notes}
 </p>
 )}
 </div>

 <div className="flex flex-wrap gap-2 pt-2 border-t clinic-border">
 <button
 type="button"
 onClick={() => onOpenMedicalFile(patient)}
 className="flex-1 clinic-accent-bg text-white py-2 px-3 rounded-xl text-xs font-bold hover:opacity-90 transition"
 >
 الملف الطبي وإضافة كشف
 </button>
 <button
 type="button"
 onClick={() => startEdit(patient)}
 className="clinic-surface border clinic-border clinic-accent-hover py-2 px-3 rounded-xl text-xs font-bold transition"
 >
 تعديل
 </button>
 <Link
                    href={`/admin/whatsapp?phone=${encodeURIComponent(patient.phone || '')}&name=${encodeURIComponent(patient.name || '')}`}
                    className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 py-2 px-3 rounded-xl text-xs font-bold transition"
                  >
                    واتساب
                  </Link>
 </div>
 </div>
 )
 })
 )}
 </div>
 </div>
 )
}
