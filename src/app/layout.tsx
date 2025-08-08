import { Inter } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/lib/providers'
import { ThemeProvider } from '@/contexts/theme-context'
import { NavigationProvider } from '@/contexts/navigation-context'
import { GlobalLoadingOverlay } from '@/components/ui/global-loading-overlay'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'GameScope — Discover Your Next Favorite Game',
    template: '%s | GameScope',
  },
  description:
    'GameScope helps you explore, track, and curate games you love with powerful search, rich details, and a modern social experience.',
  applicationName: 'GameScope',
  keywords: [
    'games',
    'gaming',
    'game discovery',
    'game reviews',
    'game search',
    'wishlist',
    'favorites',
    'Next.js',
    'TypeScript',
  ],
  category: 'Entertainment',
  icons: {
    icon: '/Rlogo.png',
    shortcut: '/Rlogo.png',
    apple: '/Rlogo.png',
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
    },
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'GameScope — Discover Your Next Favorite Game',
    description:
      'Explore games across platforms, track favorites, and get smart recommendations with a sleek, responsive experience.',
    siteName: 'GameScope',
    images: [
      {
        url: '/Rlogo.png',
        width: 512,
        height: 512,
        alt: 'GameScope',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GameScope — Discover Your Next Favorite Game',
    description:
      'Powerful game discovery with rich details, collections, and a modern UX.',
    images: ['/Rlogo.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#111827',
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="format-detection" content="telephone=no,email=no,address=no" />
        <link rel="canonical" href={siteUrl} />
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'GameScope',
              url: siteUrl,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${siteUrl}/?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'GameScope',
              url: siteUrl,
              logo: `${siteUrl}/Rlogo.png`,
            }),
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <Providers>
            <NavigationProvider>
              <GlobalLoadingOverlay />
              {children}
            </NavigationProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
