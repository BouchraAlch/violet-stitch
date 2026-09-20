'use client'

import { useCart } from '@/context/CartContext'
import { Product } from '@/lib/types/database'

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart()

  return (
    <button
      onClick={() => addToCart(product, 1)}
      className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm active:scale-95"
    >
      Add to Cart
    </button>
  )
}