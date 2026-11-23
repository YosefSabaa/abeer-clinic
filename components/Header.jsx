'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { t } from '@/lib/i18n'

export default function Header({ locale = 'ar', setLocale }) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 bg-[#1A050A]/90 backdrop-blur-lg border-b border-[#5A1D2E]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        <Link href="/booking" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            ط
          </div>
          <span className="text-sm font-alexandria font-bold text-pink-300">طبيبي</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-2">
          <Link
            href="/booking"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              pathname === '/booking' ? 'bg-pink-600 text-white' : 'text-gray-300 hover:bg-[#3A0D1A]'
            }`}
          >
            {t(locale, 'bookYourAppointment')}
          </Link>
          <Link
            href="/patient"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              pathname === '/patient' ? 'bg-pink-600 text-white' : 'text-gray-300 hover:bg-[#3A0D1A]'
            }`}
          >
            {t(locale, 'myAccount')}
          </Link>
          <Link
            href="/admin"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              pathname === '/admin' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-[#3A0D1A]'
            }`}
          >
            {t(locale, 'adminPanel')}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/patient"
            className="sm:hidden px-2.5 py-1.5 rounded-xl bg-[#3A0D1A] border border-pink-500/30 text-pink-300 text-[11px] font-bold"
          >
            {t(locale, 'myAccount')}
          </Link>
          {setLocale && (
            <button
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              className="h-9 px-3 rounded-xl bg-[#3A0D1A] hover:bg-[#5A1D2E] active:scale-95 transition text-xs font-bold"
            >
              {locale === 'ar' ? 'EN' : 'ع'}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}