import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Violet Stitch | Handmade Crochet Store',
  description: 'Explore unique handmade crochet products, flowers, and accessories.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen antialiased bg-purple-50/30 text-gray-800`}>
        <CartProvider>
          {/* Global Navigation Bar */}
          <Navbar />

          {/* Main Content Viewport */}
          <main className="flex-1">{children}</main>

          {/* Global Footer */}
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}