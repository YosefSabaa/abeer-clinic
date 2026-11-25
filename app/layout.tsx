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
  metadataBase: new URL('https://YOUR-DOMAIN.com'),

  title: {
    default: 'عيادة دكتورة عبير الدالي',
    template: '%s | عيادة دكتورة عبير الدالي',
  },

  description:
    'احجز دورك أونلاين وتابع ملفك الطبي مع دكتورة عبير الدالي — استشاري ورئيس قسم النساء والتوليد MSH.',

  applicationName: 'عيادة دكتورة عبير الدالي',

  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },

  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    url: '/',
    siteName: 'عيادة دكتورة عبير الدالي',
    title: 'عيادة دكتورة عبير الدالي',
    description:
      'احجز دورك أونلاين وتابع ملفك الطبي بسهولة وأمان.',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'عيادة دكتورة عبير الدالي',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'عيادة دكتورة عبير الدالي',
    description: 'احجز دورك أونلاين وتابع ملفك الطبي.',
    images: ['/opengraph-image.png'],
  },

  robots: {
    index: true,
    follow: true,
  },
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
