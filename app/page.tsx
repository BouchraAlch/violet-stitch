import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Product } from '@/lib/types/database'
import AddToCartButton from '@/components/AddToCartButton'

export const revalidate = 0 // Fetch fresh data on request

export default async function HomePage() {
  const supabase = await createClient()
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
  }

  const items: Product[] = products || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Banner */}
      <div className="bg-purple-100 rounded-2xl p-8 mb-12 text-center border border-purple-200">
        <h1 className="text-4xl font-extrabold text-purple-950 mb-2">Welcome to Violet Stitch</h1>
        <p className="text-purple-800 max-w-xl mx-auto">
          Handmade crochet creations crafted with love. Browse our catalog and find your favorite piece.
        </p>
      </div>

      {/* Catalog Grid */}
      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No products available right now.</p>
          <p className="text-sm mt-1">Check back soon or add products from the admin dashboard!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((product) => {
            const mainCoverImage = product.image_urls?.[0] || '/placeholder.png'

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden flex flex-col hover:shadow-md transition"
              >
                <Link href={`/products/${product.id}`} className="relative h-56 w-full bg-purple-50 block">
                  {product.image_urls?.[0] ? (
                    <Image
                      src={mainCoverImage}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </Link>

                <div className="p-4 flex flex-col flex-1">
                  <Link href={`/products/${product.id}`}>
                    <h2 className="font-semibold text-lg text-gray-900 hover:text-purple-700 transition line-clamp-1">
                      {product.title}
                    </h2>
                  </Link>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2 flex-1">
                    {product.description || 'Handcrafted crochet item.'}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-bold text-purple-900">${product.price.toFixed(2)}</span>
                    <AddToCartButton product={product} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}