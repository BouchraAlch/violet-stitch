'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronDown, ChevronUp, Minus, Plus, ShoppingBag, X } from 'lucide-react'

import ProductCard from '@/components/ProductCard'
import { Product } from '@/lib/types/database'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/context/CartContext'

interface BouquetSelection {
  product: Product
  quantity: number
  selectedColor: string
}

type SelectionSectionKey = 'flowers' | 'leaves' | 'papers'

const colorNames: Record<string, string> = {
  '#000000': 'Black',
  '#FFFFFF': 'White',
  '#FF0000': 'Red',
  '#00FF00': 'Green',
  '#0000FF': 'Blue',
  '#FFFF00': 'Yellow',
  '#FFA500': 'Orange',
  '#800080': 'Purple',
  '#FFC0CB': 'Pink',
  '#A52A2A': 'Brown',
  '#808080': 'Gray',
  '#C0C0C0': 'Silver',
  '#FFD700': 'Gold',
  '#008000': 'Green',
  '#00FFFF': 'Cyan',
  '#F5F5DC': 'Beige',
  '#800000': 'Maroon',
  '#000080': 'Navy Blue',
  '#008080': 'Teal',
  '#4B0082': 'Indigo',
  '#EE82EE': 'Violet',
  '#F5DEB3': 'Wheat',
  '#D2691E': 'Chocolate',
  '#F0E68C': 'Khaki',
  '#E6E6FA': 'Lavender',
  '#FF7F50': 'Coral',
  '#DC143C': 'Crimson',
  '#40E0D0': 'Turquoise',
  '#98FB98': 'Pale Green',
  '#ADD8E6': 'Light Blue',
  '#90EE90': 'Light Green',
  '#FFFFE0': 'Light Yellow',
  '#FFB6C1': 'Light Pink',
  '#D3D3D3': 'Light Gray',
  '#A9A9A9': 'Dark Gray',
}

const getColorName = (color: string): string => {
  const normalized = color.trim().toUpperCase()

  if (colorNames[normalized]) {
    return colorNames[normalized]
  }

  return color
}

