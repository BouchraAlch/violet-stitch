'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/lib/types/database'
import { createClient } from '@/lib/supabase/client'

export default function AllProductsPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAllProducts() {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) {
        setProducts(data)
      } else if (error) {
        console.error('Error fetching products:', error)
      }
      setLoading(false)
    }

    fetchAllProducts()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
        <div className="mb-8 border-b border-gray-200 pb-5">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            All Products
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Explore our complete collection of handmade crochet creations.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-72 rounded-2xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl py-16 text-center border border-purple-100 shadow-sm">
            <p className="text-gray-500 text-base font-medium">
              No products found in the store yet.
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