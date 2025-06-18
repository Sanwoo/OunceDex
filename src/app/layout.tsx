import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import Header from '../components/Header'
import { Providers } from '../components/Providers'
import { Toaster } from '@/components/ui/sonner'
import { PropsWithChildren } from 'react'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata = {
  title: 'Ounce-Dex',
  description: 'A personal DEX based on Uniswap V2 Router',
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-8">
          <Providers>
            <Header />
            {children}
          </Providers>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