const parseColors = (product: Product): string[] => {
  const rawColor =
    (product as any)?.colors ||
    (product as any)?.color ||
    ''

  if (Array.isArray(rawColor)) {
    return rawColor
      .map((color) => String(color).trim())
      .filter(Boolean)
  }

  const cleanString = String(rawColor)
    .replace(/colors?:/gi, '')
    .replace(/[\[\]'"]/g, '')

  return cleanString
    .split(',')
    .map((color) => color.trim())
    .filter(Boolean)
}

const getImageUrl = (product: Product): string => {
  const rawImages =
    (product as any)?.image_urls ||
    (product as any)?.img_link

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

export default function FlowersCategoryPage() {
  const supabase = createClient()
  const { addPersonalizedBouquet } = useCart()

  const [bouquets, setBouquets] = useState<Product[]>([])
  const [individualFlowers, setIndividualFlowers] = useState<Product[]>([])
  const [leaves, setLeaves] = useState<Product[]>([])
  const [papers, setPapers] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [expandedSections, setExpandedSections] = useState<{
    bouquets: boolean
    flowers: boolean
    leaves: boolean
    papers: boolean
  }>({
    bouquets: false,
    flowers: false,
    leaves: false,
    papers: false,
  })

  const [bouquetSelections, setBouquetSelections] = useState<
    Record<string, BouquetSelection>
  >({})

  const [selectionModal, setSelectionModal] = useState<{
    product: Product
    section: SelectionSectionKey
  } | null>(null)

  const [selectionQuantity, setSelectionQuantity] = useState(1)
  const [selectionColor, setSelectionColor] = useState('')

  const [bouquetAdded, setBouquetAdded] = useState(false)

  const bouquetRef = useRef<HTMLDivElement>(null)
  const flowersRef = useRef<HTMLDivElement>(null)
  const leavesRef = useRef<HTMLDivElement>(null)
  const papersRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchFlowerCategoryData() {
      setLoading(true)

      const { data: allFlowerProducts } = await supabase
        .from('products')
        .select('*')
        .in('category', [
          'flowers',
          'flower',
          'bouquet',
          'bouquets',
          'leaf',
          'leaves',
          'paper',
          'papers',
        ])

      if (allFlowerProducts) {
        setBouquets(
          allFlowerProducts.filter(
            (p) =>
              p.category?.toLowerCase() === 'bouquet' ||
              p.category?.toLowerCase() === 'bouquets'
          )
        )

        setIndividualFlowers(
          allFlowerProducts.filter(
            (p) =>
              p.category?.toLowerCase() === 'flower' ||
              p.category?.toLowerCase() === 'flowers'
          )
        )

        setLeaves(
          allFlowerProducts.filter(
            (p) =>
              p.category?.toLowerCase() === 'leaf' ||
              p.category?.toLowerCase() === 'leaves'
          )
        )

        setPapers(
          allFlowerProducts.filter(
            (p) =>
              p.category?.toLowerCase() === 'paper' ||
              p.category?.toLowerCase() === 'papers'
          )
        )
      }

      setLoading(false)
    }

    fetchFlowerCategoryData()
  }, [])

  useEffect(() => {
    if (!selectionModal) return

    const colors = parseColors(selectionModal.product)

    setSelectionQuantity(1)
    setSelectionColor(colors[0] || '')
  }, [selectionModal])

  useEffect(() => {
    if (!selectionModal) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectionModal(null)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [selectionModal])

  useEffect(() => {
    if (!selectionModal) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [selectionModal])

  const toggleExpand = (
    sectionKey: keyof typeof expandedSections
  ) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }))
  }

  const scrollContainer = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: 'left' | 'right'
  ) => {
    if (!ref.current) return

    const scrollAmount = ref.current.clientWidth * 0.8

    ref.current.scrollBy({
      left:
        direction === 'left'
          ? -scrollAmount
          : scrollAmount,
      behavior: 'smooth',
    })
  }

  const openSelectionModal = (
    product: Product,
    section: SelectionSectionKey
  ) => {
    setSelectionModal({
      product,
      section,
    })
  }

  const confirmSelection = () => {
    if (!selectionModal) return

    const product = selectionModal.product

    setBouquetSelections((previous) => {
      const existing = previous[product.id]

      return {
        ...previous,
        [product.id]: {
          product,
          quantity: existing
            ? existing.quantity + selectionQuantity
            : selectionQuantity,
          selectedColor:
            selectionColor ||
            existing?.selectedColor ||
            '',
        },
      }
    })

    setSelectionModal(null)
  }

  const removeBouquetSelection = (productId: string) => {
    setBouquetSelections((previous) => {
      const next = { ...previous }
      delete next[productId]
      return next
    })
  }

  const updateBouquetSelectionQuantity = (
    productId: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeBouquetSelection(productId)
      return
    }

    setBouquetSelections((previous) => {
      const existing = previous[productId]

      if (!existing) return previous

      return {
        ...previous,
        [productId]: {
          ...existing,
          quantity,
        },
      }
    })
  }

  const selectedComponents = Object.values(
    bouquetSelections
  )

  const bouquetTotal = selectedComponents.reduce(
    (sum, item) =>
      sum +
      (Number(item.product.price) || 0) *
        item.quantity,
    0
  )

  const chooseThisBouquet = () => {
    if (selectedComponents.length === 0) return

    addPersonalizedBouquet(
      selectedComponents.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
      }))
    )

    setBouquetAdded(true)

    setTimeout(() => {
      setBouquetAdded(false)
      setBouquetSelections({})
    }, 900)
  }

  /*
   * --------------------------------------------------------------------------
   * Normal product section
   *
   * Used for ready-made bouquets.
   * These products continue using ProductCard and the normal quick-add modal.
   * --------------------------------------------------------------------------
   */
  const ProductSection = ({
    title,
    subtitle,
    products,
    sectionKey,
    containerRef,
  }: {
    title: string
    subtitle?: string
    products: Product[]
    sectionKey: keyof typeof expandedSections
    containerRef: React.RefObject<HTMLDivElement | null>
  }) => {
    const isExpanded = expandedSections[sectionKey]

    return (
      <div className="mb-10">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">
              {title}
            </h3>

            {subtitle && (
              <p className="text-xs text-purple-600 font-medium mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          {products.length > 0 && (
            <button
              type="button"
              onClick={() =>
                toggleExpand(sectionKey)
              }
              className="text-purple-600 hover:text-purple-700 font-semibold text-sm flex items-center gap-1 transition focus:outline-none"
            >
              {isExpanded ? (
                <>
                  Show Less
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  See More ({products.length})
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 h-64 rounded-2xl"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-purple-50/50 rounded-2xl py-8 text-center text-sm text-gray-500 border border-purple-100">
            No items found in this section yet.
          </div>
        ) : isExpanded ? (
          <div className="bg-purple-50/40 rounded-3xl p-4 sm:p-6 border border-purple-100/80 transition-all duration-300">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() =>
                  toggleExpand(sectionKey)
                }
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-purple-700 bg-purple-100/80 hover:bg-purple-200 rounded-full transition"
              >
                Collapse Section
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="relative group">
            {products.length > 4 && (
              <button
                type="button"
                onClick={() =>
                  scrollContainer(
                    containerRef,
                    'left'
                  )
                }
                aria-label="Scroll Left"
                className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-purple-100 text-gray-800 items-center justify-center transition hover:bg-purple-600 hover:text-white"
              >
                &#8249;
              </button>
            )}

            <div
              ref={containerRef}
              className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-2"
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="w-[calc((100%-1rem)/2)] sm:w-[calc((100%-2*1rem)/3)] md:w-[calc((100%-3*1.5rem)/4)] flex-shrink-0"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {products.length > 4 && (
              <button
                type="button"
                onClick={() =>
                  scrollContainer(
                    containerRef,
                    'right'
                  )
                }
                aria-label="Scroll Right"
                className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-purple-100 text-gray-800 items-center justify-center transition hover:bg-purple-600 hover:text-white"
              >
                &#8250;
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  /*
   * --------------------------------------------------------------------------
   * Personalized product card
   *
   * Unlike ProductCard, this does NOT add directly to the cart.
   * Clicking it opens the selection modal.
   * --------------------------------------------------------------------------
   */
  const PersonalizedProductCard = ({
    product,
    section,
  }: {
    product: Product
    section: SelectionSectionKey
  }) => {
    const selection = bouquetSelections[product.id]
    const imageUrl = getImageUrl(product)
    const productName =
      product.name || 'Handcrafted Item'
    const productPrice = Number(product.price) || 0
    const colors = parseColors(product)

    return (
      <>
        <button
          type="button"
          onClick={() =>
            openSelectionModal(product, section)
          }
          className={`
            group relative bg-white rounded-2xl overflow-hidden
            flex flex-col text-left h-full w-full
            transition-all duration-200
            ${
              selection
                ? 'border-2 border-purple-600 shadow-md'
                : 'border border-gray-100 shadow-sm hover:shadow-md'
            }
          `}
        >
          <div className="relative aspect-square bg-purple-50 overflow-hidden">
            <Image
              src={imageUrl}
              alt={productName}
              fill
              unoptimized
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />

            {selection && (
              <>
                <div className="absolute inset-0 bg-purple-900/10" />

                <div className="absolute top-2 right-2 z-10 min-w-7 h-7 px-2 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md">
                  <span className="text-xs font-bold">
                    {selection.quantity}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="p-4 flex flex-col flex-1 justify-between">
            <div>
              <h3
                className={`
                  font-bold text-base line-clamp-1 transition
                  ${
                    selection
                      ? 'text-purple-700'
                      : 'text-gray-900 group-hover:text-purple-600'
                  }
                `}
              >
                {productName}
              </h3>

              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mt-0.5">
                {product.category || 'Handmade'}
              </p>

              {selection?.selectedColor && (
                <p className="text-[11px] text-gray-500 mt-1">
                  {getColorName(
                    selection.selectedColor
                  )}
                </p>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-base md:text-lg font-bold text-gray-900">
                {productPrice} DA
              </span>

              {selection && (
                <span className="text-[11px] font-semibold text-purple-600">
                  Selected
                </span>
              )}
            </div>
          </div>
        </button>
      </>
    )
  }

  /*
   * --------------------------------------------------------------------------
   * Personalized product section
   * --------------------------------------------------------------------------
   */
  const PersonalizedSection = ({
    title,
    subtitle,
    products,
    sectionKey,
    containerRef,
  }: {
    title: string
    subtitle?: string
    products: Product[]
    sectionKey: SelectionSectionKey
    containerRef: React.RefObject<HTMLDivElement | null>
  }) => {
    const expanded =
      expandedSections[sectionKey]

    return (
      <div className="mb-10">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">
              {title}
            </h3>

            {subtitle && (
              <p className="text-xs text-purple-600 font-medium mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          {products.length > 0 && (
            <button
              type="button"
              onClick={() =>
                toggleExpand(sectionKey)
              }
              className="text-purple-600 hover:text-purple-700 font-semibold text-sm flex items-center gap-1 transition focus:outline-none"
            >
              {expanded ? (
                <>
                  Show Less
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  See More ({products.length})
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 h-64 rounded-2xl"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-purple-50/50 rounded-2xl py-8 text-center text-sm text-gray-500 border border-purple-100">
            No items found in this section yet.
          </div>
        ) : expanded ? (
          <div className="bg-purple-50/40 rounded-3xl p-4 sm:p-6 border border-purple-100/80">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <PersonalizedProductCard
                  key={product.id}
                  product={product}
                  section={sectionKey}
                />
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() =>
                  toggleExpand(sectionKey)
                }
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-purple-700 bg-purple-100/80 hover:bg-purple-200 rounded-full transition"
              >
                Collapse Section
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="relative group">
            {products.length > 4 && (
              <button
                type="button"
                onClick={() =>
                  scrollContainer(
                    containerRef,
                    'left'
                  )
                }
                aria-label="Scroll Left"
                className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-purple-100 text-gray-800 items-center justify-center transition hover:bg-purple-600 hover:text-white"
              >
                &#8249;
              </button>
            )}

            <div
              ref={containerRef}
              className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-2"
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="w-[calc((100%-1rem)/2)] sm:w-[calc((100%-2*1rem)/3)] md:w-[calc((100%-3*1.5rem)/4)] flex-shrink-0"
                >
                  <PersonalizedProductCard
                    product={product}
                    section={sectionKey}
                  />
                </div>
              ))}
            </div>

            {products.length > 4 && (
              <button
                type="button"
                onClick={() =>
                  scrollContainer(
                    containerRef,
                    'right'
                  )
                }
                aria-label="Scroll Right"
                className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-purple-100 text-gray-800 items-center justify-center transition hover:bg-purple-600 hover:text-white"
              >
                &#8250;
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-purple-900 via-purple-850 to-purple-900 text-white py-12 px-6 text-center border-b border-purple-800">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-purple-800/80 text-purple-200 text-xs font-semibold tracking-wider uppercase mb-3 border border-purple-700/50">
            Floral Collections
          </span>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Crochet Flowers & Bouquets
          </h1>

          <p className="text-purple-200 text-sm md:text-base max-w-xl mx-auto font-light mt-2">
            Choose a ready-made floral arrangement or mix-and-match custom stems, leaves, and wrapping paper to build your own.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
        {/* ---------------------------------------------------------------- */}
        {/* Ready-made bouquets                                              */}
        {/* ---------------------------------------------------------------- */}

        <section className="mb-14">
          <ProductSection
            title="💐 Ready-to-Gift Bouquets"
            subtitle="Complete handcrafted arrangements"
            products={bouquets}
            sectionKey="bouquets"
            containerRef={bouquetRef}
          />
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Personalized bouquet                                             */}
        {/* ---------------------------------------------------------------- */}

        <section className="bg-white border border-purple-100 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="mb-8 border-b border-purple-100 pb-4">
            <span className="text-xs font-semibold tracking-wider text-purple-700 uppercase">
              DIY Arrangement
            </span>

            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              Personalize Your Bouquet
            </h2>

            <p className="text-gray-600 text-sm mt-1">
              Pick your favorite flower stems, matching greenery, and wrapping paper to craft your custom bouquet order.
            </p>
          </div>

          <PersonalizedSection
            title="1. Choose Your Flowers"
            subtitle="Select individual flower stems"
            products={individualFlowers}
            sectionKey="flowers"
            containerRef={flowersRef}
          />

          <PersonalizedSection
            title="2. Choose Your Leaves & Greenery"
            subtitle="Add filler leaves and accent branches"
            products={leaves}
            sectionKey="leaves"
            containerRef={leavesRef}
          />

          <PersonalizedSection
            title="3. Choose Wrapping Paper & Ribbons"
            subtitle="Select decorative packaging"
            products={papers}
            sectionKey="papers"
            containerRef={papersRef}
          />

          {/* Bouquet Summary */}
          <div className="mt-10 border-t border-purple-100 pt-8">
            <div className="bg-purple-50/70 rounded-2xl border border-purple-100 p-5 sm:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-600">
                    Your Bouquet
                  </p>

                  <h3 className="text-xl font-extrabold text-gray-900 mt-1">
                    {selectedComponents.length === 0
                      ? 'Start building your bouquet'
                      : `${selectedComponents.length} component${
                          selectedComponents.length === 1
                            ? ''
                            : 's'
                        } selected`}
                  </h3>

                  {selectedComponents.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      Your selections will be added as one personalized bouquet.
                    </p>
                  )}
                </div>

                <div className="text-left md:text-right">
                  <p className="text-xs text-gray-500">
                    Bouquet total
                  </p>

                  <p className="text-2xl font-extrabold text-purple-700">
                    {bouquetTotal} DA
                  </p>
                </div>
              </div>

              {selectedComponents.length > 0 && (
                <div className="mt-5 space-y-2">
                  {selectedComponents.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between gap-3 bg-white rounded-xl border border-purple-100 p-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-purple-50 flex-shrink-0">
                          <Image
                            src={getImageUrl(item.product)}
                            alt={item.product.name}
                            fill
                            unoptimized
                            sizes="44px"
                            className="object-cover"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {item.product.name}
                          </p>

                          <p className="text-xs text-gray-500">
                            {getColorName(
                              item.selectedColor
                            )}{' '}
                            ·{' '}
                            {item.product.price} DA each
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            updateBouquetSelectionQuantity(
                              item.product.id,
                              item.quantity - 1
                            )
                          }
                          className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-100"
                          aria-label={`Decrease ${item.product.name}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <span className="w-5 text-center text-sm font-bold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateBouquetSelectionQuantity(
                              item.product.id,
                              item.quantity + 1
                            )
                          }
                          className="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-100"
                          aria-label={`Increase ${item.product.name}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeBouquetSelection(
                              item.product.id
                            )
                          }
                          className="w-7 h-7 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center"
                          aria-label={`Remove ${item.product.name}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={chooseThisBouquet}
                disabled={
                  selectedComponents.length === 0 ||
                  bouquetAdded
                }
                className={`
                  mt-5 w-full py-3.5 rounded-2xl
                  flex items-center justify-center gap-2
                  font-bold text-sm
                  shadow-md transition-all
                  ${
                    bouquetAdded
                      ? 'bg-emerald-600 text-white'
                      : selectedComponents.length === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-[0.99]'
                  }
                `}
              >
                {bouquetAdded ? (
                  <>
                    <span className="text-base">✓</span>
                    Bouquet Added to Order
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Choose This Bouquet
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Personalized component selection modal                              */}
      {/* ------------------------------------------------------------------ */}

      {selectionModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-3 py-4 sm:p-4 bg-black/45 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectionModal(null)
            }
          }}
        >
          <div
            className="relative w-full max-w-[340px] sm:max-w-md max-h-[88vh] overflow-y-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100"
            onMouseDown={(event) => {
              event.stopPropagation()
            }}
          >
            <button
              type="button"
              onClick={() => setSelectionModal(null)}
              className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-white/90 border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-gray-900"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative aspect-square bg-purple-50 overflow-hidden rounded-t-2xl sm:rounded-t-3xl">
              <Image
                src={getImageUrl(selectionModal.product)}
                alt={selectionModal.product.name}
                fill
                unoptimized
                sizes="448px"
                className="object-cover object-center"
              />
            </div>

            <div className="p-4 sm:p-5">
              <div className="mb-5 pr-8">
                <p className="text-xs uppercase tracking-wider font-bold text-purple-600">
                  Add to bouquet
                </p>

                <h2 className="text-xl font-extrabold text-gray-900 mt-1">
                  {selectionModal.product.name}
                </h2>

                <p className="text-lg font-extrabold text-purple-700 mt-1">
                  {selectionModal.product.price} DA each
                </p>
              </div>

              {parseColors(selectionModal.product).length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-sm font-semibold text-gray-900">
                      Color
                    </span>

                    {selectionColor && (
                      <span className="text-xs font-semibold text-purple-600">
                        • {getColorName(selectionColor)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {parseColors(selectionModal.product).map(
                      (color, index) => {
                        const isSelected =
                          selectionColor === color

                        const looksLikeHex =
                          /^#[0-9A-F]{3,8}$/i.test(
                            color
                          )

                        return (
                          <button
                            key={`${color}-${index}`}
                            type="button"
                            title={getColorName(color)}
                            aria-label={`Select ${getColorName(
                              color
                            )}`}
                            onClick={() =>
                              setSelectionColor(color)
                            }
                            className={`
                              relative w-8 h-8 rounded-full
                              flex items-center justify-center
                              transition-all
                              ${
                                isSelected
                                  ? 'ring-2 ring-purple-600 ring-offset-2 scale-110'
                                  : 'border border-gray-300 hover:scale-105'
                              }
                            `}
                            style={{
                              backgroundColor:
                                looksLikeHex
                                  ? color
                                  : undefined,
                            }}
                          >
                            {!looksLikeHex && (
                              <span className="text-[8px] font-semibold text-gray-700">
                                {getColorName(
                                  color
                                ).slice(0, 2)}
                              </span>
                            )}
                          </button>
                        )
                      }
                    )}
                  </div>
                </div>
              )}

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                  Quantity
                </label>

                <div className="inline-flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectionQuantity(
                        (current) =>
                          Math.max(1, current - 1)
                      )
                    }
                    className="w-9 h-9 rounded-lg bg-white text-gray-700 shadow-sm flex items-center justify-center hover:bg-gray-100"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="w-11 text-center font-bold text-gray-900">
                    {selectionQuantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectionQuantity(
                        (current) => current + 1
                      )
                    }
                    className="w-9 h-9 rounded-lg bg-white text-gray-700 shadow-sm flex items-center justify-center hover:bg-gray-100"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">
                    Component total
                  </span>

                  <span className="text-lg font-extrabold text-gray-900">
                    {(Number(
                      selectionModal.product.price
                    ) || 0) * selectionQuantity}{' '}
                    DA
                  </span>
                </div>

                <button
                  type="button"
                  onClick={confirmSelection}
                  className="w-full py-3 rounded-2xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add to Bouquet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}