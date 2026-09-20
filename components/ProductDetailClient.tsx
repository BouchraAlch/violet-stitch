'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Product } from '@/lib/types/database'
import { useCart } from '@/context/CartContext'

interface ProductDetailClientProps {
  product: Product
}

// Simple parser for colors stored in Supabase
const parseColors = (product: any): string[] => {
  // Get raw string/array from product object
  const rawColor = product?.colors || product?.color || ''
  
  // Clean off "color:", "colors:", quotes, brackets, and split by comma
  const cleanString = String(rawColor).replace(/colors?:/gi, '').replace(/[\[\]'"]/g, '')
  
  return cleanString.split(',').map((c) => c.trim()).filter(Boolean)
}

// Simple parser for images stored in Supabase
const parseImages = (product: any): string[] => {
  const rawUrls = product?.image_urls || product?.img_link
  if (!rawUrls) return ['/flower.png']
  if (Array.isArray(rawUrls)) return rawUrls.map((i) => String(i).trim()).filter(Boolean)
  if (typeof rawUrls === 'string') {
    try {
      const parsed = JSON.parse(rawUrls)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.map((i) => String(i).trim()).filter(Boolean)
    } catch {}
    if (rawUrls.trim().length > 0) return [rawUrls.trim()]
  }
  return ['/flower.png']
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart } = useCart()

  const productImages = parseImages(product)
  const availableColors = parseColors(product)

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState<string>(
    availableColors.length > 0 ? availableColors[0] : ''
  )
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  // Mobile Swipe State
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const productName = product?.name || 'Handcrafted Crochet Item'
  const category = product?.category || 'Handmade'
  const description =
    product?.description ||
    'Carefully handcrafted with high-grade premium yarn. Each piece is unique and made with love.'

  const handleNextImage = () => setCurrentImageIndex((prev) => (prev + 1) % productImages.length)
  const handlePrevImage = () => setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length)

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX)
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > 50) handleNextImage()
    if (distance < -50) handlePrevImage()
  }

  const handleAddToCart = () => {
    addToCart(
      {
        ...product,
        name: selectedColor ? `${productName} - ${selectedColor}` : productName,
      },
      quantity
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 w-full">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-purple-600 transition">Home</Link>
          <span>/</span>
          <Link href={`/category/${category}`} className="hover:text-purple-600 capitalize transition">
            {category}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{productName}</span>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm">
          
          {/* Images */}
          <div className="flex flex-col gap-4">
            <div
              className="relative aspect-square w-full rounded-2xl overflow-hidden bg-purple-50 border border-purple-100 shadow-inner group select-none"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <Image
                src={productImages[currentImageIndex] || '/flower.png'}
                alt={productName}
                fill
                priority
                unoptimized
                className="object-cover object-center transition-all duration-300"
              />

              {product?.is_bestseller && (
                <span className="absolute top-4 left-4 bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10">
                  Best Seller
                </span>
              )}

              {productImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md transition"
                  >
                    ‹
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md transition"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {productImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      currentImageIndex === idx ? 'border-purple-600 scale-105' : 'border-gray-200 opacity-60'
                    }`}
                  >
                    <Image src={imgUrl} alt="Thumbnail" fill unoptimized className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Options */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">{category}</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-3">{productName}</h1>
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-900 mb-6">{product?.price} DA</div>

              <div className="border-t border-b border-gray-100 py-5 mb-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-600 text-sm leading-relaxed font-light">{description}</p>
              </div>

              {/* COLOR SWATCHES */}
              {availableColors.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <label className="text-sm font-semibold text-gray-900">Color Options</label>
                    {!selectedColor.startsWith('#') && (
                      <span className="text-sm font-bold text-purple-600 capitalize">
                        • {selectedColor}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {availableColors.map((colorValue, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedColor(colorValue)}
                        title={colorValue}
                        className={`relative w-9 h-9 rounded-full transition-all flex items-center justify-center shadow-sm ${
                          selectedColor === colorValue
                            ? 'ring-2 ring-offset-2 ring-purple-600 scale-110'
                            : 'hover:scale-105 border border-gray-300'
                        }`}
                        style={{ backgroundColor: colorValue }}
                      >
                        {selectedColor === colorValue && (
                          <span className="text-xs font-bold text-white mix-blend-difference">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Quantity</label>
                <div className="inline-flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                  <button
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="w-10 h-10 rounded-lg bg-white text-gray-700 shadow-sm flex items-center justify-center font-bold text-lg"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-gray-900 text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg bg-white text-gray-700 shadow-sm flex items-center justify-center font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Order Button */}
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 rounded-2xl font-bold text-base shadow-lg transition-all ${
                  added ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {added ? 'Added to Order!' : `Add to Order • ${(product?.price || 0) * quantity} DA`}
              </button>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}