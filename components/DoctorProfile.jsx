'use client'

import Image from 'next/image'
import { useClinic } from '@/lib/clinic-context'
import { t } from '@/lib/i18n'

export default function DoctorProfile({ locale: propLocale }) {
 const { settings, locale: ctxLocale } = useClinic()
 const locale = propLocale || ctxLocale
 const doc = settings.doctor_profile
 const contact = settings.clinic_contact
 const visibleReviews = (settings.reviews || []).filter((r) => r.visible !== false)
 const avgRating =
 visibleReviews.length > 0
 ? visibleReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / visibleReviews.length
 : 5.0

 const name = locale === 'ar' ? doc.name_ar : doc.name_en || doc.name_ar
 const title = locale === 'ar' ? doc.title_ar : doc.title_en || doc.title_ar
 const bio = locale === 'ar' ? doc.bio_ar : doc.bio_en || doc.bio_ar
 const badge = locale === 'ar' ? doc.badge_ar : doc.badge_en || doc.badge_ar
 const address = locale === 'ar' ? contact.address_ar : contact.address_en || contact.address_ar

 return (
 <div className="clinic-card rounded-2xl p-5 border clinic-border shadow-card animate-fade-in">
 <div className="flex flex-col sm:flex-row gap-5">
 <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 clinic-accent-border-soft mx-auto sm:mx-0 flex-shrink-0 clinic-surface">
 <div className="absolute inset-0 z-0 flex items-center justify-center clinic-text-muted text-xs">
 صورة الطبيبة
 </div>
 <Image
 src={doc.image || '/doctor.jpg'}
 alt={name}
 fill
 className="object-cover relative z-10"
 onError={(e) => {
 e.currentTarget.style.display = 'none'
 }}
 />
 </div>

 <div className="flex-1 text-center sm:text-start">
 {badge && (
 <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
 <span className="text-[10px] clinic-surface clinic-accent-text px-2.5 py-0.5 rounded-full border clinic-border font-bold">
 {badge}
 </span>
 </div>
 )}

 <h1 className="text-xl sm:text-2xl font-alexandria font-bold clinic-text mb-1">
 {name}
 </h1>
 <p className="text-xs sm:text-sm clinic-text-secondary mb-3">{title}</p>

 <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
 {doc.available_for_booking !== false ? (
 <span className="flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full text-[11px] border border-emerald-500/30 font-bold">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
 {t(locale, 'available')}
 </span>
 ) : (
 <span className="flex items-center gap-1.5 bg-red-500/15 text-red-400 px-2.5 py-1 rounded-full text-[11px] border border-red-500/30 font-bold">
 {t(locale, 'unavailable')}
 </span>
 )}

 <div className="flex items-center gap-1 text-amber-400 text-xs">
 <span>★★★★★</span>
 <span className="clinic-text font-bold">{avgRating.toFixed(1)}</span>
 <span className="clinic-text-muted">({visibleReviews.length})</span>
 </div>
 </div>

 <p className="text-[11px] sm:text-xs clinic-text-muted mb-3 leading-relaxed">{address}</p>

 <div className="flex flex-wrap justify-center sm:justify-start gap-2">
 {contact.phone && (
 <a
 href={`tel:${contact.phone}`}
 className="flex items-center gap-1.5 clinic-surface border clinic-border clinic-accent-hover active:scale-95 clinic-text px-3.5 py-2 rounded-xl text-xs font-bold transition"
 >
 {t(locale, 'call')}
 </a>
 )}
 {contact.whatsapp && (
 <a
 href={`https://wa.me/${contact.whatsapp}`}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-1.5 clinic-surface border clinic-border hover:border-emerald-500/50 active:scale-95 clinic-text px-3.5 py-2 rounded-xl text-xs font-bold transition"
 >
 {t(locale, 'whatsapp')}
 </a>
 )}
 {contact.map_url && (
 <a
 href={contact.map_url}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-1.5 clinic-surface border clinic-border clinic-accent-hover active:scale-95 clinic-text px-3.5 py-2 rounded-xl text-xs font-bold transition"
 >
 {t(locale, 'map')}
 </a>
 )}
 </div>
 </div>
 </div>

 {bio && (
 <p className="text-[11px] clinic-text-muted mt-4 leading-relaxed border-t clinic-border pt-3">
 {bio}
 </p>
 )}
 </div>
 )
}
