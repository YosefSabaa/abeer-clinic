'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useClinic } from '@/lib/clinic-context'
import { THEME_PRESETS } from '@/lib/default-settings'
import BookingQuestionsEditor from '@/components/admin/BookingQuestionsEditor'

const SETTINGS_GROUPS = [
 {
 title_ar: 'صفحة الحجز',
 title_en: 'Booking Page',
 items: [
 { id: 'doctor_profile', label_ar: 'بياناتك', label_en: 'Your Info', icon: '🩺' },
 { id: 'clinic_contact', label_ar: 'العيادة والتواصل', label_en: 'Clinic & Contact', icon: '📍' },
 { id: 'theme_settings', label_ar: 'الألوان', label_en: 'Colors', icon: '🎨' },
 { id: 'reviews', label_ar: 'آراء المرضى', label_en: 'Patient Reviews', icon: '★' },
 ],
 },
 {
 title_ar: 'المواعيد والحجز',
 title_en: 'Schedule & Booking',
 items: [
 { id: 'working_hours', label_ar: 'مواعيد العمل', label_en: 'Working Hours', icon: '🕒' },
 { id: 'holidays', label_ar: 'الإجازات', label_en: 'Holidays', icon: '📅' },
 { id: 'booking_rules', label_ar: 'قواعد الحجز', label_en: 'Booking Rules', icon: '📋' },
 ],
 },
 {
 title_ar: 'المرضى',
 title_en: 'Patients',
 items: [
 { id: 'booking_questions', label_ar: 'أسئلة الحجز', label_en: 'Booking Questions', icon: '✉️' },
 ],
 },
 {
 title_ar: 'الفريق والكشف',
 title_en: 'Team & Security',
 items: [
 { id: 'reception_staff', label_ar: 'الاستقبال وصلاحياته', label_en: 'Reception & Permissions', icon: '👥' },
 { id: 'security_settings', label_ar: 'الأمان', label_en: 'Security', icon: '🔒' },
 ],
 },
 {
    title_ar: 'الرسائل والتواصل',
    title_en: 'Messaging',
    items: [
      { id: 'whatsapp_settings', label_ar: 'واتساب', label_en: 'WhatsApp', icon: '💬' },
    ],
  },
]

const PERMISSION_LABELS = [
 { key: 'viewToday', label: 'مشاهدة وإدارة قائمة اليوم' },
 { key: 'manageCalendar', label: 'إدارة التقويم والمواعيد' },
 { key: 'managePatients', label: 'إضافة وتعديل ملفات المرضى' },
 { key: 'viewMedicalRecords', label: 'الاطلاع على سجل الكشف والروشتات' },
 { key: 'manageWhatsapp', label: 'الرد على محادثات واتساب' },
 { key: 'manageSettings', label: 'تعديل إعدادات العيادة' },
]

