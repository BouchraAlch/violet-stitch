'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/lib/types/database'
import { createClient } from '@/lib/supabase/client'

const categoryTitles: Record<string, { title: string; subtitle: string }> = {
  flowers: {
    title: 'Crochet Flowers',
    subtitle: 'Handcrafted floral arrangements that stay vibrant forever.',
  },
  keychains: {
    title: 'Crochet Keychains',
    subtitle: 'Cute and detailed accessories designed to follow you everywhere.',
  },
  others: {
    title: 'Other Creations',
    subtitle: 'Unique handmade items crafted with love and care.',
  },
}

export default function CategoryPage() {
  const params = useParams()
  const slug = (params.slug as string) || 'flowers'
  const supabase = createClient()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const currentCategory = categoryTitles[slug] || {
    title: slug.charAt(0).toUpperCase() + slug.slice(1),
    subtitle: 'Handmade crochet items tailored just for you.',
  }

  useEffect(() => {
    async function fetchCategoryProducts() {
      setLoading(true)

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', slug)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching category products:', error.message)
      } else if (data) {
        setProducts(data)
      }

      setLoading(false)
    }

    fetchCategoryProducts()
  }, [slug])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      {/* Category Header */}
      <div className="bg-purple-900 text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-purple-100">
          {currentCategory.title}
        </h1>
        <p className="text-base md:text-lg text-purple-200/90 max-w-xl mx-auto font-light">
          {currentCategory.subtitle}
        </p>
      </div>

      {/* Product Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-80 rounded-2xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm my-8">
            <p className="text-gray-500 text-lg font-medium">No products found in this category yet.</p>
            <p className="text-gray-400 text-sm mt-1">Check back soon for new handmade additions!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}