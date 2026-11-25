'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 clinic-card/95 backdrop-blur-lg border-t clinic-border sm:hidden no-print">
      <div className="grid grid-cols-2 py-2">
        <Link
          href="/booking"
          className={`flex flex-col items-center gap-0.5 py-1 px-4 ${
            pathname === '/booking' ? 'clinic-accent-text' : 'clinic-text-muted'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[10px] font-bold">حجز موعد</span>
        </Link>

        <Link
          href="/patient"
          className={`flex flex-col items-center gap-0.5 py-1 px-4 ${
            pathname === '/patient' ? 'clinic-accent-text' : 'clinic-text-muted'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-bold">ملفي الطبي</span>
        </Link>
      </div>
    </nav>
  )
}
