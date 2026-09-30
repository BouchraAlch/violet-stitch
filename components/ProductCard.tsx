'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Product } from '@/lib/types/database'
import { useCart } from '@/context/CartContext'
import ProductQuickAddModal from '@/components/ProductQuickAddModal'

interface ProductCardProps {
  product: any
}

export default function ProductCard({ product }: ProductCardProps) {
  const { cart } = useCart()

  const [isModalOpen, setIsModalOpen] = useState(false)

  // Product ID
  const productId = product?.id
    ? String(product.id)
    : null

  // Product name
  const productName: string =
    product?.name ||
    product?.title ||
    product?.product_name ||
    'Handcrafted Item'

  // Product type/category
  const productType: string =
    product?.type ||
    product?.category ||
    product?.product_type ||
    'Handmade'

  /*
   * Product image.
   */
  const getImageUrl = (): string => {
    const rawImages =
      product?.image_urls || product?.img_link

    if (Array.isArray(rawImages) && rawImages.length > 0) {
      return String(rawImages[0]).trim()
    }

    if (typeof rawImages === 'string') {
      try {
        const parsed = JSON.parse(rawImages)

        if (Array.isArray(parsed) && parsed.length > 0) {
          return String(parsed[0]).trim()
        }
      } catch {
        // Not JSON
      }

      if (rawImages.trim()) {
        return rawImages.trim()
      }
    }

    return '/flower.png'
  }

  const imageUrl = getImageUrl()

  /*
   * Check whether ANY variant of this product
   * currently exists in the cart.
   *
   * We deliberately check only product.id here.
   *
   * Example:
   *
   * Rose / Red
   * Rose / White
   *
   * Both make the card purple.
   */
  const isInCart =
    productId !== null &&
    cart.some(
      (item) => String(item.product.id) === productId
    )

  const handleOpenModal = () => {
    if (!productId) return

    setIsModalOpen(true)
  }

  return (
    <>
      <div
        className={`
          group relative bg-white rounded-2xl overflow-hidden
          flex flex-col justify-between h-full
          cursor-pointer
          transition-all duration-200
          ${
            isInCart
              ? 'border-2 border-purple-600 shadow-md'
              : 'border border-gray-100 shadow-sm hover:shadow-md'
          }
        `}
        onClick={handleOpenModal}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleOpenModal()
          }
        }}
      >
        {/* Product Image */}
        <div className="block overflow-hidden relative aspect-square bg-purple-50">
          <Image
            src={imageUrl}
            alt={productName}
            fill
            priority={false}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            unoptimized
            className={`
              object-cover object-center
              transition-transform duration-300
              group-hover:scale-105
            `}
          />

          {/* Best Seller */}
          {product?.is_bestseller && (
            <span className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm z-10">
              Best Seller
            </span>
          )}

          {/* In Cart Indicator */}
          {isInCart && (
            <div className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md">
              <span className="text-sm font-bold">
                ✓
              </span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 flex flex-col flex-1 justify-between">
          <div>
            {/* Product Name */}
            <h3
              className={`
                font-bold text-base line-clamp-1 transition
                ${
                  isInCart
                    ? 'text-purple-700'
                    : 'text-gray-900 group-hover:text-purple-600'
                }
              `}
            >
              {productName}
            </h3>

            {/* Category */}
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mt-0.5">
              {productType}
            </p>
          </div>

          {/* Price */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-base md:text-lg font-bold text-gray-900">
              {product?.price ?? 0} DA
            </span>

            {isInCart && (
              <span className="text-[11px] font-semibold text-purple-600">
                In cart
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Add Modal */}
      <ProductQuickAddModal
        product={productId ? product : null}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}