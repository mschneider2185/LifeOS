import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mind Map Pro - Personality-Driven Growth Platform',
  description: 'Transform your personality insights into actionable growth strategies. Get personalized reports, sprint guides, and strategic planners to achieve your personal and professional goals.',
  keywords: 'personality development, personal growth, MBTI, DISC, goal achievement, self-improvement, personality test, growth strategies',
  authors: [{ name: 'Mind Map Pro Team' }],
  creator: 'Mind Map Pro',
  publisher: 'Mind Map Pro',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://mindmappro.com'),
  openGraph: {
    title: 'Mind Map Pro - Personality-Driven Growth Platform',
    description: 'Transform your personality insights into actionable growth strategies.',
    url: 'https://mindmappro.com',
    siteName: 'Mind Map Pro',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Mind Map Pro - Personality-Driven Growth Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mind Map Pro - Personality-Driven Growth Platform',
    description: 'Transform your personality insights into actionable growth strategies.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
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