'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useClinic } from '@/lib/clinic-context'
import { t } from '@/lib/i18n'

export default function Header({ locale: propLocale, setLocale: propSetLocale }) {
  const pathname = usePathname()
  const clinic = useClinic()
  const locale = propLocale || clinic.locale
  const setLocale = propSetLocale || clinic.setLocale
  const { theme, setTheme, settings } = clinic

  const clinicName =
    locale === 'ar'
      ? settings?.clinic_contact?.clinic_name_ar || settings?.doctor_profile?.name_ar || 'العيادة'
      : settings?.clinic_contact?.clinic_name_en || settings?.doctor_profile?.name_en || 'Clinic'

  return (
    <header className="sticky top-0 z-40 clinic-card/95 backdrop-blur-lg border-b clinic-border no-print">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
        <Link href="/booking" className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl clinic-accent-bg flex items-center justify-center text-white font-bold text-sm shrink-0">
            {clinicName.charAt(0)}
          </div>
          <span className="text-sm font-alexandria font-bold clinic-text truncate">
            {clinicName}
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-2 shrink-0">
          <Link
            href="/booking"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              pathname === '/booking'
                ? 'clinic-accent-bg text-white'
                : 'clinic-text-secondary hover:clinic-surface'
            }`}
          >
            {t(locale, 'bookYourAppointment')}
          </Link>
          <Link
            href="/patient"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              pathname === '/patient'
                ? 'clinic-accent-bg text-white'
                : 'clinic-text-secondary hover:clinic-surface'
            }`}
          >
            {t(locale, 'myAccount')}
          </Link>
        </nav>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? t(locale, 'light') : t(locale, 'dark')}
            className="h-9 px-2.5 rounded-xl clinic-surface border clinic-border clinic-accent-hover transition text-xs font-bold"
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>

          <button
            type="button"
            onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
            className="h-9 px-3 rounded-xl clinic-surface border clinic-border clinic-accent-hover transition text-xs font-bold"
          >
            {locale === 'ar' ? 'EN' : 'ع'}
          </button>
        </div>
      </div>
    </header>
  )
}
