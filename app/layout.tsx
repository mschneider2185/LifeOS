import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

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
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
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