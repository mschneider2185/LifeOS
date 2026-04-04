import React from 'react'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { LayoutShell } from '@/components/lifeos/LayoutShell'

export const metadata: Metadata = {
  title: 'LifeOS — Your life, configured to your brain',
  description: 'Take a 5-minute personality assessment. LifeOS configures itself to match how you actually work — WIP limits, coaching style, burnout detection, and more.',
  keywords: 'personality assessment, life management, MBTI, DISC, Big Five, productivity, burnout detection',
  authors: [{ name: 'Michael Schneider' }],
  creator: 'LifeOS',
  publisher: 'LifeOS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'LifeOS — Your life, configured to your brain',
    description: 'Take a 5-minute personality assessment. LifeOS configures itself to match how you actually work.',
    siteName: 'LifeOS',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LifeOS — Your life, configured to your brain',
    description: 'Take a 5-minute personality assessment. LifeOS configures itself to match how you actually work.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} h-full`}>
      <body className="font-sans h-full bg-dark-bg text-white antialiased">
        <LayoutShell>{children}</LayoutShell>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(15, 15, 25, 0.9)',
              color: '#e2e8f0',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
} 