import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductDetailClient from '@/components/ProductDetailClient'

interface ProductPageProps {
  params: Promise<{ id: string }> | { id: string }
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Gracefully handle Next.js 15 Promise params vs Next.js 14 sync params
  const resolvedParams = params instanceof Promise ? await params : params
  const { id } = resolvedParams || {}

  if (!id || id === 'undefined') {
    notFound()
  }

  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('Supabase query error for product ID:', id, error)
  }

  if (!product) {
    notFound()
  }

  return <ProductDetailClient product={product} />
}