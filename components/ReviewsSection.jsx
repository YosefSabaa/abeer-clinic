'use client'

import { useRef } from 'react'
import { useClinic } from '@/lib/clinic-context'
import { t } from '@/lib/i18n'

export default function ReviewsSection({ locale: propLocale }) {
  const { settings, locale: ctxLocale } = useClinic()
  const locale = propLocale || ctxLocale
  const scrollRef = useRef(null)

  const reviews = (settings.reviews || []).filter((r) => r.visible !== false)
  if (reviews.length === 0) return null

  const avg = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviews.length

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' })
    }
  }

  return (
    <section className="overflow-hidden">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-base sm:text-lg font-alexandria font-bold clinic-text">
          {t(locale, 'reviews')}
        </h2>
        <div className="flex items-center gap-1.5 text-amber-400 shrink-0">
          <span className="text-sm">★★★★★</span>
          <span className="clinic-text font-bold text-xs">{avg.toFixed(1)}</span>
          <span className="clinic-text-muted text-xs">
            ({reviews.length} {t(locale, 'reviewCount')})
          </span>
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => scroll(-1)}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full clinic-surface border clinic-border items-center justify-center clinic-accent-hover transition"
          aria-label="السابق"
        >
          ›
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full clinic-surface border clinic-border items-center justify-center clinic-accent-hover transition"
          aria-label="التالي"
        >
          ‹
        </button>

        <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 sm:px-10">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="clinic-card w-[260px] max-w-[82vw] shrink-0 p-4 rounded-xl border clinic-border"
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full clinic-accent-bg flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {(review.name || 'م').charAt(0)}
                  </div>
                  <span className="font-bold text-sm clinic-text truncate">{review.name}</span>
                </div>
                <span className="text-[11px] clinic-text-muted shrink-0">{review.date}</span>
              </div>
              <div className="text-amber-400 text-sm mb-2">{'★'.repeat(review.rating || 5)}</div>
              <p className="text-xs sm:text-sm clinic-text-secondary leading-relaxed">{review.text}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-emerald-400">
                <span>✓</span>
                <span>زيارة مؤكدة</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
