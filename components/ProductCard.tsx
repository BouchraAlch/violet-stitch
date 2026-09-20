'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/lib/types/database'
import { useCart } from '@/context/CartContext'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()

  // Ensure product ID exists before creating links
  const productId = product?.id ? String(product.id) : null
  const productName: string = product?.name || 'Handcrafted Crochet Item'
  const imageUrl: string =
    product?.image_urls && product.image_urls.length > 0
      ? product.image_urls[0]
      : '/flower.png'

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (!productId) return <>{children}</>
    return <Link href={`/product/${productId}`}>{children}</Link>
  }

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
      {productId ? (
        <Link href={`/product/${productId}`} className="block overflow-hidden relative aspect-square bg-purple-50">
          <Image
            src={imageUrl}
            alt={productName}
            fill
            priority={false}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
          {product?.is_bestseller && (
            <span className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
              Best Seller
            </span>
          )}
        </Link>
      ) : (
        <div className="block overflow-hidden relative aspect-square bg-purple-50">
          <Image
            src={imageUrl}
            alt={productName}
            fill
            priority={false}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover object-center"
          />
        </div>
      )}

      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
            {product?.category || 'Handmade'}
          </span>
          {productId ? (
            <Link href={`/product/${productId}`}>
              <h3 className="font-semibold text-gray-900 text-sm md:text-base mt-1 group-hover:text-purple-600 transition line-clamp-1">
                {productName}
              </h3>
            </Link>
          ) : (
            <h3 className="font-semibold text-gray-900 text-sm md:text-base mt-1 line-clamp-1">
              {productName}
            </h3>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-base md:text-lg font-bold text-gray-900">
            {product?.price ?? 0} DA
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation() // Prevents page navigation when clicking cart button
              addToCart(product)
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-xl transition shadow-sm hover:scale-105 active:scale-95 flex items-center justify-center z-10"
            aria-label="Add to cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}