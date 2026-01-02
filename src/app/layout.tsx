import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { CalcomProvider } from '@/components/providers/cal-provider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DentalFlow - Modern Practice Management',
  description: 'Complete dental practice management solution with advanced features, mobile-first design, and seamless integrations',
  keywords: 'dental, practice management, appointments, patients, billing, treatment plans',
  authors: [{ name: 'DentalFlow Team' }],
  viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
  robots: 'noindex, nofollow', // Remove in production
  openGraph: {
    title: 'DentalFlow - Modern Practice Management',
    description: 'Complete dental practice management solution',
    type: 'website',
    locale: 'en_US',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="color-scheme" content="light dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <CalcomProvider>
          <div id="root">
            {children}
          </div>
        </CalcomProvider>

        {/* Progressive Web App - Service Worker */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('SW registration successful');
                  }, function(err) {
                    console.log('SW registration failed');
                  });
              });
            }
          `,
        }} />

        {/* Accessibility improvements */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Skip to main content for screen readers
            document.addEventListener('DOMContentLoaded', function() {
              const skipLink = document.createElement('a');
              skipLink.href = '#main-content';
              skipLink.textContent = 'Skip to main content';
              skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50';
              document.body.insertBefore(skipLink, document.body.firstChild);
            });

            // Enhanced focus management
            document.addEventListener('keydown', function(e) {
              if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
              }
            });

            document.addEventListener('mousedown', function() {
              document.body.classList.remove('keyboard-navigation');
            });
          `,
        }} />
      </body>
    </html>
  )
}