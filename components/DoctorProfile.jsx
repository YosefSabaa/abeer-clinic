'use client'
import Image from 'next/image'
import { DOCTOR } from '@/lib/constants'
import { t } from '@/lib/i18n'

export default function DoctorProfile({ locale }) {
  return (
    <div className="bg-gradient-to-br from-[#3A0D1A] to-[#2A0A14] rounded-2xl p-5 border border-[#5A1D2E] shadow-card animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-5">
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-pink-500/30 mx-auto sm:mx-0 flex-shrink-0 bg-[#5A1D2E]">
          <div className="absolute inset-0 z-0 flex items-center justify-center text-gray-400 text-xs">
            صورة الطبيبة
          </div>
          <Image
            src={DOCTOR.image}
            alt={DOCTOR.name}
            fill
            className="object-cover relative z-10"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>

        <div className="flex-1 text-center sm:text-right">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            <span className="text-[10px] bg-[#5A1D2E] text-pink-200 px-2.5 py-0.5 rounded-full border border-pink-500/20">
              استشاري
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-alexandria font-bold text-white mb-1">
            {t(locale, 'doctorName')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mb-3">{t(locale, 'doctorTitle')}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
            <span className="flex items-center gap-1.5 bg-green-900/30 text-green-400 px-2.5 py-1 rounded-full text-[11px] border border-green-800">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {t(locale, 'available')}
            </span>
            <div className="flex items-center gap-1 text-yellow-400 text-xs">
              <span>★★★★★</span>
              <span className="text-white font-bold">{DOCTOR.rating.toFixed(1)}</span>
              <span className="text-gray-500">({DOCTOR.reviewCount})</span>
            </div>
          </div>

          <p className="text-[11px] sm:text-xs text-gray-400 mb-3 leading-relaxed">{DOCTOR.address}</p>

          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            <a
              href={`tel:${DOCTOR.phone}`}
              className="flex items-center gap-1.5 bg-[#5A1D2E] hover:bg-[#7A2D3E] active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-medium transition"
            >
              {t(locale, 'call')}
            </a>
            <a
              href={`https://wa.me/${DOCTOR.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-[#5A1D2E] hover:bg-[#7A2D3E] active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-medium transition"
            >
              {t(locale, 'whatsapp')}
            </a>
            <a
              href={DOCTOR.map}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-[#5A1D2E] hover:bg-[#7A2D3E] active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-medium transition"
            >
              {t(locale, 'map')}
            </a>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 mt-4 leading-relaxed border-t border-[#5A1D2E] pt-3">
        {DOCTOR.bio}
      </p>
    </div>
  )
}