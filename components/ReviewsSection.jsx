'use client'
import { useRef } from 'react'
import { REVIEWS } from '@/lib/constants'
import { t } from '@/lib/i18n'

export default function ReviewsSection({ locale }) {
  const scrollRef = useRef(null)

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' })
    }
  }

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-alexandria font-bold">{t(locale, 'reviews')}</h2>
        <div className="flex items-center gap-2 text-yellow-400">
          <span className="text-sm">★★★★★</span>
          <span className="text-white font-bold">5.0</span>
          <span className="text-gray-500 text-xs">({REVIEWS.length} {t(locale, 'reviewCount')})</span>
        </div>
      </div>

      <div className="relative">
        <button onClick={() => scroll(-1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#3A0D1A] border border-[#5A1D2E] flex items-center justify-center hover:bg-[#5A1D2E] transition" aria-label="السابق">
          ›
        </button>
        <button onClick={() => scroll(1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#3A0D1A] border border-[#5A1D2E] flex items-center justify-center hover:bg-[#5A1D2E] transition" aria-label="التالي">
          ‹
        </button>

        <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 px-10">
          {REVIEWS.map((review) => (
            <div key={review.id} className="bg-[#2A0A14] min-w-[260px] p-4 rounded-xl border border-[#5A1D2E]">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-white font-bold text-sm">
                    {review.initial}
                  </div>
                  <span className="font-bold text-sm">{review.name}</span>
                </div>
                <span className="text-xs text-gray-500">{review.date}</span>
              </div>
              <div className="text-yellow-400 text-sm mb-2">{'★'.repeat(review.rating)}</div>
              <p className="text-sm text-gray-400 leading-relaxed">{review.text}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-green-400">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                زيارة مؤكدة
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}