'use client'

import { useState } from 'react'
import Link from 'next/link'

const NAV_ITEMS = [
  { id: 'today', label_ar: 'اليوم', label_en: 'Today', perm: 'viewToday' },
  { id: 'calendar', label_ar: 'التقويم', label_en: 'Calendar', perm: 'manageCalendar' },
  { id: 'patients', label_ar: 'المرضى', label_en: 'Patients', perm: 'managePatients' },
  { id: 'records', label_ar: 'سجل الكشف', label_en: 'Visit Log', perm: 'viewMedicalRecords' },
  { id: 'consultations', label_ar: 'الاستشارات', label_en: 'Consultations', perm: 'viewMedicalRecords' },
  { id: 'settings', label_ar: 'الإعدادات', label_en: 'Settings', perm: 'manageSettings' },
]

function NavIcon({ id, active }) {
  const cls = `w-4 h-4 shrink-0 ${active ? 'clinic-accent-text' : 'opacity-75'}`
  switch (id) {
    case 'today':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'calendar':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    case 'patients':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    case 'consultations':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    case 'records':
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    default:
      return (
        <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
  }
}

export default function AdminShell({
  activeSection,
  onSelectSection,
  todayCount = 0,
  pendingConsultationsCount = 0,
  locale,
  setLocale,
  theme,
  setTheme,
  settings,
  sessionInfo,
  onLogout,
  children,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const clinicName =
    locale === 'ar'
      ? settings?.clinic_contact?.clinic_name_ar || settings?.doctor_profile?.name_ar || 'العيادة'
      : settings?.clinic_contact?.clinic_name_en || settings?.doctor_profile?.name_en || 'Clinic'

  const doctorName =
    locale === 'ar'
      ? settings?.doctor_profile?.name_ar || 'دكتورة عبير الدالي'
      : settings?.doctor_profile?.name_en || 'Dr. Abeer El-Dali'

  const roleLabel =
    sessionInfo?.role === 'reception'
      ? locale === 'ar'
        ? 'الاستقبال'
        : 'Reception'
      : locale === 'ar'
        ? 'الدكتور'
        : 'Doctor'

  const displayUser = sessionInfo?.userName || doctorName

  const allowedNav = NAV_ITEMS.filter((item) => {
    if (!sessionInfo || sessionInfo.role === 'doctor') return true
    return Boolean(sessionInfo.permissions?.[item.perm])
  })

  return (
    <div className="min-h-screen clinic-main flex flex-col overflow-x-hidden">
      <header className="sticky top-0 z-40 h-14 clinic-card border-b clinic-border px-3 sm:px-5 flex items-center justify-between gap-2 no-print">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-9 h-9 rounded-xl clinic-surface border clinic-border flex items-center justify-center shrink-0"
            aria-label="القائمة"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 rounded-lg clinic-accent-bg text-white inline-flex items-center justify-center text-xs font-bold shrink-0">
              {clinicName.charAt(0)}
            </span>
            <span className="font-alexandria font-bold text-sm sm:text-base clinic-text truncate">
              {clinicName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden md:block leading-tight text-end">
            <span className="block text-[10px] clinic-text-muted">{roleLabel}</span>
            <span className="text-xs font-bold clinic-text">{displayUser}</span>
          </div>

          <div className="inline-flex items-center rounded-full clinic-surface border clinic-border p-0.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setLocale('ar')}
              className={`px-2.5 py-1 rounded-full transition ${
                locale === 'ar' ? 'clinic-card clinic-text shadow-sm' : 'clinic-text-muted'
              }`}
            >
              عربي
            </button>
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`px-2.5 py-1 rounded-full transition ${
                locale === 'en' ? 'clinic-card clinic-text shadow-sm' : 'clinic-text-muted'
              }`}
            >
              EN
            </button>
          </div>

          <div className="hidden sm:inline-flex items-center rounded-full clinic-surface border clinic-border p-0.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`px-2.5 py-1 rounded-full inline-flex items-center gap-1 transition ${
                theme === 'light' ? 'clinic-card clinic-text shadow-sm' : 'clinic-text-muted'
              }`}
            >
              <span>☀</span>
              <span>{locale === 'ar' ? 'فاتح' : 'Light'}</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`px-2.5 py-1 rounded-full inline-flex items-center gap-1 transition ${
                theme === 'dark' ? 'clinic-card clinic-text shadow-sm' : 'clinic-text-muted'
              }`}
            >
              <span>☾</span>
              <span>{locale === 'ar' ? 'داكن' : 'Dark'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onLogout}
            title={locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            className="w-9 h-9 rounded-xl clinic-surface border clinic-border hover:border-red-500/50 hover:text-red-400 flex items-center justify-center transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 flex relative min-w-0">
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <aside
          className={`fixed lg:sticky top-14 z-30 h-[calc(100vh-3.5rem)] w-56 shrink-0 clinic-main border-e clinic-border flex flex-col justify-between p-3 transition-transform duration-200 no-print ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          <nav className="space-y-1.5 mt-1">
            {allowedNav.map((item) => {
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectSection(item.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'clinic-surface border clinic-border clinic-text shadow-sm'
                      : 'clinic-text-secondary hover:clinic-card border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <NavIcon id={item.id} active={isActive} />
                    <span>{locale === 'ar' ? item.label_ar : item.label_en}</span>
                  </span>

                  {item.id === 'consultations' && pendingConsultationsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full clinic-accent-bg text-white text-[10px] font-bold">
                      {pendingConsultationsCount}
                    </span>
                  )}

                  {item.id === 'today' && (
                    <span className="flex items-center gap-1.5">
                      {todayCount > 0 && (
                        <span className="text-[10px] clinic-text-muted">{todayCount}</span>
                      )}
                      <span
                        className={`w-2 h-2 rounded-full ${
                          todayCount > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500/40'
                        }`}
                      />
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          <div className="pt-3 border-t clinic-border space-y-2">
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="sm:hidden w-full flex items-center justify-between px-3 py-2 rounded-xl clinic-surface border clinic-border text-xs font-bold"
            >
              <span>{locale === 'ar' ? 'المظهر' : 'Theme'}</span>
              <span>{theme === 'dark' ? '☾ داكن' : '☀ فاتح'}</span>
            </button>

            <Link
              href="/booking"
              target="_blank"
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold clinic-text-secondary hover:clinic-surface transition"
            >
              <span className="flex items-center gap-2">
                <span>🔗</span>
                <span>{locale === 'ar' ? 'صفحة الحجز' : 'Booking Page'}</span>
              </span>
              <span className="opacity-60">↗</span>
            </Link>
          </div>
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-6 overflow-x-hidden">
          <div className="max-w-6xl mx-auto min-w-0">{children}</div>
        </main>
      </div>
    </div>
  )
}
