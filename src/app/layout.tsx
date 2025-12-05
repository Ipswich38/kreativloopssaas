import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { CalcomProvider } from '@/components/providers/cal-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dental SaaS - Practice Management System',
  description: 'Complete dental practice management solution with offline-first capabilities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CalcomProvider>
          {children}
        </CalcomProvider>
      </body>
    </html>
  )
}