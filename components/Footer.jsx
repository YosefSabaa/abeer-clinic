'use client'
import { useState, useEffect } from 'react'
import { t } from '@/lib/i18n'

export default function Footer({ locale }) {
  const [year, setYear] = useState('')

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="text-center py-6 mt-8 border-t border-[#5A1D2E]">
      <p className="text-xs text-gray-500">
        © {year} {t(locale, 'footer')} — طبيبي
      </p>
    </footer>
  )
}