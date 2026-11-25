'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useClinic } from '@/lib/clinic-context'
import { t } from '@/lib/i18n'

export default function Footer({ locale: propLocale }) {
  const { locale: ctxLocale, settings } = useClinic()
  const locale = propLocale || ctxLocale
  const [year, setYear] = useState('')

  useEffect(() => {
    setYear(String(new Date().getFullYear()))
  }, [])

  const doctorName =
    locale === 'ar'
      ? settings?.doctor_profile?.name_ar || 'دكتورة عبير الدالي'
      : settings?.doctor_profile?.name_en || 'Dr. Abeer El-Dali'

  return (
    <footer className="text-center py-6 mt-8 border-t clinic-border space-y-1 no-print">
      <p className="text-xs clinic-text-muted">
        © {year} {doctorName} — {t(locale, 'footer')}
      </p>
      <Link href="/privacy-policy" className="clinic-accent-text hover:underline text-xs">
        سياسة الخصوصية
      </Link>
    </footer>
  )
}
