'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/lib/types/database'

interface ProductCardProps {
  product: any // Using 'any' briefly to safely access all dynamic database fields
}

export default function ProductCard({ product }: ProductCardProps) {
  // 1. Get Product ID safely
  const productId = product?.id ? String(product.id) : null

  // 2. Get Product Name (Title) - checking 'name', 'title', or 'product_name' from Supabase
  const productName: string =
    product?.name ||
    product?.title ||
    product?.product_name ||
    'Handcrafted Item'

  // 3. Get Product Type/Category (Subtitle) - checking 'type', 'category', or 'product_type'
  const productType: string =
    product?.type ||
    product?.category ||
    product?.product_type ||
    'Handmade'

  // 4. Get Image URL safely
  const imageUrl: string =
    Array.isArray(product?.image_urls) && product.image_urls.length > 0
      ? product.image_urls[0]
      : Array.isArray(product?.img_link) && product.img_link.length > 0
      ? product.img_link[0]
      : typeof product?.img_link === 'string'
      ? product.img_link
      : '/flower.png'

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
      {/* Product Image */}
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

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* TITLE: Product Name (from 'name' column in DB) */}
          {productId ? (
            <Link href={`/product/${productId}`}>
              <h3 className="font-bold text-gray-900 text-base group-hover:text-purple-600 transition line-clamp-1">
                {productName}
              </h3>
            </Link>
          ) : (
            <h3 className="font-bold text-gray-900 text-base line-clamp-1">
              {productName}
            </h3>
          )}

          {/* SUBTITLE: Type or Category (e.g. Flowers, Keychains) */}
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mt-0.5">
            {productType}
          </p>
        </div>

        {/* Price Row */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-base md:text-lg font-bold text-gray-900">
            {product?.price ?? 0} DA
          </span>
        </div>
      </div>
    </div>
  )
}