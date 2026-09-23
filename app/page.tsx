'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/lib/types/database'
import { createClient } from '@/lib/supabase/client'

// =========================================================
// HERO SLIDES - IMAGES ONLY
// =========================================================
const heroSlides = [
  {
    id: 1,
    image: '/hero1.jpg',
  },
  {
    id: 2,
    image: '/hero3.jpg',
  },
  {
    id: 3,
    image: '/hero2.jpg',
  },
]

export default function HomePage() {
  const supabase = createClient()

  // =========================================================
  // HERO STATE
  // =========================================================
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // =========================================================
  // PRODUCTS STATE
  // =========================================================
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const [bestSellers, setBestSellers] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // =========================================================
  // PRODUCT CAROUSEL REFS
  // =========================================================
  const newArrivalsRef = useRef<HTMLDivElement>(null)
  const bestSellersRef = useRef<HTMLDivElement>(null)

  // =========================================================
  // TOUCH SWIPE STATE
  // =========================================================
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  // =========================================================
  // TOUCH START
  // =========================================================
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  // =========================================================
  // TOUCH MOVE
  // =========================================================
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  // =========================================================
  // TOUCH END
  // =========================================================
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd

    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      handleNextSlide()
    } else if (isRightSwipe) {
      handlePrevSlide()
    }
  }

  // =========================================================
  // HERO AUTO-SLIDE
  // =========================================================
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
      }, 3000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPaused])

  // =========================================================
  // NEXT SLIDE
  // =========================================================
  const handleNextSlide = () => {
    setIsPaused(true)
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  // =========================================================
  // PREVIOUS SLIDE
  // =========================================================
  const handlePrevSlide = () => {
    setIsPaused(true)
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    )
  }

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)

      const { data: newArrivalsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12)

      const { data: bestSellersData } = await supabase
        .from('products')
        .select('*')
        .eq('is_bestseller', true)
        .limit(12)

      if (newArrivalsData) {
        setNewArrivals(newArrivalsData)
      }

      if (bestSellersData) {
        setBestSellers(bestSellersData)
      }

      setLoading(false)
    }

    fetchProducts()
  }, [])

  // =========================================================
  // PRODUCT SCROLL FUNCTION
  // =========================================================
  const scrollContainer = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: 'left' | 'right'
  ) => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth

      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  // =========================================================
  // RETURN
  // =========================================================
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">

      <Navbar />

      {/* ========================================================= */}
      {/* PART 1: HERO SLIDER SECTION                              */}
      {/* ========================================================= */}

      <section
        className="relative w-full h-screen overflow-hidden bg-gray-900 select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >

        {/* ===================================================== */}
        {/* HERO IMAGE SLIDER                                     */}
        {/* ===================================================== */}

        <div
          className="flex w-full h-full transition-transform duration-700 ease-out"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
          }}
        >
          {heroSlides.map((slide) => (
            <div
              key={slide.id}
              className="relative w-full h-full flex-shrink-0"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${slide.image})`,
                }}
              >
                <div className="absolute inset-0 bg-black/30" />
              </div>
            </div>
          ))}
        </div>

        {/* ===================================================== */}
        {/* FIXED HERO CONTENT                                    */}
        {/* Same content for every image                          */}
        {/* ===================================================== */}

        <div className="absolute inset-0 z-10 max-w-7xl mx-auto h-full px-6 flex flex-col justify-center items-center text-center text-white pt-20">

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-purple-100 drop-shadow-md">
            Welcome to Violet Stitch
          </h1>

          <p className="text-lg md:text-xl text-purple-100/90 max-w-2xl mb-8 font-light leading-relaxed">
            Discover beautiful crochet flowers, charming keychains,
            and many other handmade surprises.
          </p>

          <Link
            href="/productsexplore"
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm px-5 py-2.5 rounded-full shadow-md transition hover:scale-105 active:scale-95"
          >
            Explore What We Have
          </Link>

        </div>

        {/* ===================================================== */}
        {/* PREVIOUS BUTTON                                       */}
        {/* ===================================================== */}

        <button
          onClick={handlePrevSlide}
          aria-label="Previous Slide"
          className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 text-white items-center justify-center transition hover:scale-110 active:scale-95"
        >
          <svg
            className="w-6 h-6 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* ===================================================== */}
        {/* NEXT BUTTON                                           */}
        {/* ===================================================== */}

        <button
          onClick={handleNextSlide}
          aria-label="Next Slide"
          className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 text-white items-center justify-center transition hover:scale-110 active:scale-95"
        >
          <svg
            className="w-6 h-6 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

      </section>

      {/* ========================================================= */}
      {/* PART 2: NEW ARRIVALS SECTION                              */}
      {/* ========================================================= */}

      <section className="pt-12 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

        <div className="flex justify-between items-end mb-6">

          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              New Arrivals
            </h2>

            <p className="text-gray-500 mt-1">
              Discover our latest handcrafted crochet creations.
            </p>
          </div>

          <Link
            href="/products"
            className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
          >
            View All &rarr;
          </Link>

        </div>

        {loading ? (

          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 animate-pulse">

            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 h-80 rounded-2xl"
              />
            ))}

          </div>

        ) : (

          <div className="relative group">

            {newArrivals.length > 4 && (
              <button
                onClick={() =>
                  scrollContainer(newArrivalsRef, 'left')
                }
                aria-label="Scroll Left"
                className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-xl border border-gray-100 text-gray-800 items-center justify-center transition hover:bg-purple-600 hover:text-white hover:scale-110 active:scale-95"
              >
                <svg
                  className="w-6 h-6 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            <div
              ref={newArrivalsRef}
              className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-2"
            >

              {newArrivals.map((product) => (
                <div
                  key={product.id}
                  className="w-[calc((100%-2*1rem)/3)] md:w-[calc((100%-3*1.5rem)/4)] flex-shrink-0"
                >
                  <ProductCard product={product} />
                </div>
              ))}

            </div>

            {newArrivals.length > 4 && (
              <button
                onClick={() =>
                  scrollContainer(newArrivalsRef, 'right')
                }
                aria-label="Scroll Right"
                className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-xl border border-gray-100 text-gray-800 items-center justify-center transition hover:bg-purple-600 hover:text-white hover:scale-110 active:scale-95"
              >
                <svg
                  className="w-6 h-6 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}

          </div>
        )}

      </section>

      {/* ========================================================= */}
      {/* PART 3: BEST SELLERS SECTION                              */}
      {/* ========================================================= */}

      <section className="py-12 bg-purple-50/50 border-y border-purple-100">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

          <div className="flex justify-between items-end mb-6">

            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                Best Sellers
              </h2>

              <p className="text-gray-500 mt-1">
                Our most loved and popular items chosen by you.
              </p>
            </div>

            <Link
              href="/products"
              className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
            >
              View All &rarr;
            </Link>

          </div>

          {loading ? (

            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 animate-pulse">

              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-200 h-80 rounded-2xl"
                />
              ))}

            </div>

          ) : (

            <div className="relative group">

              {bestSellers.length > 4 && (
                <button
                  onClick={() =>
                    scrollContainer(bestSellersRef, 'left')
                  }
                  aria-label="Scroll Left"
                  className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-xl border border-purple-100 text-gray-800 items-center justify-center transition hover:bg-purple-600 hover:text-white hover:scale-110 active:scale-95"
                >
                  <svg
                    className="w-6 h-6 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}

              <div
                ref={bestSellersRef}
                className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-2"
              >

                {bestSellers.map((product) => (
                  <div
                    key={product.id}
                    className="w-[calc((100%-2*1rem)/3)] md:w-[calc((100%-3*1.5rem)/4)] flex-shrink-0"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}

              </div>

              {bestSellers.length > 4 && (
                <button
                  onClick={() =>
                    scrollContainer(bestSellersRef, 'right')
                  }
                  aria-label="Scroll Right"
                  className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-xl border border-purple-100 text-gray-800 items-center justify-center transition hover:bg-purple-600 hover:text-white hover:scale-110 active:scale-95"
                >
                  <svg
                    className="w-6 h-6 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}

            </div>
          )}

        </div>

      </section>

      {/* ========================================================= */}
      {/* PART 4: ABOUT VIOLET STITCH SHOP SECTION                  */}
      {/* ========================================================= */}

      <section
        id="about"
        className="py-20 bg-purple-200/60 text-purple-950"
      >

        <div className="max-w-4xl mx-auto px-6 text-center">

          <span className="text-sm font-semibold tracking-widest text-purple-700 uppercase">
            Crafted With Love
          </span>

          <h2 className="text-4xl font-extrabold mt-2 mb-6">
            About Violet Stitch Shop
          </h2>

          <p className="text-lg leading-relaxed text-purple-900/80 mb-8 font-light">
            Welcome to Violet Stitch! Every piece in our store is carefully
            hand-crafted yarn by yarn. We specialize in bringing warmth and
            color into your everyday life through vibrant crochet flowers,
            adorable keychains, and custom clothing designed to last forever.
          </p>

          <div className="inline-block bg-white/80 backdrop-blur px-8 py-4 rounded-2xl shadow-sm border border-purple-200 text-purple-800 font-medium">
            ✨ 100% Handmade Quality • Made with Care
          </div>

        </div>

      </section>

      {/* ========================================================= */}
      {/* PART 5: 3 FEATURE RECTANGLES SECTION                      */}
      {/* ========================================================= */}

      <section className="py-16 bg-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Delivery */}
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center shadow-sm hover:shadow-md transition">

              <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4">

                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>

              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delivery to 69 Wilayas
              </h3>

              <p className="text-gray-500 text-sm">
                We deliver fast and directly to all 69 wilayas nationwide
                with home or stopdesk delivery options.
              </p>

            </div>

            {/* Handmade */}
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center shadow-sm hover:shadow-md transition">

              <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4">

                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>

              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                100% Handmade
              </h3>

              <p className="text-gray-500 text-sm">
                Every single product is stitched by hand with high attention
                to detail and high-grade premium yarn.
              </p>

            </div>

            {/* Custom Orders */}
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center shadow-sm hover:shadow-md transition">

              <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4">

                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>

              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Products Available by Order
              </h3>

              <p className="text-gray-500 text-sm">
                Looking for custom colors or personalized designs?
                Request your order and we will craft it for you.
              </p>

            </div>

          </div>

        </div>

      </section>

      <Footer />

    </div>
  )
}