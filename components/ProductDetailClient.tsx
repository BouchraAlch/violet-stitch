'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Product } from '@/lib/types/database'
import { useCart } from '@/context/CartContext'

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const images = product.image_urls && product.image_urls.length > 0
    ? product.image_urls
    : ['/placeholder.png']

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-6 sm:p-8 rounded-2xl border border-purple-100 shadow-sm">
      {/* Gallery Section */}
      <div className="flex flex-col gap-4">
        {/* Main Displayed Image */}
        <div className="relative h-80 sm:h-96 w-full rounded-xl overflow-hidden bg-purple-50 border border-purple-100">
          <Image
            src={images[selectedImageIndex]}
            alt={product.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Image Thumbnails (Color / Variant Options) */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                  selectedImageIndex === idx ? 'border-purple-600 ring-2 ring-purple-200' : 'border-gray-200 opacity-70 hover:opacity-100'
                }`}
              >
                <Image src={url} alt={`Variant ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Details & Action */}
      <div className="flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
          <p className="text-2xl font-extrabold text-purple-900 mt-3">${product.price.toFixed(2)}</p>
          <div className="mt-6 border-t border-purple-100 pt-4">
            <p className="text-gray-600 leading-relaxed">{product.description || 'Handcrafted crochet item crafted with care.'}</p>
          </div>
        </div>

        <div className="mt-8 border-t border-purple-100 pt-6">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1 bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
              >
                -
              </button>
              <span className="px-4 py-1 text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-1 bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={() => addToCart(product, quantity, selectedImageIndex)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition shadow-md active:scale-[0.99]"
          >
            Add to Cart (${(product.price * quantity).toFixed(2)})
          </button>
        </div>
      </div>
    </div>
  )
}