import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Alexandria, IBM_Plex_Sans_Arabic } from 'next/font/google'
import { ClinicSettingsProvider } from '@/lib/clinic-context'

const alexandria = Alexandria({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-alexandria',
})

const ibmPlex = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex',
})

export const metadata: Metadata = {
  title: 'عيادة دكتورة عبير الدالي — استشاري و رئيس قسم نساء وتوليد MSH',
  description: 'احجز دورك أونلاين وتابع ملفك الطبي مع دكتورة عبير الدالي',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1A050A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      data-theme="dark"
      className={`${alexandria.variable} ${ibmPlex.variable}`}
    >
      <body className="font-ibm-plex antialiased clinic-main overflow-x-hidden">
        <ClinicSettingsProvider>{children}</ClinicSettingsProvider>
      </body>
    </html>
  )
}
