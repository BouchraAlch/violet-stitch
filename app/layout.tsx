import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import Navbar from '@/components/Navbar'

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
      <body className={inter.className}>
        <CartProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)] bg-purple-50/30">{children}</main>
        </CartProvider>
      </body>
    </html>
  )
}