'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/lib/types/database'
import { createClient } from '@/lib/supabase/client'

export default function CategorySlugPage() {
  const params = useParams()
  const slug = (params?.slug as string) || ''
  const supabase = createClient()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategoryProducts() {
      if (!slug) return
      setLoading(true)

      const normalizedSlug = slug.toLowerCase()
      let query = supabase.from('products').select('*')

      if (
        normalizedSlug === 'flower' ||
        normalizedSlug === 'flowers' ||
        normalizedSlug === 'flower-stems' ||
        normalizedSlug === 'stems'
      ) {
        query = query.or('category.ilike.%flower%,category.ilike.%stem%')
      } else if (normalizedSlug === 'bouquet' || normalizedSlug === 'bouquets') {
        query = query.or('category.ilike.%bouquet%')
      } else if (normalizedSlug === 'leaf' || normalizedSlug === 'leaves') {
        query = query.or('category.ilike.%leaf%,category.ilike.%leaves%')
      } else if (normalizedSlug === 'paper' || normalizedSlug === 'papers') {
        query = query.or('category.ilike.%paper%')
      } else {
        query = query.ilike('category', `%${normalizedSlug}%`)
      }

      const { data, error } = await query

      if (data) {
        setProducts(data)
      } else if (error) {
        console.error('Error fetching category products:', error)
      }

      setLoading(false)
    }

    fetchCategoryProducts()
  }, [slug])

  const formatTitle = (text: string) => {
    switch (text.toLowerCase()) {
      case 'bouquet':
      case 'bouquets':
        return 'Ready-to-Gift Bouquets'
      case 'flower':
      case 'flowers':
      case 'flower-stems':
      case 'stems':
        return 'Individual Flower items'
      case 'leaf':
      case 'leaves':
        return 'Leaves & Greenery'
      case 'paper':
      case 'papers':
        return 'Wrapping Paper & Packaging'
      default:
        return text.charAt(0).toUpperCase() + text.slice(1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Category Hero Header Banner */}
      <section className="bg-gradient-to-r from-purple-900 via-purple-850 to-purple-900 text-white py-12 px-6 text-center border-b border-purple-800">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            {formatTitle(slug)}
          </h1>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-72 rounded-2xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl py-16 text-center border border-purple-100 shadow-sm">
            <p className="text-gray-500 text-base font-medium">
              No products found in "{formatTitle(slug)}" yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}