export default function SettingsHub({
 settings,
 onSaveSettings,
 saving,
 dbWarning,
 whatsappConfigured,
 locale = 'ar',
}) {
 const { previewThemeSettings, setTheme } = useClinic()
  const [activeTab, setActiveTab] = useState('booking_questions')
 const [draft, setDraft] = useState(settings)
 const [dirty, setDirty] = useState(false)

 // Local helper state for adding holidays / reviews / staff
 const [newHoliday, setNewHoliday] = useState({ date: '', reason: '' })
 const [newReview, setNewReview] = useState({ name: '', date: '', text: '', rating: 5 })

 const updateSection = (sectionKey, nextValue) => {
 setDraft((prev) => ({ ...prev, [sectionKey]: nextValue }))
 setDirty(true)
 }

 const handleSave = async () => {
 const ok = await onSaveSettings(draft)
 if (ok) setDirty(false)
 }

 return (
 <div className="space-y-5">
 {/* Header matching screenshot */}
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <h1 className="text-2xl font-alexandria font-bold clinic-text">
 {locale === 'ar' ? 'الإعدادات' : 'Settings'}
 </h1>
 <p className="text-xs clinic-text-muted mt-0.5">
 {locale === 'ar'
 ? 'تحكم في نظام العيادة وصلاحيات الاستقبال.'
 : 'Control your clinic system and reception permissions.'}
 </p>
 </div>

 <div className="flex items-center gap-2">
 {dirty && (
 <button
 type="button"
 onClick={handleSave}
 disabled={saving}
 className="clinic-accent-bg text-white px-4 py-2 rounded-xl text-xs font-bold shadow-glow hover:opacity-90 transition disabled:opacity-50"
 >
 {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
 </button>
 )}

 <Link
 href="/booking"
 target="_blank"
 className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl clinic-surface border clinic-border clinic-accent-hover text-xs font-bold clinic-text transition"
 >
 <span>{locale === 'ar' ? 'شوف صفحتك' : 'View Your Page'}</span>
 <svg className="w-3.5 h-3.5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
 </svg>
 </Link>
 </div>
 </div>

 {dbWarning && (
 <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300">
 <strong>ملاحظة الإعداد الأولي:</strong> {dbWarning} — قم بتشغيل ملف{' '}
 <code className="px-1.5 py-0.5 rounded bg-black/30" dir="ltr">
 supabase/clinic_settings_migration.sql
 </code>{' '}
 في Supabase SQL Editor لتفعيل الحفظ الدائم في قاعدة البيانات.
 </div>
 )}

 {/* 2-Column Settings Hub matching screenshot */}
 <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5 items-start">
 {/* Sub-sidebar menu */}
 <aside className="clinic-card border clinic-border rounded-2xl p-3 space-y-4">
 {SETTINGS_GROUPS.map((group) => (
 <div key={group.title_ar} className="space-y-1">
 <p className="px-3 text-[10px] font-bold clinic-text-muted">
 {locale === 'ar' ? group.title_ar : group.title_en}
 </p>
 {group.items.map((item) => {
 const isActive = activeTab === item.id
 return (
 <button
 key={item.id}
 type="button"
 onClick={() => setActiveTab(item.id)}
 className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
 isActive
 ? 'clinic-surface border clinic-border clinic-text shadow-sm'
 : 'clinic-text-secondary hover:clinic-surface/60 border border-transparent'
 }`}
 >
 <span className="text-sm opacity-85">{item.icon}</span>
 <span>{locale === 'ar' ? item.label_ar : item.label_en}</span>
 </button>
 )
 })}
 </div>
 ))}
 </aside>

 {/* Active Settings Content Card */}
 <section className="clinic-card border clinic-border rounded-2xl p-5 sm:p-6 space-y-5">
 {/* 1. بياناتك */}
 {activeTab === 'doctor_profile' && (
 <div className="space-y-4">
 <div>
 <h2 className="text-lg font-alexandria font-bold clinic-text">بياناتك</h2>
 <p className="text-xs clinic-text-muted">
 تظهر هذه البيانات في أعلى صفحة الحجز للمرضى.
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-[11px] clinic-text-muted mb-1">اسم الطبيب (عربي)</label>
 <input
 type="text"
 value={draft.doctor_profile.name_ar || ''}
 onChange={(e) =>
 updateSection('doctor_profile', { ...draft.doctor_profile, name_ar: e.target.value })
 }
 className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none "
 />
 </div>
 <div>
 <label className="block text-[11px] clinic-text-muted mb-1">Doctor Name (English)</label>
 <input
 type="text"
 dir="ltr"
 value={draft.doctor_profile.name_en || ''}
 onChange={(e) =>
 updateSection('doctor_profile', { ...draft.doctor_profile, name_en: e.target.value })
 }
 className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none text-left"
 />
 </div>
 <div>
 <label className="block text-[11px] clinic-text-muted mb-1">المسمى الوظيفي (عربي)</label>
 <input
 type="text"
 value={draft.doctor_profile.title_ar || ''}
 onChange={(e) =>
 updateSection('doctor_profile', { ...draft.doctor_profile, title_ar: e.target.value })
 }
 className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none "
 />
 </div>
 <div>
 <label className="block text-[11px] clinic-text-muted mb-1">Title (English)</label>
 <input
 type="text"
 dir="ltr"
 value={draft.doctor_profile.title_en || ''}
 onChange={(e) =>
 updateSection('doctor_profile', { ...draft.doctor_profile, title_en: e.target.value })
 }
 className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none text-left"
 />
 </div>
 </div>

 <div>
 <label className="block text-[11px] clinic-text-muted mb-1">نبذة عن الطبيب (عربي)</label>
 <textarea
 rows={3}
 value={draft.doctor_profile.bio_ar || ''}
 onChange={(e) =>
 updateSection('doctor_profile', { ...draft.doctor_profile, bio_ar: e.target.value })
 }
 className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none "
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-[11px] clinic-text-muted mb-1">الشارة (مثال: استشاري)</label>
 <input
 type="text"
 value={draft.doctor_profile.badge_ar || ''}
 onChange={(e) =>
 updateSection('doctor_profile', { ...draft.doctor_profile, badge_ar: e.target.value })
 }
 className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none "
 />
 </div>
 <div>
 <label className="block text-[11px] clinic-text-muted mb-1">مسار صورة الطبيب</label>
 <input
 type="text"
 dir="ltr"
 value={draft.doctor_profile.image || '/doctor.jpg'}
 onChange={(e) =>
 updateSection('doctor_profile', { ...draft.doctor_profile, image: e.target.value })
 }
 className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none text-left"
 />
 </div>
 </div>

 <label className="flex items-center justify-between clinic-main border clinic-border rounded-xl p-3.5 cursor-pointer">
 <div>
 <span className="block text-xs font-bold clinic-text">إتاحة الحجز الأونلاين</span>
 <span className="text-[11px] clinic-text-muted">إظهار حالة «متاح للحجز» واستقبال حجوزات جديدة</span>
 </div>
 <input
 type="checkbox"
 checked={draft.doctor_profile.available_for_booking !== false}
 onChange={(e) =>
 updateSection('doctor_profile', {
 ...draft.doctor_profile,
 available_for_booking: e.target.checked,
 })
 }
 className="w-4 h-4 "
 />
 </label>
 </div>
 )}

 {/* 2. العيادة والتواصل */}
 {activeTab === 'clinic_contact' && (
 <div className="space-y-4">
 <div>
 <h2 className="text-lg font-alexandria font-bold clinic-text">العيادة والتواصل</h2>
 <p className="text-xs clinic-text-muted">
 العنوان وأرقام التواصل التي تظهر للمرضى وفي رسائل تأكيد واتساب.
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-[11px] clinic-text-muted mb-1">اسم العيادة</label>
 <input
 type="text"
 value={draft.clinic_contact.clinic_name_ar || ''}
 onChange={(e) =>
 updateSection('clinic_contact', {
 ...draft.clinic_contact,
 clinic_name_ar: e.target.value,
 })
 }
 className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none "
 />
 </div>
 <div>
 <label className="block text-[11px] clinic-text-muted mb-1">رقم الهاتف للاتصال</label>
 <input
 type="tel"
 dir="ltr"
 value={draft.clinic_contact.phone || ''}
 onChange={(e) =>
 updateSection('clinic_contact', { ...draft.clinic_contact, phone: e.target.value })
 }
 className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none text-left"
 />
 </div>
 <div>
 <label className="block text-[11px] clinic-text-muted mb-1">رقم واتساب (بدون +)</label>
 <input
 type="tel"
 dir="ltr"
 value={draft.clinic_contact.whatsapp || ''}
 onChange={(e) =>
 updateSection('clinic_contact', { ...draft.clinic_contact, whatsapp: e.target.value })
 }
 placeholder="2010XXXXXXXX"
 className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none text-left"
 />
 </div>
 <div>
 <label className="block text-[11px] clinic-text-muted mb-1">رابط خرائط جوجل</label>
 <input
 type="url"
 dir="ltr"
 value={draft.clinic_contact.map_url || ''}
 onChange={(e) =>
 updateSection('clinic_contact', { ...draft.clinic_contact, map_url: e.target.value })
 }
 className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none text-left"
 />
 </div>
 </div>

 <div>
 <label className="block text-[11px] clinic-text-muted mb-1">العنوان التفصيلي</label>
 <textarea
 rows={2}
 value={draft.clinic_contact.address_ar || ''}
 onChange={(e) =>
 updateSection('clinic_contact', { ...draft.clinic_contact, address_ar: e.target.value })
 }
 className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs clinic-text outline-none "
 />
 </div>
 </div>
 )}

 {/* 3. الألوان */}
 {activeTab === 'theme_settings' && (
 <div className="space-y-4">
 <div>
 <h2 className="text-lg font-alexandria font-bold clinic-text">الألوان والمظهر</h2>
 <p className="text-xs clinic-text-muted">
 اختر لوحة الألوان الرسمية لصفحة الحجز ولوحة التحكم.
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {THEME_PRESETS.map((preset) => {
 const selected = draft.theme_settings.preset === preset.id
 return (
 <button
 key={preset.id}
 type="button"
 onClick={() => {
                        const nextTheme = {
                          ...draft.theme_settings,
                          preset: preset.id,
                          accent_primary: preset.accentPrimary,
                          accent_secondary: preset.accentSecondary,
                        }
                        updateSection('theme_settings', nextTheme)
                        previewThemeSettings(nextTheme)
                      }}
 className={`p-4 rounded-2xl border text-start transition flex items-center justify-between ${
 selected
 ? 'clinic-accent-border clinic-surface shadow-sm'
 : 'clinic-main clinic-border hover:clinic-accent-border-soft'
 }`}
 >
 <div>
 <span className="block text-xs font-bold clinic-text">{preset.name_ar}</span>
 <span className="text-[10px] clinic-text-muted">{preset.name_en}</span>
 </div>
 <div className="flex items-center gap-1.5">
 <span
 className="w-6 h-6 rounded-full border border-white/20"
 style={{ backgroundColor: preset.dark.bgCard }}
 />
 <span
 className="w-6 h-6 rounded-full border border-white/20"
 style={{ backgroundColor: preset.accentPrimary }}
 />
 <span
 className="w-6 h-6 rounded-full border border-white/20"
 style={{ backgroundColor: preset.accentSecondary }}
 />
 </div>
 </button>
 )
 })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="clinic-main border clinic-border rounded-xl p-3 space-y-1.5">
                  <label className="block text-[11px] clinic-text-muted">الوضع الافتراضي للموقع</label>
                  <div className="flex gap-1.5">
                    {[
                      { id: 'dark', label: '☾ داكن' },
                      { id: 'light', label: '☀ فاتح' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          const nextTheme = { ...draft.theme_settings, default_mode: m.id }
                          updateSection('theme_settings', nextTheme)
                          setTheme(m.id)
                          previewThemeSettings(nextTheme)
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                          (draft.theme_settings.default_mode || 'dark') === m.id
                            ? 'clinic-accent-bg text-white border-transparent'
                            : 'clinic-surface clinic-border clinic-text-secondary'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="clinic-main border clinic-border rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="block text-[11px] clinic-text-muted">اللون الأساسي</span>
                    <span className="text-xs font-bold" dir="ltr">{draft.theme_settings.accent_primary}</span>
                  </div>
                  <input
                    type="color"
                    value={draft.theme_settings.accent_primary || '#EC4899'}
                    onChange={(e) => {
                      const nextTheme = { ...draft.theme_settings, accent_primary: e.target.value }
                      updateSection('theme_settings', nextTheme)
                      previewThemeSettings(nextTheme)
                    }}
                    className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>

                <div className="clinic-main border clinic-border rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="block text-[11px] clinic-text-muted">اللون الثانوي</span>
                    <span className="text-xs font-bold" dir="ltr">{draft.theme_settings.accent_secondary}</span>
                  </div>
                  <input
                    type="color"
                    value={draft.theme_settings.accent_secondary || '#A855F7'}
                    onChange={(e) => {
                      const nextTheme = { ...draft.theme_settings, accent_secondary: e.target.value }
                      updateSection('theme_settings', nextTheme)
                      previewThemeSettings(nextTheme)
                    }}
                    className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. آراء المرضى */}
 {activeTab === 'reviews' && (
 <div className="space-y-4">
 <div>
 <h2 className="text-lg font-alexandria font-bold clinic-text">آراء المرضى</h2>
 <p className="text-xs clinic-text-muted">
 أضف أو أخفِ التقييمات التي تظهر في صفحة الحجز.
 </p>
 </div>

 <div className="clinic-main border clinic-border rounded-2xl p-4 space-y-3">
 <p className="text-xs font-bold clinic-accent-text">+ إضافة تقييم جديد</p>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
 <input
 type="text"
 placeholder="اسم المريض"
 value={newReview.name}
 onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
 className="clinic-surface border clinic-border rounded-xl p-2.5 text-xs outline-none"
 />
 <input
 type="text"
 placeholder="التاريخ (مثال: نوفمبر 2026)"
 value={newReview.date}
 onChange={(e) => setNewReview({ ...newReview, date: e.target.value })}
 className="clinic-surface border clinic-border rounded-xl p-2.5 text-xs outline-none"
 />
 <select
 value={newReview.rating}
 onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
 className="clinic-surface border clinic-border rounded-xl p-2.5 text-xs outline-none"
 >
 {[5, 4, 3].map((r) => (
 <option key={r} value={r}>
 {'★'.repeat(r)} ({r})
 </option>
 ))}
 </select>
 </div>
 <textarea
 rows={2}
 placeholder="نص التقييم..."
 value={newReview.text}
 onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
 className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs outline-none"
 />
 <button
 type="button"
 onClick={() => {
 if (!newReview.name.trim() || !newReview.text.trim()) return
 updateSection('reviews', [
 {
 id: `rev-${Date.now()}`,
 ...newReview,
 visible: true,
 },
 ...(draft.reviews || []),
 ])
 setNewReview({ name: '', date: '', text: '', rating: 5 })
 }}
 className="clinic-accent-bg text-white px-4 py-2 rounded-xl text-xs font-bold"
 >
 إضافة للقائمة
 </button>
 </div>

 <div className="space-y-2.5">
 {(draft.reviews || []).map((rev, idx) => (
 <div
 key={rev.id || idx}
 className="clinic-main border clinic-border rounded-xl p-3.5 flex items-start justify-between gap-3"
 >
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className="font-bold text-xs clinic-text">{rev.name}</span>
 <span className="text-amber-400 text-xs">{'★'.repeat(rev.rating || 5)}</span>
 <span className="text-[10px] clinic-text-muted">{rev.date}</span>
 </div>
 <p className="text-xs clinic-text-secondary">{rev.text}</p>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 <button
 type="button"
 onClick={() =>
 updateSection(
 'reviews',
 draft.reviews.map((r, i) =>
 i === idx ? { ...r, visible: r.visible === false } : r
 )
 )
 }
 className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
 rev.visible === false
 ? 'clinic-surface clinic-text-muted'
 : 'bg-emerald-500/15 text-emerald-400'
 }`}
 >
 {rev.visible === false ? 'مخفي' : 'ظاهر'}
 </button>
 <button
 type="button"
 onClick={() =>
 updateSection(
 'reviews',
 draft.reviews.filter((_, i) => i !== idx)
 )
 }
 className="text-red-400 text-xs px-2 py-1"
 >
 حذف
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* 5. مواعيد العمل */}
 {activeTab === 'working_hours' && (
 <div className="space-y-4">
 <div>
 <h2 className="text-lg font-alexandria font-bold clinic-text">مواعيد العمل</h2>
 <p className="text-xs clinic-text-muted">
 تُستخدم هذه المواعيد تلقائيًا لتوليد الفترات المتاحة في صفحة الحجز.
 </p>
 </div>

 <div className="space-y-2.5">
 {draft.working_hours.map((day, idx) => (
 <div
 key={day.dayIndex}
 className="clinic-main border clinic-border rounded-xl p-3 flex flex-wrap items-center justify-between gap-3"
 >
 <label className="flex items-center gap-2.5 min-w-[110px] cursor-pointer">
 <input
 type="checkbox"
 checked={!day.closed}
 onChange={(e) => {
 const next = draft.working_hours.map((w, i) =>
 i === idx ? { ...w, closed: !e.target.checked } : w
 )
 updateSection('working_hours', next)
 }}
 className="w-4 h-4 "
 />
 <span className="text-xs font-bold clinic-text">{day.day_ar}</span>
 </label>

 {day.closed ? (
 <span className="text-xs text-red-400 font-bold">إجازة أسبوعية</span>
 ) : (
 <div className="flex items-center gap-2 text-xs">
 <span className="clinic-text-muted">من</span>
 <input
 type="time"
 value={day.start || '19:00'}
 onChange={(e) => {
 const next = draft.working_hours.map((w, i) =>
 i === idx ? { ...w, start: e.target.value } : w
 )
 updateSection('working_hours', next)
 }}
 className="clinic-surface border clinic-border rounded-lg px-2.5 py-1.5 text-xs outline-none"
 />
 <span className="clinic-text-muted">إلى</span>
 <input
 type="time"
 value={day.end || '23:00'}
 onChange={(e) => {
 const next = draft.working_hours.map((w, i) =>
 i === idx ? { ...w, end: e.target.value } : w
 )
 updateSection('working_hours', next)
 }}
 className="clinic-surface border clinic-border rounded-lg px-2.5 py-1.5 text-xs outline-none"
 />
 </div>
 )}
 </div>
 ))}
 </div>
 </div>
 )}

 {/* 6. الإجازات */}
 {activeTab === 'holidays' && (
 <div className="space-y-4">
 <div>
 <h2 className="text-lg font-alexandria font-bold clinic-text">الإجازات والأيام المغلقة</h2>
 <p className="text-xs clinic-text-muted">
 أي تاريخ يُضاف هنا يتم إغلاقه تلقائيًا في صفحة الحجز والتقويم.
 </p>
 </div>

 <div className="flex flex-wrap gap-2.5 clinic-main border clinic-border rounded-2xl p-4">
 <input
 type="date"
 value={newHoliday.date}
 onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
 className="clinic-surface border clinic-border rounded-xl px-3 py-2 text-xs outline-none"
 />
 <input
 type="text"
 placeholder="السبب (مثال: مؤتمر طبي / إجازة عيد)"
 value={newHoliday.reason}
 onChange={(e) => setNewHoliday({ ...newHoliday, reason: e.target.value })}
 className="flex-1 min-w-[180px] clinic-surface border clinic-border rounded-xl px-3 py-2 text-xs outline-none"
 />
 <button
 type="button"
 onClick={() => {
 if (!newHoliday.date) return
 updateSection('holidays', [
 ...(draft.holidays || []),
 { id: `hol-${Date.now()}`, ...newHoliday },
 ])
 setNewHoliday({ date: '', reason: '' })
 }}
 className="clinic-accent-bg text-white px-4 py-2 rounded-xl text-xs font-bold"
 >
 + إضافة إجازة
 </button>
 </div>

 <div className="space-y-2">
 {(draft.holidays || []).length === 0 ? (
 <p className="text-xs clinic-text-muted py-4">لا توجد إجازات مسجلة حاليًا.</p>
 ) : (
 draft.holidays.map((h, idx) => (
 <div
 key={h.id || idx}
 className="clinic-main border clinic-border rounded-xl p-3 flex items-center justify-between"
 >
 <div>
 <span className="font-bold text-xs clinic-text" dir="ltr">
 {h.date}
 </span>
 {h.reason && (
 <span className="text-xs clinic-text-muted ms-3">— {h.reason}</span>
 )}
 </div>
 <button
 type="button"
 onClick={() =>
 updateSection(
 'holidays',
 draft.holidays.filter((_, i) => i !== idx)
 )
 }
 className="text-xs text-red-400 hover:underline"
 >
 حذف
 </button>
 </div>
 ))
 )}
 </div>
 </div>
 )}

 {/* 7. قواعد الحجز */}
          {activeTab === 'booking_rules' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-alexandria font-bold clinic-text">قواعد الحجز ونظام الدور</h2>
                <p className="text-xs clinic-text-muted">
                  تحكم في الحد الأقصى اليومي للحجوزات، متوسط مدة كل حالة لحساب الوقت التقريبي، وأسعار الكشف.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] clinic-text-muted mb-1">أقصى عدد حجوزات في اليوم</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={draft.booking_rules.max_daily_bookings ?? 20}
                    onChange={(e) =>
                      updateSection('booking_rules', {
                        ...draft.booking_rules,
                        max_daily_bookings: Math.max(1, Number(e.target.value) || 20),
                      })
                    }
                    className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] clinic-text-muted mb-1">متوسط المدة لكل مريض (دقيقة)</label>
                  <select
                    value={draft.booking_rules.avg_minutes_per_patient || 15}
                    onChange={(e) =>
                      updateSection('booking_rules', {
                        ...draft.booking_rules,
                        avg_minutes_per_patient: Number(e.target.value),
                      })
                    }
                    className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs outline-none"
                  >
                    {[10, 15, 20, 25, 30, 45].map((m) => (
                      <option key={m} value={m}>
                        {m} دقيقة
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] clinic-text-muted mb-1">سعر الكشف ({draft.booking_rules.currency_ar || 'ج.م'})</label>
                  <input
                    type="number"
                    min="0"
                    value={draft.booking_rules.consultation_price ?? 360}
                    onChange={(e) =>
                      updateSection('booking_rules', {
                        ...draft.booking_rules,
                        consultation_price: Number(e.target.value),
                      })
                    }
                    className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] clinic-text-muted mb-1">سعر الاستشارة ({draft.booking_rules.currency_ar || 'ج.م'})</label>
                  <input
                    type="number"
                    min="0"
                    value={draft.booking_rules.followup_price ?? 150}
                    onChange={(e) =>
                      updateSection('booking_rules', {
                        ...draft.booking_rules,
                        followup_price: Number(e.target.value),
                      })
                    }
                    className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] clinic-text-muted mb-1">الحجز المسبق حتى (أيام)</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={draft.booking_rules.max_advance_days || 30}
                    onChange={(e) =>
                      updateSection('booking_rules', {
                        ...draft.booking_rules,
                        max_advance_days: Number(e.target.value),
                      })
                    }
                    className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] clinic-text-muted mb-1">تنبيه للمريض قبل الحجز</label>
                  <input
                    type="text"
                    value={draft.booking_rules.booking_notice_ar || ''}
                    onChange={(e) =>
                      updateSection('booking_rules', {
                        ...draft.booking_rules,
                        booking_notice_ar: e.target.value,
                      })
                    }
                    className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 8. أسئلة الحجز (Exact match to screenshot) */}
 {activeTab === 'booking_questions' && (
 <BookingQuestionsEditor
 questions={draft.booking_questions}
 onChange={(next) => updateSection('booking_questions', next)}
 locale={locale}
 />
 )}

 {/* 9. الاستقبال وصلاحياته */}
          {activeTab === 'reception_staff' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-alexandria font-bold clinic-text">الاستقبال وصلاحياته</h2>
                  <p className="text-xs clinic-text-muted">
                    أضف رقم هاتف وكلمة مرور لكل موظف استقبال وحدد الأقسام المسموح له بها.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateSection('reception_staff', [
                      ...(draft.reception_staff || []),
                      {
                        id: `staff-${Date.now()}`,
                        name: 'موظف استقبال جديد',
                        role: 'reception',
                        phone: '',
                        password: '',
                        active: true,
                        permissions: {
                          viewToday: true,
                          manageCalendar: true,
                          managePatients: true,
                          viewMedicalRecords: false,
                          manageSettings: false,
                          manageWhatsapp: true,
                        },
                      },
                    ])
                  }
                  className="clinic-accent-bg text-white px-3.5 py-2 rounded-xl text-xs font-bold"
                >
                  + إضافة موظف
                </button>
              </div>

              <div className="space-y-3">
                {(draft.reception_staff || []).map((member, idx) => (
                  <div key={member.id || idx} className="clinic-main border clinic-border rounded-2xl p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] clinic-text-muted mb-1">الاسم</label>
                        <input
                          type="text"
                          value={member.name || ''}
                          onChange={(e) => {
                            const next = draft.reception_staff.map((m, i) =>
                              i === idx ? { ...m, name: e.target.value } : m
                            )
                            updateSection('reception_staff', next)
                          }}
                          className="w-full clinic-surface border clinic-border rounded-xl p-2 text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] clinic-text-muted mb-1">رقم الهاتف للدخول</label>
                        <input
                          type="tel"
                          dir="ltr"
                          placeholder="010XXXXXXXX"
                          value={member.phone || ''}
                          onChange={(e) => {
                            const next = draft.reception_staff.map((m, i) =>
                              i === idx ? { ...m, phone: e.target.value } : m
                            )
                            updateSection('reception_staff', next)
                          }}
                          className="w-full clinic-surface border clinic-border rounded-xl p-2 text-xs outline-none text-left"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] clinic-text-muted mb-1">كلمة المرور</label>
                        <input
                          type="text"
                          dir="ltr"
                          placeholder="كلمة مرور الموظف"
                          value={member.password || ''}
                          onChange={(e) => {
                            const next = draft.reception_staff.map((m, i) =>
                              i === idx ? { ...m, password: e.target.value } : m
                            )
                            updateSection('reception_staff', next)
                          }}
                          className="w-full clinic-surface border clinic-border rounded-xl p-2 text-xs outline-none text-left"
                        />
                      </div>
                      <div className="flex items-end justify-between gap-2">
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(member.active)}
                            onChange={(e) => {
                              const next = draft.reception_staff.map((m, i) =>
                                i === idx ? { ...m, active: e.target.checked } : m
                              )
                              updateSection('reception_staff', next)
                            }}
                            className="w-4 h-4"
                          />
                          <span>نشط</span>
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            updateSection(
                              'reception_staff',
                              draft.reception_staff.filter((_, i) => i !== idx)
                            )
                          }
                          className="text-xs text-red-400 hover:underline"
                        >
                          حذف
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t clinic-border">
                      {PERMISSION_LABELS.map((perm) => (
                        <label key={perm.key} className="flex items-center gap-2 text-xs clinic-text-secondary cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(member.permissions?.[perm.key])}
                            onChange={(e) => {
                              const next = draft.reception_staff.map((m, i) =>
                                i === idx
                                  ? {
                                      ...m,
                                      permissions: {
                                        ...m.permissions,
                                        [perm.key]: e.target.checked,
                                      },
                                    }
                                  : m
                              )
                              updateSection('reception_staff', next)
                            }}
                            className="w-4 h-4"
                          />
                          <span>{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. الأمان */}
          {activeTab === 'security_settings' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-alexandria font-bold clinic-text">بيانات الدخول والأمان</h2>
                <p className="text-xs clinic-text-muted">
                  يمكنك تعديل رقم الهاتف وكلمة المرور الخاصة بدخول لوحة التحكم في أي وقت.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] clinic-text-muted mb-1">رقم هاتف دخول الطبيب</label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={draft.security_settings.admin_phone || ''}
                    onChange={(e) =>
                      updateSection('security_settings', {
                        ...draft.security_settings,
                        admin_phone: e.target.value,
                      })
                    }
                    placeholder="01000000000"
                    className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs outline-none text-left"
                  />
                </div>
                <div>
                  <label className="block text-[11px] clinic-text-muted mb-1">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    dir="ltr"
                    value={draft.security_settings.admin_password || ''}
                    onChange={(e) =>
                      updateSection('security_settings', {
                        ...draft.security_settings,
                        admin_password: e.target.value,
                      })
                    }
                    placeholder="اتركه فارغًا للإبقاء على الحالي"
                    className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs outline-none text-left"
                  />
                </div>
                <div>
                  <label className="block text-[11px] clinic-text-muted mb-1">مدة بقاء الجلسة (ساعات)</label>
                  <input
                    type="number"
                    min="1"
                    max="72"
                    value={draft.security_settings.session_hours || 8}
                    onChange={(e) =>
                      updateSection('security_settings', {
                        ...draft.security_settings,
                        session_hours: Number(e.target.value),
                      })
                    }
                    className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 11. واتساب */}
 {activeTab === 'whatsapp_settings' && (
 <div className="space-y-4">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <h2 className="text-lg font-alexandria font-bold clinic-text">واتساب العيادة</h2>
 <p className="text-xs clinic-text-muted">
 إدارة رسائل التأكيد التلقائية وصندوق محادثات المرضى عبر WhatsApp Cloud API.
 </p>
 </div>

 <Link
 href="/admin/whatsapp"
 className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition"
 >
 فتح صندوق محادثات واتساب ←
 </Link>
 </div>

 <div
 className={`rounded-xl border p-3.5 text-xs flex items-center justify-between ${
 whatsappConfigured
 ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
 : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
 }`}
 >
 <span>
 {whatsappConfigured
 ? '✓ الربط مع Meta WhatsApp Cloud API مفعل وجاهز'
 : '⚠ متغيرات WhatsApp API في .env.local غير مكتملة'}
 </span>
 </div>

 <label className="flex items-center justify-between clinic-main border clinic-border rounded-xl p-3.5 cursor-pointer">
 <div>
 <span className="block text-xs font-bold clinic-text">إرسال رسالة تأكيد تلقائية عند الحجز</span>
 <span className="text-[11px] clinic-text-muted">
 يستخدم قالب <code dir="ltr">{draft.whatsapp_settings.template_name}</code> تلقائيًا فور تأكيد الحجز
 </span>
 </div>
 <input
 type="checkbox"
 checked={draft.whatsapp_settings.auto_confirmation_enabled !== false}
 onChange={(e) =>
 updateSection('whatsapp_settings', {
 ...draft.whatsapp_settings,
 auto_confirmation_enabled: e.target.checked,
 })
 }
 className="w-4 h-4 "
 />
 </label>

 <div>
 <label className="block text-[11px] clinic-text-muted mb-1">اسم قالب Meta المعتمد</label>
 <input
 type="text"
 dir="ltr"
 value={draft.whatsapp_settings.template_name || 'appointment_confirmation_ar'}
 onChange={(e) =>
 updateSection('whatsapp_settings', {
 ...draft.whatsapp_settings,
 template_name: e.target.value,
 })
 }
 className="w-full clinic-surface border clinic-border rounded-xl p-2.5 text-xs outline-none text-left"
 />
 </div>
 </div>
 )}

 {/* Bottom Save Bar */}
 <div className="flex items-center justify-between pt-4 border-t clinic-border">
 <span className="text-[11px] clinic-text-muted">
 {dirty ? '● توجد تعديلات غير محفوظة' : '✓ جميع الإعدادات محدثة'}
 </span>
 <button
 type="button"
 onClick={handleSave}
 disabled={saving || !dirty}
 className="clinic-accent-bg text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition disabled:opacity-40 shadow-glow"
 >
 {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
 </button>
 </div>
 </section>
 </div>
 </div>
 )
}
